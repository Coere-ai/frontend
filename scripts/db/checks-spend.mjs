// Checks of the spend limits and the free first build (docs/accounts.md
// 8.10, 10, Appendix A): the columns and their seeds (no daily limit on any
// plan), usage_daily and usage_model_daily, how spend_state() and
// device_auth() resolve the limits across the first build, the month and
// the UTC day, the first memory_built, the operator's reset, reserve_spend's
// rules, the two Cost page readers, and that a signed in person can neither
// read nor change any of it. Runs after checkRecordUsage, so today A has
// spent 1,500 micro dollars in 2 calls and B 7 in 1, all on Haiku, and no
// first build is done. Every check that writes is rolled back.

import { A, B, C } from "./checks-accounts.mjs";
import { as, check, equal, one, refused, rows } from "./harness.mjs";

const DENIED = /permission denied/;
const num = (value) => (value === null || value === undefined ? null : Number(value));
const asServer = (db, fn) => as(db, "service_role", null, fn);

// spend_state's columns, in its order. Every other reader carries the same names.
export const SPEND_COLUMNS = [
  "monthly_limit_micros", "month_cost_micros",
  "lifetime_limit_micros", "lifetime_cost_micros",
  "daily_limit_micros", "day_cost_micros",
  "first_build_done", "first_build_limit_micros", "first_build_cost_micros",
];

const shape = (row) => (row ? SPEND_COLUMNS.map((c) => (typeof row[c] === "boolean" ? row[c] : num(row[c]))) : null);

// [monthly limit, month spend, lifetime limit, lifetime spend, daily limit, day spend, built, allowance, first build spend]
async function spendOf(db, user, name) {
  let row = null;
  await asServer(db, async () => {
    row = (await rows(db, name, "select * from public.spend_state($1)", [user]))?.[0] ?? null;
  });
  return shape(row);
}

async function authOfA(db, name) {
  let row = null;
  await asServer(db, async () => {
    row = (await rows(db, name, `select ${SPEND_COLUMNS.join(", ")} from public.device_auth('hash_a')`))?.[0] ?? null;
  });
  return shape(row);
}

const meter = (db, user, cost) =>
  asServer(db, () => rows(db, `spend ${cost}`, "select public.record_usage($1, null, 'message', 'claude-opus-5-5', 1, 1, 0, 0, $2, 200, 1, null)", [user, cost]));
const built = (db, user) => asServer(db, () => rows(db, "memory_built", "select public.record_app_events($1, null, $2::jsonb)", [user, JSON.stringify([{ kind: "memory_built", count: 1 }])]));

export async function checkSpendColumns(db) {
  const columns = await rows(
    db,
    "spend columns",
    `select table_name || '.' || column_name as name, data_type, is_nullable, column_default from information_schema.columns
      where table_schema = 'public' and table_name in ('plans', 'profiles')
        and column_name in ('daily_limit_micros', 'first_build_limit_micros', 'first_build_at', 'first_build_mark_micros') order by 1`,
  );
  equal("the daily and first build columns", columns, [
    { name: "plans.daily_limit_micros", data_type: "bigint", is_nullable: "YES", column_default: null },
    { name: "plans.first_build_limit_micros", data_type: "bigint", is_nullable: "NO", column_default: "10000000" },
    { name: "profiles.daily_limit_micros", data_type: "bigint", is_nullable: "YES", column_default: null },
    { name: "profiles.first_build_at", data_type: "timestamp with time zone", is_nullable: "YES", column_default: null },
    { name: "profiles.first_build_limit_micros", data_type: "bigint", is_nullable: "YES", column_default: null },
    { name: "profiles.first_build_mark_micros", data_type: "bigint", is_nullable: "NO", column_default: "0" },
  ]);
  equal(
    "every plan keeps its monthly limit, has no daily limit and a $10 first build",
    await rows(db, "plan seeds", "select id, monthly_limit_micros::int as monthly, daily_limit_micros as daily, first_build_limit_micros::int as first from public.plans order by id"),
    [
      { id: "free", monthly: 5000000, daily: null, first: 10000000 },
      { id: "plus", monthly: 20000000, daily: null, first: 10000000 },
      { id: "team", monthly: 100000000, daily: null, first: 10000000 },
    ],
  );
  equal(
    "a new profile has no daily limit of its own and no first build",
    await one(db, "own daily", "select count(*)::int from public.profiles where daily_limit_micros is not null or first_build_limit_micros is not null or first_build_at is not null or first_build_mark_micros <> 0"),
    0,
  );
  for (const table of ["usage_daily", "usage_model_daily"]) {
    equal(
      `${table} has Row Level Security on and no policy`,
      await rows(db, `${table} rls`, "select c.relrowsecurity as rls, (select count(*)::int from pg_policy p where p.polrelid = c.oid) as policies from pg_class c where c.oid = $1::regclass", [`public.${table}`]),
      [{ rls: true, policies: 0 }],
    );
  }
  await refused(db, "a negative daily limit is refused", "update public.profiles set daily_limit_micros = -1 where id = $1", /profiles_limits_sane/, [A]);
  await refused(db, "a negative first build limit is refused", "update public.profiles set first_build_limit_micros = -1 where id = $1", /profiles_limits_sane/, [A]);
  await refused(db, "a negative plan daily limit is refused", "update public.plans set daily_limit_micros = -1 where id = 'free'", /plans_limits_sane/);
  await refused(db, "a negative plan first build limit is refused", "update public.plans set first_build_limit_micros = -1 where id = 'free'", /plans_limits_sane/);
}

