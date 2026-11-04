import assert from "node:assert/strict";
import { test } from "node:test";

import { limitsInForce, paused } from "./limits-in-force";

const built = {
  monthlyLimitMicros: 5_000_000,
  monthCostMicros: 1_000_000,
  lifetimeLimitMicros: null,
  lifetimeCostMicros: 11_000_000,
  dailyLimitMicros: null,
  dayCostMicros: 300_000,
  firstBuildDone: true,
  firstBuildLimitMicros: 10_000_000,
  firstBuildCostMicros: 0,
};

test("after the first build: the month, and no day while the daily limit is off", () => {
  assert.deepEqual(limitsInForce(built), [{ label: "This month", spentMicros: 1_000_000, limitMicros: 5_000_000, reached: false }]);
  assert.equal(paused(built), false);
});

test("a daily limit the operator set shows as today, and a lifetime limit always", () => {
  const s = { ...built, dailyLimitMicros: 300_000, lifetimeLimitMicros: 20_000_000 };
  assert.deepEqual(
    limitsInForce(s).map((l) => [l.label, l.reached]),
    [["This month", false], ["Today", true], ["Lifetime", false]],
  );
  assert.equal(paused(s), true);
});

test("during the first build: the allowance in place of the month and the day", () => {
  const s = { ...built, firstBuildDone: false, firstBuildCostMicros: 10_000_000, monthCostMicros: 0, dayCostMicros: 0, dailyLimitMicros: 1 };
  assert.deepEqual(limitsInForce(s), [{ label: "First build", spentMicros: 10_000_000, limitMicros: 10_000_000, reached: true }]);
  assert.equal(paused(s), true);
  assert.equal(paused({ ...s, firstBuildCostMicros: 9_999_999 }), false);
});
