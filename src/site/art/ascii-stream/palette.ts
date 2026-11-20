import { linearRgb, type Rgb } from "../stage/math";

/** The colors of ASCII Stream, as hex. */
export type AsciiStreamPalette = {
  /** The near black behind everything. Dark parts of the scene show it exactly. */
  background: string;
  /** The haze between the ribbons and the faint ribbons far back. */
  deep: string;
  /** Most ribbons. */
  ribbon: string;
  /** The brightest ribbons, out toward the edges. */
  bright: string;
  /** The hottest light: the seam, the ribbon cores and the glyphs. */
  core: string;
  /** The thin line running the length of the seam. Black turns it off. */
  line: string;
};

/** Coere's own: deep blue haze, Coere blue ribbons, pale blue and white light, and a thin cyan line along the seam. */
export const COERE_STREAM_PALETTE: AsciiStreamPalette = {
  background: "#0b0a12",
  deep: "#1f36e0",
  ribbon: "#5267f7",
  bright: "#8fb0ff",
  core: "#ffffff",
  line: "#5fd6ff",
};

/** The palette as the shader reads it: each color in linear light, so overlapping light adds up as it would. */
export function streamShaderPalette(p: AsciiStreamPalette): Record<keyof AsciiStreamPalette, Rgb> {
  return {
    background: linearRgb(p.background),
    deep: linearRgb(p.deep),
    ribbon: linearRgb(p.ribbon),
    bright: linearRgb(p.bright),
    core: linearRgb(p.core),
    line: linearRgb(p.line),
  };
}
