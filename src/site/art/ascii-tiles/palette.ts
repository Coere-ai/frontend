import { hexToRgb, type Rgb } from "../stage/math";
import { MAX_IRIDESCENT } from "./shaders";

/** The colors of ASCII Tiles, as hex. */
export type AsciiTilesPalette = {
  /** Behind the glyphs. */
  background: string;
  /** The glyphs on a tile top in shade. */
  shade: string;
  /** The glyphs on a tile top in full light. */
  lit: string;
  /** The film on the bevels, three to eight colors, read round in a loop. */
  iridescent: readonly string[];
};

/** Close to the demo: gray and white glass with a full rainbow on the bevels. */
export const SPECTRUM_PALETTE: AsciiTilesPalette = {
  background: "#000000",
  shade: "#4a4a4a",
  lit: "#ffffff",
  iridescent: ["#ff3d5a", "#ffb02e", "#f4ff3d", "#3dff8b", "#2ed8ff", "#3d5bff", "#c03dff"],
};

/** Coere's own: blue glass and white light, the bevels turning through Coere blue, violet, a pink blush, white and cyan. */
export const COERE_TILES_PALETTE: AsciiTilesPalette = {
  background: "#04050c",
  shade: "#3a4275",
  lit: "#ffffff",
  iridescent: ["#5267f7", "#8a63ff", "#d08bff", "#ff8fd0", "#ffffff", "#5fe0ff", "#3b55ff"],
};

export const TILE_PALETTES = { spectrum: SPECTRUM_PALETTE, coere: COERE_TILES_PALETTE } as const;

export type AsciiTilesPaletteName = keyof typeof TILE_PALETTES;

/** The iridescent ramp as the shader reads it: at least three colors and at most the shader's limit, padded with black. */
export function iridescentStops(colors: readonly string[]): { stops: Float32Array; count: number } {
  const list = colors.length >= 3 ? colors.slice(0, MAX_IRIDESCENT) : [...colors, ...SPECTRUM_PALETTE.iridescent].slice(0, Math.max(3, colors.length));
  const stops = new Float32Array(MAX_IRIDESCENT * 3);
  list.forEach((hex, i) => stops.set(hexToRgb(hex) as Rgb, i * 3));
  return { stops, count: list.length };
}
