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
