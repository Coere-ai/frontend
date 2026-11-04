import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PAUSE_LINES, pauseOf } from "./limits";

// A free account after its first build: $5 a month, no daily or lifetime limit.
const built = {
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

describe("pauseOf", () => {
  it("is null while nothing is reached, and with no row", () => {
    assert.equal(pauseOf(built), null);
    assert.equal(pauseOf({ ...built, monthCostMicros: 4_999_999, dayCostMicros: 4_999_999 }), null);
    assert.equal(pauseOf(null), null);
    assert.equal(pauseOf(undefined), null);
  });

  it("is the month once the monthly limit is reached", () => {
    assert.equal(pauseOf({ ...built, monthCostMicros: 5_000_000 }), "month");
  });

  it("is the day only when the operator set a daily limit and it is reached", () => {
    assert.equal(pauseOf({ ...built, dailyLimitMicros: 2_000_000, dayCostMicros: 2_000_000 }), "day");
    assert.equal(pauseOf({ ...built, dailyLimitMicros: 2_000_000, dayCostMicros: 2_000_000, monthCostMicros: 5_000_000 }), "month");
  });

  it("asks to contact us for a spent lifetime limit or first build allowance", () => {
    assert.equal(pauseOf({ ...built, lifetimeLimitMicros: 1, lifetimeCostMicros: 1 }), "contact");
    assert.equal(pauseOf({ ...built, firstBuildDone: false, firstBuildCostMicros: 10_000_000 }), "contact");
    assert.equal(pauseOf({ ...built, firstBuildDone: false, firstBuildCostMicros: 9_999_999, monthCostMicros: 9e9 }), null);
  });
});

describe("PAUSE_LINES", () => {
  it("never holds a number", () => {
    for (const line of Object.values(PAUSE_LINES)) assert.doesNotMatch(line, /\d|\$/);
  });
});
