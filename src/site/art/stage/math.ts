/**
 * Small pure helpers the WebGL backgrounds share: colors, the pixel ratio
 * they draw at, and the order of glyphs from light to dense. Nothing here
 * touches the page, so the tests run it in Node.
 */

export type Rgb = readonly [number, number, number];

/** "#5267f7" or "#56f" as 0 to 1 channels. Anything unreadable comes back black. */
export function hexToRgb(hex: string): Rgb {
  const h = hex.trim().replace(/^#/, "");
  const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
  if (!/^[0-9a-f]{6}$/i.test(full)) return [0, 0, 0];
  const n = Number.parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** One sRGB channel in linear light, so colors add up the way light does in the shader. */
export function toLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** A hex color in linear light. */
export function linearRgb(hex: string): Rgb {
  const [r, g, b] = hexToRgb(hex);
  return [toLinear(r), toLinear(g), toLinear(b)];
}

/**
 * The pixel ratio to draw at: the screen's own, held under `cap`, and never
 * under `floor` (or the screen's own ratio when that is lower still).
 */
export function drawRatio(device: number, cap: number, floor = 1): number {
  const d = Number.isFinite(device) && device > 0 ? device : 1;
  return Math.max(Math.min(d, cap), Math.min(d, floor));
}

/**
 * The next cap after a run of slow frames: a quarter step down, but never
 * under the floor. Returns the same cap when it is already at the floor.
 */
export function lowerCap(cap: number, floor: number): number {
  return Math.max(floor, Math.round((cap - 0.25) * 100) / 100);
}

/**
 * Glyphs ordered from the emptiest to the densest by how much of its cell
 * each one inks. Ties keep the order they came in, and the first glyph is
 * always the emptiest, so dark cells stay dark.
 */
export function rampByInk(glyphs: readonly string[], ink: readonly number[]): string[] {
  return glyphs
    .map((g, i) => ({ g, ink: ink[i] ?? 0, i }))
    .sort((a, b) => a.ink - b.ink || a.i - b.i)
    .map((x) => x.g);
}

/** The grid of character cells that covers a canvas, rounded up so the edge is never bare. */
export function cellGrid(width: number, height: number, cell: number): { cols: number; rows: number } {
  const c = Math.max(cell, 1);
  return { cols: Math.max(1, Math.ceil(width / c)), rows: Math.max(1, Math.ceil(height / c)) };
}
