import assert from "node:assert/strict";
import { test } from "node:test";

import { SECTION_ID, cleanLabel, idAllocator, slugify } from "./ids";

test("slugify folds accents and punctuation into a valid id", () => {
  assert.equal(slugify("Founders: David Kubánek"), "founders-david-kubanek");
  assert.equal(slugify("1. The verification conundrum"), "1-the-verification-conundrum");
  assert.equal(slugify("!!!"), "");
});

test("slugify output always passes the server's id pattern", () => {
  const long = slugify("Our approach: autonomous R&D department of frontier AI agents that plan");
  assert.ok(long.length <= 40);
  assert.ok(SECTION_ID.test(long), long);
  assert.ok(!long.endsWith("-"));
});

test("cleanLabel flattens whitespace and caps length at 80", () => {
  assert.equal(cleanLabel("  The \n problem  "), "The problem");
  const capped = cleanLabel("x".repeat(200));
  assert.equal(capped.length, 80);
  assert.ok(capped.endsWith("…"));
  assert.equal(cleanLabel(null), "");
});

test("idAllocator keeps ids unique and falls back on invalid ones", () => {
  const next = idAllocator();
  assert.equal(next("results", "section-1"), "results");
  assert.equal(next("results", "section-2"), "results-2");
  assert.equal(next("Not Valid", "section-3"), "section-3");
  assert.equal(next("", "section-4"), "section-4");
});
