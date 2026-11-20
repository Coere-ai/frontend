import type { CellPicture } from "./cells";
import { GAP_RGB, UNLIT_RGB } from "./renderer";

const byte = (rgb: readonly number[]) => rgb.map((c) => Math.round(c * 255));

/**
 * Paints the settled picture straight into a 2D canvas's pixels, the same
 * squares, gaps and gap glow the WebGL pass draws. Used where no intro
 * plays (the small cards) and where WebGL is missing, so it costs one pass
 * over the pixels and no GPU context.
 */
export function paintPicture(canvas: HTMLCanvasElement, picture: CellPicture, cell: number, gap: number): boolean {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return false;
  const { width, height } = canvas;
  const image = ctx.createImageData(width, height);
  const out = image.data;
  const { cols, rows, data } = picture;
  const [ur, ug, ub] = byte(UNLIT_RGB);
  const [gr, gg, gb] = byte(GAP_RGB);
  const core = cell - gap;
  const settled = new Uint8Array(cols * rows * 3);
  for (let i = 0; i < cols * rows; i++) {
    settled[i * 3] = Math.max(data[i * 4], ur);
    settled[i * 3 + 1] = Math.max(data[i * 4 + 1], ug);
    settled[i * 3 + 2] = Math.max(data[i * 4 + 2], ub);
  }
  const at = (x: number, y: number) => (Math.min(y, rows - 1) * cols + Math.min(x, cols - 1)) * 3;
  for (let y = 0; y < height; y++) {
    const cy = Math.floor(y / cell);
    const ly = y - cy * cell;
    for (let x = 0, p = y * width * 4; x < width; x++, p += 4) {
      const cx = Math.floor(x / cell);
      const lx = x - cx * cell;
      out[p + 3] = 255;
      if (lx < core && ly < core) {
        const q = at(cx, cy);
        out[p] = settled[q];
        out[p + 1] = settled[q + 1];
        out[p + 2] = settled[q + 2];
        continue;
      }
      const a = at(cx, cy);
      const b = at(cx + (lx >= core ? 1 : 0), cy);
      const c = at(cx, cy + (ly >= core ? 1 : 0));
      const d = at(cx + (lx >= core ? 1 : 0), cy + (ly >= core ? 1 : 0));
      const r = (settled[a] + settled[b] + settled[c] + settled[d]) / 4;
      const g = (settled[a + 1] + settled[b + 1] + settled[c + 1] + settled[d + 1]) / 4;
      const bl = (settled[a + 2] + settled[b + 2] + settled[c + 2] + settled[d + 2]) / 4;
      const bright = Math.max(r, g, bl) / 255;
      const t = Math.min(Math.max((bright - 0.3) / 0.6, 0), 1);
      const glow = 0.32 * t * t * (3 - 2 * t);
      out[p] = gr + r * glow;
      out[p + 1] = gg + g * glow;
      out[p + 2] = gb + bl * glow;
    }
  }
  ctx.putImageData(image, 0, 0);
  return true;
}
