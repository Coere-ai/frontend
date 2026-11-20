import { averageCells, buildPalette, COLS, COVER_WALL, colorsIn, gridSvg, quantize, ROWS, type Wall } from "./grid";
import { rasterizeSvg } from "./render";

/** Pixels drawn a side for each cell, so a cell's color is the average of 16 samples of the scene. */
const SUPERSAMPLE = 4;

/** A wall other than the covers' own: its size in cells and its dark colors. */
type WallOptions = { cols?: number; rows?: number; wall?: Wall };

/**
 * A cover scene turned into the LED wall: drawn at four pixels a cell,
 * averaged to one color a cell, snapped to the colors the scene is drawn
 * in, and written out as solid squares. The covers take the defaults; the
 * site's share picture asks for a wall of its own shape.
 */
export async function pixelate(scene: string, title: string, { cols = COLS, rows = ROWS, wall = COVER_WALL }: WallOptions = {}): Promise<string> {
  const rgba = await rasterizeSvg(scene, cols * SUPERSAMPLE, rows * SUPERSAMPLE);
  const palette = buildPalette(colorsIn(scene), wall);
  const cells = quantize(averageCells(rgba, cols, rows, SUPERSAMPLE, wall.gap), palette);
  return gridSvg(cells, palette, cols, rows, title, wall.gap);
}
