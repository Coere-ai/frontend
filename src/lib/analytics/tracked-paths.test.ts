import assert from "node:assert/strict";
import { test } from "node:test";

import { isTrackedPath } from "./tracked-paths";

test("every private page is left out of the site's numbers", () => {
  for (const path of ["/admin", "/admin/users", "/statistics", "/sign-in", "/sign-up", "/sign-out", "/connect", "/account", "/dashboard", "/dashboard/memory", "/join/abc", "/auth/callback", "/welcome"]) {
    assert.equal(isTrackedPath(path), false, path);
  }
});

test("public pages are counted, including ones that only start like a private one", () => {
  for (const path of ["/", "/about", "/install", "/blog/portable-memory", "/accounting", "/connected", "/sign-ups"]) {
    assert.equal(isTrackedPath(path), true, path);
  }
});
