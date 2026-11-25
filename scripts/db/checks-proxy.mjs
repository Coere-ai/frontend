// Checks of 20261125000000_proxy_settle.sql (docs/accounts.md 8.4, 8.9,
// 8.10, 16): settle_call records a call and lets its hold go in one
// transaction, and a failed record keeps the hold; the site wide first build
// budget refuses a first build call as `site_budget`; a batch that only the
// message holds in flight fill is `pending`; the durable sign up limit; and
// the daily bound on feature counts. Runs after checkLiveHolds, while C has
// spent nothing and its first build is not done. Every check that writes is
// rolled back.

import { A, C } from "./checks-accounts.mjs";
import { as, check, equal, one, refused, rows } from "./harness.mjs";

const asServer = (db, fn) => as(db, "service_role", null, fn);
const OVERRUN = 5_000_000;
const LIVE = 128;

const reserveOf = (db) => (amount, expected, o = {}) =>
  asServer(db, async () =>
    (
      await rows(db, `reserve ${amount} ${expected}`, "select * from public.reserve_spend($1, $2, 360, $3, $4, $5, $6)", [
        C, amount, o.batch ?? false, expected, OVERRUN, LIVE,
      ])
    )?.[0],
  );

// Expects a server call inside the open transaction to fail, then rolls back to before it, so the checks after it still run.
async function failsAsServer(db, name, sql, pattern, params = []) {
  await db.exec("savepoint expect_failure");
  await db.exec("set role service_role");
  try {
    await db.query(sql, params);
    check(name, false, "was allowed");
  } catch (error) {
    check(name, pattern.test(error.message), error.message);
  }
  await db.exec("rollback to savepoint expect_failure");
  await db.exec("reset role");
}

const usageRows = [
  { model: "claude-opus-5-5", input: 1000, output: 10, cacheWrite: 0, cacheRead: 0, costMicros: 5250 },
  { model: "claude-sonnet-5-5", input: 1000, output: 400, cacheWrite: 0, cacheRead: 2000, costMicros: 7200 },
];

export async function checkSettleCall(db) {
  const reserve = reserveOf(db);
  await db.exec("begin");
  const before = await one(db, "usage before", "select count(*)::int from public.usage_events where user_id = $1", [C]);
  const hold = (await reserve(260_000, 87_000))?.hold_id;
  const settled = await asServer(db, () =>
    one(db, "settle_call", "select public.settle_call($1, $2, null, 'message', $3::jsonb, 200, 1200, 'req_1')", [hold, C, JSON.stringify(usageRows)]),
  );
  equal("settle_call answers true", settled, true);
  equal("it writes one usage row per model", await one(db, "usage after", "select count(*)::int from public.usage_events where user_id = $1", [C]), before + 2);
  equal(
    "with each model's tokens and cost",
    await rows(db, "rows", "select model, cache_read_tokens::int as cr, cost_micros::int as cost, status::int, duration_ms from public.usage_events where user_id = $1 and request_id = 'req_1' order by model", [C]),
    [
      { model: "claude-opus-5-5", cr: 0, cost: 5250, status: 200, duration_ms: 1200 },
      { model: "claude-sonnet-5-5", cr: 2000, cost: 7200, status: 200, duration_ms: 1200 },
    ],
  );
  equal("and adds them to the month", await one(db, "month", "select cost_micros::int from public.usage_monthly where user_id = $1", [C]), 12_450);
  equal("and lets the hold go in the same call", await one(db, "hold gone", "select count(*)::int from public.spend_holds where id = $1", [hold]), 0);

  // A record that fails rolls the delete back with it, so the hold keeps counting.
  const kept = (await reserve(260_000, 87_000))?.hold_id;
  await failsAsServer(db, "a settle whose record fails is refused", "select public.settle_call($1, $2, null, 'not_a_kind', $3::jsonb, 200, 1, 'req_2')", /usage_events_kind_known/, [kept, C, JSON.stringify(usageRows)]);
  equal("and its hold stays", await one(db, "hold kept", "select count(*)::int from public.spend_holds where id = $1", [kept]), 1);
  equal("with no usage row written", await one(db, "no row", "select count(*)::int from public.usage_events where request_id = 'req_2'"), 0);

  // Another account's hold is never let go by a settle naming the wrong account.
  await asServer(db, () => one(db, "settle other", "select public.settle_call($1, $2, null, 'count_tokens', '[]'::jsonb, 200, 1, null)", [kept, A]));
  equal("a settle for another account leaves the hold", await one(db, "hold still kept", "select count(*)::int from public.spend_holds where id = $1", [kept]), 1);
  await db.exec("rollback");

  await as(db, "authenticated", C, async () => {
    await refused(db, "a person cannot call settle_call", "select public.settle_call(null, $1, null, 'message', '[]'::jsonb, 200, 1, null)", /permission denied/, [C]);
  });
}

