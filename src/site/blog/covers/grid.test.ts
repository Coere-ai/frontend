import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { zlibSync } from "fflate";

import { coverScene } from "./index";
import { averageCells, blocksOf, buildPalette, COLS, colorsIn, GAP_COLOR, gridSvg, hexToRgb, OFF_COLOR, quantize, ROWS, type Rgb, rgbToHex } from "./grid";
import { pixelate } from "./pixelate";
import { decodePng } from "./png";

/** An RGBA picture `w` by `h`, each pixel colored by `at(x, y)`. */
function picture(w: number, h: number, at: (x: number, y: number) => Rgb): Uint8ClampedArray {
  const px = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) px.set([...at(x, y), 255], (y * w + x) * 4);
  return px;
}

/**
 * Reads a cover SVG back into one color per cell, by filling in the base
 * rect and then every path's blocks. It fails if a block does not start
 * and end on whole cells or if two blocks claim the same cell.
 */
function cellsOfSvg(svg: string, cols: number, rows: number): string[] {
  const base = /<rect width="(\d+)" height="(\d+)" fill="(#[0-9a-f]{6})"\/>\n<path|<rect width="(\d+)" height="(\d+)" fill="(#[0-9a-f]{6})"\/>\n<\/g>/.exec(svg);
  assert.ok(base, "the most common color is drawn as one rect");
  const grid: string[] = Array(cols * rows).fill(base[3] ?? base[6]);
  const claimed = new Set<number>();
  for (const [, fill, d] of svg.matchAll(/<path fill="(#[0-9a-f]{6})" d="([^"]+)"\/>/g)) {
    let at = [0, 0];
    for (const [, dx, dy, w, h, back] of d.matchAll(/m(-?\d+) (-?\d+)h(\d+)v(\d+)h(-\d+)z/g)) {
      const [x, y] = [at[0] + Number(dx), at[1] + Number(dy)];
      assert.equal(Number(back), -Number(w), "a block closes on itself");
      for (let yy = y; yy < y + Number(h); yy++) {
        for (let xx = x; xx < x + Number(w); xx++) {
          const i = yy * cols + xx;
          assert.ok(xx < cols && yy < rows, "a block stays on the wall");
          assert.ok(!claimed.has(i), `cell ${xx},${yy} is drawn once`);
          claimed.add(i);
          grid[i] = fill;
        }
      }
      at = [x, y];
    }
    // Every number in the path is a whole cell, so no edge falls inside a cell.
    assert.match(d, /^[mhvz0-9 -]+$/);
  }
  return grid;
}

describe("averageCells", () => {
  it("gives each cell one color, the average of the pixels under it", () => {
    // 2 by 1 cells at 4 pixels a cell; a white shape covers the first cell and a quarter of the second.
    const px = picture(8, 4, (x) => (x < 5 ? [255, 255, 255] : [0, 0, 0]));
    const cells = averageCells(px, 2, 1, 4);
    assert.equal(cells.length, 2 * 3);
    assert.deepEqual([...cells.slice(0, 3)], [255, 255, 255]);
    assert.deepEqual([...cells.slice(3, 6)].map(Math.round), [64, 64, 64]);
  });

  it("refuses a picture that does not match the grid", () => {
    assert.throws(() => averageCells(new Uint8ClampedArray(10 * 10 * 4), 3, 3, 4));
  });
});

describe("buildPalette", () => {
  it("holds the wall's colors, every base at full strength, and no color twice", () => {
    const palette = buildPalette(["#5267f7", "#ffffff"]).map(rgbToHex);
    for (const c of [GAP_COLOR, OFF_COLOR, "#5267f7", "#ffffff"]) assert.ok(palette.includes(c), c);
    assert.equal(new Set(palette).size, palette.length);
  });

  it("reads a scene's colors from its text", () => {
    assert.deepEqual(colorsIn(`<rect fill="#FFF"/><stop stop-color="#5267f7"/><path fill="#5267f7"/>`), ["#ffffff", "#5267f7"]);
  });
});

describe("quantize", () => {
  const palette = buildPalette(["#5267f7", "#ffffff", "#c86bff"]);

  it("snaps every cell to one palette color, and leaves a palette color as it is", () => {
    const colors: Rgb[] = [hexToRgb("#5267f7"), hexToRgb("#ffffff"), [120, 30, 200], [12, 13, 20], [90, 100, 160]];
    const index = quantize(new Float32Array(colors.flat()), palette);
    assert.equal(index.length, colors.length);
    for (const i of index) assert.ok(i < palette.length);
    assert.equal(rgbToHex(palette[index[0]]), "#5267f7");
    assert.equal(rgbToHex(palette[index[1]]), "#ffffff");
  });

  it("keeps a pale blue blue rather than gray", () => {
    const [i] = quantize(new Float32Array([200, 210, 250]), buildPalette(["#ffffff", "#a3b0fd"]));
    const [r, , b] = buildPalette(["#ffffff", "#a3b0fd"])[i];
    assert.ok(b - r > 20, `got ${rgbToHex(buildPalette(["#ffffff", "#a3b0fd"])[i])}`);
  });
});

