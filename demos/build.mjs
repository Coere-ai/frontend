#!/usr/bin/env node
/**
 * Builds the live demos into public/preview/live from coere-v2's own
 * source: Coere's content script, dashboard and UI kit, the replica chat
 * sites its tests and films use, and each film's script in demos/films.
 *
 *   COERE_V2=/path/to/coere-v2 node demos/build.mjs [film...]
 *
 * DEMO_SKIP_LIB=1 skips the shared bundles in lib/ when only a film changed.
 *
 * The coere-v2 checkout needs its dependencies installed (pnpm install).
 * Only the build output is kept in this repo; coere-v2 itself is read, never
 * changed. Three things differ from the extension's own build, all for
 * the page a demo runs in: a page's host name is the website's, so Coere
 * is told which chat site each tab stands for; the demo's scripted hand
 * makes untrusted events, which Coere ignores on purpose, so its checks
 * read true here; and chrome.* is the demo's own (stage/tab/chrome.ts).
 */
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const V2 = process.env.COERE_V2 && resolve(process.env.COERE_V2);
if (!V2 || !existsSync(join(V2, "apps/extension/src"))) throw new Error("Set COERE_V2 to a coere-v2 checkout with its dependencies installed");
const OUT = resolve(here, "../public/preview/live");
const LIB = join(OUT, "lib");
const WEB_LIB = "/preview/live/lib/";
const v2require = createRequire(join(V2, "apps/extension/package.json"));
const { build } = await import(v2require.resolve("esbuild"));
const tsx = join(V2, "node_modules/.bin/tsx");

/** Vite's `?raw` and `?inline` imports, as text. */
const asText = {
  name: "as-text",
  setup(b) {
    b.onResolve({ filter: /\?(raw|inline|url)$/ }, (a) => ({ path: resolve(a.resolveDir, a.path.replace(/\?(raw|inline|url)$/, "")), namespace: "as-text", pluginData: a.path.endsWith("?url") }));
    b.onLoad({ filter: /.*/, namespace: "as-text" }, (a) =>
      a.pluginData ? { contents: `export default ${JSON.stringify(WEB_LIB + "ext/" + a.path.split("/").pop())}`, loader: "js" } : { contents: readFileSync(a.path, "utf8"), loader: "text" },
    );
  },
};

/** The two changes to coere-v2's code in a demo, made as it is read: host names, and trusted events. */
const demoPatches = {
  name: "demo-patches",
  setup(b) {
    b.onLoad({ filter: /\.(ts|tsx)$/ }, (a) => {
      if (!a.path.startsWith(V2) || a.path.includes("node_modules")) return undefined;
      let src = readFileSync(a.path, "utf8");
      if (a.path.endsWith("packages/platforms/src/registry.ts"))
        src = src.replace("const h = host.toLowerCase()", "const h = ((globalThis as { __demoHosts?: Record<string, string> }).__demoHosts?.[host] ?? host).toLowerCase()");
      src = src.replace(/\b([\w$]+)\.isTrusted\b/g, "(true)");
      return { contents: src, loader: a.path.endsWith(".tsx") ? "tsx" : "ts" };
    });
  },
};

/** Coere for Teams' catalog in place of Coere's, as coere-v2's build/solution-swaps.ts swaps it. */
const solutionSwap = {
  name: "solution-swap",
  setup(b) {
    b.onLoad({ filter: /packages[\\/]memory[\\/]src[\\/]taxonomy[\\/](catalog|keywords|templates)\.gen\.ts$/ }, (a) => {
      const swapped = a.path.replace(/packages[\\/]memory[\\/]src[\\/]taxonomy/, "packages/solution/src/taxonomy");
      if (!existsSync(swapped)) return undefined;
      return { contents: readFileSync(swapped, "utf8"), loader: "ts", resolveDir: dirname(swapped) };
    });
  },
};

const preact = (path) => v2require.resolve(path);

