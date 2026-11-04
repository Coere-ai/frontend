import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { refusedLimit, secondsToNextDay, secondsToNextMonth, spendRetryAfter, spentLimit, toSpend } from "./spend";

// A free account after its first build, as the seeds leave it: $5 a month, no daily or lifetime limit.
const base = {
  monthlyLimitMicros: 5_000_000,
  monthCostMicros: 0,
  lifetimeLimitMicros: null,
  lifetimeCostMicros: 0,
  dailyLimitMicros: null,
  dayCostMicros: 0,
  firstBuildDone: true,
  firstBuildLimitMicros: 10_000_000,
  firstBuildCostMicros: 0,
};

describe("spentLimit", () => {
  it("lets a call through under every limit", () => {
    assert.equal(spentLimit(base), null);
    assert.equal(spentLimit({ ...base, lifetimeLimitMicros: 9_000_000, lifetimeCostMicros: 8_999_999, monthCostMicros: 4_999_999 }), null);
  });

  it("stops at the monthly limit, inclusive", () => {
    assert.equal(spentLimit({ ...base, monthCostMicros: 4_999_999 }), null);
    assert.equal(spentLimit({ ...base, monthCostMicros: 5_000_000 }), "monthly");
  });

  it("has no lifetime limit when it is null, however much was spent", () => {
    assert.equal(spentLimit({ ...base, lifetimeCostMicros: 1e12 }), null);
  });

  it("has no daily limit when it is null, the default, however much today cost", () => {
    assert.equal(spentLimit({ ...base, dayCostMicros: 4_999_999, monthCostMicros: 4_999_999 }), null);
  });

  it("stops at the lifetime limit, and names it first", () => {
    assert.equal(spentLimit({ ...base, lifetimeLimitMicros: 3_000_000, lifetimeCostMicros: 3_000_000 }), "lifetime");
    assert.equal(spentLimit({ ...base, lifetimeLimitMicros: 1, lifetimeCostMicros: 2, monthCostMicros: 9e9, dayCostMicros: 9e9, dailyLimitMicros: 1 }), "lifetime");
  });

  it("treats a zero limit as spent", () => {
    assert.equal(spentLimit({ ...base, monthlyLimitMicros: 0 }), "monthly");
    assert.equal(spentLimit({ ...base, lifetimeLimitMicros: 0 }), "lifetime");
    assert.equal(spentLimit({ ...base, dailyLimitMicros: 0 }), "daily");
    assert.equal(spentLimit({ ...base, firstBuildDone: false, firstBuildLimitMicros: 0 }), "first_build");
  });

  it("stops at a daily limit the operator set, inclusive, and names a spent month first", () => {
    const daily = { ...base, dailyLimitMicros: 2_000_000 };
    assert.equal(spentLimit({ ...daily, dayCostMicros: 1_999_999 }), null);
    assert.equal(spentLimit({ ...daily, dayCostMicros: 2_000_000 }), "daily");
    assert.equal(spentLimit({ ...daily, dayCostMicros: 2_000_000, monthCostMicros: 5_000_000 }), "monthly");
  });

  it("uses the first build allowance in place of the month and the day until the first build is done", () => {
    const building = { ...base, firstBuildDone: false, dailyLimitMicros: 2_000_000 };
    assert.equal(spentLimit({ ...building, firstBuildCostMicros: 9_000_000 }), null);
    // The month and the day count nothing while the build runs, and would not stop it if they did.
    assert.equal(spentLimit({ ...building, firstBuildCostMicros: 9_000_000, monthCostMicros: 9e9, dayCostMicros: 9e9 }), null);
    assert.equal(spentLimit({ ...building, firstBuildCostMicros: 10_000_000 }), "first_build");
    assert.equal(spentLimit({ ...building, firstBuildCostMicros: 10_000_000, lifetimeLimitMicros: 1, lifetimeCostMicros: 1 }), "lifetime");
  });

  it("applies the month once the build is done, whatever the build spent", () => {
    // The first build spent $9, but the month counts only spend after it.
    assert.equal(spentLimit({ ...base, lifetimeCostMicros: 9_000_000, monthCostMicros: 0 }), null);
    assert.equal(spentLimit({ ...base, lifetimeCostMicros: 14_000_000, monthCostMicros: 5_000_000 }), "monthly");
  });
});

describe("toSpend", () => {
  it("reads spend_state's columns, numbers given as strings included", () => {
    assert.deepEqual(
      toSpend({
        monthly_limit_micros: "5000000", month_cost_micros: "12", lifetime_limit_micros: null, lifetime_cost_micros: 900,
        daily_limit_micros: null, day_cost_micros: 0, first_build_done: true, first_build_limit_micros: "10000000", first_build_cost_micros: 0,
      }),
      { ...base, monthCostMicros: 12, lifetimeCostMicros: 900 },
    );
  });

  it("reads a set daily limit, a missing number as 0 and anything but true as not built", () => {
    const s = toSpend({ daily_limit_micros: "0", lifetime_limit_micros: 7, first_build_done: "yes", month_cost_micros: "x" });
    assert.deepEqual([s.dailyLimitMicros, s.lifetimeLimitMicros, s.firstBuildDone, s.monthCostMicros, s.monthlyLimitMicros], [0, 7, false, 0, 0]);
  });
});

describe("the day boundary", () => {
  it("counts to the next UTC midnight", () => {
    assert.equal(secondsToNextDay(new Date("2026-11-04T23:59:00Z")), 60);
    assert.equal(secondsToNextDay(new Date("2026-11-04T00:00:00Z")), 86_400);
    assert.equal(secondsToNextDay(new Date("2026-11-04T23:59:59.500Z")), 1);
  });

  it("rolls over a month and a year end", () => {
    assert.equal(secondsToNextDay(new Date("2026-11-30T12:00:00Z")), 43_200);
    assert.equal(secondsToNextDay(new Date("2026-12-31T23:00:00Z")), 3_600);
  });

  it("is UTC whatever the clock's own zone says", () => {
    // 20:00 in New York on the 4th is 01:00 UTC on the 5th: 23 hours to go.
    assert.equal(secondsToNextDay(new Date("2026-11-04T20:00:00-05:00")), 23 * 3600);
  });
});

describe("spendRetryAfter", () => {
  it("waits for the next month, the next day, or an hour for a limit only the operator lifts", () => {
    const now = new Date("2026-11-30T23:59:00Z");
    assert.equal(secondsToNextMonth(now), 60);
    assert.equal(spendRetryAfter("monthly", now), 60);
    assert.equal(spendRetryAfter("daily", new Date("2026-11-04T22:00:00Z")), 7200);
    assert.equal(spendRetryAfter("lifetime", now), 3600);
    assert.equal(spendRetryAfter("first_build", now), 3600);
  });
});

describe("refusedLimit", () => {
  it("reads reserve_spend's word, and anything else as the month", () => {
    assert.equal(refusedLimit("daily"), "daily");
    assert.equal(refusedLimit("first_build"), "first_build");
    assert.equal(refusedLimit("lifetime"), "lifetime");
    assert.equal(refusedLimit("monthly"), "monthly");
    assert.equal(refusedLimit(null), "monthly");
    assert.equal(refusedLimit("weekly"), "monthly");
  });
});
