import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { secondsToNextMonth, spendRetryAfter, spentLimit } from "./spend";

const base = { monthlyLimitMicros: 5_000_000, lifetimeLimitMicros: null, monthCostMicros: 0, lifetimeCostMicros: 0 };

describe("spentLimit", () => {
  it("lets a call through under both limits", () => {
    assert.equal(spentLimit(base), null);
    assert.equal(spentLimit({ ...base, lifetimeLimitMicros: 9_000_000, lifetimeCostMicros: 8_999_999, monthCostMicros: 4_999_999 }), null);
  });

  it("stops at the monthly limit, inclusive", () => {
    assert.equal(spentLimit({ ...base, monthCostMicros: 5_000_000 }), "monthly");
  });

  it("has no lifetime limit when it is null, however much was spent", () => {
    assert.equal(spentLimit({ ...base, lifetimeCostMicros: 1e12 }), null);
  });

  it("stops at the lifetime limit, and names it before the month", () => {
    assert.equal(spentLimit({ ...base, lifetimeLimitMicros: 3_000_000, lifetimeCostMicros: 3_000_000 }), "lifetime");
    assert.equal(spentLimit({ ...base, lifetimeLimitMicros: 1, lifetimeCostMicros: 2, monthCostMicros: 9e9 }), "lifetime");
  });

  it("treats a zero limit as spent", () => {
    assert.equal(spentLimit({ ...base, monthlyLimitMicros: 0 }), "monthly");
    assert.equal(spentLimit({ ...base, lifetimeLimitMicros: 0 }), "lifetime");
  });
});

describe("spendRetryAfter", () => {
  it("waits for the next month, or an hour for a lifetime limit", () => {
    const now = new Date("2026-11-30T23:59:00Z");
    assert.equal(secondsToNextMonth(now), 60);
    assert.equal(spendRetryAfter("monthly", now), 60);
    assert.equal(spendRetryAfter("lifetime", now), 3600);
  });
});
