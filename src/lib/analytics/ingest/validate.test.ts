import assert from "node:assert/strict";
import { test } from "node:test";

import { parseSections, safePath, safeReferrer } from "./validate";

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
