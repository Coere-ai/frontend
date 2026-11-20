/**
 * The colors of the pixel matrix. A palette is four stops on one ramp, in
 * hue order, so a position from 0 to 1 picks a color between them. Every
 * logo is colored from the same ramp, which keeps the wall in one palette
 * even where a brand's own color sits far from it.
 */

export type Rgb = readonly [number, number, number];

/** Four hex colors, in the order the ramp runs through them. */
export type MatrixPalette = readonly [string, string, string, string];

/** Cyan, electric blue, violet and magenta: the luminous default. */
export const NEON_PALETTE: MatrixPalette = ["#1fe4ff", "#3a78ff", "#8a5cff", "#ff3fd8"];

/** Coere blue and its neighbors, for a calmer wall in the brand's own hue. */
export const BRAND_PALETTE: MatrixPalette = ["#62e6ff", "#5267f7", "#7d6bff", "#b26bff"];

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
  const n = Number.parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** The ramp color at `t`, blended between the two nearest stops. */
export function rampAt(stops: readonly Rgb[], t: number): Rgb {
  const x = Math.min(Math.max(t, 0), 1) * (stops.length - 1);
  const i = Math.min(Math.floor(x), stops.length - 2);
  const f = x - i;
  const a = stops[i];
  const b = stops[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

/** Hue in degrees and saturation from 0 to 1, enough to tell a brand color from white or gray. */
export function hueAndSaturation([r, g, b]: Rgb): { hue: number; saturation: number } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d < 1e-6) return { hue: 0, saturation: 0 };
  const saturation = max === 0 ? 0 : d / max;
  let hue: number;
  if (max === r) hue = ((g - b) / d) % 6;
  else if (max === g) hue = (b - r) / d + 2;
  else hue = (r - g) / d + 4;
  hue *= 60;
  return { hue: hue < 0 ? hue + 360 : hue, saturation };
}

/** The signed gap between two hues, from -180 to 180 degrees. */
export function hueGap(a: number, b: number): number {
  return ((((a - b) % 360) + 540) % 360) - 180;
}

/**
 * Where a sampled cell sits on the ramp. Each logo has a `tone`, its home
 * on the ramp, and a brand hue that maps onto it. A colored cell moves along
 * the ramp by how far its hue is from the brand hue, so a logo with several
 * colors (Gemini, Copilot) keeps its parts apart in the new palette. White
 * and gray cells, every cell of a one color mark, and a mark set `mono`
 * (Copilot, whose many brand hues land on the ramp as clashing bands),
 * follow a soft gradient across the logo instead, `across` running from 0 to 1.
 */
export function rampPosition(cell: Rgb, logo: { tone: number; hue: number; mono?: boolean }, across: number): number {
  const sweep = logo.tone + (across - 0.5) * 0.5;
  if (logo.mono) return clamp01(sweep);
  const { hue, saturation } = hueAndSaturation(cell);
  if (saturation < 0.2) return clamp01(sweep);
  const brand = logo.tone + (hueGap(hue, logo.hue) / 360) * 1.1;
  return clamp01(brand * 0.6 + sweep * 0.4);
}

function clamp01(x: number): number {
  return Math.min(Math.max(x, 0), 1);
}
