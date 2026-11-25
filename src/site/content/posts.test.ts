import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, it } from "node:test";

/**
 * The post list stays on the server. Every client module, and every module
 * a client module imports, ships in the browser's chunks, so a post that
 * reached one would be readable on every page. These read the source, and
 * the built chunks when there are any, rather than importing posts.ts,
 * which is server only.
 */

const root = join(import.meta.dirname, "..", "..", "..");
const src = join(root, "src");
const POSTS = join(src, "site", "content", "posts.ts");

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...sourceFiles(path));
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.ts$/.test(name)) out.push(path);
  }
  return out;
}

/** The files a module imports for their values. `import type` and `export type` are left out, since the build drops them. */
function valueImports(file: string): string[] {
  const text = readFileSync(file, "utf8");
  const specs: string[] = [];
  const pattern = /^\s*(import|export)\s+(?!type\s)(?:[^"';]*?\s+from\s+)?["']([^"']+)["']/gm;
  for (const match of text.matchAll(pattern)) specs.push(match[2]);
  for (const match of text.matchAll(/import\(\s*["']([^"']+)["']\s*\)/g)) specs.push(match[1]);
  return specs.map((spec) => resolveSpec(file, spec)).filter((path): path is string => path !== null);
}

function resolveSpec(from: string, spec: string): string | null {
  const base = spec.startsWith("@/") ? join(src, spec.slice(2)) : spec.startsWith(".") ? resolve(dirname(from), spec) : null;
  if (!base) return null;
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const isClient = (file: string) => /^\s*["']use client["']/.test(readFileSync(file, "utf8"));

describe("the post list", () => {
  it("is marked server only", () => {
    // Tested with ok, not match, so a failure does not print the file.
    assert.ok(/^import "server-only";$/m.test(readFileSync(POSTS, "utf8")), "posts.ts is not server only");
  });

  it("is never imported by a client module, directly or through another", () => {
    const seen = new Set<string>();
    const todo = sourceFiles(src).filter(isClient);
    const from = new Map<string, string>(todo.map((f) => [f, f]));
    while (todo.length > 0) {
      const file = todo.pop()!;
      if (seen.has(file)) continue;
      seen.add(file);
      for (const next of valueImports(file)) {
        if (!from.has(next)) from.set(next, from.get(file)!);
        todo.push(next);
      }
    }
    assert.equal(seen.has(POSTS), false, `posts.ts reaches the browser through ${relative(root, from.get(POSTS) ?? "")}`);
  });

  it("holds no hidden post: a post that is not out yet stays out of the repository", () => {
    assert.ok(!/^\s*hidden:\s*true/m.test(readFileSync(POSTS, "utf8")), "posts.ts holds a hidden post");
  });

  it("gives words in every language only to the posts it holds", () => {
    const slugs = new Set([...readFileSync(POSTS, "utf8").matchAll(/^\s*slug:\s*"([^"]+)"/gm)].map((m) => m[1]));
    const dir = join(src, "site", "i18n", "messages");
    for (const lang of readdirSync(dir).filter((name) => statSync(join(dir, name)).isDirectory())) {
      const blog = readFileSync(join(dir, lang, "blog.ts"), "utf8");
      const block = blog.slice(blog.indexOf("posts: {"));
      for (const m of block.matchAll(/^ {4}"([a-z0-9-]+)":\s*\{/gm)) assert.ok(slugs.has(m[1]), `${lang} has words for a post the blog does not hold`);
    }
  });
});

/**
 * The built client chunks, when a build is there (or COERE_CHUNKS_DIR names
 * one): no post body may be in them, since the menus need only each post's
 * slug, title and cover.
 */
describe("the built chunks", () => {
  const dir = process.env.COERE_CHUNKS_DIR ?? join(root, ".next", "static", "chunks");
  const built = existsSync(dir);

  it("carry no post's body", { skip: built ? false : "no build here" }, () => {
    const text = readFileSync(POSTS, "utf8");
    // The first paragraph of each post, as the source writes it.
    const openings = [...text.matchAll(/body:\s*\[\s*"((?:[^"\\]|\\.){40,})"/g)].map((m) => JSON.parse(`"${m[1]}"`).slice(0, 60));
    assert.ok(openings.length > 0);
    const chunks = readdirSync(dir).filter((name) => name.endsWith(".js")).map((name) => readFileSync(join(dir, name), "utf8"));
    for (const opening of openings) {
      assert.equal(chunks.some((chunk) => chunk.includes(opening)), false, "a post body is in a client chunk");
    }
  });
});