export async function checkDailyRows(db) {
  const daily = await rows(db, "usage_daily", "select user_id, requests::int, input_tokens::int, output_tokens::int, cache_write_tokens::int, cache_read_tokens::int, cost_micros::int from public.usage_daily order by user_id");
  equal("record_usage keeps each account's day", daily, [
    { user_id: A, requests: 2, input_tokens: 1300, output_tokens: 200, cache_write_tokens: 50, cache_read_tokens: 400, cost_micros: 1500 },
    { user_id: B, requests: 1, input_tokens: 10, output_tokens: 0, cache_write_tokens: 0, cache_read_tokens: 0, cost_micros: 7 },
  ]);
  check("usage_daily is keyed by the UTC day", await one(db, "utc day", "select bool_and(day = (now() at time zone 'utc')::date) from public.usage_daily"));
  equal(
    "record_usage keeps the product's day per model",
    await rows(db, "usage_model_daily", "select model, requests::int, input_tokens::int, output_tokens::int, cache_write_tokens::int, cache_read_tokens::int, cost_micros::int from public.usage_model_daily"),
    [{ model: "claude-haiku-5-5", requests: 3, input_tokens: 1310, output_tokens: 200, cache_write_tokens: 50, cache_read_tokens: 400, cost_micros: 1507 }],
  );

  // meter_batch writes both through record_usage; a charged reservation names no model.
  await db.exec("begin");
  await db.query("insert into public.ai_batches (id, user_id, request_count, reserved_micros) values ('msgbatch_dd', $1, 1, 9), ('msgbatch_dx', $1, 1, 4)", [C]);
  await asServer(db, async () => {
    await rows(db, "meter batch", "select public.meter_batch($1, null, 'msgbatch_dd', $2::jsonb, 200, 10, null)", [C, JSON.stringify([{ model: "claude-sonnet-5-5", input: 10, output: 5, cacheWrite: 1, cacheRead: 2, costMicros: 70 }])]);
    await rows(db, "charge batch", "select public.charge_unmetered_batch($1, 'msgbatch_dx')", [C]);
  });
  equal("a metered batch lands in the account's day", num(await one(db, "batch day", "select cost_micros from public.usage_daily where user_id = $1", [C])), 74);
  equal(
    "and in its model's day, with a charged reservation under ''",
    await rows(db, "batch models", "select model, cost_micros::int from public.usage_model_daily where model <> 'claude-haiku-5-5' order by model"),
    [{ model: "", cost_micros: 4 }, { model: "claude-sonnet-5-5", cost_micros: 70 }],
  );
  await db.exec("rollback");
}