export async function checkFirstBuildBudget(db) {
  const reserve = reserveOf(db);
  const today = "select cost_micros::int from public.first_build_daily where day = (now() at time zone 'utc')::date";
  await db.exec("begin");
  equal("the budget is seeded at $1,000 a day", await one(db, "seed", "select value from public.site_settings where key = 'budget.first_build_daily'"), { micros: 1_000_000_000 });
  await db.query("update public.site_settings set value = '{\"micros\": 1000000}' where key = 'budget.first_build_daily'");
  await db.query("delete from public.first_build_daily");

  // $0.95 of first build spend today, from C, which is still in its first build.
  await asServer(db, () => rows(db, "first build spend", "select public.record_usage($1, null, 'message', 'claude-sonnet-5-5', 1, 1, 0, 0, 950000, 200, 1, null)", [C]));
  equal("first build spend is counted for the day", await one(db, "counted", today), 950_000);
  equal("a first build call past the site's budget is refused as site_budget", (await reserve(200_000, 100_000))?.refused, "site_budget");
  check("one that fits starts", (await reserve(200_000, 40_000))?.hold_id != null);
  check("a batch starts while the budget is not spent", (await reserve(10_000, 0, { batch: true }))?.hold_id != null);
  await db.query("delete from public.spend_holds where user_id = $1", [C]);

  await db.query("update public.first_build_daily set cost_micros = 1000000");
  equal("and is refused once it is", (await reserve(1, 0, { batch: true }))?.refused, "site_budget");
  await db.query("update public.profiles set lifetime_limit_micros = 1 where id = $1", [C]);
  equal("the account's own spent limit is named first", (await reserve(2, 2))?.refused, "lifetime");
  await db.query("update public.profiles set lifetime_limit_micros = null where id = $1", [C]);

  await db.query("delete from public.site_settings where key = 'budget.first_build_daily'");
  check("with no budget set there is no ceiling", (await reserve(200_000, 100_000))?.hold_id != null);
  await db.query("insert into public.site_settings (key, value) values ('budget.first_build_daily', '{\"micros\": 1}')");

  // After the first build, the budget no longer applies and spend no longer counts toward it.
  await asServer(db, () => rows(db, "memory_built", "select public.record_app_events($1, null, $2::jsonb)", [C, JSON.stringify([{ kind: "memory_built", count: 1 }])]));
  check("a call after the first build is not held to it", (await reserve(200_000, 100_000))?.hold_id != null);
  await asServer(db, () => rows(db, "later spend", "select public.record_usage($1, null, 'message', 'claude-sonnet-5-5', 1, 1, 0, 0, 5000, 200, 1, null)", [C]));
  equal("and its spend is not first build spend", await one(db, "not counted", today), 1_000_000);
  await db.exec("rollback");

  await as(db, "authenticated", C, async () => {
    await refused(db, "a person cannot read the budget's day", "select * from public.first_build_daily", /permission denied/);
  });
}

export async function checkBatchPending(db) {
  const reserve = reserveOf(db);
  await db.exec("begin");
  // Message holds of $9 at worst and $1 expected leave no worst case room for a batch.
  await reserve(9_000_000, 1_000_000);
  await reserve(1_000_000, 100_000);
  equal("a batch that only message holds in flight keep out waits as pending", (await reserve(1, 0, { batch: true }))?.refused, "pending");
  await db.query("delete from public.spend_holds where user_id = $1", [C]);

  // A batch not yet metered whose reservation fills the allowance is the limit, as before.
  await db.query("insert into public.ai_batches (id, user_id, request_count, reserved_micros) values ('msgbatch_full', $1, 1, 10000000)", [C]);
  await reserve(1, 1);
  equal("a batch kept out by a batch not yet metered is refused as the limit", (await reserve(1, 0, { batch: true }))?.refused, "first_build");
  await db.query("delete from public.ai_batches where id = 'msgbatch_full'");
  await db.query("delete from public.spend_holds where user_id = $1", [C]);

  // Spend at the limit is the limit, whatever is in flight.
  await asServer(db, () => rows(db, "spend to the limit", "select public.record_usage($1, null, 'message', null, 0, 0, 0, 0, 10000000, 200, 1, null)", [C]));
  await db.query("delete from public.first_build_daily");
  equal("a batch with spend at the limit is refused as the limit", (await reserve(1, 0, { batch: true }))?.refused, "first_build");
  await db.exec("rollback");
}

