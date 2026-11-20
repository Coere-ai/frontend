/**
 * The LED wall every cover is shown on, as a true pixel grid: the scene is
 * drawn once, each cell takes the one color the scene has on average under
 * it, that color is snapped to the cover's palette, and the cell is drawn
 * as one solid square of it. No shape edge crosses a cell; a soft edge, a
 * glow or a gradient becomes a step in a cell's brightness.
 */

export type Rgb = readonly [number, number, number];

/** The wall's grid: 192 by 108 cells at 16 by 9, ten units each in the SVG it is written to. */
export const COLS = 192;
export const ROWS = 108;
export const PITCH = 10;

/** The dark between the cells. */
export const GAP_COLOR = "#04050b";
/** The color of a cell nothing lights: the gap color with a little light of its own, so the wall reads as LEDs. */
export const OFF_COLOR = "#16171c";

/** The two dark colors of a wall: the gap between cells and a cell nothing lights. The covers use the default; a picture on another dark gives its own. */
export type Wall = { gap: string; off: string };
export const COVER_WALL: Wall = { gap: GAP_COLOR, off: OFF_COLOR };

/** The lit square inside each cell, in canvas units, so every gap is the same. */
const SQUARE = { inset: 1.2, size: 7.6, round: 1.6 };

/**
 * Brightness steps toward each palette color, darkest first. They are
 * closer together in the dark, where the bloom and the glows fade out, so
 * a fade reads as even steps rather than a jump.
 */
const LEVELS = Array.from({ length: 24 }, (_, k) => ((k + 1) / 24) ** 1.7);

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.slice(0, 6);
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * The colors a cell may take: the gap and unlit colors, then every base
 * color and two paler tints of it at each brightness step up to full, once from the unlit
 * color (a light on the wall) and once from the gap color (a light under
 * the dark edges). Duplicates are dropped, so the list holds each color once.
 */
export function buildPalette(bases: readonly string[], wall: Wall = COVER_WALL): Rgb[] {
  const seen = new Set<string>();
  const out: Rgb[] = [];
  const add = (c: Rgb) => {
    const rounded: Rgb = [Math.round(c[0]), Math.round(c[1]), Math.round(c[2])];
    const key = rounded.join(",");
    if (seen.has(key)) return;
    seen.add(key);
    out.push(rounded);
  };
  const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  // Each base also comes paler, a third and two thirds of the way to white, for the white to blue gradients.
  const white: Rgb = [255, 255, 255];
  const tones = bases.map(hexToRgb).flatMap((c) => [c, mix(c, white, 1 / 3), mix(c, white, 2 / 3)]);
  for (const from of [wall.off, wall.gap].map(hexToRgb)) {
    add(from);
    for (const c of tones) for (const t of LEVELS) add(mix(from, c, t));
  }
  return out;
}

/** Every hex color written in an SVG's text, so a cover's palette is the colors its scene is drawn in. */
export function colorsIn(svg: string): string[] {
  const found = svg.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) ?? [];
  return [...new Set(found.map((c) => rgbToHex(hexToRgb(c))))];
}

/**
 * One color per cell: the average of the `ss` by `ss` block of pixels under
 * it, from an RGBA picture `cols * ss` by `rows * ss` pixels in size. A
 * cell half covered by a shape comes out half way between the shape and
 * what is behind it, never split between the two.
 */
export function averageCells(rgba: Uint8ClampedArray, cols: number, rows: number, ss: number, gap = GAP_COLOR): Float32Array {
  const width = cols * ss;
  const gapRgb = hexToRgb(gap);
  if (rgba.length !== width * rows * ss * 4) throw new Error(`picture is not ${cols * ss} by ${rows * ss}`);
  const out = new Float32Array(cols * rows * 3);
  const n = ss * ss;
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = 0; sy < ss; sy++) {
        let p = ((cy * ss + sy) * width + cx * ss) * 4;
        for (let sx = 0; sx < ss; sx++, p += 4) {
          // The scene is opaque; any alpha left is read as the gap color behind it.
          const a = rgba[p + 3] / 255;
          r += rgba[p] * a + gapRgb[0] * (1 - a);
          g += rgba[p + 1] * a + gapRgb[1] * (1 - a);
          b += rgba[p + 2] * a + gapRgb[2] * (1 - a);
        }
      }
      const c = (cy * cols + cx) * 3;
      out[c] = r / n;
      out[c + 1] = g / n;
      out[c + 2] = b / n;
    }
  }
  return out;
}

/**
 * How much a difference in hue counts against one in lightness. Near white
 * a pale blue and a gray are almost as light, and the blue is the one the
 * scene meant, so hue counts for more than OKLab alone would give it.
 */
const CHROMA_WEIGHT = 4;

