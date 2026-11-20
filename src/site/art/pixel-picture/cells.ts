import { rampAt, type Rgb } from "../pixel-matrix/palette";
import { blur, percentile } from "./grid";

/**
 * Turns a photo into an LED picture: one solid color per square cell, on
 * the matrix palette's ramp. The photo is read for its light and its edges,
 * not its colors, so the scene comes back as a luminous rendering in Coere's
 * cyan, blue, violet and magenta rather than as a tinted photo.
 */

/** An RGBA image, row by row, as a canvas or sharp hands it over. */
export type Pixels = { data: Uint8ClampedArray | Uint8Array; width: number; height: number };

/**
 * The picture, one RGBA texel a cell, row by row from the top. RGB is the
 * cell's settled color; alpha is its place on the ramp, which the intro
 * uses to flash each cell in its own hue.
 */
export type CellPicture = { cols: number; rows: number; data: Uint8Array };

/** The look, in one place so a test and a tuning script read the same numbers. */
export const LOOK = {
  /** How far local contrast is pushed, so windows, columns and shelves stand apart. */
  detail: 1.3,
  /** Raises the light to this power: the shadows sink to black and the lit parts carry the scene. */
  gamma: 2,
  /** How bright a plain stretch (sky, a bare wall) stays against a busy one, so the picture is drawn by its detail. */
  plain: 0.3,
  /** How much an edge lights its cell, on top of its own light. */
  edge: 0.75,
  /** The share of the ramp set by brightness: bright cells lean cyan, dim ones violet and magenta. */
  byLight: 0.45,
  /** The share set by a slow diagonal sweep across the picture, so the palette runs across it. */
  bySweep: 0.62,
  /** How far a photo's own warm or cool color moves a cell along the ramp. */
  byHue: 0.22,
  /** How much the brightest cells run toward white, like an LED at full drive. */
  hot: 0.3,
  /** The glow the bright cells spill onto their neighbors, as a share of their light. */
  bloom: 0.45,
  /** Where the ramp starts for the brightest cell. */
  offset: 0.04,
  /** Lifts every cell, since the gaps take about half the screen. */
  gain: 1.4,
};

/** How soon the shoulder bends: higher lifts the mid tones more. */
const SHOULDER = 1.6;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Hue in turns from 0 to 1 and saturation from 0 to 1. */
function hueOf(r: number, g: number, b: number): [number, number] {
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (d < 1e-4 || max <= 0) return [0, 0];
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h /= 6;
  return [h < 0 ? h + 1 : h, d / max];
}

/**
 * Reads `pixels`, already cropped to the picture's frame and sized to a
 * few pixels a cell, into `cols` by `rows` cells colored from `stops`.
 */
