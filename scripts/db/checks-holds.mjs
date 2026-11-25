// Checks of 20261124000000_build_lane_holds.sql: the expected cost each hold
// keeps, and the seven argument reserve_spend's rules (docs/accounts.md
// 8.10). A message is refused as its spent limit when its expected cost does
// not fit alone, as `pending` when the expected costs in flight fill the
// limit, and as `concurrency` when the account has too many holds or every
// worst case in flight would pass the limit by more than the overrun. A
// batch keeps the four argument rules. Runs after checkSpendReserve, while
// C has spent nothing and the first build is not done (a $10 allowance on
// Free). Every check that writes is rolled back.

import { A, C } from "./checks-accounts.mjs";
import { as, check, equal, one, refused, rows } from "./harness.mjs";

const asServer = (db, fn) => as(db, "service_role", null, fn);
const OVERRUN = 5_000_000;
const LIVE = 128;

export async function checkHoldColumns(db) {
  const columns = await rows(
    db,
    "hold columns",
    `select column_name, data_type, is_nullable, column_default from information_schema.columns
      where table_schema = 'public' and table_name = 'spend_holds' and column_name = 'expected_micros'`,
  );
  equal("a hold keeps its expected cost, null on an older hold", columns, [{ column_name: "expected_micros", data_type: "bigint", is_nullable: "YES", column_default: null }]);
}

