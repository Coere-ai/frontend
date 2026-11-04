// Checks of Row Level Security and the grants: what a signed in person, a
// visitor with the publishable key and the server may each do. Runs last,
// on the rows the other checks made. A is the organization's admin, B a
// member once demoted below, C in no organization with one invite.

import { A, B, C } from "./checks-accounts.mjs";
import { as, check, equal, one, refused, rows } from "./harness.mjs";

const DENIED = /permission denied/;

export async function checkOwnRows(db) {
  await as(db, "authenticated", A, async () => {
    equal("A sees only A's profile", (await rows(db, "profiles", "select id from public.profiles"))?.map((r) => r.id), [A]);
    equal("A sees only A's devices", await one(db, "devices", "select count(*)::int from public.devices where user_id <> $1", [A]), 0);
    equal("A sees A's devices", await one(db, "own devices", "select count(*)::int from public.devices"), 2);
    await refused(db, "A cannot read token_hash", "select token_hash from public.devices", DENIED);
    await refused(db, "A cannot select * from devices", "select * from public.devices", DENIED);
    equal("A sees only A's usage", await one(db, "usage", "select count(*)::int from public.usage_events where user_id <> $1", [A]), 0);
    equal("A sees only A's totals", (await rows(db, "totals", "select user_id from public.user_totals"))?.map((r) => r.user_id), [A]);
    equal("plans are readable", await one(db, "plans", "select count(*)::int from public.plans"), 3);

    await refused(db, "A cannot change plan_id", "update public.profiles set plan_id = 'team' where id = $1", DENIED, [A]);
    await refused(db, "A cannot change status", "update public.profiles set status = 'active' where id = $1", DENIED, [A]);
    await rows(db, "A sets a display name", "update public.profiles set display_name = 'Al' where id = $1", [A]);
    await rows(db, "A tries B's display name", "update public.profiles set display_name = 'Hacked' where id = $1", [B]);
    await refused(db, "A cannot delete devices", "delete from public.devices where user_id = $1", DENIED, [B]);
    await refused(db, "A cannot insert a device", "insert into public.devices (user_id, name, token_hash, token_hint) values ($1, 'x', 'y', 'z')", DENIED, [A]);
    for (const table of ["device_codes", "ai_batches", "spend_holds", "app_events", "security_events", "daily_totals", "developer_waitlist"]) {
      await refused(db, `A cannot read ${table}`, `select count(*) from public.${table}`, DENIED);
    }
    await refused(db, "A cannot call device_auth", "select * from public.device_auth('hash_b')", DENIED);
    await refused(db, "A cannot call reserve_spend", "select * from public.reserve_spend($1, 0, 1, false)", DENIED, [A]);
    await refused(db, "A cannot call record_app_events", "select public.record_app_events($1, null, '[]'::jsonb)", DENIED, [A]);
    await refused(db, "A cannot call admin_table_stats", "select * from public.admin_table_stats()", DENIED);
  });
  equal("A's display name changed", await one(db, "display A", "select display_name from public.profiles where id = $1", [A]), "Al");
  equal("B's display name did not", await one(db, "display B", "select display_name from public.profiles where id = $1", [B]), null);
  equal("B's devices are all there", await one(db, "B devices", "select count(*)::int from public.devices where user_id = $1", [B]), 1);

  await as(db, "anon", null, async () => {
    await refused(db, "anon cannot read plans", "select count(*) from public.plans", DENIED);
    await refused(db, "anon cannot read profiles", "select count(*) from public.profiles", DENIED);
    await refused(db, "anon cannot read site_visits", "select count(*) from public.site_visits", DENIED);
    await refused(db, "anon cannot call my_org_id", "select public.my_org_id()", DENIED);
  });
}

export async function checkOrganizationRows(db, org) {
  await as(db, "authenticated", A, async () => {
    equal("the admin sees the organization", await one(db, "org", "select count(*)::int from public.organizations"), 1);
    equal("the admin sees both members", await one(db, "members", "select count(*)::int from public.org_members"), 2);
    equal("the admin sees every invite", await one(db, "invites", "select count(*)::int from public.org_invites"), 4);
    equal("my_org_id is the admin's org", await one(db, "my_org_id", "select public.my_org_id()"), org);
    equal("the admin sees org_totals", await one(db, "org_totals", "select count(*)::int from public.org_totals"), 1);
  });
  await db.query("update public.org_members set role = 'member' where user_id = $1", [B]);
  await as(db, "authenticated", B, async () => {
    equal("a member sees the organization", await one(db, "org", "select count(*)::int from public.organizations"), 1);
    equal("a member sees both members", await one(db, "members", "select count(*)::int from public.org_members"), 2);
    equal("a member sees the org memory row", await one(db, "org_memory", "select count(*)::int from public.org_memory"), 1);
    equal("a member sees only their own invites", await one(db, "invites", "select count(*)::int from public.org_invites where user_id <> $1", [B]), 0);
  });
  await as(db, "authenticated", C, async () => {
    for (const table of ["organizations", "org_members", "org_memory", "org_totals"]) {
      equal(`an outsider sees no ${table}`, await one(db, table, `select count(*)::int from public.${table}`), 0);
    }
    equal("an invited outsider sees their invite", (await rows(db, "own invite", "select user_id from public.org_invites"))?.map((r) => r.user_id), [C]);
  });
}

export async function checkStorage(db) {
  await as(db, "authenticated", A, async () => {
    const names = (await rows(db, "objects", "select name from storage.objects order by name"))?.map((r) => r.name);
    check("A sees only A's objects", names?.length === 2 && names.every((n) => n.startsWith(`${A}/`)), JSON.stringify(names));
    await rows(db, "A deletes B's object", "delete from storage.objects where name like $1", [`${B}/%`]);
    await refused(db, "A cannot upload", "insert into storage.objects (bucket_id, name) values ('memory', $1 || '/x.json')", /row-level security/, [A]);
    await rows(db, "A deletes A's index", "delete from storage.objects where name = $1", [`${A}/index.json`]);
  });
  equal("B's object survives A's delete", await one(db, "B object", "select count(*)::int from storage.objects where name like $1", [`${B}/%`]), 1);
  equal("A's own delete works", await one(db, "A object", "select count(*)::int from storage.objects where name = $1", [`${A}/index.json`]), 0);
}

export async function checkServerWrites(db) {
  await as(db, "service_role", null, async () => {
    const insert = "insert into public.developer_waitlist (email, source) values ($1, 'site') on conflict (email) do nothing";
    await rows(db, "waitlist insert", insert, ["dev@example.com"]);
    await rows(db, "waitlist repeat", insert, ["dev@example.com"]);
    equal("a repeat waitlist signup is one row", await one(db, "waitlist", "select count(*)::int from public.developer_waitlist"), 1);
    await rows(db, "security event", "insert into public.security_events (kind) values ('sign_in')");
    await refused(db, "an unknown security kind is refused", "insert into public.security_events (kind) values ('nope')", /security_events_kind_known/);
    await refused(db, "an uppercase waitlist email is refused", insert, /developer_waitlist_email_lower/, ["Dev@Example.com"]);
  });
}
