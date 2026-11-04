import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { IndexFact, MemoryIndex } from "./index-types";
import { capForAnswer } from "./org-answer";

const fact = (i: number, importance = 3): IndexFact => ({
  id: `f${String(i).padStart(6, "0")}`, subject: "e1", under: null, kind: "note", key: null, text: "x".repeat(200), importance,
  status: "active", sensitivity: null, first: null, last: null, sources: 1,
});

const graph = (facts: IndexFact[]): MemoryIndex => ({
  v: 1, digest: "d".repeat(64), created: "", timeZone: null, self: null, sections: [],
  entities: [{ id: "e1", kind: "organization", name: "Acme", section: "work", parent: null, importance: 3 }],
  facts, relations: [], sources: [], documents: [], truncated: false,
});

describe("capForAnswer", () => {
  it("leaves a small graph alone", () => {
    const small = graph([fact(1)]);
    assert.equal(capForAnswer(small), small);
  });

  it("keeps the most important facts up to the count, and says so", () => {
    const out = capForAnswer(graph([fact(1, 1), fact(2, 5), fact(3, 3)]), 1_000_000, 2);
    assert.deepEqual(out.facts.map((f) => f.id), ["f000002", "f000003"]);
    assert.equal(out.truncated, true);
  });

  it("halves until the answer fits its bytes", () => {
    const out = capForAnswer(graph(Array.from({ length: 2000 }, (_, i) => fact(i))), 100_000, 5000);
    assert.ok(new TextEncoder().encode(JSON.stringify(out)).byteLength <= 100_000);
    assert.ok(out.facts.length > 0);
    assert.equal(out.truncated, true);
  });
});
