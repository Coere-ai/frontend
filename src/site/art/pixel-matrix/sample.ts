import { type Rgb, rampAt, rampPosition } from "./palette";

/** Floats per lit cell: offset x and y, color r g b, bevel normal x and y, coverage, seed. */
export const CELL_FLOATS = 9;

/** A logo turned into lit cells, ready for the GPU. */
export type CellSet = { data: Float32Array; count: number };

/** A cell is lit when at least this share of it is covered by the mark. */
const MIN_COVER = 0.28;
/** How steep the bevel reads under the light; higher makes the edges catch more. */
const BEVEL = 1.7;

/**
 * Turns a rendered logo into its LED cells. `rgba` is a square image of
 * `grid * ss` pixels a side; each cell averages an `ss` by `ss` block, so
 * an edge cell that is half covered comes out half as bright, which keeps
 * curves smooth on a coarse grid. The coverage is blurred into a height so
 * each cell gets a normal: the logo reads as a raised shape the light can
 * rake across, lit on one edge and shaded on the other.
 */
export function cellsFromPixels(rgba: Uint8ClampedArray, grid: number, ss: number, logo: { tone: number; hue: number }, stops: readonly Rgb[]): CellSet {
  const side = grid * ss;
  const cover = new Float32Array(grid * grid);
  const color = new Float32Array(grid * grid * 3);
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      let a = 0;
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = 0; sy < ss; sy++) {
        let p = ((y * ss + sy) * side + x * ss) * 4;
        for (let sx = 0; sx < ss; sx++, p += 4) {
          const w = rgba[p + 3] / 255;
          a += w;
          r += (rgba[p] / 255) * w;
          g += (rgba[p + 1] / 255) * w;
          b += (rgba[p + 2] / 255) * w;
        }
      }
      const c = y * grid + x;
      cover[c] = a / (ss * ss);
      if (a > 0) color.set([r / a, g / a, b / a], c * 3);
    }
  }

  const height = blur(blur(cover, grid), grid);
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= grid || y >= grid ? 0 : height[y * grid + x]);
  const out: number[] = [];
  let seed = 0x9e3779b9 ^ Math.round(logo.tone * 1e4);
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      const c = y * grid + x;
      if (cover[c] < MIN_COVER) continue;
      const across = (x + y) / (2 * (grid - 1));
      const cell: Rgb = [color[c * 3], color[c * 3 + 1], color[c * 3 + 2]];
      const [r, g, b] = rampAt(stops, rampPosition(cell, logo, across));
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      out.push((x + 0.5) / grid - 0.5, (y + 0.5) / grid - 0.5, r, g, b, -(at(x + 1, y) - at(x - 1, y)) * BEVEL, -(at(x, y + 1) - at(x, y - 1)) * BEVEL, Math.min(1, cover[c] * 1.15), seed / 2 ** 32);
    }
  }
  return { data: new Float32Array(out), count: out.length / CELL_FLOATS };
}

/** A 3 by 3 box blur on a square grid, with the outside read as empty. */
function blur(src: Float32Array, grid: number): Float32Array {
  const dst = new Float32Array(src.length);
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx >= 0 && yy >= 0 && xx < grid && yy < grid) sum += src[yy * grid + xx];
        }
      }
      dst[y * grid + x] = sum / 9;
    }
  }
  return dst;
}
