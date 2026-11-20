import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { hexToRgb, NEON_PALETTE } from "../pixel-matrix/palette";
import { pictureCells } from "./cells";
import { coverCrop, extendRows } from "./frame";

const stops = NEON_PALETTE.map(hexToRgb);

/** An RGBA image `w` by `h`, gray at the level `at(x, y)` gives (0 to 255). */
function image(w: number, h: number, at: (x: number, y: number) => number) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = at(x, y);
      data.set([v, v, v, 255], (y * w + x) * 4);
    }
  }
  return { data, width: w, height: h };
}

const brightness = (data: Uint8Array, i: number) => Math.max(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);

describe("pictureCells", () => {
  it("gives one texel a cell", () => {
    const pic = pictureCells(image(60, 30, () => 128), 20, 10, stops);
    assert.equal(pic.cols, 20);
    assert.equal(pic.rows, 10);
    assert.equal(pic.data.length, 20 * 10 * 4);
  });

  it("keeps the shadows near black and lights the bright, busy parts", () => {
    // Left half black, right half fine white stripes: the stripes light up, the black stays dark.
    const pic = pictureCells(image(96, 48, (x, y) => (x < 48 ? 0 : (x + y) % 6 < 3 ? 255 : 40)), 32, 16, stops);
    const left = brightness(pic.data, 8 * 32 + 4);
    const right = Math.max(...Array.from({ length: 8 }, (_, k) => brightness(pic.data, 8 * 32 + 22 + k)));
    assert.ok(left < 30, `dark cell ${left}`);
    assert.ok(right > 150, `lit cell ${right}`);
  });

  it("colors cells from the palette, not gray", () => {
    const pic = pictureCells(image(96, 48, (x, y) => ((x >> 1) + (y >> 1)) % 2 ? 255 : 30), 32, 16, stops);
    const i = 8 * 32 + 16;
    const [r, g, b] = [pic.data[i * 4], pic.data[i * 4 + 1], pic.data[i * 4 + 2]];
    assert.ok(b > r, "the Coere palette leans blue");
    assert.ok(Math.max(r, g, b) - Math.min(r, g, b) > 20, "a lit cell has a hue");
  });

  it("stores each cell's place on the ramp in alpha, running across the picture", () => {
    const pic = pictureCells(image(96, 48, () => 128), 32, 16, stops);
    assert.ok(pic.data[3] < pic.data[(16 * 32 - 1) * 4 + 3], "top left sits nearer cyan than bottom right");
  });
});

describe("coverCrop", () => {
  it("covers a wide frame with the full width, centered", () => {
    assert.deepEqual(coverCrop(1920, 1280, 2), { x: 0, y: 160, w: 1920, h: 960 });
  });

  it("follows the focus in a tall frame and stays inside the photo", () => {
    const crop = coverCrop(1920, 1280, 0.5, [0.1, 0.5]);
    assert.equal(crop.w, 640);
    assert.equal(crop.x, 0);
    assert.equal(coverCrop(1920, 1280, 0.5, [0.9, 0.5]).x, 1280);
  });

  it("zooms in on the focus", () => {
    assert.deepEqual(coverCrop(1920, 1280, 1.5, [0.5, 0.5, 2]), { x: 480, y: 320, w: 960, h: 640 });
  });
});

describe("extendRows", () => {
  it("sets the picture at the foot of a taller grid and fades it in above", () => {
    const pic = pictureCells(image(30, 30, (x, y) => ((x + y) % 2 ? 255 : 0)), 10, 10, stops);
    const tall = extendRows(pic, 16);
    assert.equal(tall.rows, 16);
    assert.equal(brightness(tall.data, 2 * 10 + 5), 0, "above the picture the cells are unlit");
    assert.deepEqual(Array.from(tall.data.subarray(15 * 40, 16 * 40)), Array.from(pic.data.subarray(9 * 40, 10 * 40)), "the last row is the picture's last row");
  });

  it("leaves a picture that already fills the grid alone", () => {
    const pic = pictureCells(image(30, 30, () => 200), 10, 10, stops);
    assert.equal(extendRows(pic, 10), pic);
  });
});
