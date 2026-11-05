// Takes one picture: waits for the page to settle, wakes every part that
// fades in as it scrolls into view, hides the dev server's own badge,
// takes the focus off whatever was clicked, and saves a WebP (through sharp, which Next already installs) or a PNG. Every
// picture taken is listed in the run's manifest, so the README pages and
// the report read the same list.

import { createRequire } from "node:module";
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
let sharp = null;
try {
  sharp = require("sharp");
} catch {
  sharp = null;
}

/** WebP's limit is 16,383 pixels a side. */
const MAX_HEIGHT = 16_000;

/** The dev server's badge and overlay, which no visitor sees. */
const HIDE_DEV = "nextjs-portal, [data-nextjs-toast], [data-next-badge-root] { display: none !important; }";

export function createShooter(outDir) {
  const taken = [];

  /**
   * Hides the dev badge in this page and every page it loads next. With
   * `allNear`, every element counts as on screen: a live film starts only
   * near the screen and stops far from it, so a whole page picture would
   * otherwise show the films far from where the page was scrolled as blank.
   */
  async function prepare(page, { allNear = false } = {}) {
    if (allNear) {
      await page.addInitScript(() => {
        const Real = window.IntersectionObserver;
        window.IntersectionObserver = class extends Real {
          constructor(callback, options) {
            super(() => {}, options);
            this.cb = callback;
          }
          observe(el) {
            const box = el.getBoundingClientRect();
            setTimeout(() => this.cb([{ target: el, isIntersecting: true, intersectionRatio: 1, boundingClientRect: box, intersectionRect: box, rootBounds: null, time: performance.now() }], this), 0);
          }
        };
      });
    }
    await page.addInitScript((css) => {
      const add = () => {
        const s = document.createElement("style");
        s.textContent = css;
        document.documentElement.appendChild(s);
      };
      if (document.documentElement) add();
      else document.addEventListener("DOMContentLoaded", add);
    }, HIDE_DEV);
  }

  /** Scrolls to the bottom and back in steps, so parts that appear on scroll are drawn. */
  async function wake(page) {
    await page.evaluate(async () => {
      const step = Math.max(300, Math.floor(window.innerHeight * 0.5));
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 250));
      }
      // The last parts fade in over 0.6 s, so the page rests at the bottom before going back up.
      await new Promise((r) => setTimeout(r, 900));
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 400));
    });
  }

  /**
   * Saves the page (or `o.clip`, or `o.element`) as `<area>/<name>`.
   * `o.full` takes the whole page; `o.caption` and `o.alt` go to the manifest.
   */
  async function shot(page, area, name, o = {}) {
    await page.addStyleTag({ content: HIDE_DEV }).catch(() => {});
    // No hover state and no focus ring in a picture.
    await page.mouse.move(1, 1).catch(() => {});
    for (const frame of page.frames()) await frame.evaluate(() => document.activeElement?.blur?.()).catch(() => {});
    // A countdown's digits roll as they change; a still one never shows a digit mid roll.
    if (o.still) await page.emulateMedia({ reducedMotion: "reduce" });
    if (o.full) await wake(page);
    await page.waitForTimeout(o.settle ?? 600);
    let png;
    if (o.element) png = await o.element.screenshot({ animations: "disabled" });
    else {
      // WebP stops at 16,383 pixels a side, and no reader scrolls further: a longer page is cut there.
      const tall = o.full ? await page.evaluate(() => document.documentElement.scrollHeight) : 0;
      const clip = o.clip ?? (tall > MAX_HEIGHT ? { x: 0, y: 0, width: page.viewportSize().width, height: MAX_HEIGHT } : null);
      png = await page.screenshot({ fullPage: Boolean(o.full), animations: "disabled", ...(clip ? { clip } : {}) });
    }
    if (o.still) await page.emulateMedia({ reducedMotion: "no-preference" });
    const ext = sharp ? "webp" : "png";
    const file = join(outDir, area, `${name}.${ext}`);
    mkdirSync(dirname(file), { recursive: true });
    const bytes = sharp ? await sharp(png).webp({ quality: 82, effort: 5 }).toBuffer() : png;
    writeFileSync(file, bytes);
    const meta = sharp ? await sharp(png).metadata() : { width: null, height: null };
    taken.push({ area, name, file: `${name}.${ext}`, width: meta.width, height: meta.height, bytes: statSync(file).size, alt: o.alt ?? "", caption: o.caption ?? "" });
    console.log(`  ${area}/${name}.${ext}`);
  }

  return { prepare, wake, shot, taken };
}
