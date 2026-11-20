import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { cellPixels, fieldUnit } from "./grid";

describe("cellPixels", () => {
  it("snaps a dither pixel to whole device pixels", () => {
    assert.equal(cellPixels(2.5, 1), 3);
    assert.equal(cellPixels(2.5, 2), 5);
    assert.equal(cellPixels(2, 1.5), 3);
    assert.equal(cellPixels(3, 3), 9);
  });

  it("never draws a dither pixel smaller than one device pixel", () => {
    assert.equal(cellPixels(0.2, 1), 1);
    assert.equal(cellPixels(0, 2), 2);
    assert.equal(cellPixels(Number.NaN, 1), 1);
    assert.equal(cellPixels(2, 0), 2);
  });
});

describe("fieldUnit", () => {
  it("keeps the bands in proportion to the canvas, within bounds", () => {
    assert.equal(fieldUnit(1094, 600), 600 * 1.6 / 2.6);
    assert.equal(fieldUnit(4000, 2000), 440);
    assert.equal(fieldUnit(390, 900), 240);
  });

  it("scales the bands and ignores a scale of zero or less", () => {
    assert.equal(fieldUnit(4000, 2000, 1.5), 660);
    assert.equal(fieldUnit(4000, 2000, 0), 440);
  });
});
