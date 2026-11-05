// Finds Playwright without adding it to the site's dependencies: a copy on
// the module path first, else the one coere-v2 already installs (the tool
// needs that checkout anyway, for the extension).

import { createRequire } from "node:module";
import { join } from "node:path";

export function loadPlaywright(coereV2) {
  const tries = [
    () => createRequire(import.meta.url)("playwright"),
    () => createRequire(join(coereV2, "package.json"))("@playwright/test"),
  ];
  for (const t of tries) {
    try {
      return t();
    } catch {
      // Try the next one.
    }
  }
  throw new Error("Playwright not found. Install it (npm i -g playwright) or run pnpm install in coere-v2.");
}
