/**
 * This film opens no AI chat site. Its pages are coere-v2's own fake web
 * pages (tests/fake-pages): the clinic's intake form, the class's quiz,
 * and the search engine and company sites research reads. Their servers
 * build each page from their store when it is asked for, so the film runs
 * those same servers in its top page (fake-pages.js, built here) and a tab
 * asks them for the page at its address as it loads (page.html, with the
 * film's page-tab.js). Two things a browser bundle cannot do are done here
 * at build time, in Node: each page's client script is bundled, as the
 * servers' `clientScript` bundles it with esbuild, and the servers find it
 * by its file instead of building it.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const V2 = process.env.COERE_V2 && resolve(process.env.COERE_V2);
const OUT = resolve(here, "../../../public/preview/live/actions-anywhere");

if (V2) {
  const v2require = createRequire(join(V2, "apps/extension/package.json"));
  const esbuild = v2require(v2require.resolve("esbuild"));
  mkdirSync(OUT, { recursive: true });

  /** A source file's own address as the servers write it, under a root that names no machine. */
  const fileUrl = (path) => `file:///v2/${relative(V2, path).split("\\").join("/")}`;

  // The pages' client scripts, bundled as tests/fake-google/client-script.ts bundles them.
  const CLIENTS = ["tests/fake-pages/form/client.ts", "tests/fake-pages/quiz/client.ts", "tests/fake-pages/research/canvas-client.ts", "tests/fake-pages/touch-client.ts"];
  const clients = {};
  for (const rel of CLIENTS) {
    const out = esbuild.buildSync({ entryPoints: [join(V2, rel)], bundle: true, write: false, format: "iife", target: "chrome120", legalComments: "none" });
    clients[`/v2/${rel}`] = out.outputFiles[0].text;
  }

  /** The servers as a browser runs them: their own addresses in place of import.meta.url, and clientScript reading the scripts above. */
  const browserServers = {
    name: "browser-servers",
    setup(b) {
      b.onLoad({ filter: /\.ts$/ }, (a) => {
        if (!a.path.startsWith(V2) || a.path.includes("node_modules")) return undefined;
        let src = readFileSync(a.path, "utf8").replace(/\bimport\.meta\.url\b/g, JSON.stringify(fileUrl(a.path)));
        if (a.path.endsWith("tests/fake-google/client-script.ts"))
          src = src
            .replace("import { buildSync } from 'esbuild'", "const buildSync = (o: { entryPoints: string[] }) => ({ outputFiles: [{ text: (globalThis as unknown as { __fakeClients: Record<string, string> }).__fakeClients[o.entryPoints[0] ?? ''] ?? '' }] })")
            .replace("import { fileURLToPath } from 'node:url'", "const fileURLToPath = (u: URL) => decodeURIComponent(u.pathname)");
        return { contents: src, loader: "ts" };
      });
    },
  };

  await esbuild.build({
    entryPoints: [join(here, "pages-entry.ts")],
    outfile: join(OUT, "fake-pages.js"),
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "chrome120",
    minify: true,
    legalComments: "none",
    logLevel: "warning",
    alias: { "@v2": V2 },
    banner: { js: `globalThis.__fakeClients=${JSON.stringify(clients).replace(/<\/script/gi, "<\\/script")};` },
    plugins: [browserServers],
  });

  // A tab's page: the film's script first in its head, which writes the page the server makes for the tab's address.
  writeFileSync(join(OUT, "page.html"), '<!doctype html><html lang="en"><head><meta charset="utf-8"><script src="page-tab.js"></script></head><body></body></html>\n');
}

export default [];
