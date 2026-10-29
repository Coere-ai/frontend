/**
 * Builds the film pages under public/preview/films from the coere-v2 demo
 * folder. Run it after copying new films in:
 *
 *   node scripts/films/build-pages.mjs ../coere-v2/docs/demo
 *
 * Each film already here (its .mp4) gets a page made from its source page:
 * the same title, the same cues, and the caption and chapter tracks and the
 * font that page loads, copied beside it.
 */
import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { filmPage } from "./page-template.mjs";

const source = process.argv[2];
if (!source) throw new Error("usage: node scripts/films/build-pages.mjs <coere-v2/docs/demo>");
const target = new URL("../../public/preview/films/", import.meta.url).pathname;

/** Pulls one element's text out of the source page, which is our own generated HTML. */
function between(html, open, close, slug) {
  const from = html.indexOf(open);
  const to = html.indexOf(close, from + open.length);
  if (from < 0 || to < 0) throw new Error(`${slug}.html has no ${open}`);
  return html.slice(from + open.length, to);
}

mkdirSync(join(target, "fonts"), { recursive: true });
copyFileSync(join(source, "fonts", "Geist-Variable.woff2"), join(target, "fonts", "Geist-Variable.woff2"));

const slugs = readdirSync(target).filter((f) => f.endsWith(".mp4")).map((f) => f.slice(0, -4));
for (const slug of slugs) {
  const html = readFileSync(join(source, `${slug}.html`), "utf8");
  const title = between(html, "<title>", "</title>", slug);
  const cues = between(html, '<script type="application/json" id="cues">', "</script>", slug);
  JSON.parse(cues);
  for (const track of ["captions", "chapters"]) {
    copyFileSync(join(source, `${slug}-${track}.vtt`), join(target, `${slug}-${track}.vtt`));
  }
  writeFileSync(join(target, `${slug}.html`), filmPage(slug, title, cues));
  console.log(`${slug}.html: ${title}`);
}
