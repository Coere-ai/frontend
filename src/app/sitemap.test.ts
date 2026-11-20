import assert from "node:assert/strict";
import { test } from "node:test";

import { PRIVACY_EFFECTIVE } from "@/site/content/privacy";

import sitemap from "./sitemap";

test("the privacy policy's last change is the date the policy says it took effect", () => {
  const entry = sitemap().find((e) => e.url.endsWith("/privacy"));
  assert.ok(entry);
  assert.equal(entry.lastModified, PRIVACY_EFFECTIVE);
});

test("the pricing page is listed, since the Product menu and the footer link to it", () => {
  assert.ok(sitemap().some((e) => e.url.endsWith("/pricing")));
});

test("a translated page is listed in every language, each naming the others", () => {
  const pricing = sitemap().filter((e) => new URL(e.url).pathname.replace(/^\/(es|fr|nl|ja)(?=\/)/, "") === "/pricing");
  const paths = pricing.map((e) => new URL(e.url).pathname).sort();
  assert.deepEqual(paths, ["/es/pricing", "/fr/pricing", "/ja/pricing", "/nl/pricing", "/pricing"]);
  for (const entry of pricing) {
    assert.equal(entry.alternates?.languages?.["x-default"], "https://www.coere.ai/pricing");
    assert.equal(entry.alternates?.languages?.ja, "https://www.coere.ai/ja/pricing");
  }
});

test("a page still in English is listed once, at its English address", () => {
  const privacy = sitemap().filter((e) => e.url.includes("privacy"));
  assert.equal(privacy.length, 1);
  assert.equal(new URL(privacy[0].url).pathname, "/privacy");
});
