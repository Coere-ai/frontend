import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createAttemptLimiter } from "./attempts";

describe("createAttemptLimiter", () => {
  it("allows max attempts in a window, then refuses", () => {
    const limiter = createAttemptLimiter({ max: 3, windowMs: 1000 });
    assert.deepEqual([1, 2, 3, 4, 5].map(() => limiter.hit("a", 0)), [false, false, false, true, true]);
  });

  it("starts again when the window ends", () => {
    const limiter = createAttemptLimiter({ max: 1, windowMs: 1000 });
    assert.equal(limiter.hit("a", 0), false);
    assert.equal(limiter.hit("a", 999), true);
    assert.equal(limiter.hit("a", 1000), false);
  });

  it("counts each key apart", () => {
    const limiter = createAttemptLimiter({ max: 1, windowMs: 1000 });
    assert.equal(limiter.hit("a", 0), false);
    assert.equal(limiter.hit("b", 0), false);
    assert.equal(limiter.hit("a", 0), true);
  });
});
