import assert from "node:assert/strict";
import { test } from "node:test";

import { dailySeries, num, sumDaily, topBy } from "./totals";

const NOW = Date.parse("2026-11-03T12:00:00Z");

const rows = [
  { day: "2026-11-01", new_users: 2, input_tokens: "1000", output_tokens: 500, cost_micros: "2500000", tokens_saved: 9000, context_imports: 3, transfers: 1, requests: 4 },
  { day: "2026-11-03", new_users: 1, new_orgs: 1, input_tokens: 10, output_tokens: 5, cost_micros: 1, tokens_saved: null },
  { day: "2026-09-01", new_users: 5, cost_micros: 7 },
];

test("bigint columns that arrive as strings still add up", () => {
  assert.equal(num("2500000"), 2_500_000);
  assert.equal(num(null), 0);
  assert.equal(num("x"), 0);
});

test("the daily series is zero filled and counts input plus output as tokens used", () => {
  const s = dailySeries(rows, 3, NOW);
  assert.deepEqual(s.map((d) => d.date), ["2026-11-01", "2026-11-02", "2026-11-03"]);
  assert.equal(s[0]?.tokensUsed, 1500);
  assert.equal(s[0]?.costMicros, 2_500_000);
  assert.equal(s[1]?.newUsers, 0);
  assert.equal(s[2]?.newOrgs, 1);
});

test("lifetime totals add every row, old days included", () => {
  const t = sumDaily(rows);
  assert.equal(t.newUsers, 8);
  assert.equal(t.costMicros, 2_500_008);
  assert.equal(t.tokensUsed, 1515);
  assert.equal(t.tokensSaved, 9000);
  assert.equal(t.requests, 4);
  assert.equal("date" in t, false);
});

test("top rows are the largest, ties by name, zeros left out", () => {
  const people = [
    { name: "b", saved: 5 },
    { name: "a", saved: 5 },
    { name: "c", saved: 9 },
    { name: "d", saved: 0 },
  ];
  assert.deepEqual(topBy(people, (p) => p.saved, 2).map((p) => p.name), ["c", "a"]);
  assert.equal(topBy(people, (p) => p.saved).length, 3);
});
