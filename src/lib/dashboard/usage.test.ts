import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { daysBetween, summarize, type UsageRow } from "./usage";

const row = (created_at: string, model: string | null, kind: string, cost: number, tokens = 10): UsageRow => ({
  created_at,
  model,
  kind,
  input_tokens: tokens,
  output_tokens: 0,
  cache_read_tokens: 0,
  cache_write_tokens: 0,
  cost_micros: cost,
});

describe("daysBetween", () => {
  it("lists every UTC day, both ends included", () => {
    assert.deepEqual(daysBetween(new Date("2026-10-30T15:00:00Z"), new Date("2026-11-02T01:00:00Z")), ["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"]);
  });
});

describe("summarize", () => {
  it("adds cost and tokens by day, model and kind, biggest first", () => {
    const rows = [
      row("2026-11-01T10:00:00Z", "claude-haiku-5-5", "message", 100),
      row("2026-11-01T11:00:00Z", "claude-sonnet-5-5", "message", 900, 50),
      row("2026-11-03T09:00:00Z", "claude-haiku-5-5", "batch_result", 50),
      row("2026-11-03T09:30:00Z", null, "count_tokens", 0),
    ];
    const s = summarize(rows, new Date("2026-11-01T00:00:00Z"), new Date("2026-11-03T23:00:00Z"));
    assert.deepEqual(
      s.days.map((d) => [d.key, d.costMicros, d.requests]),
      [
        ["2026-11-01", 1000, 2],
        ["2026-11-02", 0, 0],
        ["2026-11-03", 50, 2],
      ],
    );
    assert.deepEqual(
      s.models.map((m) => [m.key, m.costMicros]),
      [
        ["claude-sonnet-5-5", 900],
        ["claude-haiku-5-5", 150],
        ["other", 0],
      ],
    );
    assert.deepEqual(s.kinds.map((k) => k.key), ["message", "batch_result", "count_tokens"]);
    assert.deepEqual(s.total, { key: "total", costMicros: 1050, tokens: 80, requests: 4 });
  });

  it("leaves rows outside the range out of the days but in the totals", () => {
    const s = summarize([row("2026-09-01T00:00:00Z", "claude-haiku-5-5", "message", 7)], new Date("2026-11-01T00:00:00Z"), new Date("2026-11-01T00:00:00Z"));
    assert.equal(s.days[0]?.costMicros, 0);
    assert.equal(s.total.costMicros, 7);
  });
});
