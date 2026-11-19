import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

// docs/launch.md is what the owner follows by hand on launch day, so a button
// it names has to exist. Its first real run once said to press Back up now,
// which no page has: the site never sends the bridge's coere.backup, and the
// extension pushes the memory file by itself after a build.
const root = join(import.meta.dirname, "..", "..");
const launch = readFileSync(join(root, "docs", "launch.md"), "utf8");

function sources(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && /\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name))
    .map((e) => join(e.parentPath, e.name));
}

test("launch.md names Back up now only when a page can send it", () => {
  const sends = sources(join(root, "src")).some((path) => readFileSync(path, "utf8").includes("coere.backup"));
  if (!sends) assert.doesNotMatch(launch, /Back up now/);
});
