import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createOnce } from "./once";

describe("createOnce", () => {
  it("says yes once per key per window", () => {
    let t = 0;
    const once = createOnce(() => t);
    assert.equal(once.firstIn("a", 1000), true);
    assert.equal(once.firstIn("a", 1000), false);
    assert.equal(once.firstIn("b", 1000), true);
    t = 999;
    assert.equal(once.firstIn("a", 1000), false);
    t = 1000;
    assert.equal(once.firstIn("a", 1000), true);
  });

  it("keeps working past the sweep size", () => {
    let t = 0;
    const once = createOnce(() => t);
    for (let i = 0; i < 10_005; i++) once.firstIn(`k${i}`, 10);
    t = 20;
    assert.equal(once.firstIn("k0", 10), true);
    assert.equal(once.firstIn("k0", 10), false);
  });
});