describe("gridSvg", () => {
  it("writes every cell as exactly one color, in blocks on whole cells", () => {
    const cols = 12;
    const rows = 7;
    const palette = buildPalette(["#5267f7", "#ffffff"]);
    const cells = new Uint16Array(cols * rows).map((_, i) => ((i % cols) * 7 + Math.floor(i / cols) * 3) % 5 === 0 ? 3 : (i % cols > 6 ? 20 : 0));
    const svg = gridSvg(cells, palette, cols, rows, "A <test> & title");
    assert.deepEqual(cellsOfSvg(svg, cols, rows), [...cells].map((c) => rgbToHex(palette[c])));
    assert.match(svg, /<title>A &lt;test&gt; &amp; title<\/title>/);
  });

  it("merges a flat area into one block", () => {
    const blocks = blocksOf(new Uint16Array(6 * 4).fill(2), 6, 4);
    assert.deepEqual(blocks, [{ x: 0, y: 0, w: 6, h: 4, c: 2 }]);
  });
});

describe("decodePng", () => {
  it("reads RGBA rows under every filter", () => {
    const width = 3;
    const pixels = [
      [10, 20, 30, 255, 40, 50, 60, 255, 70, 80, 90, 128],
      [1, 2, 3, 255, 4, 5, 6, 255, 7, 8, 9, 255],
      [100, 110, 120, 255, 130, 140, 150, 255, 160, 170, 180, 255],
      [5, 5, 5, 255, 250, 250, 250, 255, 0, 0, 0, 0],
      [9, 9, 9, 255, 19, 29, 39, 255, 200, 100, 50, 255],
    ];
    const paeth = (a: number, b: number, c: number) => {
      const p = a + b - c;
      const [pa, pb, pc] = [Math.abs(p - a), Math.abs(p - b), Math.abs(p - c)];
      return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
    };
    const raw: number[] = [];
    pixels.forEach((row, y) => {
      raw.push(y);
      row.forEach((v, x) => {
        const left = x >= 4 ? row[x - 4] : 0;
        const up = y > 0 ? pixels[y - 1][x] : 0;
        const corner = x >= 4 && y > 0 ? pixels[y - 1][x - 4] : 0;
        const predict = [0, left, up, (left + up) >> 1, paeth(left, up, corner)][y];
        raw.push((v - predict + 256) & 255);
      });
    });
    const chunk = (type: string, data: Uint8Array) => {
      const out = new Uint8Array(12 + data.length);
      new DataView(out.buffer).setUint32(0, data.length);
      out.set([...type].map((c) => c.charCodeAt(0)), 4);
      out.set(data, 8);
      return [...out];
    };
    const header = new Uint8Array(13);
    new DataView(header.buffer).setUint32(0, width);
    new DataView(header.buffer).setUint32(4, pixels.length);
    header.set([8, 6, 0, 0, 0], 8);
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...chunk("IHDR", header), ...chunk("IDAT", zlibSync(new Uint8Array(raw))), ...chunk("IEND", new Uint8Array())]);
    const decoded = decodePng(png);
    assert.equal(decoded.width, width);
    assert.equal(decoded.height, pixels.length);
    assert.deepEqual([...decoded.rgba], pixels.flat());
  });
});

describe("pixelate", () => {
  it("turns a real cover into the full grid, one palette color a cell", async () => {
    const scene = coverScene("forge");
    const svg = await pixelate(scene, "Forge");
    const cells = cellsOfSvg(svg, COLS, ROWS);
    assert.equal(cells.length, COLS * ROWS);
    const allowed = new Set(buildPalette(colorsIn(scene)).map(rgbToHex));
    for (const c of new Set(cells)) assert.ok(allowed.has(c), `${c} is in the palette`);
    // The cover lights more than its dark wall: it has bright cells and dark ones.
    const light = (hex: string) => hexToRgb(hex).reduce((a, b) => a + b, 0);
    assert.ok(cells.some((c) => light(c) > 600));
    assert.ok(cells.some((c) => light(c) < 80));
  });
});
