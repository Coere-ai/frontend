/**
 * The graph's colours. Sections get flat colours from one small, calm
 * palette built around the brand blue, each at least 3 to 1 against its card so a point reads as
 * an object (WCAG 1.4.11). The last colour is a quiet grey for what fits no
 * section. Everything else is the dashboard's ink, line and surface.
 */

export interface GraphTheme {
  /** The card the graph sits on, which the canvas fills first. */
  background: string;
  /** Labels. */
  text: string;
  /** Lines from a point to its parent. */
  line: string;
  /** The outline drawn round a label so it stays readable over a line. */
  halo: string;
  /** The ring round the chosen point, and the person in the middle. */
  ink: string;
  /** Section colours, picked by a node's hue index and wrapped past the end. */
  colors: readonly string[];
}

/** On white. Blue first, then colours that sit far apart, then the grey. */
export const LIGHT_COLORS: readonly string[] = [
  "#5267f7",
  "#0e8a86",
  "#b26f12",
  "#cc4b78",
  "#3a8a55",
  "#8a5cf0",
  "#2a80c0",
  "#c25a28",
  "#a24f98",
  "#6b7280",
];

/** The index of the grey, for a section that holds what fits nowhere else. */
export const QUIET_HUE = LIGHT_COLORS.length - 1;

export const LIGHT_THEME: GraphTheme = {
  background: "#ffffff",
  text: "#080e24",
  line: "rgba(8, 14, 36, 0.16)",
  halo: "rgba(255, 255, 255, 0.9)",
  ink: "#080e24",
  colors: LIGHT_COLORS,
};

/** The colour for a hue index, wrapping, with the ink for a palette that is empty. */
export function colorOf(theme: GraphTheme, hue: number): string {
  const n = theme.colors.length;
  if (n === 0) return theme.ink;
  const i = Number.isFinite(hue) ? Math.abs(Math.round(hue)) % n : 0;
  return theme.colors[i]!;
}
