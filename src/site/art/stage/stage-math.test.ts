import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { iridescentStops } from "../ascii-tiles/palette";
import { MAX_IRIDESCENT } from "../ascii-tiles/shaders";
import { COERE_PALETTE, shaderPalette } from "../liquid-lines/palette";
import { cellGrid, drawRatio, hexToRgb, linearRgb, lowerCap, rampByInk, toLinear } from "./math";

describe("hexToRgb", () => {
  it("reads six and three digit colors", () => {
    assert.deepEqual(hexToRgb("#5267f7"), [0x52 / 255, 0x67 / 255, 0xf7 / 255]);
    assert.deepEqual(hexToRgb("#fff"), [1, 1, 1]);
    assert.deepEqual(hexToRgb("000000"), [0, 0, 0]);
  });

  it("turns anything unreadable into black rather than NaN", () => {
    assert.deepEqual(hexToRgb("#zzz"), [0, 0, 0]);
    assert.deepEqual(hexToRgb(""), [0, 0, 0]);
  });
});

describe("toLinear", () => {
  it("keeps black and white and darkens the middle", () => {
    assert.equal(toLinear(0), 0);
    assert.ok(Math.abs(toLinear(1) - 1) < 1e-9);
    assert.ok(toLinear(0.5) < 0.25 && toLinear(0.5) > 0.2);
    assert.deepEqual(linearRgb("#ffffff").map((c) => Math.round(c * 1000) / 1000), [1, 1, 1]);
  });
});

describe("drawRatio", () => {
  it("holds the screen's ratio under the cap", () => {
    assert.equal(drawRatio(3, 2), 2);
    assert.equal(drawRatio(1.5, 2), 1.5);
  });

  it("never draws under the floor, unless the screen itself is lower", () => {
    assert.equal(drawRatio(3, 0.5, 1), 1);
    assert.equal(drawRatio(0.75, 2, 1), 0.75);
  });

  it("treats a missing ratio as 1", () => {
    assert.equal(drawRatio(Number.NaN, 2), 1);
    assert.equal(drawRatio(0, 2), 1);
  });
});

describe("lowerCap", () => {
  it("steps down a quarter at a time and stops at the floor", () => {
    assert.equal(lowerCap(2, 1), 1.75);
    assert.equal(lowerCap(1.1, 1), 1);
    assert.equal(lowerCap(1, 1), 1);
  });
});

describe("rampByInk", () => {
  it("orders glyphs from the emptiest to the densest", () => {
    assert.deepEqual(rampByInk(["#", " ", "."], [0.5, 0, 0.05]), [" ", ".", "#"]);
  });

  it("keeps the given order for glyphs with the same ink", () => {
    assert.deepEqual(rampByInk(["a", "b", " "], [0.3, 0.3, 0]), [" ", "a", "b"]);
  });
});

describe("cellGrid", () => {
  it("rounds up so the last column and row are never bare", () => {
    assert.deepEqual(cellGrid(100, 50, 7), { cols: 15, rows: 8 });
    assert.deepEqual(cellGrid(70, 70, 7), { cols: 10, rows: 10 });
  });

  it("always has at least one cell, even for a zero sized cell", () => {
    assert.deepEqual(cellGrid(0, 0, 0), { cols: 1, rows: 1 });
  });
});

describe("iridescentStops", () => {
  it("packs the colors and pads the rest with black", () => {
    const { stops, count } = iridescentStops(["#ff0000", "#00ff00", "#0000ff"]);
    assert.equal(count, 3);
    assert.equal(stops.length, MAX_IRIDESCENT * 3);
    assert.deepEqual(Array.from(stops.slice(0, 9)), [1, 0, 0, 0, 1, 0, 0, 0, 1]);
    assert.ok(stops.slice(9).every((v) => v === 0));
  });

  it("keeps at most the shader's limit and fills a short list to three", () => {
    assert.equal(iridescentStops(Array(12).fill("#ffffff")).count, MAX_IRIDESCENT);
    assert.equal(iridescentStops(["#ffffff"]).count, 3);
  });
});

describe("shaderPalette", () => {
  it("keeps the warm edge quieter than the cool one", () => {
    const p = shaderPalette({ ...COERE_PALETTE, cool: "#ffffff", warm: "#ffffff" });
    assert.ok(p.warm[0] < p.cool[0]);
  });

  it("turns the warm edge off for black", () => {
    assert.deepEqual(shaderPalette({ ...COERE_PALETTE, warm: "#000000" }).warm, [0, 0, 0]);
  });
});
