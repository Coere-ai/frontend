import assert from "node:assert/strict";
import { test } from "node:test";

import { countByDay, dayKeys, sumByDay, utcDay, windowStart } from "./by-day";

const NOW = Date.parse("2026-11-03T15:00:00Z");

test("days end today, oldest first, in UTC", () => {
  assert.deepEqual(dayKeys(3, NOW), ["2026-11-01", "2026-11-02", "2026-11-03"]);
  assert.deepEqual(dayKeys(0, NOW), ["2026-11-03"]);
  assert.equal(windowStart(3, NOW), "2026-11-01T00:00:00.000Z");
});

test("a timestamp's day is its UTC day", () => {
  assert.equal(utcDay("2026-11-02T23:30:00-05:00"), "2026-11-03");
  assert.equal(utcDay("not a date"), null);
  assert.equal(utcDay(null), null);
});

test("counts are zero filled and drop what is outside the window", () => {
  const points = countByDay(["2026-11-03T01:00:00Z", "2026-11-03T02:00:00Z", "2026-11-01T09:00:00Z", "2026-10-01T09:00:00Z", null], 3, NOW);
  assert.deepEqual(points, [
    { date: "2026-11-01", count: 1 },
    { date: "2026-11-02", count: 0 },
    { date: "2026-11-03", count: 2 },
  ]);
});

test("sums add each row's value into its day", () => {
  const rows = [
    { day: "2026-11-02", v: 5 },
    { day: "2026-11-02", v: 7 },
    { day: "2026-11-03", v: Number.NaN },
  ];
  const points = sumByDay(rows, (r) => r.day, (r) => r.v, 2, NOW);
  assert.deepEqual(points, [
    { date: "2026-11-02", count: 12 },
    { date: "2026-11-03", count: 0 },
  ]);
});
