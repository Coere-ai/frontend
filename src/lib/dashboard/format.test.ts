import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ago, bytes, compact, day, dollars, percent, plural } from "./format";

describe("dashboard formats", () => {
  it("writes money from micro dollars", () => {
    assert.equal(dollars(0), "$0.00");
    assert.equal(dollars(5_000_000), "$5.00");
    assert.equal(dollars(1234), "under $0.01");
    assert.equal(dollars(123_456_789), "$123.46");
    assert.equal(dollars(1_234_500_000), "$1,234.50");
  });

  it("writes counts short", () => {
    assert.equal(compact(950), "950");
    assert.equal(compact(12_400), "12.4K");
    assert.equal(compact(3_000_000), "3M");
    assert.equal(compact(250_000), "250K");
  });

  it("writes sizes in steps of 1,024", () => {
    assert.equal(bytes(512), "512 B");
    assert.equal(bytes(1536), "1.5 KB");
    assert.equal(bytes(26_214_400), "25 MB");
  });

  it("writes dates in UTC and ages in whole units", () => {
    assert.equal(day("2026-11-03T23:30:00Z"), "Nov 3, 2026");
    assert.equal(day(null), "");
    const now = Date.parse("2026-11-03T12:00:00Z");
    assert.equal(ago("2026-11-03T11:59:30Z", now), "just now");
    assert.equal(ago("2026-11-03T11:00:00Z", now), "1 hour ago");
    assert.equal(ago("2026-10-31T12:00:00Z", now), "3 days ago");
    assert.equal(ago(null, now), "never");
  });

  it("keeps a meter between 0 and 100", () => {
    assert.equal(percent(2_500_000, 5_000_000), 50);
    assert.equal(percent(9, 5), 100);
    assert.equal(percent(1, 0), 0);
  });

  it("says one and many", () => {
    assert.equal(plural(1, "memory", "memories"), "1 memory");
    assert.equal(plural(1200, "chat"), "1,200 chats");
  });
});
