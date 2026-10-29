/**
 * Brings freshly recorded films from a coere-v2 demo folder into the site:
 *
 *   node scripts/films/import-films.mjs ../coere-v2/docs/demo v3 teams
 *
 * For each slug it copies the film and its poster, writes the chapter and
 * caption cues the site reads (src/site/content/films/<slug>.json), and
 * takes a still from 42% of the way in for previews. Run build-pages.mjs
 * afterwards so each film's page and tracks match.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [source, ...slugs] = process.argv.slice(2);
if (!source || slugs.length === 0) throw new Error("usage: node scripts/films/import-films.mjs <coere-v2/docs/demo> <slug...>");
const root = new URL("../../", import.meta.url).pathname;
const films = join(root, "public/preview/films");
const cues = join(root, "src/site/content/films");

for (const slug of slugs) {
  copyFileSync(join(source, `${slug}.mp4`), join(films, `${slug}.mp4`));
  copyFileSync(join(source, `${slug}-poster.jpg`), join(films, `${slug}-poster.jpg`));

  const html = readFileSync(join(source, `${slug}.html`), "utf8");
  const json = html.match(/<script type="application\/json" id="cues">([\s\S]*?)<\/script>/)?.[1];
  if (!json) throw new Error(`${slug}.html has no cues`);
  const { chapters, captions } = JSON.parse(json);
  writeFileSync(join(cues, `${slug}.json`), JSON.stringify({ chapters, captions }, null, 1) + "\n");

  const length = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", join(films, `${slug}.mp4`)]).toString());
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(length * 0.42), "-i", join(films, `${slug}.mp4`), "-frames:v", "1", "-vf", "scale=1920:-1", "-q:v", "3", join(films, `${slug}-still.jpg`)]);
  console.log(`${slug}: ${length.toFixed(1)} s, ${chapters.length} chapters`);
}
