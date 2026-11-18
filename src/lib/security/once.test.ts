import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createOnce } from "./once";

/** How many times `run` walks a Map, which is what each sweep does. */
function mapWalks(run: () => void): number {
  const walk = Map.prototype[Symbol.iterator];
  let walks = 0;
  Map.prototype[Symbol.iterator] = function (this: Map<unknown, unknown>) {
    walks += 1;
    return walk.call(this);
  };
  try {
    run();
  } finally {
    Map.prototype[Symbol.iterator] = walk;
  }
  return walks;
}

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

  it("sweeps once per doubling, not once per key, while every key is fresh", () => {
    const once = createOnce(() => 0);
    assert.ok(mapWalks(() => { for (let i = 0; i < 40_000; i++) once.firstIn(`k${i}`, 1000); }) < 10);
    assert.equal(once.firstIn("k0", 1000), false);
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
