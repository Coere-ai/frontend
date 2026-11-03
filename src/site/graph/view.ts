import type { Bounds } from "./types";

/**
 * The flat camera: which world point sits in the middle of the canvas and
 * how many pixels one world unit takes. Plain functions, so panning, zooming
 * and fitting are tested with no canvas.
 */

export interface View {
  cx: number;
  cy: number;
  /** Pixels per world unit. */
  k: number;
}

/** The canvas in CSS pixels, and the bands at its top and bottom that the page's own controls cover. */
export interface Frame {
  width: number;
  height: number;
  top: number;
  bottom: number;
}

export interface Limits {
  min: number;
  max: number;
}

/** The most a fit zooms in, so a small graph is not blown up to fill the card. */
const FIT_MAX = 1.6;
/** The most an open section or folder is zoomed in, a little closer, since it is what the person asked to see. */
export const OPEN_MAX = 1.9;
/** Room kept around the graph when it is fitted, for the labels at its edge. */
const PAD = 56;

/** The middle of the part of the canvas the controls leave free. */
const middleY = (f: Frame): number => f.top + (f.height - f.top - f.bottom) / 2;

export function toScreen(v: View, f: Frame, x: number, y: number): { x: number; y: number } {
  return { x: (x - v.cx) * v.k + f.width / 2, y: (y - v.cy) * v.k + middleY(f) };
}

export function toWorld(v: View, f: Frame, sx: number, sy: number): { x: number; y: number } {
  return { x: (sx - f.width / 2) / v.k + v.cx, y: (sy - middleY(f)) / v.k + v.cy };
}

/**
 * The view that shows the whole box in the free part of the canvas, zoomed
 * in no further than `most` and out no further than `least`, the zoom
 * below which a line would hide (line-room.ts).
 */
export function fitView(b: Bounds, f: Frame, most = FIT_MAX, least = 0): View {
  const w = Math.max(1, b.maxX - b.minX);
  const h = Math.max(1, b.maxY - b.minY);
  const room = {
    w: Math.max(1, f.width - PAD * 2),
    h: Math.max(1, f.height - f.top - f.bottom - PAD),
  };
  const k = Math.max(least, Math.min(most, room.w / w, room.h / h));
  return { cx: (b.minX + b.maxX) / 2, cy: (b.minY + b.maxY) / 2, k };
}

/** How far out and in the person may zoom, from the zoom that fits everything, and never so far out that a line hides. */
export function limitsFor(fitK: number, least = 0): Limits {
  return { min: Math.max(fitK * 0.5, least), max: Math.max(4, fitK * 10, least) };
}

/** Zooms by `factor` about a point on the canvas, which stays under the pointer. */
export function zoomAt(v: View, f: Frame, factor: number, sx: number, sy: number, l: Limits): View {
  const k = Math.min(l.max, Math.max(l.min, v.k * factor));
  const before = toWorld(v, f, sx, sy);
  const after = toWorld({ ...v, k }, f, sx, sy);
  return { cx: v.cx + before.x - after.x, cy: v.cy + before.y - after.y, k };
}

/** Moves the view with the hand: dragging right brings what was on the left into sight. */
export function panBy(v: View, dx: number, dy: number): View {
  return { cx: v.cx - dx / v.k, cy: v.cy - dy / v.k, k: v.k };
}

/** The view part way from `a` to `b`, with the zoom eased in steps of scale, so a glide feels even. */
export function between(a: View, b: View, t: number): View {
  const k = Math.exp(Math.log(a.k) + (Math.log(b.k) - Math.log(a.k)) * t);
  return { cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t, k };
}

/** Slow at both ends, for a glide. */
export const easeInOut = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
