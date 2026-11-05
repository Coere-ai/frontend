import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { niceScale } from "./nice-scale";

describe("niceScale", () => {
  it("rounds the top up to a step of 1, 2 or 5 times a power of ten", () => {
    assert.deepEqual(niceScale(615), { top: 800, step: 200 });
    assert.deepEqual(niceScale(205), { top: 400, step: 100 });
    assert.deepEqual(niceScale(45), { top: 80, step: 20 });
    assert.deepEqual(niceScale(551_800), { top: 800_000, step: 200_000 });
  });

  it("keeps counts whole, so a small axis steps by 1", () => {
    assert.deepEqual(niceScale(15), { top: 20, step: 5 });
    assert.deepEqual(niceScale(3), { top: 4, step: 1 });
    assert.deepEqual(niceScale(0), { top: 4, step: 1 });
  });

  it("lets money step in cents", () => {
    assert.deepEqual(niceScale(0.6, { whole: false }), { top: 0.8, step: 0.2 });
  });

  it("never leaves a value above the top", () => {
    for (const v of [1, 7, 11, 99, 101, 999, 1234, 48_000]) assert.ok(niceScale(v).top >= v, String(v));
  });
});
