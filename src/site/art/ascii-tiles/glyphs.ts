import { rampByInk } from "../stage/math";

/** Pixels per glyph in the atlas. Big enough that mipmaps make clean small glyphs. */
const SIDE = 64;

/** The default glyphs, from a dot to a full block of ink. */
export const DEFAULT_GLYPHS = " .·:-=+*#";

export type GlyphAtlas = { canvas: HTMLCanvasElement; count: number };

/**
 * Draws the glyphs side by side on a canvas, white on black, then redraws
 * them sorted by how much of their square they ink, so a position from 0
 * to 1 in the atlas runs from empty to dense whatever the font. Each glyph
 * keeps a margin so its neighbours never bleed into it at small sizes.
 */
export function buildGlyphAtlas(glyphs: string): GlyphAtlas {
  const chars = Array.from(new Set(Array.from(glyphs.length ? glyphs : DEFAULT_GLYPHS)));
  const canvas = document.createElement("canvas");
  canvas.width = SIDE * chars.length;
  canvas.height = SIDE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2d");
  const paint = (list: string[]) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${Math.round(SIDE * 0.9)}px ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`;
    list.forEach((c, i) => ctx.fillText(c, i * SIDE + SIDE / 2, SIDE * 0.55, SIDE * 0.9));
  };
  paint(chars);
  const px = ctx.getImageData(0, 0, canvas.width, SIDE).data;
  const ink = chars.map((_, i) => {
    let sum = 0;
    for (let y = 0; y < SIDE; y++) for (let x = 0; x < SIDE; x++) sum += px[(y * canvas.width + i * SIDE + x) * 4];
    return sum / (SIDE * SIDE * 255);
  });
  paint(rampByInk(chars, ink));
  return { canvas, count: chars.length };
}
