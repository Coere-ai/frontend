import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { strToU8, zipSync } from "fflate";

import { buildIndex, MAX_INDEX_FACTS } from "./build-index";
import { openCoere, wantedEntry } from "./coere-zip";
import { countsFromManifest } from "./counts";
import { SAM_FOLDER, zipFolder } from "./fixture-zip";

const SELF = "ent_0199a5c1-8a00-7000-8000-000000000010";

function sam() {
  const opened = openCoere(zipFolder(SAM_FOLDER, { "chats/claude/demo-style.txt": "chat text" }));
  if (!opened.ok) throw new Error(opened.reason);
  return opened;
}

describe("openCoere", () => {
  it("opens the example bundle and leaves chats, keys and citations packed", () => {
    const opened = sam();
    assert.equal(opened.manifest.version, "2.0");
    assert.equal(opened.manifest.digest, "91a8a8bfdde568c21fe2bde88bbdff931ed5a1989af2124014add9b2b1cca1ff");
    assert.ok(opened.files.has("sections/personal/_facts.jsonl"));
    assert.ok(!opened.files.has("chats/claude/demo-style.txt"));
    assert.ok(!opened.files.has("forget-keys.jsonl"));
    assert.ok(!opened.files.has("sections/school/cs-101/notes.cite.jsonl"));
    assert.ok(!opened.files.has("sections/school/cs-101/notes.versions/0001.md"));
  });

  it("refuses a zip without mimetype first, or with the wrong type or no manifest", () => {
    const plain = zipSync({ "manifest.json": strToU8("{}"), mimetype: [strToU8("application/vnd.coere.memory+zip"), { level: 0 }] });
    assert.deepEqual(openCoere(plain), { ok: false, reason: "not_coere" });
    const wrong = zipSync({ mimetype: [strToU8("application/zip"), { level: 0 }] });
    assert.deepEqual(openCoere(wrong), { ok: false, reason: "not_coere" });
    const bare = zipSync({ mimetype: [strToU8("application/vnd.coere.memory+zip"), { level: 0 }], "manifest.json": strToU8("{}") });
    assert.deepEqual(openCoere(bare), { ok: false, reason: "bad_manifest" });
    assert.deepEqual(openCoere(strToU8("not a zip at all, just some words here.")), { ok: false, reason: "not_coere" });
  });

  it("wants records and documents only", () => {
    assert.equal(wantedEntry("sections/work/_facts.jsonl"), true);
    assert.equal(wantedEntry("sections/work/notes.md"), true);
    assert.equal(wantedEntry("chats/claude/x.txt"), false);
    assert.equal(wantedEntry("forget-keys.jsonl"), false);
  });
});

describe("countsFromManifest", () => {
  it("adds up the example's records by kind", () => {
    assert.deepEqual(countsFromManifest(sam().manifest), {
      memories: 13,
      entities: 5,
      links: 3,
      chats: 3,
      documents: 2,
      sections: 10,
    });
  });
});

describe("buildIndex", () => {
  it("indexes the example bundle", () => {
    const opened = sam();
    const { index, includesQuotes, includesSensitive } = buildIndex(opened.manifest, opened.files, { includeSensitive: true });
    assert.equal(index.v, 1);
    assert.equal(index.self, SELF);
    assert.equal(index.timeZone, "America/Los_Angeles");
    assert.equal(index.sections.length, 10);
    assert.equal(index.sections[0]?.key, "personal");
    assert.equal(index.entities.length, 5);
    assert.equal(index.facts.length, 13);
    assert.equal(index.relations.length, 3);
    assert.equal(index.sources.length, 3);
    assert.deepEqual(index.documents.map((d) => d.title).sort(), ["Notes", "Python pin"].sort());
    assert.equal(index.truncated, false);
    assert.equal(includesQuotes, true);
    assert.equal(includesSensitive, true);

    const course = index.entities.find((e) => e.name === "CS 101");
    assert.deepEqual(course, { id: "ent_0199a5c1-8a00-7000-8000-000000000011", kind: "course", name: "CS 101", section: "school", parent: null, importance: 4 });
    const project = index.entities.find((e) => e.name === "Project 1");
    assert.equal(project?.parent, course?.id);

    const name = index.facts.find((f) => f.key === "name");
    assert.deepEqual(name, {
      id: "fact_0199a5c1-8a00-7000-8000-000000000100",
      subject: SELF,
      under: "sec_personal",
      kind: "attribute",
      key: "name",
      text: "The person is called Sam.",
      importance: 4,
      status: "active",
      sensitivity: null,
      first: "2026-10-05T21:28:40Z",
      last: "2026-10-05T21:28:40Z",
      sources: 1,
    });
    assert.ok(!JSON.stringify(index).includes("Hi, I'm Sam."), "no quote reaches the index");
    assert.deepEqual(index.sources.find((s) => s.id === "chatgpt:demo-cs101")?.sections, ["people", "personal", "school"]);
  });

  it("leaves out sensitive memories when they are off", () => {
    const opened = sam();
    const { index } = buildIndex(opened.manifest, opened.files, { includeSensitive: false });
    assert.equal(index.facts.length, 12);
    assert.ok(index.facts.every((f) => f.sensitivity === null));
    assert.ok(!JSON.stringify(index).includes("peanuts"));
  });

  it("keeps the most important facts past the cap", () => {
    const opened = sam();
    const { index } = buildIndex(opened.manifest, opened.files, { includeSensitive: true, maxFacts: 3 });
    assert.equal(index.truncated, true);
    assert.equal(index.facts.length, 3);
    assert.ok(index.facts.every((f) => f.importance === 5));
    assert.equal(MAX_INDEX_FACTS, 50_000);
  });
});
