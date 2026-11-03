import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { costMicros, hasPrice, PRICE_TABLE_DATE, PRICES } from "./prices";

const t = (input: number, output = 0, cacheRead = 0, cacheWrite = 0) => ({ input, output, cacheRead, cacheWrite });

describe("the price table", () => {
  it("is the 2026-10-22 table of section 11", () => {
    assert.equal(PRICE_TABLE_DATE, "2026-10-22");
    assert.deepEqual(PRICES["claude-opus-5-5"]?.base, { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 });
    assert.deepEqual(PRICES["claude-sonnet-5-5"]?.base, { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 });
    assert.deepEqual(PRICES["claude-haiku-5-5"]?.base, { input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125 });
    assert.deepEqual(PRICES["claude-haiku-5-5"]?.above100k, { input: 0.5, output: 2.5, cacheRead: 0.05, cacheWrite: 0.625 });
    const jev = PRICES["jev-1.14.0"]?.base;
    assert.equal(jev?.input, 0.042);
    assert.equal(jev?.output, 0);
    assert.ok(Math.abs((jev?.cacheWrite ?? 0) - 0.0525) < 1e-12);
    assert.equal(hasPrice("jev-1.13.0"), true);
    assert.equal(hasPrice("gpt"), false);
  });
});

describe("costMicros", () => {
  it("prices each kind of token", () => {
    assert.equal(costMicros("claude-sonnet-5-5", t(1000, 500, 2000, 400), "direct"), 2000 + 5000 + 400 + 1000);
    assert.equal(costMicros("claude-opus-5-5", t(1_000_000), "direct"), 4_000_000);
  });

  it("halves a batch", () => {
    assert.equal(costMicros("claude-sonnet-5-5", t(1000, 500), "batch"), 3500);
  });

  it("uses Haiku's long prompt tier past 100K, counting cache tokens", () => {
    assert.equal(costMicros("claude-haiku-5-5", t(100_000), "direct"), 10_000);
    assert.equal(costMicros("claude-haiku-5-5", t(60_000, 1000, 40_001), "direct"), Math.round(60_000 * 0.5 + 2500 + 40_001 * 0.05));
  });

  it("prices an unknown model as Opus", () => {
    assert.equal(costMicros("mystery", t(10, 10), "direct"), 240);
  });

  it("rounds to whole micro dollars", () => {
    assert.equal(costMicros("jev-1.14.0", t(10), "direct"), 0);
    assert.equal(costMicros("jev-1.14.0", t(100), "direct"), 4);
  });
});
