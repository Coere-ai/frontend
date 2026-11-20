import assert from "node:assert/strict";
import { test } from "node:test";

import { localizePath, locales, splitLocale } from "./locales";
import { allMessages } from "./messages/all";
import { format } from "./types";

type Leaf = { path: string; value: string };

/** Every string in a message tree, with the path of keys that leads to it. */
function leaves(node: unknown, path = ""): Leaf[] {
  if (typeof node === "string") return [{ path, value: node }];
  if (Array.isArray(node)) return node.flatMap((item, i) => leaves(item, `${path}[${i}]`));
  if (node && typeof node === "object") return Object.entries(node).flatMap(([key, value]) => leaves(value, path ? `${path}.${key}` : key));
  return [{ path, value: String(node) }];
}

const holes = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

const english = leaves(allMessages.en);

test("every language has every English key, and no others", () => {
  const want = english.map((l) => l.path).sort();
  for (const locale of locales) {
    const have = leaves(allMessages[locale]).map((l) => l.path).sort();
    assert.deepEqual(have, want, `${locale} differs from English`);
  }
});

test("no message is empty or only spaces", () => {
  for (const locale of locales) {
    for (const leaf of leaves(allMessages[locale])) assert.ok(leaf.value.trim() !== "", `${locale} ${leaf.path} is empty`);
  }
});

test("every translation keeps the {holes} of its English message", () => {
  const byPath = new Map(english.map((l) => [l.path, holes(l.value)]));
  for (const locale of locales) {
    for (const leaf of leaves(allMessages[locale])) assert.deepEqual(holes(leaf.value), byPath.get(leaf.path), `${locale} ${leaf.path}`);
  }
});

test("no translation uses an em dash, which the site's writing rules keep out", () => {
  for (const locale of locales) {
    for (const leaf of leaves(allMessages[locale])) assert.ok(!leaf.value.includes("—"), `${locale} ${leaf.path}`);
  }
});

test("product names stay as they are in every language", () => {
  for (const locale of locales) {
    const text = JSON.stringify(allMessages[locale]);
    assert.ok(!/Coere (Conectar|Connecter|Verbinden|コネクト)/.test(text), `${locale} translated a product name`);
  }
});

test("site paths gain the language's prefix and English keeps its own", () => {
  assert.equal(localizePath("/pricing", "en"), "/pricing");
  assert.equal(localizePath("/pricing", "es"), "/es/pricing");
  assert.equal(localizePath("/", "ja"), "/ja");
  assert.equal(localizePath("/#products", "fr"), "/fr#products");
  assert.equal(localizePath("/about#team", "nl"), "/nl/about#team");
  assert.equal(localizePath("mailto:a@b.c", "es"), "mailto:a@b.c");
  assert.equal(localizePath("https://example.com/x", "es"), "https://example.com/x");
  assert.equal(localizePath("#top", "es"), "#top");
  // The account pages are in English only, so links to them never gain a prefix.
  assert.equal(localizePath("/sign-in", "es"), "/sign-in");
  assert.equal(localizePath("/dashboard/memory", "ja"), "/dashboard/memory");
  assert.equal(localizePath("/signals", "es"), "/es/signals");
});

test("a browser path splits into its language and the page", () => {
  assert.deepEqual(splitLocale("/es/pricing"), { locale: "es", path: "/pricing" });
  assert.deepEqual(splitLocale("/ja"), { locale: "ja", path: "/" });
  assert.deepEqual(splitLocale("/pricing"), { locale: "en", path: "/pricing" });
  assert.deepEqual(splitLocale("/"), { locale: "en", path: "/" });
  assert.deepEqual(splitLocale("/en/pricing"), { locale: "en", path: "/pricing" });
  assert.deepEqual(splitLocale("/espresso"), { locale: "en", path: "/espresso" });
});

test("format fills holes and leaves unknown ones visible", () => {
  assert.equal(format("{a} and {b}", { a: 1, b: "x" }), "1 and x");
  assert.equal(format("{a} and {c}", { a: 1 }), "1 and {c}");
});
