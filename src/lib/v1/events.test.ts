import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DAY_COUNT_PER_KIND, DAY_SAVED, dailyCapArgs, parseEvents, perRequestCount, SAVED_PER_USE } from "./events";

describe("parseEvents", () => {
  it("accepts counts and tokens saved on imports and transfers", () => {
    const events = [
      { kind: "context_import", count: 2, tokensSaved: 18000 },
      { kind: "transfer", count: 1, tokensSaved: 0 },
      { kind: "memory_search", count: 40 },
    ];
    assert.deepEqual(parseEvents({ events }), events);
  });

  it("refuses an unknown kind, a bad count, tokens saved elsewhere, or a big batch", () => {
    assert.equal(parseEvents({ events: [{ kind: "chat_text", count: 1 }] }), null);
    assert.equal(parseEvents({ events: [{ kind: "voice", count: 0 }] }), null);
    assert.equal(parseEvents({ events: [{ kind: "voice", count: 1.5 }] }), null);
    assert.equal(parseEvents({ events: [{ kind: "voice", count: 100_001 }] }), null);
    assert.equal(parseEvents({ events: [{ kind: "voice", count: 1, tokensSaved: 5 }] }), null);
    assert.equal(parseEvents({ events: [{ kind: "transfer", count: 1, tokensSaved: -1 }] }), null);
    assert.equal(parseEvents({ events: [{ kind: "transfer", count: 1, tokensSaved: 100_000_001 }] }), null);
    assert.equal(parseEvents({ events: Array.from({ length: 51 }, () => ({ kind: "voice", count: 1 })) }), null);
    assert.equal(parseEvents({ events: [] }), null);
    assert.equal(parseEvents({}), null);
  });
});

describe("the caps on one batch", () => {
  it("keeps a real batch from the extension as it is", () => {
    // About what ten minutes of a busy build sends (coere-v2 usage-tally.ts).
    const events = [
      { kind: "extract_chat", count: 600 },
      { kind: "context_import", count: 3, tokensSaved: 41_000 },
      { kind: "memory_search", count: 25 },
      { kind: "memory_built", count: 1 },
    ];
    assert.deepEqual(parseEvents({ events }), events);
  });

  it("clamps a kind's summed count, so one request cannot add 5e6 imports", () => {
    const events = Array.from({ length: 50 }, () => ({ kind: "context_import", count: 100_000, tokensSaved: 100_000_000 }));
    const out = parseEvents({ events });
    assert.ok(out);
    assert.equal(out.length, 1);
    assert.equal(out[0].count, perRequestCount("context_import"));
    assert.ok(out[0].count <= 1_000);
    // One stored row may hold at most 100,000,000 tokens saved (app_events_saved_sane).
    assert.equal(out[0].tokensSaved, 100_000_000);
  });

  it("clamps tokens saved to what that many imports can save", () => {
    const out = parseEvents({ events: [{ kind: "context_import", count: 1, tokensSaved: 100_000_000 }] });
    assert.deepEqual(out, [{ kind: "context_import", count: 1, tokensSaved: SAVED_PER_USE }]);
    assert.ok(SAVED_PER_USE <= 1_000_000);
  });

  it("gives a whole backfill of chats more room than the other kinds", () => {
    assert.ok(perRequestCount("extract_chat") >= 5_000);
    assert.equal(parseEvents({ events: [{ kind: "extract_chat", count: 100_000 }] })?.[0].count, perRequestCount("extract_chat"));
  });

  it("sends record_app_events_capped the day's bounds for the device", () => {
    assert.deepEqual(dailyCapArgs("u1", "d1", [{ kind: "voice", count: 1 }]), {
      p_user: "u1",
      p_device: "d1",
      p_events: [{ kind: "voice", count: 1 }],
      p_day_count: DAY_COUNT_PER_KIND,
      p_day_saved: DAY_SAVED,
    });
    assert.ok(DAY_COUNT_PER_KIND <= 20_000 && DAY_SAVED <= 200_000_000);
  });
});
