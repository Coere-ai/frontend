import { averageCells, buildPalette, COLS, colorsIn, gridSvg, quantize, ROWS } from "./grid";
import { rasterizeSvg } from "./render";

/** Pixels drawn a side for each cell, so a cell's color is the average of 16 samples of the scene. */
const SUPERSAMPLE = 4;

/**
 * A cover scene turned into the LED wall: drawn at four pixels a cell,
 * averaged to one color a cell, snapped to the colors the scene is drawn
 * in, and written out as solid squares.
 */
export async function pixelate(scene: string, title: string): Promise<string> {
  const rgba = await rasterizeSvg(scene, COLS * SUPERSAMPLE, ROWS * SUPERSAMPLE);
  const palette = buildPalette(colorsIn(scene));
  const cells = quantize(averageCells(rgba, COLS, ROWS, SUPERSAMPLE), palette);
  return gridSvg(cells, palette, COLS, ROWS, title);
}
