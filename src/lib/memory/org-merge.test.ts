import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { contributes, effectiveAccess, readableSections } from "../org/access";
import { buildIndex } from "./build-index";
import { openCoere } from "./coere-zip";
import { SAM_FOLDER, zipFolder } from "./fixture-zip";
import type { IndexFact, MemoryIndex } from "./index-types";
import { cutToSections, memberPart } from "./org-cut";
import { mergeParts, normalName } from "./org-merge";

const fact = (id: string, subject: string, over: Partial<IndexFact> = {}): IndexFact => ({
  id, subject, under: null, kind: "note", key: null, text: id, importance: 3, status: "active",
  sensitivity: null, first: null, last: null, sources: 1, ...over,
});

function member(prefix: string, clientName: string): MemoryIndex {
  return {
    v: 1, digest: prefix.repeat(64).slice(0, 64), created: "2026-11-01T00:00:00Z", timeZone: null, self: `${prefix}_self`,
    sections: [{ key: "work", name: "Work" }, { key: "personal", name: "Personal" }],
    entities: [
      { id: `${prefix}_self`, kind: "self", name: prefix, section: "personal", parent: null, importance: 5 },
      { id: `${prefix}_client`, kind: "organization", name: clientName, section: "work", parent: null, importance: 3 },
      { id: `${prefix}_project`, kind: "project", name: "Launch", section: "work", parent: `${prefix}_client`, importance: 4 },
    ],
    facts: [
      fact(`${prefix}_f1`, `${prefix}_client`),
      fact(`${prefix}_f2`, `${prefix}_self`, { under: "sec_work" }),
      fact(`${prefix}_f3`, `${prefix}_client`, { sensitivity: "health" }),
      fact(`${prefix}_f4`, `${prefix}_self`),
    ],
    relations: [
      { id: `${prefix}_r1`, from: `${prefix}_project`, type: "for", to: `${prefix}_client` },
      { id: `${prefix}_r2`, from: `${prefix}_self`, type: "works_with", to: `${prefix}_client` },
    ],
    sources: [
      { id: `claude:${prefix}work`, platform: "claude", title: "Work chat", capturedAt: null, messages: 4, sections: ["work"] },
      { id: `claude:${prefix}home`, platform: "claude", title: "Private chat", capturedAt: null, messages: 2, sections: ["personal"] },
    ],
    documents: [{ path: "sections/work/acme/notes.md", title: "Notes" }, { path: "sections/personal/diary.md", title: "Diary" }],
    truncated: false,
  };
}

describe("memberPart", () => {
  it("keeps only the shared sections and drops sensitive memories", () => {
    const part = memberPart(member("a", "Acme"), ["work"]);
    assert.deepEqual(part.entities.map((e) => e.id), ["a_client", "a_project"]);
    assert.deepEqual(part.facts.map((f) => f.id), ["a_f1", "a_f2"]);
    assert.deepEqual(part.relations.map((r) => r.id), ["a_r1"]);
    assert.deepEqual(part.sources.map((s) => s.title), ["Work chat"]);
    assert.deepEqual(part.documents.map((d) => d.title), ["Notes"]);
    assert.equal(part.self, null);
    assert.deepEqual(part.sections.map((s) => s.key), ["work"]);
  });

  it("cuts the example bundle to one section", () => {
    const opened = openCoere(zipFolder(SAM_FOLDER));
    if (!opened.ok) throw new Error(opened.reason);
    const { index } = buildIndex(opened.manifest, opened.files, { includeSensitive: true });
    const part = memberPart(index, ["school"]);
    assert.deepEqual(part.entities.map((e) => e.name).sort(), ["CS 101", "Project 1"]);
    assert.ok(part.facts.length > 0);
    assert.ok(!JSON.stringify(part).includes("peanuts"));
    assert.ok(!part.sources.some((s) => s.title === "Lisbon in November"));
  });
});

describe("mergeParts", () => {
  const merged = mergeParts(
    [
      { userId: "u2", index: member("b", "  ACME ") },
      { userId: "u1", index: member("a", "Acme") },
    ],
    ["work"],
    new Date("2026-11-03T00:00:00Z"),
  );

  it("makes one entity of the same section, kind and name", () => {
    assert.equal(normalName("  ACME\tInc "), "acme inc");
    const clients = merged.entities.filter((e) => e.kind === "organization");
    assert.equal(clients.length, 1);
    assert.equal(clients[0]?.id, "a_client");
    assert.equal(merged.entities.filter((e) => e.kind === "project").length, 1);
    assert.equal(merged.entities.find((e) => e.kind === "project")?.parent, "a_client");
  });

  it("keeps each fact with its contributor, remapped to the merged entities", () => {
    assert.equal(merged.facts.length, 4);
    const b1 = merged.facts.find((f) => f.id === "b_f1");
    assert.deepEqual([b1?.subject, b1?.contributor], ["a_client", "u2"]);
    assert.ok(merged.facts.every((f) => f.sensitivity === null));
    assert.deepEqual(merged.facts.map((f) => f.contributor).sort(), ["u1", "u1", "u2", "u2"]);
  });

  it("follows relations to the merged entities without repeating them", () => {
    assert.deepEqual(merged.relations, [{ id: "a_r1", from: "a_project", type: "for", to: "a_client" }]);
  });

  it("keeps only chats behind the shared sections, and no member's self", () => {
    assert.deepEqual(merged.sources.map((s) => s.title), ["Work chat", "Work chat"]);
    assert.equal(merged.self, null);
    assert.equal(merged.created, "2026-11-03T00:00:00.000Z");
    assert.match(merged.digest, /^[0-9a-f]{64}$/);
  });

  it("is the same whatever order the parts come in", () => {
    const again = mergeParts([{ userId: "u1", index: member("a", "Acme") }, { userId: "u2", index: member("b", "acme") }], ["work"], new Date("2026-11-03T00:00:00Z"));
    assert.deepEqual(again, merged);
  });

  it("cuts to what a member may read", () => {
    assert.equal(cutToSections(merged, [], { dropSensitive: true }).facts.length, 0);
    assert.equal(cutToSections(merged, ["work"], { dropSensitive: true }).facts.length, 4);
  });
});

describe("access", () => {
  it("lets a member's own access override the default, and admins read all", () => {
    const own = effectiveAccess({ read: ["work"], contribute: false }, { read: "all", contribute: true });
    assert.deepEqual(own, { read: ["work"], contribute: false });
    assert.deepEqual(effectiveAccess(null, { read: "all", contribute: true }), { read: "all", contribute: true });
    assert.deepEqual(effectiveAccess({ read: 5 }, null), { read: "all", contribute: true });
    assert.deepEqual(readableSections("member", own, ["work", "clients"]), ["work"]);
    assert.deepEqual(readableSections("admin", own, ["work", "clients"]), ["work", "clients"]);
    assert.equal(contributes(true, own), false);
    assert.equal(contributes(false, { read: "all", contribute: true }), false);
    assert.equal(contributes(true, { read: "all", contribute: true }), true);
  });
});
