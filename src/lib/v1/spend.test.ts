import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { refusedLimit, secondsToNextDay, secondsToNextMonth, spendRetryAfter, spentLimit } from "./spend";

const base = {
  monthlyLimitMicros: 5_000_000,
  lifetimeLimitMicros: null,
  monthCostMicros: 0,
  lifetimeCostMicros: 0,
  dailyLimitMicros: 2_000_000,
  dayCostMicros: 0,
  firstBuildDone: true,
};

describe("spentLimit", () => {
  it("lets a call through under every limit", () => {
    assert.equal(spentLimit(base), null);
    assert.equal(spentLimit({ ...base, lifetimeLimitMicros: 9_000_000, lifetimeCostMicros: 8_999_999, monthCostMicros: 4_999_999, dayCostMicros: 1_999_999 }), null);
  });

  it("stops at the monthly limit, inclusive", () => {
    assert.equal(spentLimit({ ...base, monthCostMicros: 5_000_000 }), "monthly");
  });

  it("has no lifetime limit when it is null, however much was spent", () => {
    assert.equal(spentLimit({ ...base, lifetimeCostMicros: 1e12 }), null);
  });

  it("stops at the lifetime limit, and names it before the month", () => {
    assert.equal(spentLimit({ ...base, lifetimeLimitMicros: 3_000_000, lifetimeCostMicros: 3_000_000 }), "lifetime");
    assert.equal(spentLimit({ ...base, lifetimeLimitMicros: 1, lifetimeCostMicros: 2, monthCostMicros: 9e9, dayCostMicros: 9e9 }), "lifetime");
  });

  it("treats a zero limit as spent", () => {
    assert.equal(spentLimit({ ...base, monthlyLimitMicros: 0 }), "monthly");
    assert.equal(spentLimit({ ...base, lifetimeLimitMicros: 0 }), "lifetime");
    assert.equal(spentLimit({ ...base, dailyLimitMicros: 0 }), "daily");
  });

  it("stops at the daily limit once the first build is done, inclusive", () => {
    assert.equal(spentLimit({ ...base, dayCostMicros: 1_999_999 }), null);
    assert.equal(spentLimit({ ...base, dayCostMicros: 2_000_000 }), "daily");
  });

  it("names a spent month before a spent day, since the month lasts longer", () => {
    assert.equal(spentLimit({ ...base, dayCostMicros: 2_000_000, monthCostMicros: 5_000_000 }), "monthly");
  });

  it("uses the first build allowance until the first build is done", () => {
    const building = { ...base, firstBuildDone: false, dailyLimitMicros: 10_000_000 };
    assert.equal(spentLimit({ ...building, dayCostMicros: 9_000_000 }), null);
    assert.equal(spentLimit({ ...building, dayCostMicros: 10_000_000 }), "first_build");
    // It outlasts the month, so it is named first.
    assert.equal(spentLimit({ ...building, dayCostMicros: 10_000_000, monthCostMicros: 5_000_000 }), "first_build");
    assert.equal(spentLimit({ ...building, dayCostMicros: 10_000_000, lifetimeLimitMicros: 1, lifetimeCostMicros: 1 }), "lifetime");
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