export async function checkSignUpLimit(db) {
  const hit = (hash) => asServer(db, () => one(db, `hit ${hash}`, "select public.hit_sign_up_limit($1, 2, 3600)", [hash]));
  await db.exec("begin");
  equal("an address gets its tries", [await hit("aa11"), await hit("aa11")], [false, false]);
  equal("and is over the limit after them", await hit("aa11"), true);
  equal("another address is counted apart", await hit("bb22"), false);
  await db.query("update public.sign_up_attempts set window_start = now() - interval '2 hours' where ip_hash = 'aa11'");
  equal("a new window starts the count again", await hit("aa11"), false);
  await failsAsServer(db, "a malformed hash is refused", "select public.hit_sign_up_limit('Not A Hash', 2, 3600)", /sign_up_attempts_hash_sane/);
  await db.exec("rollback");

  await as(db, "authenticated", C, async () => {
    await refused(db, "a person cannot call the sign up limit", "select public.hit_sign_up_limit('cc33', 2, 3600)", /permission denied/);
  });
}

export async function checkAppEventsCapped(db) {
  await db.exec("begin");
  const device = await one(db, "device", "insert into public.devices (user_id, name, token_hash, token_hint) values ($1, 'Chrome', 'hash_cap', 'cccc') returning id", [C]);
  const send = (events, dayCount = 10, daySaved = 1000) =>
    asServer(db, () => rows(db, "capped", "select public.record_app_events_capped($1, $2, $3::jsonb, $4, $5)", [C, device, JSON.stringify(events), dayCount, daySaved]));
  const totals = () => rows(db, "totals", "select context_imports::int as imports, extractions::int as extractions, tokens_saved::int as saved from public.user_totals where user_id = $1", [C]);
  const was = (await totals())?.[0];

  await send([{ kind: "extract_chat", count: 6 }, { kind: "context_import", count: 1, tokensSaved: 700 }]);
  await send([{ kind: "extract_chat", count: 6 }, { kind: "context_import", count: 1, tokensSaved: 700 }]);
  await send([{ kind: "extract_chat", count: 6 }]);
  const now = (await totals())?.[0];
  equal(
    "a device is held to the day's count per kind and tokens saved",
    { extractions: now.extractions - was.extractions, imports: now.imports - was.imports, saved: now.saved - was.saved },
    { extractions: 10, imports: 2, saved: 1000 },
  );
  equal("an entry with no room left stores no row", await one(db, "rows", "select count(*)::int from public.app_events where device_id = $1", [device]), 4);
  await db.query("update public.app_events set created_at = now() - interval '1 day' where device_id = $1", [device]);
  await send([{ kind: "extract_chat", count: 3 }]);
  equal("the next UTC day starts afresh", ((await totals())?.[0]?.extractions ?? 0) - was.extractions, 13);
  await db.exec("rollback");

  await as(db, "authenticated", C, async () => {
    await refused(db, "a person cannot call record_app_events_capped", "select public.record_app_events_capped($1, null, '[]'::jsonb, 1, 1)", /permission denied/, [C]);
  });
}

// An expired hold that was never let go is charged as spend before it is
// deleted: its charge_micros when the proxy set one, else its worst case.
// A hold settle_call or the proxy let go is never charged.
export async function checkExpiredHolds(db) {
  const reserve = reserveOf(db);
  const spent = () => one(db, "spent", "select coalesce(sum(cost_micros), 0)::int from public.usage_events where user_id = $1", [C]);
  await db.exec("begin");
  await db.query("delete from public.site_settings where key = 'budget.first_build_daily'");
  const before = await spent();
  const cut = (await reserve(260_000, 87_000))?.hold_id;
  const early = (await reserve(260_000, 87_000))?.hold_id;
  const settled = (await reserve(260_000, 87_000))?.hold_id;
  const released = (await reserve(260_000, 87_000))?.hold_id;
  await db.query("update public.spend_holds set charge_micros = 90000 where id = $1", [early]);
  await asServer(db, () => one(db, "settle", "select public.settle_call($1, $2, null, 'message', $3::jsonb, 200, 1, 'req_settled')", [settled, C, JSON.stringify([usageRows[1]])]));
  await db.query("delete from public.spend_holds where id = $1", [released]);
  await db.query("update public.spend_holds set expires_at = now() - interval '1 second' where user_id = $1", [C]);
  check("the next call starts", (await reserve(1, 1))?.hold_id != null);
  equal("an expired hold is charged its worst case, or the charge the proxy set, and a settled one only its own cost", (await spent()) - before, 260_000 + 90_000 + 7_200);
  equal(
    "each charge is one usage row named for the expired hold",
    await rows(db, "expired rows", "select cost_micros::int as cost, status::int from public.usage_events where user_id = $1 and request_id = 'expired_hold' order by cost_micros", [C]),
    [{ cost: 90_000, status: 504 }, { cost: 260_000, status: 504 }],
  );
  equal("and the expired holds are gone", await one(db, "gone", "select count(*)::int from public.spend_holds where id = any($1)", [[cut, early]]), 0);
  await db.exec("rollback");
  await as(db, "authenticated", C, async () => {
    await refused(db, "a person cannot set a hold's charge", "update public.spend_holds set charge_micros = 0", /permission denied/);
  });
}
