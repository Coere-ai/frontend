import type { CellPicture } from "./cells";

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * Sets `picture` at the foot of a taller grid of `rows`, its first `fade`
 * share of rows rising out of the unlit cells above. A phone's hero is far
 * taller than the photo is wide, and a crop that tall would keep only a
 * sliver of the scene; this keeps the scene in the lower part, round the
 * app, and leaves the words above on dark cells.
 */
export function extendRows(picture: CellPicture, rows: number, fade = 0.3): CellPicture {
  if (rows <= picture.rows) return picture;
  const { cols, data } = picture;
  const out = new Uint8Array(cols * rows * 4);
  const top = rows - picture.rows;
  const edge = picture.rows * fade;
  for (let y = 0; y < picture.rows; y++) {
    const k = smooth(0, edge, y);
    for (let x = 0; x < cols; x++) {
      const p = (y * cols + x) * 4;
      const q = ((y + top) * cols + x) * 4;
      out[q] = data[p] * k;
      out[q + 1] = data[p + 1] * k;
      out[q + 2] = data[p + 2] * k;
      out[q + 3] = data[p + 3];
    }
  }
  // Above the picture the cells keep the ramp of its first row, so the intro still flashes them in a hue.
  for (let y = 0; y < top; y++) {
    for (let x = 0; x < cols; x++) out[(y * cols + x) * 4 + 3] = data[x * 4 + 3];
  }
  return { cols, rows, data: out };
}

/**
 * The part of a photo `width` by `height` that covers a frame of the given
 * aspect, as CSS object-fit cover would, centered on `focus` (0 to 1 each
 * way) as far as the photo allows.
 */
export function coverCrop(width: number, height: number, aspect: number, focus: readonly [number, number] = [0.5, 0.5]) {
  const w = Math.min(width, height * aspect);
  const h = w / aspect;
  const x = Math.min(Math.max(focus[0] * width - w / 2, 0), width - w);
  const y = Math.min(Math.max(focus[1] * height - h / 2, 0), height - h);
  return { x, y, w, h };
}