export function pictureCells(pixels: Pixels, cols: number, rows: number, stops: readonly Rgb[]): CellPicture {
  const { data, width, height } = pixels;
  const n = cols * rows;
  const light = new Float32Array(n);
  const warmth = new Float32Array(n);

  // Each cell averages its block of the photo.
  for (let y = 0; y < rows; y++) {
    const y0 = Math.floor((y * height) / rows);
    const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * height) / rows));
    for (let x = 0; x < cols; x++) {
      const x0 = Math.floor((x * width) / cols);
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * width) / cols));
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0, p = (sy * width + x0) * 4; sx < x1; sx++, p += 4) {
          r += data[p];
          g += data[p + 1];
          b += data[p + 2];
        }
      }
      const k = 1 / ((y1 - y0) * (x1 - x0) * 255);
      r *= k;
      g *= k;
      b *= k;
      const i = y * cols + x;
      light[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      // Warm colors (reds, oranges) move toward magenta, cool ones (sky, water) toward cyan.
      const [h, s] = hueOf(r, g, b);
      const warm = Math.cos((h - 0.04) * Math.PI * 2);
      warmth[i] = warm * s * smooth(0.04, 0.3, Math.max(r, g, b));
    }
  }

  // Stretch the light to the full range, then push local contrast so the structure reads on a coarse grid.
  const lo = percentile(light, 0.015);
  const hi = Math.max(percentile(light, 0.985), lo + 0.05);
  for (let i = 0; i < n; i++) light[i] = clamp01((light[i] - lo) / (hi - lo));
  const soft = blur(light, cols, rows, Math.max(cols, rows) / 48);

  // Edges at cell scale, normalized so the strongest few run full.
  const edges = new Float32Array(n);
  for (let y = 0; y < rows; y++) {
    const up = Math.max(y - 1, 0) * cols;
    const mid = y * cols;
    const down = Math.min(y + 1, rows - 1) * cols;
    for (let x = 0; x < cols; x++) {
      const l = Math.max(x - 1, 0);
      const r = Math.min(x + 1, cols - 1);
      const gx = light[up + r] + 2 * light[mid + r] + light[down + r] - light[up + l] - 2 * light[mid + l] - light[down + l];
      const gy = light[down + l] + 2 * light[down + x] + light[down + r] - light[up + l] - 2 * light[up + x] - light[up + r];
      edges[mid + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  const edgeTop = Math.max(percentile(edges, 0.97), 1e-3);

  // How busy each cell's neighborhood is: a plain sky or wall scores low and dims, windows, shelves and columns score high and light up.
  const square = new Float32Array(n);
  for (let i = 0; i < n; i++) square[i] = light[i] * light[i];
  const mean = blur(light, cols, rows, 1);
  const meanSquare = blur(square, cols, rows, 1);
  const busy = new Float32Array(n);
  for (let i = 0; i < n; i++) busy[i] = Math.sqrt(Math.max(meanSquare[i] - mean[i] * mean[i], 0));
  const busyTop = Math.max(percentile(busy, 0.9), 1e-3);

  // The ramp in 256 steps, so no cell builds a color of its own.
  const ramp = new Float32Array(256 * 3);
  for (let k = 0; k < 256; k++) ramp.set(rampAt(stops, k / 255), k * 3);
  const color = new Float32Array(n * 3);
  const place = new Float32Array(n);
  const glow = new Float32Array(n * 3);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const l = light[i];
      const local = clamp01(l + LOOK.detail * (l - soft[i]));
      const edge = clamp01(edges[i] / edgeTop);
      const texture = clamp01(busy[i] / busyTop);
      const v = clamp01(Math.pow(local, LOOK.gamma) * (LOOK.plain + (1 - LOOK.plain) * texture) + LOOK.edge * edge * edge * (0.25 + 0.75 * l));
      const sweep = (x / cols) * 0.62 + (y / rows) * 0.38;
      const t = clamp01((1 - local) * LOOK.byLight + sweep * LOOK.bySweep + LOOK.offset - warmth[i] * LOOK.byHue);
      const hot = smooth(0.7, 1, v) * LOOK.hot;
      const spill = smooth(0.45, 0.95, v);
      const lut = Math.round(t * 255) * 3;
      for (let c = 0; c < 3; c++) {
        const tone = ramp[lut + c];
        const lit = (tone + (1 - tone) * hot) * v;
        color[i * 3 + c] = lit;
        glow[i * 3 + c] = lit * spill;
      }
      place[i] = t;
    }
  }

  // The bright cells light their neighbors a little, a soft halo a few cells wide.
  const halo = blur(glow, cols, rows, 2, 3);
  // A soft shoulder, in a table, so a bright cell with a bright halo never clips flat.
  const curve = new Uint8Array(2048);
  for (let k = 0; k < 2048; k++) curve[k] = Math.round(255 * Math.min((1 - Math.exp((-k / 1024) * SHOULDER)) / (1 - Math.exp(-SHOULDER)), 1));
  const out = new Uint8Array(n * 4);
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < 3; c++) {
      const v = LOOK.gain * color[i * 3 + c] + LOOK.bloom * halo[i * 3 + c];
      out[i * 4 + c] = curve[Math.min(Math.round(v * 1024), 2047)];
    }
    out[i * 4 + 3] = Math.round(place[i] * 255);
  }
  return { cols, rows, data: out };
}
