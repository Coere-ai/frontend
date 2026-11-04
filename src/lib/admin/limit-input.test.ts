import assert from "node:assert/strict";
import { test } from "node:test";

import { isLimitKind, isPlanId, LIMIT_COLUMNS, readAccountLimits, readPlanLimits, readRequiredDollars } from "./limit-input";

const form = (values: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return (name: string) => fd.get(name);
};

test("an account's limits are dollars with cents, and blank means the plan's", () => {
  assert.deepEqual(readAccountLimits(form({ daily: "2.50", firstBuild: "$10", monthly: "", lifetime: " " })), {
    ok: true,
    limits: { daily: 2_500_000, first_build: 10_000_000, monthly: null, lifetime: null },
  });
  assert.deepEqual(readAccountLimits(form({})), { ok: true, limits: { daily: null, first_build: null, monthly: null, lifetime: null } });
  // Zero is a limit (nothing may be spent), not the plan's.
  assert.deepEqual(readAccountLimits(form({ daily: "0" })), { ok: true, limits: { daily: 0, first_build: null, monthly: null, lifetime: null } });
});

test("a bad amount is refused, naming the field", () => {
  assert.deepEqual(readAccountLimits(form({ daily: "-1" })), { ok: false, error: "Daily limit: Type an amount in dollars, like 25 or 12.50." });
  assert.equal(readAccountLimits(form({ firstBuild: "1.234" })).ok, false);
  assert.match((readAccountLimits(form({ firstBuild: "abc" })) as { error: string }).error, /^First build allowance:/);
  assert.match((readAccountLimits(form({ monthly: "100001" })) as { error: string }).error, /^Monthly limit: A limit can be at most/);
});

test("a plan needs a daily, first build and monthly amount, and may have no lifetime limit", () => {
  assert.deepEqual(readPlanLimits(form({ daily: "2", firstBuild: "10", monthly: "5", lifetime: "" })), {
    ok: true,
    limits: { daily: 2_000_000, first_build: 10_000_000, monthly: 5_000_000, lifetime: null },
  });
  assert.deepEqual(readPlanLimits(form({ daily: "", firstBuild: "10", monthly: "5" })), { ok: false, error: "Daily limit: type an amount in dollars, like 2 or 2.50." });
  assert.match((readPlanLimits(form({ daily: "2", firstBuild: "", monthly: "5" })) as { error: string }).error, /^First build allowance:/);
  assert.match((readPlanLimits(form({ daily: "2", firstBuild: "10", monthly: "" })) as { error: string }).error, /^Monthly limit:/);
  assert.match((readPlanLimits(form({ daily: "2", firstBuild: "10", monthly: "5", lifetime: "x" })) as { error: string }).error, /^Lifetime limit:/);
});

test("the one amount for every plan must be there", () => {
  assert.deepEqual(readRequiredDollars("3.25", "Daily limit"), { ok: true, micros: 3_250_000 });
  assert.equal(readRequiredDollars("", "Daily limit").ok, false);
  assert.equal(readRequiredDollars(null, "Daily limit").ok, false);
  assert.equal(readRequiredDollars("-2", "Daily limit").ok, false);
});

test("only the four kinds can be cleared, each by its own column", () => {
  for (const kind of ["daily", "first_build", "monthly", "lifetime"]) assert.ok(isLimitKind(kind), kind);
  for (const bad of ["status", "plan_id", "", null, 1, "daily_limit_micros"]) assert.equal(isLimitKind(bad), false, String(bad));
  assert.deepEqual(Object.values(LIMIT_COLUMNS), ["daily_limit_micros", "first_build_limit_micros", "monthly_limit_micros", "lifetime_limit_micros"]);
});

test("a plan id is the shape the plans table holds", () => {
  assert.ok(isPlanId("free"));
  assert.ok(isPlanId("team_2"));
  for (const bad of ["", "Free", "a b", "x".repeat(41), null, "free;drop"]) assert.equal(isPlanId(bad), false, String(bad));
});
