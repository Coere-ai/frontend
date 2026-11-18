import assert from "node:assert/strict";
import { test } from "node:test";

import { parseSections, safePath, safeReferrer, text } from "./validate";

test("parseSections keeps label and position, drops bad entries", () => {
  const out = parseSections([
    { id: "section-01", seconds: 12.4, label: "  The problem ", position: 1 },
    { id: "section-01", seconds: 99 },
    { id: "BAD ID", seconds: 3 },
    { id: "vision", seconds: -5, position: 999 },
    null,
  ]);
  assert.deepEqual(out, [
    { section: "section-01", seconds: 12, label: "The problem", position: 1 },
    { section: "vision", seconds: 0, label: null, position: 199 },
  ]);
});

test("parseSections accepts a batch from an older tab with ids only", () => {
  assert.deepEqual(parseSections([{ id: "hero", seconds: 4 }]), [
    { section: "hero", seconds: 4, label: null, position: null },
  ]);
  assert.deepEqual(parseSections("nope"), []);
});

test("parseSections caps the batch at forty entries", () => {
  const many = Array.from({ length: 60 }, (_, i) => ({ id: `s-${i}`, seconds: 1 }));
  assert.equal(parseSections(many).length, 40);
});

test("safePath groups variants of one page", () => {
  assert.equal(safePath("/investment-memo/?utm=x#top"), "/investment-memo");
  assert.equal(safePath("https://evil.example/"), "/");
  assert.equal(safePath(undefined), "/");
});

test("safeReferrer keeps only the host", () => {
  assert.equal(safeReferrer("https://www.Google.com/search?q=private"), "www.google.com");
  assert.equal(safeReferrer(""), null);
});

test("a cut that splits an emoji leaves no half of it, which Postgres's JSON refuses", () => {
  const lone = /[\uD800-\uDFFF]/;
  const label = `${"a".repeat(78)}😀 more words`;
  const [section] = parseSections([{ id: "hero", seconds: 1, label }]);
  assert.ok(section?.label && !lone.test(section.label.replace(/😀/g, "")), section?.label ?? "");
  const cut = text(`${"b".repeat(119)}😀`, 120);
  assert.ok(cut !== null && !lone.test(cut.replace(/😀/g, "")), cut ?? "");
  assert.equal(text("half \uD83D of one", 120), "half  of one");
  assert.equal(safePath(`/${"c".repeat(254)}😀`).length, 255);
});