export async function checkSpendResolution(db) {
  await db.exec("begin");
  equal("before the first build: the $10 allowance against everything, and the month and the day count nothing", await authOfA(db, "first build"), [
    5000000, 0, null, 1500, null, 0, false, 10000000, 1500,
  ]);
  equal("device_auth carries spend_state's answer", await authOfA(db, "same"), await spendOf(db, A, "spend_state A"));

  await built(db, A);
  check("the first memory_built sets first_build_at", await one(db, "built at", "select first_build_at is not null from public.profiles where id = $1", [A]));
  equal("and marks the spend so far", num(await one(db, "mark", "select first_build_mark_micros from public.profiles where id = $1", [A])), 1500);
  equal("the first build's spend does not count in the month it finished, nor in its day", await authOfA(db, "built"), [
    5000000, 0, null, 1500, null, 0, true, 10000000, 0,
  ]);
  equal("though usage_monthly still holds it", num(await one(db, "month row", "select cost_micros from public.usage_monthly where user_id = $1", [A])), 1500);
  await meter(db, A, 600);
  equal("spend after the build counts in the month and the day", (await authOfA(db, "after"))?.slice(0, 6), [5000000, 600, null, 2100, null, 600]);

  await db.query("update public.profiles set first_build_at = now() - interval '40 days' where id = $1", [A]);
  const before = await one(db, "built before", "select first_build_at::text from public.profiles where id = $1", [A]);
  await built(db, A);
  equal("a later memory_built changes nothing", await one(db, "built after", "select first_build_at::text from public.profiles where id = $1", [A]), before);
  equal("a build finished in an earlier month: the whole month and day count", (await authOfA(db, "earlier month"))?.slice(0, 6), [5000000, 2100, null, 2100, null, 2100]);
  await db.query("update public.usage_daily set day = day - 1 where user_id = $1", [A]);
  equal("yesterday's spend does not count today", (await authOfA(db, "new day"))?.[5], 0);
  await db.query("update public.usage_monthly set month = (month - interval '1 month')::date where user_id = $1", [A]);
  equal("last month's spend does not count this month", (await authOfA(db, "new month"))?.[1], 0);

  equal("the daily limit is off by default", (await authOfA(db, "no daily"))?.[4], null);
  await db.query("update public.plans set daily_limit_micros = 3000000 where id = 'free'");
  equal("a plan's daily limit applies when the person has none", (await authOfA(db, "plan daily"))?.[4], 3000000);
  await db.query("update public.profiles set daily_limit_micros = 0, monthly_limit_micros = 7000000 where id = $1", [A]);
  equal("the person's own wins, and zero is a limit", (await authOfA(db, "own daily"))?.slice(0, 5), [7000000, 0, null, 2100, 0]);
  await db.query("update public.profiles set daily_limit_micros = null, monthly_limit_micros = null, first_build_limit_micros = 4000000 where id = $1", [A]);
  await db.query("update public.plans set daily_limit_micros = null where id = 'free'");
  equal("clearing both turns the daily limit off again", (await authOfA(db, "cleared"))?.[4], null);

  await asServer(db, async () => {
    equal("reset_first_build answers true for an account", await one(db, "reset", "select public.reset_first_build($1)", [A]), true);
    equal("and false for none", await one(db, "reset none", "select public.reset_first_build('00000000-0000-4000-8000-0000000000ff')"), false);
  });
  equal("a reset clears first_build_at", await one(db, "reset at", "select first_build_at from public.profiles where id = $1", [A]), null);
  equal("a reset gives a fresh allowance, the own one first, and the month waits again", await authOfA(db, "after reset"), [
    5000000, 0, null, 2100, null, 0, false, 4000000, 0,
  ]);
  await db.exec("rollback");
}

