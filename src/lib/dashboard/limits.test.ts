import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveLimits, spentShare } from "./limits";

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
