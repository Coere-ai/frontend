// Checks of the functions that keep the running totals: record_usage,
// record_app_events, accept_org_invite and set_memory_totals, plus the two
// admin readers. Runs after checks-accounts.mjs, on its rows.

import { A, B, C } from "./checks-accounts.mjs";
import { as, check, equal, one, refused, rows } from "./harness.mjs";

const num = (value) => (value === null || value === undefined ? null : Number(value));

export async function checkRecordUsage(db, org) {
  await as(db, "service_role", null, async () => {
    const call = "select public.record_usage($1, null, $2, 'claude-haiku-5-5', $3, $4, $5, $6, $7, 200, 900, 'req_1')";
    await rows(db, "record_usage 1", call, [A, "message", 1000, 200, 50, 400, 1500]);
    await rows(db, "record_usage 2", call, [A, "count_tokens", 300, 0, 0, 0, 0]);
    await rows(db, "record_usage B", call, [B, "jev", 10, 0, 0, 0, 7]);
  });
  const monthly = (await rows(db, "usage_monthly", "select requests, input_tokens, output_tokens, cost_micros from public.usage_monthly where user_id = $1", [A]))?.[0];
  equal("usage_monthly adds both calls", [monthly?.requests, monthly?.input_tokens, monthly?.output_tokens, monthly?.cost_micros].map(num), [2, 1300, 200, 1500]);
  const user = (await rows(db, "user_totals", "select requests, input_tokens, cache_write_tokens, cache_read_tokens, cost_micros from public.user_totals where user_id = $1", [A]))?.[0];
  equal("user_totals adds usage and cache tokens", Object.values(user ?? {}).map(num), [2, 1300, 50, 400, 1500]);
  const orgRow = (await rows(db, "org_totals", "select requests, cost_micros from public.org_totals where org_id = $1", [org]))?.[0];
  equal("org_totals adds only its members' usage", Object.values(orgRow ?? {}).map(num), [2, 1500]);
  const day = (await rows(db, "daily_totals", "select requests, cost_micros from public.daily_totals"))?.[0];
  equal("daily_totals adds every call", Object.values(day ?? {}).map(num), [3, 1507]);
  equal("usage_events keeps every row", await one(db, "events", "select count(*)::int from public.usage_events"), 3);
  await as(db, "service_role", null, async () => {
    equal("device_auth reads this month's spend", num((await rows(db, "spend", "select month_cost_micros from public.device_auth('hash_a')"))?.[0]?.month_cost_micros), 1500);
  });
}

export async function checkAppEvents(db, org) {
  const batch = [
    { kind: "context_import", count: 2, tokensSaved: 1000 },
    { kind: "transfer", count: 1, tokensSaved: 500 },
    { kind: "memory_search", count: 3, tokensSaved: 99 },
    { kind: "extract_chat", count: 4 },
    { kind: "extract_all", count: 1 },
    { kind: "cori_chat", count: 2 },
    { kind: "rewrite", count: 1 },
    { kind: "voice", count: 1 },
  ];
  await as(db, "service_role", null, async () => {
    await rows(db, "record_app_events", "select public.record_app_events($1, null, $2::jsonb)", [A, JSON.stringify(batch)]);
    await rows(db, "record_app_events again", "select public.record_app_events($1, null, $2::jsonb)", [A, JSON.stringify([{ kind: "transfer", count: 1, tokensSaved: 100 }])]);
    await rows(db, "record_app_events empty", "select public.record_app_events($1, null, '[]'::jsonb)", [A]);
  });
  const cols = "tokens_saved, context_imports, transfers, extractions, cori_chats, action_runs";
  const user = (await rows(db, "user app totals", `select ${cols} from public.user_totals where user_id = $1`, [A]))?.[0];
  equal("tokensSaved adds up, only on imports and transfers", Object.values(user ?? {}).map(num), [1600, 2, 2, 5, 2, 2]);
  const orgRow = (await rows(db, "org app totals", `select ${cols} from public.org_totals where org_id = $1`, [org]))?.[0];
  equal("org_totals gets the same counts", Object.values(orgRow ?? {}).map(num), [1600, 2, 2, 5, 2, 2]);
  equal("daily_totals gets tokens saved", num(await one(db, "daily saved", "select tokens_saved from public.daily_totals")), 1600);
  equal("app_events keeps one row per entry", await one(db, "app rows", "select count(*)::int from public.app_events"), 9);
  equal("app_events keeps tokens saved per row", num(await one(db, "app saved", "select sum(tokens_saved) from public.app_events")), 1600);
}

const INVITE_EXPIRED = "00000000-0000-4000-8000-0000000000e1";
const INVITE_C = "00000000-0000-4000-8000-0000000000e2";
const INVITE_B = "00000000-0000-4000-8000-0000000000e3";
const INVITE_DECLINED = "00000000-0000-4000-8000-0000000000e4";

