import assert from "node:assert/strict";
import { test } from "node:test";

import robots from "./robots";

test("every private path is disallowed for every crawler (docs/accounts.md 3.3)", () => {
  const rules = [robots().rules].flat();
  for (const path of ["/sign-in", "/sign-up", "/sign-out", "/connect", "/account", "/dashboard", "/welcome", "/admin", "/api/"]) {
    for (const rule of rules) assert.ok([rule.disallow].flat().includes(path), `${path} for ${String(rule.userAgent)}`);
  }
});
