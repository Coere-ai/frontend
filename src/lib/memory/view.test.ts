import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { MemoryIndex } from "./index-types";
import { toView } from "./view";

const fact = (id: string, importance: number, extra: Partial<MemoryIndex["facts"][number]> = {}): MemoryIndex["facts"][number] => ({
  id,
  subject: "me",
  under: null,
  kind: "note",
  key: null,
  text: `Memory ${id}`,
  importance,
  status: "active",
  sensitivity: null,
  first: null,
  last: null,
  sources: 1,
  ...extra,
});

const index: MemoryIndex = {
  v: 1,
  digest: "d",
  created: "2026-11-01T00:00:00Z",
  timeZone: null,
  self: "me",
  sections: [{ key: "work", name: "Work" }],
  entities: [
    { id: "me", kind: "self", name: "Sam", section: "personal", parent: null, importance: 5 },
    { id: "acme", kind: "org", name: "Acme", section: "work", parent: null, importance: 4 },
  ],
  facts: [fact("a", 2, { subject: "acme" }), fact("b", 5, { under: "sec_work" }), fact("c", 4, { status: "superseded" }), fact("d", 3, { contributor: "u1" })],
  relations: [],
  sources: [
    { id: "s1", platform: "claude", title: "Old", capturedAt: "2026-01-01T00:00:00Z", messages: 3, sections: ["work"] },
    { id: "s2", platform: "chatgpt", title: "New", capturedAt: "2026-10-01T00:00:00Z", messages: 9 },
  ],
  documents: [],
  truncated: false,
};

describe("toView", () => {
  it("keeps live memories, most important first, with their section and subject", () => {
    const view = toView(index);
    assert.deepEqual(
      view.facts.map((f) => [f.id, f.section, f.about]),
      [
        ["b", "work", null],
        ["d", "personal", null],
        ["a", "work", "Acme"],
      ],
    );
    assert.equal(view.totalFacts, 3);
    assert.equal(view.facts[1]?.contributor, "u1");
    assert.equal("contributor" in view.facts[0]!, false);
  });

  it("cuts to the most important and the newest chats", () => {
    const view = toView(index, { maxFacts: 1, maxChats: 1 });
    assert.deepEqual(view.facts.map((f) => f.id), ["b"]);
    assert.deepEqual(view.sources.map((s) => s.id), ["s2"]);
    assert.equal(view.totalChats, 2);
  });
});