// reserve_spend on C, a free account ($5 a month) with no spend and its
// first build still to come. Rolled back at the end.
export async function checkSpendReserve(db) {
  await db.exec("begin");
  const reserve = (amount, batch = false) => asServer(db, async () => (await rows(db, `reserve ${amount}`, "select * from public.reserve_spend($1, $2, 900, $3)", [C, amount, batch]))?.[0]);
  const clear = () => db.query("delete from public.spend_holds where user_id = $1", [C]);

  check("the first build may pass the monthly limit", (await reserve(9_000_000))?.hold_id !== null);
  equal("a message that fits alone but not beside the first waits for it", (await reserve(1_500_000))?.refused, "pending");
  equal("one past the allowance on its own is refused by it", (await reserve(10_500_000))?.refused, "first_build");
  check("a message that fills the allowance exactly is held", (await reserve(1_000_000))?.hold_id !== null);
  equal("a batch waits once it is full", (await reserve(1, true))?.refused, "first_build");
  await clear();
  check("a batch far past the allowance starts while nothing is spent", (await reserve(40_000_000, true))?.hold_id !== null);
  equal("its hold keeps every message back while it is made", (await reserve(1))?.refused, "pending");
  await clear();
  await db.query("insert into public.ai_batches (id, user_id, request_count, reserved_micros) values ('msgbatch_c1', $1, 1, 40000000)", [C]);
  equal("a batch not yet metered refuses as the spent limit", (await reserve(1))?.refused, "first_build");
  await db.query("delete from public.ai_batches where id = 'msgbatch_c1'");
  await clear();

  await meter(db, C, 9_000_000);
  equal("the build's own spend counts against the allowance", (await spendOf(db, C, "C building"))?.slice(6), [false, 10000000, 9000000]);
  await built(db, C);
  equal("once the build is done, its $9 is not in the month", (await spendOf(db, C, "C built"))?.slice(0, 2), [5000000, 0]);
  check("so the whole $5 month is still there", (await reserve(5_000_000))?.hold_id !== null);
  equal("and the monthly limit applies after the build, a message in flight waited for", (await reserve(1))?.refused, "pending");
  equal("to a batch too", (await reserve(1, true))?.refused, "monthly");
  await clear();
  await meter(db, C, 5_000_000);
  equal("spend after the build fills the month", (await spendOf(db, C, "C month"))?.slice(0, 2), [5000000, 5000000]);
  equal("and nothing more starts this month", [(await reserve(1))?.refused, (await reserve(1, true))?.refused], ["monthly", "monthly"]);

  await db.query("update public.profiles set monthly_limit_micros = 1000000000 where id = $1", [C]);
  check("with no daily limit, a day may spend far past $2", (await reserve(50_000_000))?.hold_id !== null);
  await clear();
  await db.query("update public.plans set daily_limit_micros = 2000000 where id = 'free'");
  equal("a daily limit the operator sets counts the day's spend after the build", (await spendOf(db, C, "C day"))?.slice(4, 6), [2000000, 5000000]);
  equal("and refuses once it is spent", [(await reserve(1))?.refused, (await reserve(1, true))?.refused], ["daily", "daily"]);
  await db.query("update public.plans set daily_limit_micros = null where id = 'free'");
  check("turning it off lets the call through", (await reserve(1))?.hold_id !== null);
  await db.query("update public.profiles set lifetime_limit_micros = 1 where id = $1", [C]);
  equal("a lifetime limit always applies, and is named first", (await reserve(1))?.refused, "lifetime");
  await db.query("update public.profiles set lifetime_limit_micros = null where id = $1", [C]);

  await asServer(db, () => rows(db, "reset C", "select public.reset_first_build($1)", [C]));
  equal("after a reset, spend before it does not use the allowance", (await spendOf(db, C, "C reset"))?.slice(6), [false, 10000000, 0]);
  await db.exec("rollback");
}

export async function checkCostReaders(db) {
  await asServer(db, async () => {
    const today = await one(db, "today", "select ((now() at time zone 'utc')::date)::text");
    const all = await rows(db, "by model all", "select model, requests::int, input_tokens::int, output_tokens::int, cache_write_tokens::int, cache_read_tokens::int, cost_micros::int from public.admin_usage_by_model(null)");
    equal("admin_usage_by_model splits every call by model", all, [{ model: "claude-haiku-5-5", requests: 3, input_tokens: 1310, output_tokens: 200, cache_write_tokens: 50, cache_read_tokens: 400, cost_micros: 1507 }]);
    equal("from today is the same", (await rows(db, "by model today", "select model from public.admin_usage_by_model($1::date)", [today]))?.length, 1);
    equal("from tomorrow is empty", (await rows(db, "by model tomorrow", "select model from public.admin_usage_by_model($1::date + 1)", [today]))?.length, 0);

    const top = await rows(
      db,
      "top today",
      "select user_id, email, requests::int, cost_micros::int, month_cost_micros::int, daily_limit_micros, first_build_done, first_build_cost_micros::int from public.admin_top_accounts($1::date, 10)",
      [today],
    );
    equal("admin_top_accounts ranks by cost with each account's limits in force", top, [
      { user_id: A, email: "alice2@example.com", requests: 2, cost_micros: 1500, month_cost_micros: 0, daily_limit_micros: null, first_build_done: false, first_build_cost_micros: 1500 },
      { user_id: B, email: "b@example.com", requests: 1, cost_micros: 7, month_cost_micros: 0, daily_limit_micros: null, first_build_done: false, first_build_cost_micros: 7 },
    ]);
    const result = await db.query("select * from public.admin_top_accounts(null, 1)");
    equal("and carries spend_state's columns", result.fields.map((f) => f.name).slice(8), SPEND_COLUMNS);
    equal("all time reads user_totals and leaves out who spent nothing", (await rows(db, "top all", "select user_id from public.admin_top_accounts(null, 10)"))?.map((r) => r.user_id), [A, B]);
    equal("a limit of one keeps the top by each measure", (await rows(db, "top one", "select user_id from public.admin_top_accounts(null, 1)"))?.map((r) => r.user_id), [A]);
    equal("a range with no use is empty", (await rows(db, "top tomorrow", "select user_id from public.admin_top_accounts($1::date + 1, 10)", [today]))?.length, 0);
  });
}

