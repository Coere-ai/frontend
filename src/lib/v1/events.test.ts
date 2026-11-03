import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseEvents } from "./events";

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