export async function checkLiveHolds(db) {
  await db.exec("begin");
  const reserve = (amount, expected, o = {}) =>
    asServer(db, async () =>
      (
        await rows(db, `reserve ${amount} ${expected}`, "select * from public.reserve_spend($1, $2, 360, $3, $4, $5, $6)", [
          C, amount, o.batch ?? false, expected, o.overrun ?? OVERRUN, o.live ?? LIVE,
        ])
      )?.[0],
    );
  const oldReserve = (amount, batch = false) =>
    asServer(db, async () => (await rows(db, `old reserve ${amount}`, "select * from public.reserve_spend($1, $2, 900, $3)", [C, amount, batch]))?.[0]);
  const clear = () => db.query("delete from public.spend_holds where user_id = $1", [C]);
  const holdOf = async (id) => (await rows(db, "hold", "select amount_micros::int as amount, expected_micros::int as expected, round(extract(epoch from expires_at - now()))::int as ttl from public.spend_holds where id = $1", [id]))?.[0];

  const first = await reserve(260_000, 87_000);
  equal("a hold keeps the worst case, the expected cost and its time", await holdOf(first?.hold_id), { amount: 260_000, expected: 87_000, ttl: 360 });
  equal("an expected cost above the worst case is held as the worst case", (await holdOf((await reserve(100, 1_000_000))?.hold_id))?.expected, 100);
  equal("a missing expected cost is the worst case", (await holdOf((await reserve(300, null))?.hold_id))?.expected, 300);
  await clear();

  // Calls of $0.20 at worst and $0.05 expected: the expected costs never fill the $10, so the
  // worst cases stop them once together they would pass it by more than $5, at 75 in flight.
  let admitted = 0;
  let stop = null;
  for (let i = 0; i < 200 && stop === null; i++) {
    const r = await reserve(200_000, 50_000);
    if (r?.hold_id) admitted += 1;
    else stop = r?.refused ?? "error";
  }
  equal("calls start until their worst cases would pass the allowance by the overrun", [admitted, stop], [75, "concurrency"]);
  await clear();

  // $1 at worst, $0.90 expected, with no overrun bound: eleven fit the $10, and the twelfth waits.
  for (let i = 0; i < 11; i++) await reserve(1_000_000, 900_000, { overrun: 1e12 });
  equal("a call that fits alone waits while the expected costs in flight fill the limit", (await reserve(1_000_000, 900_000, { overrun: 1e12 }))?.refused, "pending");
  equal("one whose expected cost cannot fit alone is refused by the limit, even with calls in flight", (await reserve(20_000_000, 10_500_000))?.refused, "first_build");
  equal("pending comes before the live holds cap", (await reserve(1_000_000, 900_000, { live: 1 }))?.refused, "pending");
  await clear();

  for (let i = 0; i < 3; i++) await reserve(1, 1, { live: 3 });
  equal("a call past the live holds cap waits a moment", (await reserve(1, 1, { live: 3 }))?.refused, "concurrency");
  check("a batch is never held back by the cap", (await reserve(1, 1, { live: 3, batch: true }))?.hold_id != null);
  await db.query("update public.spend_holds set expires_at = now() - interval '1 second' where user_id = $1", [C]);
  check("ended holds do not count toward the cap", (await reserve(1, 1, { live: 1 }))?.hold_id != null);
  await clear();

  equal("a call whose own worst case passes the allowance by more than the overrun is refused by it", (await reserve(16_000_000, 1_000_000))?.refused, "first_build");
  await reserve(1, 1);
  equal("beside another call it waits instead", (await reserve(16_000_000, 1_000_000))?.refused, "concurrency");
  await clear();

  // A hold made by the four argument function has no expected cost and counts its worst case.
  await oldReserve(9_500_000);
  equal("an older hold counts at its worst case", (await reserve(1_000_000, 600_000))?.refused, "pending");
  await clear();

  // A batch counts every hold's worst case. Since 20261125000000_proxy_settle, when only holds in
  // flight fill the limit it waits as pending (checks-proxy.mjs); the four argument function still refuses it.
  await reserve(9_000_000, 1_000_000);
  check("a batch starts while worst cases leave room", (await reserve(1_000_000, 0, { batch: true }))?.hold_id != null);
  equal("and waits as pending once holds in flight fill them", (await reserve(1, 0, { batch: true }))?.refused, "pending");
  equal("where the four argument function refuses it as the limit", (await oldReserve(1, true))?.refused, "first_build");
  await clear();

  // After the first build: the month, then the day, and the lifetime limit first.
  await asServer(db, () => rows(db, "memory_built", "select public.record_app_events($1, null, $2::jsonb)", [C, JSON.stringify([{ kind: "memory_built", count: 1 }])]));
  await reserve(5_000_000, 4_000_000);
  equal("the monthly limit applies after the build", (await reserve(2_000_000, 1_500_000))?.refused, "pending");
  await db.query("update public.plans set daily_limit_micros = 2000000 where id = 'free'");
  equal("a spent limit comes before pending, the day here", (await reserve(3_000_000, 2_500_000))?.refused, "daily");
  await db.query("update public.profiles set lifetime_limit_micros = 1 where id = $1", [C]);
  equal("a lifetime limit always applies, and is named first", (await reserve(2, 2))?.refused, "lifetime");
  await db.exec("rollback");

  await as(db, "authenticated", A, async () => {
    await refused(db, "a person cannot call the new reserve_spend", "select * from public.reserve_spend($1, 1, 360, false, 1, 1, 1)", /permission denied/, [A]);
  });
  equal("nothing was left held", await one(db, "holds left", "select count(*)::int from public.spend_holds"), 0);
}

// The live database already has the first migration, accounts and holds in
// flight when the second runs. They must all stay, and the new function must
// count the older holds at their worst case. `signUp` makes the accounts.
export async function checkUpgradeKeepsHolds(bootDatabase, [base, ...later], signUp) {
  const db = await bootDatabase();
  await db.exec(base);
  await signUp(db);
  await asServer(db, () => rows(db, "hold before the upgrade", "select * from public.reserve_spend($1, 9500000, 900, false)", [C]));
  for (const sql of later) await db.exec(sql);
  equal(
    "the upgrade keeps a hold in flight, with no expected cost",
    await rows(db, "held after the upgrade", "select amount_micros::int as amount, expected_micros from public.spend_holds where user_id = $1", [C]),
    [{ amount: 9_500_000, expected_micros: null }],
  );
  equal("both reserve_spend functions are there", await one(db, "both", "select count(*)::int from pg_proc where proname = 'reserve_spend'"), 2);
  const r = await asServer(db, async () => (await rows(db, "after upgrade", "select * from public.reserve_spend($1, 1000000, 360, false, 600000, $2, $3)", [C, OVERRUN, LIVE]))?.[0]);
  equal("and the new one counts it at its worst case", r?.refused, "pending");
  await db.close();
}
