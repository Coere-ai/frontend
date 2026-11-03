import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildIndex } from "@/lib/memory/build-index";
import { openCoere } from "@/lib/memory/coere-zip";
import { SAM_FOLDER, zipFolder } from "@/lib/memory/fixture-zip";

import { buildTree, CORE_ID, dimmedFor, entityNodeId, factNodeId, sectionNodeId, shortLabel, type TreeInput } from "./from-index";
import { layoutTree } from "./layout";

function samIndex() {
  const opened = openCoere(zipFolder(SAM_FOLDER));
  if (!opened.ok) throw new Error(opened.reason);
  return buildIndex(opened.manifest, opened.files, { includeSensitive: true }).index;
}

const tiny: TreeInput = {
  self: "me",
  sections: [
    { key: "work", name: "Work" },
    { key: "school", name: "School" },
  ],
  entities: [
    { id: "me", kind: "self", name: "Sam", section: "personal", parent: null, importance: 5 },
    { id: "acme", kind: "org", name: "Acme", section: "work", parent: null, importance: 4 },
    { id: "launch", kind: "project", name: "Launch.", section: "work", parent: "acme", importance: 3 },
    { id: "loop", kind: "folder", name: "Loop", section: "school", parent: "loop", importance: 2 },
  ],
  facts: [
    { id: "f1", subject: "launch", under: null, text: "Launch is in May.", importance: 5, status: "active" },
    { id: "f2", subject: "me", under: "sec_work", text: "Works at Acme.", importance: 4, status: "active" },
    { id: "f3", subject: "me", under: null, text: "Likes tea.", importance: 3, status: "active" },
    { id: "f4", subject: "launch", under: null, text: "Launch was in April.", importance: 5, status: "superseded" },
  ],
  sources: [
    { id: "c1", title: "Launch plan", capturedAt: "2026-10-01T00:00:00Z", sections: ["work"] },
    { id: "c2", title: "  ", capturedAt: null, sections: [] },
  ],
};

describe("buildTree", () => {
  it("puts the center in the middle and the sections round it, in order", () => {
    const nodes = buildTree(tiny, { center: "You" });
    assert.deepEqual(nodes[0], { id: CORE_ID, parent: null, kind: "core", hue: 0, weight: 1, label: "You" });
    assert.deepEqual(
      nodes.filter((n) => n.kind === "hub").map((n) => [n.id, n.parent, n.hue]),
      [
        [sectionNodeId("work"), CORE_ID, 0],
        [sectionNodeId("school"), CORE_ID, 1],
      ],
    );
  });

  it("hangs things from their parent, else their section, and never draws the self", () => {
    const nodes = buildTree(tiny, { center: "You" });
    const byId = new Map(nodes.map((n) => [n.id, n]));
    assert.equal(byId.has(entityNodeId("me")), false);
    assert.equal(byId.get(entityNodeId("acme"))?.parent, sectionNodeId("work"));
    assert.equal(byId.get(entityNodeId("launch"))?.parent, entityNodeId("acme"));
    assert.equal(byId.get(entityNodeId("launch"))?.label, "Launch");
    // A thing that names itself as parent hangs from its section instead.
    assert.equal(byId.get(entityNodeId("loop"))?.parent, sectionNodeId("school"));
  });

  it("files memories under their thing, their section or the middle, and leaves out ones no longer true", () => {
    const byId = new Map(buildTree(tiny, { center: "You" }).map((n) => [n.id, n]));
    assert.equal(byId.get(factNodeId("f1"))?.parent, entityNodeId("launch"));
    assert.equal(byId.get(factNodeId("f2"))?.parent, sectionNodeId("work"));
    assert.equal(byId.get(factNodeId("f3"))?.parent, CORE_ID);
    assert.equal(byId.has(factNodeId("f4")), false);
    assert.equal(byId.get(factNodeId("f1"))?.kind, "leaf");
  });

  it("draws chats as small dots by their section, with a name for an untitled one", () => {
    const byId = new Map(buildTree(tiny, { center: "You" }).map((n) => [n.id, n]));
    assert.equal(byId.get("chat:c1")?.parent, sectionNodeId("work"));
    assert.equal(byId.get("chat:c1")?.weight, 0.7);
    assert.equal(byId.get("chat:c2")?.parent, CORE_ID);
    assert.equal(byId.get("chat:c2")?.label, "Untitled chat");
  });

  it("keeps the most important memories when it must cut", () => {
    const nodes = buildTree(tiny, { center: "You", maxFacts: 1, maxChats: 0 });
    assert.deepEqual(
      nodes.filter((n) => n.id.startsWith("fact:")).map((n) => n.id),
      [factNodeId("f1")],
    );
    assert.equal(nodes.filter((n) => n.id.startsWith("chat:")).length, 0);
  });

  it("builds a tree the product layout places whole from the example bundle", () => {
    const nodes = buildTree(samIndex(), { center: "You" });
    assert.ok(nodes.some((n) => n.kind === "branch"));
    assert.ok(nodes.some((n) => n.id.startsWith("fact:")));
    const ids = new Set(nodes.map((n) => n.id));
    for (const n of nodes) if (n.parent !== null) assert.ok(ids.has(n.parent), `${n.id} hangs from a missing point`);
    const layout = layoutTree(nodes);
    assert.equal(layout.pos.size, nodes.length);
    for (const p of layout.pos.values()) assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
  });
});

describe("dimmedFor", () => {
  it("dims nothing for an empty search", () => {
    assert.equal(dimmedFor(buildTree(tiny, { center: "You" }), "  "), null);
  });

  it("keeps a match and the way to it lit", () => {
    const nodes = buildTree(tiny, { center: "You" });
    const dim = dimmedFor(nodes, "may")!;
    for (const id of [factNodeId("f1"), entityNodeId("launch"), entityNodeId("acme"), sectionNodeId("work"), CORE_ID]) assert.equal(dim.has(id), false, id);
    assert.equal(dim.has(sectionNodeId("school")), true);
    assert.equal(dim.has(factNodeId("f3")), true);
  });
});

describe("shortLabel", () => {
  it("cuts on a whole word with three dots", () => {
    assert.equal(shortLabel("one two three four", 12), "one two...");
    assert.equal(shortLabel("short"), "short");
  });
});
