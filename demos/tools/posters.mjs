// node demos/tools/posters.mjs [film...]
//
// Makes the stills the site shows while a live demo loads, and in its play
// bar's previews: for each chapter of each film, the chapter plays alone in
// the dev server and the busiest frame of it is kept (the most detail, which
// is where Coere is doing something, never an empty page or a title card).
// Writes public/preview/live/posters/<film>/<chapter>.webp, and start.webp
// for the film's first chapter. Needs the dev server at localhost:3000 with
// the access pass USER=tester PASSWORD=s3cret-pass.
import { createRequire } from "node:module";
import { copyFileSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const require = createRequire(join(root, "package.json"));
const puppeteer = require("puppeteer-core");
const BASE = "http://localhost:3000";
const OUT = join(root, "public/preview/live/posters");

/** How long to watch a chapter for its best frame, at most, and how often to look. */
const WATCH_MS = 16_000;
const EVERY_MS = 700;

const wanted = process.argv.slice(2);
const films = (wanted.length ? wanted : readdirSync(join(root, "demos/films"))).filter((f) => statSync(join(root, "demos/films", f)).isDirectory());

const browser = await puppeteer.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(`${BASE}/access`, { waitUntil: "networkidle0" });
await page.type("input[name=user]", "tester");
await page.type("input[name=password]", "s3cret-pass");
await Promise.all([page.waitForNavigation(), page.click("form button")]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const film of films) {
  await page.goto(`${BASE}/preview/live/${film}/index.html?loop=0`, { waitUntil: "load" });
  const meta = await page.waitForFunction(() => window.__demoMeta, { timeout: 20_000 }).then((h) => h.jsonValue()).catch(() => null);
  if (!meta?.chapters?.length) {
    console.log(`${film}: no chapters, skipped`);
    continue;
  }
  mkdirSync(join(OUT, film), { recursive: true });
  for (const [i, chapter] of meta.chapters.entries()) {
    const next = meta.chapters[i + 1];
    const query = new URLSearchParams({ from: chapter.id, loop: "0" });
    if (next) query.set("to", next.id);
    await page.goto(`${BASE}/preview/live/${film}/index.html?${query}`, { waitUntil: "load" });
    // Wait for the cover to lift: the chapter is on screen.
    await page.waitForFunction(() => document.getElementById("cover")?.classList.contains("off"), { timeout: 90_000 }).catch(() => undefined);
    const watch = Math.min(WATCH_MS, (chapter.seconds ?? 16) * 1000);
    let best = null;
    for (let t = 0; t < watch; t += EVERY_MS) {
      await sleep(EVERY_MS);
      const shot = await page.screenshot({ type: "webp", quality: 82 });
      if (!best || shot.length > best.length) best = shot;
    }
    const file = join(OUT, film, `${chapter.id}.webp`);
    writeFileSync(file, best);
    if (i === 0) copyFileSync(file, join(OUT, film, "start.webp"));
    console.log(`${film}/${chapter.id}: ${Math.round(best.length / 1024)} KB`);
  }
}
await browser.close();
