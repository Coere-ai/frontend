import assert from "node:assert/strict";
import { test } from "node:test";

import { clampDays, download, isUuid, json, notFound, safeTimeZone } from "./http";

test("every answer is private", async () => {
  for (const res of [notFound(), json(200, { a: 1 }), download("a,b\n", "x.csv", "text/csv")]) {
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.match(res.headers.get("x-robots-tag") ?? "", /noindex/);
  }
  assert.equal(notFound().status, 404);
  assert.deepEqual(await json(503, { error: "x" }).json(), { error: "x" });
  assert.equal(download("", "waitlist.csv", "text/csv").headers.get("content-disposition"), 'attachment; filename="waitlist.csv"');
});

test("an unknown time zone falls back to UTC", () => {
  assert.equal(safeTimeZone("Europe/London"), "Europe/London");
  assert.equal(safeTimeZone("Mars/Base"), "UTC");
  assert.equal(safeTimeZone(null), "UTC");
  assert.equal(safeTimeZone("x".repeat(65)), "UTC");
});

test("days are whole and kept in range", () => {
  assert.equal(clampDays("7", 30, 400), 7);
  assert.equal(clampDays("9999", 30, 400), 400);
  assert.equal(clampDays("0", 30, 400), 30);
  assert.equal(clampDays("abc", 30, 400), 30);
  assert.equal(clampDays("2.9", 30, 400), 2);
});

test("only a uuid passes as an id", () => {
  assert.equal(isUuid("0b6f7c1e-2a3b-4c5d-8e9f-0a1b2c3d4e5f"), true);
  assert.equal(isUuid("0b6f7c1e-2a3b-4c5d-8e9f-0a1b2c3d4e5"), false);
  assert.equal(isUuid("../org"), false);
  assert.equal(isUuid(7), false);
});
