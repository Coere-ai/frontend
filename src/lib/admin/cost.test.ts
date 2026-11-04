import assert from "node:assert/strict";
import { test } from "node:test";

import { parseCostRange, rangeStart, sortAccounts, sumFromDay, toAccountUsage, toModelUsage, totalUsage } from "./cost";

const NOW = Date.parse("2026-11-04T23:30:00Z");

test("a range starts on its first UTC day", () => {
  assert.equal(rangeStart("today", NOW), "2026-11-04");
  assert.equal(rangeStart("month", NOW), "2026-11-01");
  assert.equal(rangeStart("30d", NOW), "2026-10-06");
  assert.equal(rangeStart("all", NOW), null);
});

test("a range crosses the UTC day, not the local one", () => {
  // 20:30 in New York on the 4th is already the 5th in UTC.
  assert.equal(rangeStart("today", Date.parse("2026-11-04T20:30:00-05:00")), "2026-11-05");
  assert.equal(rangeStart("month", Date.parse("2026-11-30T23:59:59-08:00")), "2026-12-01");
  assert.equal(rangeStart("30d", Date.parse("2026-03-01T00:00:00Z")), "2026-01-31");
});

test("an unknown range reads as the last 30 days", () => {
  assert.equal(parseCostRange("month"), "month");
  assert.equal(parseCostRange("all"), "all");
  assert.equal(parseCostRange("year"), "30d");
  assert.equal(parseCostRange(null), "30d");
});

const MODELS = [
  { model: "claude-haiku-5-5", requests: "40", input_tokens: "1000", output_tokens: 200, cache_write_tokens: 50, cache_read_tokens: "4000", cost_micros: "300" },
  { model: "claude-opus-5-5", requests: 2, input_tokens: 10, output_tokens: 5, cache_write_tokens: 0, cache_read_tokens: 0, cost_micros: 900 },
  { model: "", requests: 1, input_tokens: 0, output_tokens: 0, cache_write_tokens: 0, cache_read_tokens: 0, cost_micros: 300 },
];

test("models come out with every count as a number, largest cost first", () => {
  const out = toModelUsage(MODELS);
  assert.deepEqual(out.map((m) => m.model), ["claude-opus-5-5", "claude-haiku-5-5", ""]);
  assert.deepEqual(out[1], { model: "claude-haiku-5-5", requests: 40, inputTokens: 1000, outputTokens: 200, cacheWriteTokens: 50, cacheReadTokens: 4000, costMicros: 300 });
});

test("the total row adds every model", () => {
  assert.deepEqual(totalUsage(toModelUsage(MODELS)), { requests: 43, inputTokens: 1010, outputTokens: 205, cacheWriteTokens: 50, cacheReadTokens: 4000, costMicros: 1500 });
  assert.deepEqual(totalUsage([]), { requests: 0, inputTokens: 0, outputTokens: 0, cacheWriteTokens: 0, cacheReadTokens: 0, costMicros: 0 });
});

const ACCOUNTS = toAccountUsage([
  { user_id: "a", email: "a@x.com", requests: 5, input_tokens: 100, output_tokens: 0, cache_write_tokens: 0, cache_read_tokens: 0, cost_micros: 500, monthly_limit_micros: "5000000", month_cost_micros: "200", daily_limit_micros: null, first_build_done: true, first_build_limit_micros: "10000000" },
  { user_id: "b", email: null, requests: 50, input_tokens: 10, output_tokens: 10, cache_write_tokens: 9, cache_read_tokens: 9, cost_micros: 100, monthly_limit_micros: 5000000, month_cost_micros: 0, first_build_done: false, first_build_limit_micros: 10000000, first_build_cost_micros: 100 },
  { user_id: "c", email: "c@x.com", requests: 1, input_tokens: 900, output_tokens: 100, cache_write_tokens: 0, cache_read_tokens: 0, cost_micros: 100, monthly_limit_micros: 5000000, month_cost_micros: 100, daily_limit_micros: "2000000", day_cost_micros: 100, first_build_done: true },
  { user_id: null, email: "gone", requests: 9, cost_micros: 9 },
]);

test("accounts count input plus output as tokens and keep their limits and spend", () => {
  assert.equal(ACCOUNTS.length, 3);
  assert.deepEqual(
    ACCOUNTS.map((a) => [a.id, a.tokens, a.spend.monthCostMicros, a.spend.dailyLimitMicros, a.spend.firstBuildDone, a.spend.firstBuildCostMicros]),
    [["a", 100, 200, null, true, 0], ["b", 20, 0, null, false, 100], ["c", 1000, 100, 2_000_000, true, 0]],
  );
});

test("accounts sort by cost, tokens or requests, ties by cost then id", () => {
  assert.deepEqual(sortAccounts(ACCOUNTS, "cost").map((a) => a.id), ["a", "b", "c"]);
  assert.deepEqual(sortAccounts(ACCOUNTS, "tokens").map((a) => a.id), ["c", "a", "b"]);
  assert.deepEqual(sortAccounts(ACCOUNTS, "requests").map((a) => a.id), ["b", "a", "c"]);
  assert.deepEqual(sortAccounts(ACCOUNTS, "requests", 1).map((a) => a.id), ["b"]);
});

test("this month adds the days from the first", () => {
  const days = [
    { date: "2026-10-31", count: 7 },
    { date: "2026-11-01", count: 2 },
    { date: "2026-11-03", count: 3 },
  ];
  assert.equal(sumFromDay(days, "2026-11-01"), 5);
});
