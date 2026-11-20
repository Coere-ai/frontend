import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { placeLogos, poseAt } from "./layout";
import { hexToRgb, hueGap, NEON_PALETTE, rampAt, rampPosition } from "./palette";
import { CELL_FLOATS, cellsFromPixels } from "./sample";

const stops = NEON_PALETTE.map(hexToRgb);
const logo = { tone: 0.5, hue: 200 };

/** A square image `side` pixels across, painted white where `on(x, y)` says. */
function image(side: number, on: (x: number, y: number) => boolean): Uint8ClampedArray {
  const px = new Uint8ClampedArray(side * side * 4);
  for (let y = 0; y < side; y++) for (let x = 0; x < side; x++) if (on(x, y)) px.set([255, 255, 255, 255], (y * side + x) * 4);
  return px;
}

function cells(set: { data: Float32Array; count: number }) {
  return Array.from({ length: set.count }, (_, i) => {
    const d = set.data.subarray(i * CELL_FLOATS, (i + 1) * CELL_FLOATS);
    return { x: d[0], y: d[1], nx: d[5], ny: d[6], cover: d[7], seed: d[8] };
  });
}

describe("cellsFromPixels", () => {
  it("lights only the covered cells, centered on the logo", () => {
    const set = cellsFromPixels(image(8, (x) => x < 4), 4, 2, logo, stops);
    const lit = cells(set);
    assert.equal(set.count, 8);
    assert.ok(lit.every((c) => c.x < 0 && c.cover === 1));
    assert.deepEqual([...new Set(lit.map((c) => c.x))].sort((a, b) => a - b), [-0.375, -0.125]);
  });

  it("drops a cell a quarter covered and dims a half covered one", () => {
    // Cell (0,0) has one of its four pixels on, cell (1,0) two.
    const set = cellsFromPixels(image(4, (x, y) => (x === 0 && y === 0) || (x === 2 && y < 2)), 2, 2, logo, stops);
    const lit = cells(set);
    assert.equal(set.count, 1);
    assert.equal(lit[0].x, 0.25);
    assert.ok(Math.abs(lit[0].cover - 0.575) < 1e-6);
  });

  it("tilts the edge normals outward so the light rakes the bevel", () => {
    const lit = cells(cellsFromPixels(image(16, (x, y) => x >= 4 && x < 12 && y >= 4 && y < 12), 8, 2, logo, stops));
    const right = lit.filter((c) => c.x > 0.15);
    const left = lit.filter((c) => c.x < -0.15);
    assert.ok(right.length > 0 && right.every((c) => c.nx > 0));
    assert.ok(left.length > 0 && left.every((c) => c.nx < 0));
  });

  it("gives each cell its own seed from 0 to 1", () => {
    const lit = cells(cellsFromPixels(image(16, () => true), 8, 2, logo, stops));
    assert.equal(new Set(lit.map((c) => c.seed)).size, lit.length);
    assert.ok(lit.every((c) => c.seed >= 0 && c.seed < 1));
  });
});

describe("palette", () => {
  it("runs the ramp from the first stop to the last", () => {
    assert.deepEqual(rampAt(stops, 0), stops[0]);
    assert.deepEqual(rampAt(stops, 1), stops[3]);
    assert.deepEqual(rampAt(stops, 2), stops[3]);
  });

  it("measures hue gaps the short way round", () => {
    assert.equal(hueGap(10, 350), 20);
    assert.equal(hueGap(350, 10), -20);
  });

  it("puts a brand colored cell at its logo's tone and a white one on the sweep", () => {
    const brand: [number, number, number] = [0, 0.67, 1];
    assert.ok(Math.abs(rampPosition(brand, logo, 0.5) - 0.5) < 0.02);
    assert.equal(rampPosition([1, 1, 1], logo, 0), 0.25);
    assert.equal(rampPosition([1, 1, 1], logo, 1), 0.75);
  });
});

describe("layout", () => {
  it("gives the Coere mark the first spot and caps the count", () => {
    const placed = placeLogos(["chatgpt", "coere", "claude", "gemini", "kimi"], "center", false, 3);
    assert.deepEqual(placed.map((p) => p.id), ["coere", "chatgpt", "claude"]);
    assert.deepEqual([placed[0].x, placed[0].y], [0, 0]);
  });

  it("holds every logo on its lean when motion is off", () => {
    const [p] = placeLogos(["chatgpt"], "center", false, 5);
    const a = poseAt(p, 3, 0);
    const b = poseAt(p, 40, 0);
    // Compared as text, since a sine times zero can come out as minus zero.
    assert.equal(JSON.stringify(a), JSON.stringify(b));
    assert.equal(Math.abs(a.x), 0);
  });
});
