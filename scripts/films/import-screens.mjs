/**
 * Brings saved HTML screens from the coere-v2 demo scripts into the site:
 *
 *   node scripts/films/import-screens.mjs <snapshots folder> <cut> 004 007 012
 *
 * Each picked screen goes to public/preview/screens/<cut>/<n>.html with the
 * fonts and images it names in public/preview/screens/assets. Its large
 * stylesheets move into shared files there too, named by their contents,
 * so screens of one app load its styles once. Local addresses the demo ran
 * on are taken out.
 */
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [root, cut, ...names] = process.argv.slice(2);
if (!root || !cut || names.length === 0) throw new Error("usage: node scripts/films/import-screens.mjs <snapshots> <cut> <n...>");
const site = new URL("../../public/preview/screens/", import.meta.url).pathname;
const assets = join(site, "assets");
mkdirSync(assets, { recursive: true });
mkdirSync(join(site, cut), { recursive: true });

for (const name of names) {
  let html = readFileSync(join(root, cut, `${name}.html`), "utf8");
  for (const [, file] of html.matchAll(/\.\.\/assets\/([0-9a-f]+\.[a-z0-9]+)/g)) {
    if (!existsSync(join(assets, file))) copyFileSync(join(root, "assets", file), join(assets, file));
  }
  // A style block over 8 KB becomes a shared file; small ones stay in the page.
  html = html.replace(/<style>([\s\S]*?)<\/style>/g, (block, css) => {
    if (css.length < 8192) return block;
    const file = `${createHash("sha256").update(css).digest("hex").slice(0, 16)}.css`;
    if (!existsSync(join(assets, file))) writeFileSync(join(assets, file), css.replace(/\.\.\/assets\//g, ""));
    return `<link rel="stylesheet" href="../assets/${file}">`;
  });
  html = html.replace(/(https?:\/\/)?(127\.0\.0\.1|localhost):\d+\/?/g, "");
  writeFileSync(join(site, cut, `${name}.html`), html);
}
console.log(`${cut}: ${names.length} screens`);