/**
 * Snaps each cell to the nearest palette color, judged in OKLab so the
 * nearest is the one that looks nearest. Returns each cell's palette index.
 */
export function quantize(cells: Float32Array, palette: readonly Rgb[]): Uint16Array {
  const labs = palette.map(oklab);
  const out = new Uint16Array(cells.length / 3);
  const memo = new Map<number, number>();
  for (let i = 0; i < out.length; i++) {
    const r = Math.round(cells[i * 3]);
    const g = Math.round(cells[i * 3 + 1]);
    const b = Math.round(cells[i * 3 + 2]);
    const key = (r << 16) | (g << 8) | b;
    let best = memo.get(key);
    if (best === undefined) {
      const [l, a, bb] = oklab([r, g, b]);
      let bestDistance = Infinity;
      best = 0;
      for (let p = 0; p < labs.length; p++) {
        const d = (labs[p][0] - l) ** 2 + CHROMA_WEIGHT * ((labs[p][1] - a) ** 2 + (labs[p][2] - bb) ** 2);
        if (d < bestDistance) {
          bestDistance = d;
          best = p;
        }
      }
      memo.set(key, best);
    }
    out[i] = best;
  }
  return out;
}

/** An sRGB color, 0 to 255 a channel, in OKLab. */
function oklab([r, g, b]: Rgb): Rgb {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [lr, lg, lb] = [lin(r), lin(g), lin(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675804 * s];
}

/** A block of cells of one color: its left and top cell, and how many cells across and down. */
type Block = { x: number; y: number; w: number; h: number; c: number };

/**
 * Cells of one color side by side in a row become one run, and a run with
 * the very same run under it grows down into a block, so a flat area is
 * one rect rather than one per row.
 */
export function blocksOf(cells: Uint16Array, cols: number, rows: number): Block[] {
  const done: Block[] = [];
  let open = new Map<string, Block>();
  for (let y = 0; y < rows; y++) {
    const next = new Map<string, Block>();
    for (let x = 0; x < cols; ) {
      const c = cells[y * cols + x];
      let end = x + 1;
      while (end < cols && cells[y * cols + end] === c) end++;
      const key = `${x},${end},${c}`;
      const above = open.get(key);
      if (above) {
        above.h++;
        open.delete(key);
        next.set(key, above);
      } else {
        next.set(key, { x, y, w: end - x, h: 1, c });
      }
      x = end;
    }
    done.push(...open.values());
    open = next;
  }
  done.push(...open.values());
  return done;
}

/**
 * The wall as an SVG document. The cells go in as blocks of one color, all
 * blocks of a color as one path, and the most common color as a single
 * rect under them, which keeps the file small. A mask of rounded squares,
 * one per cell, then cuts the same gap round every cell; since every block
 * starts and ends on a cell's edge, each square shows exactly one color.
 */
export function gridSvg(cells: Uint16Array, palette: readonly Rgb[], cols: number, rows: number, title: string, gap = GAP_COLOR): string {
  const counts = new Map<number, number>();
  for (const c of cells) counts.set(c, (counts.get(c) ?? 0) + 1);
  const common = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const byColor = new Map<number, Block[]>();
  for (const block of blocksOf(cells, cols, rows)) {
    if (block.c === common) continue;
    byColor.set(block.c, [...(byColor.get(block.c) ?? []), block]);
  }
  const runs = new Map<number, string[]>();
  for (const [c, blocks] of byColor) {
    // Each block is drawn from the last one's corner, in short relative steps; a path's first m counts from the origin.
    let at = [0, 0];
    runs.set(
      c,
      blocks.map(({ x, y, w, h }) => {
        const d = `m${x - at[0]} ${y - at[1]}h${w}v${h}h${-w}z`;
        at = [x, y];
        return d;
      }),
    );
  }
  const width = cols * PITCH;
  const height = rows * PITCH;
  const paths = [...runs.entries()].map(([c, d]) => `<path fill="${rgbToHex(palette[c])}" d="${d.join("")}"/>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">
<title>${escapeXml(title)}</title>
<defs>
<pattern id="cells" width="${PITCH}" height="${PITCH}" patternUnits="userSpaceOnUse"><rect x="${SQUARE.inset}" y="${SQUARE.inset}" width="${SQUARE.size}" height="${SQUARE.size}" rx="${SQUARE.round}" fill="#fff"/></pattern>
<mask id="grid" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="url(#cells)"/></mask>
</defs>
<rect width="${width}" height="${height}" fill="${gap}"/>
<g mask="url(#grid)"><g transform="scale(${PITCH})"><rect width="${cols}" height="${rows}" fill="${rgbToHex(palette[common])}"/>
${paths}
</g></g>
</svg>`;
}

/** Text placed inside an SVG, made safe for XML. */
export function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
