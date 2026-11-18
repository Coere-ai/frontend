import assert from "node:assert/strict";
import { test } from "node:test";

import { rateLimited } from "./rate-limit";

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

test("a flood of new addresses sweeps once per doubling, not once per address", () => {
  assert.ok(mapWalks(() => { for (let i = 0; i < 40_000; i++) rateLimited(`10.0.${i}`); }) < 10);
});

test("an address gets 120 beacons a minute, then is refused", () => {
  for (let i = 0; i < 120; i++) assert.equal(rateLimited("192.0.2.7"), false);
  assert.equal(rateLimited("192.0.2.7"), true);
  assert.equal(rateLimited("192.0.2.8"), false);
});