/** One bundle: a demo's own code and the coere-v2 code it imports, for one Coere version. */
async function bundle(entry, outfile, version = 2, edition = "consumer") {
  await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "chrome120",
    minify: true,
    legalComments: "none",
    logLevel: "warning",
    jsx: "automatic",
    jsxImportSource: "preact",
    loader: { ".woff2": "file", ".png": "file", ".svg": "text", ".wasm": "file", ".json": "json" },
    alias: {
      "@v2": V2,
      preact: dirname(preact("preact/package.json")),
    },
    nodePaths: [join(V2, "node_modules"), join(V2, "apps/extension/node_modules")],
    define: { __COERE_VERSION__: String(version), __COERE_FAKE_SITES__: "true", __COERE_EDITION__: JSON.stringify(edition), "process.env.NODE_ENV": '"production"' },
    plugins: [asText, ...(edition === "solution" ? [solutionSwap] : []), demoPatches],
  });
}

/** The replica sites' editor code, coere-v2's own test bundles, and the extension's fonts and icons. */
function copyLib() {
  const cache = join(V2, "tests/.cache/fake-sites");
  if (!existsSync(join(cache, "editor-prosemirror.js")))
    execFileSync(tsx, ["-e", `import('${join(V2, "tests/fake-sites/bundle.ts")}').then((m) => m.bundleFakeEditors())`], { cwd: V2, stdio: "inherit" });
  mkdirSync(LIB, { recursive: true });
  for (const file of readdirSync(cache)) cpSync(join(cache, file), join(LIB, file));
  for (const dir of ["fonts", "icon", "voice-fake"]) {
    const from = join(V2, "apps/extension/public", dir);
    if (existsSync(from)) cpSync(from, join(LIB, "ext", dir), { recursive: true });
  }
}

/** Writes a film's replica site pages, each with Coere's content script for the film's version in its head. */
function writeSites(film, pages) {
  if (!pages.length) return;
  const input = JSON.stringify({ lib: WEB_LIB, pages: pages.map((p) => ({ ...p, out: join(OUT, film, p.out) })) });
  execFileSync(tsx, [join(here, "tools/sites.mts")], { input, env: { ...process.env, COERE_V2: V2 }, stdio: ["pipe", "inherit", "inherit"] });
  for (const p of pages) {
    const file = join(OUT, film, p.out);
    const tag = `<script src="${WEB_LIB}site-v${p.version ?? 2}${p.edition === "solution" ? "-solution" : ""}.js"></script>`;
    writeFileSync(file, readFileSync(file, "utf8").replace("<head>", `<head>${tag}`));
  }
}

const page = (title) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head><body><script src="film.js"></script></body></html>\n`;

/** The extension's own pages, for a demo tab to open: lib/<page>-v<version>[-solution].html, each with its bundle beside it. */
const EXT_PAGES = { console: "Coere dashboard", onboarding: "Welcome to Coere", popup: "Coere" };
const extPage = (title, script) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body><div id="app"></div><script src="${script}"></script></body></html>\n`;

copyLib();
if (!process.env.DEMO_SKIP_LIB) {
  for (const [version, edition] of [[2, "consumer"], [3, "consumer"], [2, "solution"]]) {
    const tag = `v${version}${edition === "solution" ? "-solution" : ""}`;
    await bundle(join(here, "stage/tab/site.ts"), join(LIB, `site-${tag}.js`), version, edition);
    for (const [name, title] of Object.entries(EXT_PAGES)) {
      await bundle(join(here, `stage/tab/${name}.ts`), join(LIB, `${name}-${tag}.js`), version, edition);
      writeFileSync(join(LIB, `${name}-${tag}.html`), extPage(title, `${name}-${tag}.js`));
    }
  }
}

const wanted = process.argv.slice(2);
for (const film of readdirSync(join(here, "films"))) {
  if (wanted.length && !wanted.includes(film)) continue;
  const dir = join(here, "films", film);
  const config = existsSync(join(dir, "config.json")) ? JSON.parse(readFileSync(join(dir, "config.json"), "utf8")) : {};
  mkdirSync(join(OUT, film), { recursive: true });
  for (const [name, entry] of Object.entries(config.bundles ?? {})) await bundle(join(dir, entry.from), join(OUT, film, name), entry.version ?? 2, entry.edition);
  await bundle(join(dir, "film.ts"), join(OUT, film, "film.js"), config.version ?? 2, config.edition);
  const sites = existsSync(join(dir, "sites.mjs")) ? (await import(join(dir, "sites.mjs"))).default : [];
  writeSites(film, sites);
  writeFileSync(join(OUT, film, "index.html"), page(config.title ?? film));
  console.log(`built ${film}`);
}
