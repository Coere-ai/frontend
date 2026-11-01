// node demos/tools/pace.mjs film...
//
// Plays each film once at its own pace and saves when each of its script's
// steps began, per chapter, as public/preview/live/<film>/pace.json. A jump
// on the site's play bar reads it to land where the bar says: a skip runs
// the script's pauses at once, so without it a jump can only guess how far
// into a chapter it is. Run it again after a film's script changes. Needs
// the dev server at localhost:3000.
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const require = createRequire(join(root, "package.json"));
const puppeteer = require("puppeteer-core");
const BASE = "http://localhost:3000";

const films = process.argv.slice(2);
if (!films.length) throw new Error("Name the films to pace, e.g. node demos/tools/pace.mjs v2 forge-dev");

const browser = await puppeteer.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

for (const film of films) {
  await page.goto(`${BASE}/preview/live/${film}/index.html?loop=0&pace=1`, { waitUntil: "load" });
  await page.waitForFunction(() => "demoEnded" in document.documentElement.dataset, { timeout: 600_000, polling: 1000 });
  const pace = await page.evaluate(() => window.__pace);
  writeFileSync(join(root, "public/preview/live", film, "pace.json"), JSON.stringify(pace));
  console.log(`${film}: ${Object.entries(pace).map(([id, steps]) => `${id} ${steps.length} steps`).join(", ")}`);
}
await browser.close();
