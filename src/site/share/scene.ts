import { mark, markGradient, placeLogo } from "@/site/blog/covers/shapes";
import { type MatrixLogoId, MATRIX_LOGOS } from "@/site/art/pixel-matrix/logos";
import { NEON_PALETTE, hexToRgb, rampAt } from "@/site/art/pixel-matrix/palette";
import type { Wall } from "@/site/blog/covers/grid";

/**
 * The scene behind the site's share picture, before it goes through the
 * LED wall's grid: the Coere mark with the AIs floating round it, in the
 * colors of the Coere Solutions wall. It is drawn on the picture's own
 * 1200 by 630 canvas, and the wall lights only its right side, fading out
 * into the page's near black where the words sit.
 */

export const SHARE_WIDTH = 1200;
export const SHARE_HEIGHT = 630;

/** Five pixels a cell, coarse enough that the grid still reads in a feed's small preview. */
export const SHARE_CELL = 5;
export const SHARE_COLS = SHARE_WIDTH / SHARE_CELL;
export const SHARE_ROWS = SHARE_HEIGHT / SHARE_CELL;

/** The site's near black as the gap, and an unlit cell a little above it. */
export const SHARE_WALL: Wall = { gap: "#0b0a12", off: "#1b1a26" };

/**
 * Where each AI floats: its center, its size across, and how lit it is, a
 * far one dimmer. Placed by eye around the mark, a few cut by the edge as
 * on the Solutions wall, and none left of x 640, where the words end.
 */
const PLACES: { id: MatrixLogoId; x: number; y: number; size: number; light: number }[] = [
  { id: "claude", x: 724, y: 122, size: 104, light: 0.95 },
  { id: "chatgpt", x: 1098, y: 108, size: 136, light: 1 },
  { id: "perplexity", x: 912, y: 64, size: 72, light: 0.6 },
  { id: "kimi", x: 1186, y: 300, size: 84, light: 0.55 },
  { id: "gemini", x: 1100, y: 372, size: 108, light: 1 },
  { id: "copilot", x: 690, y: 330, size: 84, light: 0.75 },
  { id: "grok", x: 716, y: 520, size: 92, light: 0.65 },
  { id: "deepseek", x: 900, y: 548, size: 108, light: 0.9 },
  { id: "meta", x: 1096, y: 560, size: 116, light: 0.95 },
];

/** The mark, large and bright at the center of the art. */
const MARK = { x: 906, y: 318, size: 220 };

/** The files the scene draws, in /public, so the caller reads just those. */
export const SHARE_LOGO_FILES = PLACES.map((p) => MATRIX_LOGOS[p.id].src.replace(/^\//, ""));

function rampHex(t: number, white = 0): string {
  const [r, g, b] = rampAt(NEON_PALETTE.map(hexToRgb), t);
  const lift = (v: number) => Math.round((v + (1 - v) * white) * 255);
  return `#${[r, g, b].map((v) => lift(v).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * One AI's logo as the wall shows it: its own shape, filled along a sweep
 * of the wall's ramp round the logo's home on it, paler at the top left as
 * if lit from there. The logo is drawn into a mask turned to pure white, so
 * a brand's own colors give only the shape.
 */
function wallLogo(place: (typeof PLACES)[number], svg: string, i: number): { defs: string; lit: string } {
  const { x, y, size, light } = place;
  const tone = MATRIX_LOGOS[place.id].tone;
  const box = `x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}"`;
  const defs = `<linearGradient id="s-g${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${rampHex(tone - 0.18, 0.3)}"/><stop offset="1" stop-color="${rampHex(tone + 0.18)}"/></linearGradient><mask id="s-m${i}" maskUnits="userSpaceOnUse" ${box}><g filter="url(#s-white)">${placeLogo(svg, x, y, size, `s-l${i}-`)}</g></mask>`;
  return { defs, lit: `<rect ${box} fill="url(#s-g${i})" mask="url(#s-m${i})" opacity="${light}"/>` };
}

/** The share picture's scene as an SVG document. `logos` maps each file in SHARE_LOGO_FILES to its text. */
export function shareScene(logos: Record<string, string>): string {
  const drawn = PLACES.map((p, i) => wallLogo(p, logos[SHARE_LOGO_FILES[i]] ?? "", i));
  const markShape = mark(MARK.x, MARK.y, MARK.size, "url(#s-mark)");
  const lit = `${drawn.map((d) => d.lit).join("")}${markShape}`;
  const { gap, off } = SHARE_WALL;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SHARE_WIDTH} ${SHARE_HEIGHT}" width="${SHARE_WIDTH}" height="${SHARE_HEIGHT}">
<defs>
<linearGradient id="s-fade" x1="0" y1="0" x2="1" y2="0"><stop offset="0.44" stop-color="${off}" stop-opacity="0"/><stop offset="0.66" stop-color="${off}"/></linearGradient>
<radialGradient id="s-bloom" gradientUnits="userSpaceOnUse" cx="${MARK.x}" cy="${MARK.y}" r="420"><stop offset="0" stop-color="#5267f7" stop-opacity="0.4"/><stop offset="0.45" stop-color="#5267f7" stop-opacity="0.1"/><stop offset="1" stop-color="#5267f7" stop-opacity="0"/></radialGradient>
<filter id="s-white" x="0" y="0" width="100%" height="100%"><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/></filter>
<filter id="s-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>
${markGradient("s-mark", [[0, "#ffffff"], [0.45, "#c6cfff"], [1, "#5267f7"]])}
${drawn.map((d) => d.defs).join("\n")}
</defs>
<rect width="${SHARE_WIDTH}" height="${SHARE_HEIGHT}" fill="${gap}"/>
<rect width="${SHARE_WIDTH}" height="${SHARE_HEIGHT}" fill="url(#s-fade)"/>
<rect width="${SHARE_WIDTH}" height="${SHARE_HEIGHT}" fill="url(#s-bloom)"/>
<g filter="url(#s-glow)" opacity="0.5">${lit}</g>
${lit}
</svg>`;
}
