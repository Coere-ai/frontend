import type { Motif } from "./frame";
import { mark, markGradient, r1 } from "./shapes";

/**
 * The company covers: the Coere mark lifted by a beam over rising bars for
 * news about Coere itself, and the year as large LED digits on a sunrise
 * for the year's plan. Also the plain mark, for a post with no cover of
 * its own yet.
 */

const MARK_FILL = markGradient("m-mark", [[0, "#ffffff"], [0.45, "#c6cfff"], [1, "#5267f7"]]);

/** The mark in a column of light, over bars that rise from left to right. */
export function ventureMotif(): Motif {
  const bars: string[] = [];
  const count = 12;
  for (let i = 0; i < count; i++) {
    const x = 120 + i * 118;
    // Leave the middle to the mark, so the bars frame it.
    if (x > 560 && x < 1000) continue;
    const h = 90 + Math.pow(i / (count - 1), 1.6) * 430;
    bars.push(`<rect x="${x}" y="${r1(900 - h)}" width="76" height="${r1(h)}" rx="8" fill="url(#m-bar)"/>`);
  }
  return {
    defs: `${MARK_FILL}
<linearGradient id="m-bar" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#5267f7" stop-opacity="0.85"/><stop offset="1" stop-color="#7f8bfa" stop-opacity="0.15"/></linearGradient>
<linearGradient id="m-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a3b0fd" stop-opacity="0"/><stop offset="0.5" stop-color="#e0e5ff" stop-opacity="0.55"/><stop offset="1" stop-color="#a3b0fd" stop-opacity="0"/></linearGradient>
<linearGradient id="m-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="0.75" stop-color="#fff" stop-opacity="0.15"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="m-beam-fade"><rect width="1600" height="900" fill="url(#m-fade)"/></mask>
<filter id="m-soft" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="30"/></filter>`,
    under: `<g mask="url(#m-beam-fade)"><rect x="640" y="0" width="320" height="900" fill="url(#m-beam)" filter="url(#m-soft)"/></g>`,
    lit: `${bars.join("")}<rect x="700" y="0" width="200" height="300" fill="url(#m-beam)" opacity="0.8"/>${mark(800, 500, 470, "url(#m-mark)")}`,
    glow: `${mark(800, 500, 470, "#5267f7")}<rect x="730" y="0" width="140" height="420" fill="#a3b0fd" opacity="0.5"/>`,
    bloom: { x: 0.5, y: 0.45, color: "#5267f7" },
  };
}

/** A 5 by 7 dot matrix font, for the two digits the year needs. */
const DIGITS: Record<string, string[]> = {
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
};

/** Large LED digits for the year, standing on the rim of a rising sun. */
export function yearMotif(year: string): Motif {
  const px = 64;
  const gap = px;
  const width = year.length * 5 * px + (year.length - 1) * gap;
  const left = 800 - width / 2;
  const top = 110;
  const blocks: string[] = [];
  [...year].forEach((digit, d) => {
    (DIGITS[digit] ?? DIGITS["2"]).forEach((row, y) => {
      [...row].forEach((on, x) => {
        if (on === "1") blocks.push(`<rect x="${left + d * (5 * px + gap) + x * px + 4}" y="${top + y * px + 4}" width="${px - 8}" height="${px - 8}" rx="6"/>`);
      });
    });
  });
  const rings = [620, 700, 780, 860].map((r, i) => `<circle cx="800" cy="1290" r="${r}" fill="none" stroke="#7f8bfa" stroke-width="10" opacity="${0.5 - i * 0.1}"/>`).join("");
  return {
    defs: `<linearGradient id="m-year" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#a3b0fd"/><stop offset="1" stop-color="#5267f7"/></linearGradient>
<radialGradient id="m-sun" cx="0.5" cy="0.5" r="0.5"><stop offset="0.6" stop-color="#3f4ceb" stop-opacity="0.9"/><stop offset="0.92" stop-color="#c86bff" stop-opacity="0.75"/><stop offset="1" stop-color="#c86bff" stop-opacity="0"/></radialGradient>`,
    lit: `<circle cx="800" cy="1290" r="560" fill="url(#m-sun)"/>${rings}<g fill="url(#m-year)">${blocks.join("")}</g>`,
    glow: `<circle cx="800" cy="1290" r="560" fill="#5267f7"/><g fill="#7f8bfa">${blocks.join("")}</g>`,
    bloom: { x: 0.5, y: 0.85, color: "#7f5bf7" },
  };
}

/** The mark alone inside soft rings, for a post that has no cover of its own. */
export function markMotif(): Motif {
  const rings = [260, 340, 420].map((r, i) => `<circle cx="800" cy="450" r="${r}" fill="none" stroke="#5267f7" stroke-width="8" opacity="${0.55 - i * 0.15}"/>`).join("");
  return {
    defs: MARK_FILL,
    lit: `${rings}${mark(800, 450, 360, "url(#m-mark)")}`,
    glow: mark(800, 450, 360, "#5267f7"),
  };
}