export async function checkSpendLocked(db) {
  await as(db, "authenticated", A, async () => {
    for (const column of ["monthly_limit_micros", "lifetime_limit_micros", "daily_limit_micros", "first_build_limit_micros", "first_build_at", "first_build_mark_micros"]) {
      await refused(db, `a person cannot read their own ${column}`, `select ${column} from public.profiles where id = $1`, DENIED, [A]);
      const value = column === "first_build_at" ? "now()" : "999999999";
      await refused(db, `a person cannot set their own ${column}`, `update public.profiles set ${column} = ${value} where id = $1`, DENIED, [A]);
    }
    await refused(db, "a person cannot clear their first build", "update public.profiles set first_build_at = null where id = $1", DENIED, [A]);
    for (const column of ["monthly_limit_micros", "lifetime_limit_micros", "daily_limit_micros", "first_build_limit_micros"]) {
      await refused(db, `a person cannot read a plan's ${column}`, `select ${column} from public.plans`, DENIED);
      await refused(db, `a person cannot change a plan's ${column}`, `update public.plans set ${column} = 1`, DENIED);
    }
    await refused(db, "select * on profiles is refused", "select * from public.profiles", DENIED);
    await refused(db, "select * on plans is refused", "select * from public.plans", DENIED);
    for (const table of ["usage_daily", "usage_model_daily", "spend_holds", "ai_batches"]) await refused(db, `a person cannot read ${table}`, `select count(*) from public.${table}`, DENIED);
    await refused(db, "a person cannot call spend_state", "select * from public.spend_state($1)", DENIED, [A]);
    await refused(db, "a person cannot call device_auth", "select * from public.device_auth('hash_a')", DENIED);
    await refused(db, "a person cannot call reserve_spend", "select * from public.reserve_spend($1, 1, 900, false)", DENIED, [A]);
    await refused(db, "a person cannot call reset_first_build", "select public.reset_first_build($1)", DENIED, [A]);
    await refused(db, "a person cannot call admin_usage_by_model", "select * from public.admin_usage_by_model(null)", DENIED);
    await refused(db, "a person cannot call admin_top_accounts", "select * from public.admin_top_accounts(null, 10)", DENIED);
  });
  await as(db, "anon", null, async () => {
    await refused(db, "anon cannot call spend_state", "select * from public.spend_state($1)", DENIED, [A]);
  });
  equal(
    "nothing a person tried moved",
    await one(db, "locked", "select count(*)::int from public.profiles where monthly_limit_micros is not null or lifetime_limit_micros is not null or daily_limit_micros is not null or first_build_limit_micros is not null or first_build_at is not null"),
    0,
  );
  equal("and no plan moved", await one(db, "plans locked", "select count(*)::int from public.plans where daily_limit_micros is not null or first_build_limit_micros <> 10000000 or lifetime_limit_micros is not null"), 0);
}

// Values the operator and the first memory_built set, before the third run,
// so the rerun can be shown to keep them.
export async function setSpendValues(db) {
  await db.query("update public.plans set daily_limit_micros = 3500000, first_build_limit_micros = 12000000 where id = 'plus'");
  await db.query("update public.profiles set daily_limit_micros = 4000000, first_build_at = '2026-11-01T00:00:00Z', first_build_mark_micros = 1500 where id = $1", [A]);
}

export async function checkSpendKept(db) {
  equal("a rerun keeps a plan's edited daily limits", await rows(db, "plus kept", "select daily_limit_micros::int as d, first_build_limit_micros::int as f from public.plans where id = 'plus'"), [{ d: 3500000, f: 12000000 }]);
  equal("and the plans left alone still have no daily limit", await one(db, "others kept", "select count(*)::int from public.plans where id <> 'plus' and daily_limit_micros is null"), 2);
  equal(
    "a rerun keeps an account's own daily limit and first build",
    await rows(db, "A kept", "select daily_limit_micros::int as d, first_build_at = '2026-11-01T00:00:00Z' as at, first_build_mark_micros::int as m from public.profiles where id = $1", [A]),
    [{ d: 4000000, at: true, m: 1500 }],
  );
  equal("a rerun keeps the daily rows", await one(db, "daily kept", "select count(*)::int from public.usage_daily"), 2);
}
