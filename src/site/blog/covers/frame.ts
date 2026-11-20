/**
 * The scene every blog cover shares, so the covers read as one set: a near
 * black LED wall like the Coere Solutions hero, a soft Coere blue bloom, and
 * a motif with a glow behind it. A motif is plain SVG drawn on a 1600 by
 * 900 canvas. The scene is only ever seen through the wall's grid
 * (grid.ts), which gives each cell one color of it.
 */

import { COLS, GAP_COLOR, OFF_COLOR, PITCH, ROWS } from "./grid";

/** The size the finished cover is written at: one grid cell is ten units. */
export const COVER_WIDTH = COLS * PITCH;
export const COVER_HEIGHT = ROWS * PITCH;

/** The canvas every motif is drawn on. */
const SCENE_WIDTH = 1600;
const SCENE_HEIGHT = 900;

/** One grid cell on the motif's canvas. A shape meant to light whole cells starts, ends and steps on these. */
export const SCENE_CELL = SCENE_WIDTH / COLS;

/** A length on the motif's canvas moved to the nearest cell edge. */
export const snap = (n: number) => Math.round(n / SCENE_CELL) * SCENE_CELL;

export type Motif = {
  /** Gradients and other defs the motif's shapes refer to. Ids must start with "m-". */
  defs?: string;
  /** The motif's shapes, the cells it lights. */
  lit: string;
  /** Shapes drawn as a soft glow behind the lit shapes; the lit shapes by default. */
  glow?: string;
  /** Shapes drawn under the glow, such as a faint beam. */
  under?: string;
  /** The bloom's center as fractions of the canvas, and its color. */
  bloom?: { x: number; y: number; color: string };
};

/** One cover's scene as an SVG document, before the grid. */
export function sceneSvg(motif: Motif): string {
  const bloom = motif.bloom ?? { x: 0.5, y: 0.5, color: "#5267f7" };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}" width="${SCENE_WIDTH}" height="${SCENE_HEIGHT}">
<defs>
<radialGradient id="f-bloom" cx="${bloom.x}" cy="${bloom.y}" r="0.62"><stop offset="0" stop-color="${bloom.color}" stop-opacity="0.42"/><stop offset="0.45" stop-color="${bloom.color}" stop-opacity="0.12"/><stop offset="1" stop-color="${bloom.color}" stop-opacity="0"/></radialGradient>
<radialGradient id="f-vignette" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="${GAP_COLOR}" stop-opacity="0"/><stop offset="1" stop-color="${GAP_COLOR}" stop-opacity="0.85"/></radialGradient>
<filter id="f-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="22"/></filter>
${motif.defs ?? ""}
</defs>
<rect width="${SCENE_WIDTH}" height="${SCENE_HEIGHT}" fill="${OFF_COLOR}"/>
<rect width="${SCENE_WIDTH}" height="${SCENE_HEIGHT}" fill="url(#f-bloom)"/>
${motif.under ?? ""}
<g filter="url(#f-glow)" opacity="0.5">${motif.glow ?? motif.lit}</g>
${motif.lit}
<rect width="${SCENE_WIDTH}" height="${SCENE_HEIGHT}" fill="url(#f-vignette)"/>
</svg>`;
}
