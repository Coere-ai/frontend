import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { pausedToday, resolveLimits, spentShare } from "./limits";

const free = { monthlyLimitMicros: 5_000_000, lifetimeLimitMicros: null };

describe("resolveLimits", () => {
  it("takes the plan's when the person has none", () => {
    assert.deepEqual(resolveLimits({ monthlyLimitMicros: null, lifetimeLimitMicros: null }, free), { monthlyMicros: 5_000_000, lifetimeMicros: null, ownMonthly: false });
    assert.deepEqual(resolveLimits(null, { monthlyLimitMicros: 1, lifetimeLimitMicros: 9 }), { monthlyMicros: 1, lifetimeMicros: 9, ownMonthly: false });
  });

  it("takes the person's own over the plan's, each on its own", () => {
    assert.deepEqual(resolveLimits({ monthlyLimitMicros: 7_000_000, lifetimeLimitMicros: null }, { monthlyLimitMicros: 5, lifetimeLimitMicros: 30 }), { monthlyMicros: 7_000_000, lifetimeMicros: 30, ownMonthly: true });
    assert.deepEqual(resolveLimits({ monthlyLimitMicros: null, lifetimeLimitMicros: 40 }, free), { monthlyMicros: 5_000_000, lifetimeMicros: 40, ownMonthly: false });
  });

  it("keeps a limit of zero as a limit", () => {
    assert.deepEqual(resolveLimits({ monthlyLimitMicros: 0, lifetimeLimitMicros: 0 }, free), { monthlyMicros: 0, lifetimeMicros: 0, ownMonthly: true });
  });
});

describe("spentShare", () => {
  it("is the whole percent spent, and a zero limit is spent", () => {
    assert.equal(spentShare(2_500_000, 5_000_000), 50);
    assert.equal(spentShare(9, 5), 100);
    assert.equal(spentShare(0, 0), 100);
  });
});

describe("pausedToday", () => {
  it("is true only while a done first build's day is at its limit", () => {
    assert.equal(pausedToday({ daily_limit_micros: "2000000", day_cost_micros: "2000000", first_build_done: true }), true);
    assert.equal(pausedToday({ daily_limit_micros: 2_000_000, day_cost_micros: 2_500_000, first_build_done: true }), true);
    assert.equal(pausedToday({ daily_limit_micros: 2_000_000, day_cost_micros: 1_999_999, first_build_done: true }), false);
  });

  it("is false during the first build, even with its allowance spent, and with no row", () => {
    assert.equal(pausedToday({ daily_limit_micros: 10_000_000, day_cost_micros: 10_000_000, first_build_done: false }), false);
    assert.equal(pausedToday(null), false);
    assert.equal(pausedToday(undefined), false);
    assert.equal(pausedToday({ daily_limit_micros: "x", day_cost_micros: 1, first_build_done: true }), false);
  });
});