export async function checkInvites(db, org) {
  await db.query(
    `insert into public.org_invites (id, org_id, user_id, role, invited_by, expires_at, declined_at) values
       ($1, $5, $7, 'member', $6, now() - interval '1 day', null),
       ($2, $5, $8, 'member', $6, default, null),
       ($3, $5, $7, 'admin', $6, default, null),
       ($4, $5, $7, 'member', $6, default, now())`,
    [INVITE_EXPIRED, INVITE_C, INVITE_B, INVITE_DECLINED, org, A, B, C],
  );
  await as(db, "service_role", null, async () => {
    const accept = "select public.accept_org_invite($1, $2)";
    await refused(db, "an expired invite is refused", accept, /invite_expired/, [B, INVITE_EXPIRED]);
    await refused(db, "another account's invite is refused", accept, /invite_not_found/, [B, INVITE_C]);
    await refused(db, "a declined invite is refused", accept, /invite_not_found/, [B, INVITE_DECLINED]);
    await refused(db, "an unknown invite is refused", accept, /invite_not_found/, [B, "00000000-0000-4000-8000-0000000000ff"]);
    equal("a live invite is accepted", await one(db, "accept", accept, [B, INVITE_B]), org);
    await refused(db, "a used invite is refused", accept, /invite_not_found/, [B, INVITE_B]);
  });
  equal("the invite's role is kept", (await rows(db, "role", "select role, added_by from public.org_members where user_id = $1", [B]))?.[0], { role: "admin", added_by: "invite" });
  check("the invite is marked accepted", await one(db, "used", "select accepted_at is not null from public.org_invites where id = $1", [INVITE_B]));
  equal("org_totals counts the new member", await one(db, "members", "select members from public.org_totals where org_id = $1", [org]), 2);
}

export async function checkMemoryTotals(db, org) {
  await db.query(
    `insert into public.memory_files (user_id, object_path, bytes, digest, memories, entities, links, chats)
     values ($1, $2, 12345, 'd1', 10, 5, 3, 2)`,
    [B, `${B}/memory.coere`],
  );
  await db.query("update public.org_memory set facts = 7, entities = 4, relations = 2, sources = 1, index_bytes = 999 where org_id = $1", [org]);
  await as(db, "service_role", null, () => rows(db, "set_memory_totals", "select public.set_memory_totals($1)", [B]));
  const user = (await rows(db, "user memory", "select memories, entities, links, chats, storage_bytes from public.user_totals where user_id = $1", [B]))?.[0];
  equal("set_memory_totals copies the file's counts", Object.values(user ?? {}).map(num), [10, 5, 3, 2, 12345]);
  const orgRow = (await rows(db, "org memory", "select memories, entities, links, chats, storage_bytes, members from public.org_totals where org_id = $1", [org]))?.[0];
  equal("the organization takes the merged graph's counts", Object.values(orgRow ?? {}).map(num), [7, 4, 2, 1, 999, 2]);
  await db.query("delete from public.memory_files where user_id = $1", [B]);
  await as(db, "service_role", null, () => rows(db, "set_memory_totals after delete", "select public.set_memory_totals($1)", [B]));
  equal("a deleted file sets the counts to zero", num(await one(db, "zero", "select memories + storage_bytes from public.user_totals where user_id = $1", [B])), 0);
  await as(db, "service_role", null, () => rows(db, "set_memory_totals no org", "select public.set_memory_totals($1)", [C]));
}

export async function checkAdminReaders(db) {
  await db.query(
    `insert into storage.objects (bucket_id, name, metadata) values
       ('memory', $1 || '/memory.coere', '{"size": 100}'), ('memory', $1 || '/index.json', '{"size": 20}'),
       ('memory', $2 || '/memory.coere', '{"size": 300}')`,
    [A, B],
  );
  await as(db, "service_role", null, async () => {
    const tables = await rows(db, "admin_table_stats", "select * from public.admin_table_stats()");
    const pub = (tables ?? []).filter((t) => t.schema_name === "public");
    equal("admin_table_stats lists every public table", pub.length, 22);
    equal("every public table has Row Level Security on", pub.filter((t) => !t.rls_enabled).map((t) => t.table_name), []);
    equal("admin_table_stats counts policies", pub.find((t) => t.table_name === "profiles")?.policy_count, 2);
    check("admin_table_stats sees storage.objects", (tables ?? []).some((t) => t.schema_name === "storage" && t.table_name === "objects" && t.policy_count >= 2));
    const usage = await rows(db, "admin_storage_usage", "select * from public.admin_storage_usage()");
    const bucket = usage?.find((u) => u.bucket_id === "memory" && u.folder === null);
    equal("admin_storage_usage totals the bucket", [num(bucket?.objects), num(bucket?.bytes)], [3, 420]);
    const a = usage?.find((u) => u.folder === A);
    equal("admin_storage_usage totals each person", [num(a?.objects), num(a?.bytes)], [2, 120]);
  });
}
