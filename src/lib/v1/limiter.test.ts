import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createLimiter } from "./limiter";

describe("createLimiter", () => {
  it("allows the limit in a minute, then refuses with the seconds left", () => {
    let t = 1_000_000;
    const l = createLimiter(() => t);
    for (let i = 0; i < 3; i++) assert.deepEqual(l.hit("d1", 3), { ok: true });
    t += 15_500;
    assert.deepEqual(l.hit("d1", 3), { ok: false, retryAfterSeconds: 45 });
  });

  it("keeps keys apart and opens a new window after a minute", () => {
    let t = 0;
    const l = createLimiter(() => t);
    assert.equal(l.hit("a", 1).ok, true);
    assert.equal(l.hit("a", 1).ok, false);
    assert.equal(l.hit("b", 1).ok, true);
    t += 60_000;
    assert.equal(l.hit("a", 1).ok, true);
  });
});
