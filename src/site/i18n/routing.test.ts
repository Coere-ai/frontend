import assert from "node:assert/strict";
import { test } from "node:test";

import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match";

import { localeRedirects, localeRewrites } from "./routing";

/** Where the rewrites send a path, as Next matches them in order, or null when none applies. */
function rewrite(path: string): string | null {
  for (const rule of localeRewrites) {
    const params = getPathMatch(rule.source)(path);
    if (!params) continue;
    return rule.destination.replace(/:(\w+)\*?/g, (_, name: string) => {
      const value = params[name];
      return Array.isArray(value) ? value.join("/") : (value ?? "");
    }).replace(/\/$/, "");
  }
  return null;
}

test("English addresses are served from /en with no redirect", () => {
  assert.equal(rewrite("/"), "/en");
  assert.equal(rewrite("/pricing"), "/en/pricing");
  assert.equal(rewrite("/products/connect"), "/en/products/connect");
  assert.equal(rewrite("/blog/a-post/opengraph-image"), "/en/blog/a-post/opengraph-image");
  assert.equal(rewrite("/sign-in"), "/en/sign-in");
});

test("a path that already names a language, and the routes outside the site, are left alone", () => {
  for (const path of ["/es", "/es/pricing", "/ja/products/forge", "/en/pricing", "/api/v1/devices", "/admin/users/1", "/dashboard/memory", "/welcome", "/_next/static/x.js", "/preview/live/v2"]) {
    assert.equal(rewrite(path), null, path);
  }
});

test("a word that only starts like a language code is still English", () => {
  assert.equal(rewrite("/esports"), "/en/esports");
  assert.equal(rewrite("/administer"), "/en/administer");
});

test("the /en prefix goes to the unprefixed address for good", () => {
  assert.ok(localeRedirects.every((r) => r.permanent));
  assert.ok(getPathMatch(localeRedirects[1].source)("/en/pricing"));
  assert.equal(getPathMatch(localeRedirects[1].source)("/pricing"), false);
});
