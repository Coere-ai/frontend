import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { strToU8, zipSync, type Zippable } from "fflate";

import { COERE_MIMETYPE } from "./coere-zip";

/**
 * Test helper: zips a `.coere` folder the way coere-v2's `format/zip.ts`
 * does, with `mimetype` first and stored, then `manifest.json`, then the rest.
 */

function walk(dir: string, root = dir): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path, root) : [relative(root, path).split("\\").join("/")];
  });
}

export function zipFolder(dir: string, extra: Record<string, string> = {}): Uint8Array {
  const entries: Zippable = { mimetype: [strToU8(COERE_MIMETYPE), { level: 0 }] };
  const names = walk(dir).sort((a, b) => (a === "manifest.json" ? -1 : b === "manifest.json" ? 1 : a.localeCompare(b)));
  for (const name of names) entries[name] = [readFileSync(join(dir, name)), { level: 6 }];
  for (const [name, text] of Object.entries(extra)) entries[name] = [strToU8(text), { level: 6 }];
  return zipSync(entries);
}

export const SAM_FOLDER = join(process.cwd(), "src/lib/memory/fixtures/sam.coere-2.d");
