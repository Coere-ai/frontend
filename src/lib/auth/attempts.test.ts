import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createAttemptLimiter, createSignInLimiter } from "./attempts";

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

describe("createSignInLimiter", () => {
  const limits = { perAddress: 3, perUsername: 6, windowMs: 1000 };

  it("refuses an address past its own budget", () => {
    const limiter = createSignInLimiter(limits);
    assert.deepEqual([1, 2, 3, 4].map((_, i) => limiter.hit("ip1", `name${i}`, 0)), [false, false, false, true]);
  });

  it("never lets one address lock a username out", () => {
    const limiter = createSignInLimiter(limits);
    for (let i = 0; i < 100; i += 1) limiter.hit("attacker", "sam", 0);
    assert.equal(limiter.hit("owner", "sam", 0), false);
  });

  it("caps the guesses many addresses get at one username", () => {
    const limiter = createSignInLimiter(limits);
    const answers = Array.from({ length: 8 }, (_, i) => limiter.hit(`ip${i}`, "sam", 0));
    assert.deepEqual(answers, [false, false, false, false, false, false, true, true]);
    assert.equal(limiter.hit("ip9", "alex", 0), false);
  });

  it("starts both budgets again when the window ends", () => {
    const limiter = createSignInLimiter(limits);
    for (let i = 0; i < 6; i += 1) limiter.hit(`ip${i}`, "sam", 0);
    assert.equal(limiter.hit("ip7", "sam", 999), true);
    assert.equal(limiter.hit("ip7", "sam", 1000), false);
  });

  it("counts a try with no username against the address alone", () => {
    const limiter = createSignInLimiter(limits);
    assert.deepEqual([1, 2, 3, 4].map(() => limiter.hit("ip1", null, 0)), [false, false, false, true]);
  });
});
