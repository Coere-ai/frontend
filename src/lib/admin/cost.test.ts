import assert from "node:assert/strict";
import { test } from "node:test";

import { costBy, costSince, sumFromDay } from "./cost";

const rows = [
  { user_id: "u1", model: "claude-opus-5-5", cost_micros: "300", created_at: "2026-11-03T10:00:00Z" },
  { user_id: "u2", model: "claude-haiku-5-5", cost_micros: 50, created_at: "2026-11-02T10:00:00Z" },
  { user_id: "u1", model: "claude-haiku-5-5", cost_micros: 25, created_at: "2026-11-01T10:00:00Z" },
  { user_id: null, model: null, cost_micros: null, created_at: "2026-11-03T11:00:00Z" },
];

test("spend by model adds each model's rows, largest first", () => {
  assert.deepEqual(costBy(rows, (r) => r.model), [
    { key: "claude-opus-5-5", costMicros: 300, requests: 1 },
    { key: "claude-haiku-5-5", costMicros: 75, requests: 2 },
    { key: null, costMicros: 0, requests: 1 },
  ]);
});

test("spend by account keeps a deleted account's rows together", () => {
  const out = costBy(rows, (r) => r.user_id, 2);
  assert.deepEqual(out, [
    { key: "u1", costMicros: 325, requests: 2 },
    { key: "u2", costMicros: 50, requests: 1 },
  ]);
});

test("spend since a moment counts only the rows at or after it", () => {
  assert.equal(costSince(rows, "2026-11-02T10:00:00Z"), 350);
  assert.equal(costSince([], "2026-11-02T10:00:00Z"), 0);
});

test("this month adds the days from the first", () => {
  const days = [
    { date: "2026-10-31", count: 7 },
    { date: "2026-11-01", count: 2 },
    { date: "2026-11-03", count: 3 },
  ];
  assert.equal(sumFromDay(days, "2026-11-01"), 5);
});
