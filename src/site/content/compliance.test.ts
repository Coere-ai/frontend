import assert from "node:assert/strict";
import { test } from "node:test";

import { industryCompliance, inPlaceToday } from "./compliance";
import { industries } from "./industries";
import { privacySections, privacySummary } from "./privacy";

const words = (s: { name: string; short?: string; where?: string; why: string }) => [s.name, s.short ?? "", s.where ?? "", s.why].join(" ");

test("every industry lists three to five standards", () => {
  for (const industry of industries) {
    const entry = industryCompliance[industry.slug];
    assert.ok(entry, industry.slug);
    assert.ok(entry.standards.length >= 3 && entry.standards.length <= 5, industry.slug);
  }
});

test("no line says Coere is certified, compliant or audited, since it holds none of these yet", () => {
  const all = [...Object.values(industryCompliance).flatMap((e) => e.standards.map(words)), ...inPlaceToday];
  for (const line of all) {
    assert.doesNotMatch(line, /\b(certified|certification|compliant|audited|accredited|approved)\b/i, line);
  }
});

test("HIPAA is named only where it applies, and says where", () => {
  for (const [slug, entry] of Object.entries(industryCompliance)) {
    for (const standard of entry.standards.filter((s) => s.name.includes("HIPAA"))) {
      assert.equal(slug, "legal");
      assert.ok(standard.where, slug);
    }
  }
});

test("what is in place today is said in the privacy policy too", () => {
  const policy = [...privacySummary, ...privacySections.flatMap((s) => [...s.paragraphs, ...(s.list ?? []), ...(s.after ?? [])])].join(" ");
  for (const fact of ["never stores", "card numbers", "sensitive", "every view is logged", "does not sell", "does not train"]) {
    assert.ok(policy.includes(fact), fact);
  }
});

test("the copy follows the writing rules: no em dashes and no dashes as punctuation", () => {
  const all = [...Object.values(industryCompliance).flatMap((e) => e.standards.map(words)), ...inPlaceToday];
  for (const line of all) assert.doesNotMatch(line, /—|–| - |--/, line);
});
