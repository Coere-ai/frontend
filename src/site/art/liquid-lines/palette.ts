import { linearRgb, type Rgb } from "../stage/math";

/** The colors of Liquid Lines, as hex. */
export type LiquidLinesPalette = {
  /** The near black behind everything. */
  background: string;
  /** The center of every streak; white reads as light. */
  core: string;
  /** The tint on the cool edge of a streak. */
  cool: string;
  /** The cool edge of about one streak in four, for a second hue. */
  accent: string;
  /** The tint on the warm edge. Black turns the warm edge off. */
  warm: string;
  /** The wide soft bands far behind. */
  glow: string;
};

/** Close to a long exposure of white light: a blue edge on one side and a faint amber one on the other. */
export const PRISM_PALETTE: LiquidLinesPalette = { background: "#060607", core: "#ffffff", cool: "#5c8dff", accent: "#7fb2ff", warm: "#ffa452", glow: "#9aa6bd" };

/** Coere's own: white cores, Coere blue edges, now and then cyan, and a trace of warmth. */
export const COERE_PALETTE: LiquidLinesPalette = { background: "#05060d", core: "#ffffff", cool: "#5267f7", accent: "#38d4ff", warm: "#7a5236", glow: "#7f8fe0" };

export const LIQUID_PALETTES = { prism: PRISM_PALETTE, coere: COERE_PALETTE } as const;

export type LiquidLinesPaletteName = keyof typeof LIQUID_PALETTES;

/**
 * The palette as the shader reads it: linear light, with each fringe
 * weighed so a core and both its edges together add up close to the
 * core's own color. The warm edge is quieter than the cool one, as in a
 * real lens.
 */
export function shaderPalette(p: LiquidLinesPalette): Record<"bg" | "core" | "cool" | "accent" | "warm" | "glow", Rgb> {
  const scale = (c: Rgb, k: number): Rgb => [c[0] * k, c[1] * k, c[2] * k];
  return {
    bg: linearRgb(p.background),
    core: scale(linearRgb(p.core), 0.8),
    cool: scale(linearRgb(p.cool), 0.85),
    accent: scale(linearRgb(p.accent), 0.75),
    warm: scale(linearRgb(p.warm), 0.45),
    glow: linearRgb(p.glow),
  };
}
