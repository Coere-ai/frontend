import { screenRadius } from "./project";
import type { GraphNode, NodeKind, Placed } from "./types";

/**
 * Every line between two linked points must show (the owner, 2026-10-23).
 * A point is drawn no smaller than a few pixels however far out the view
 * is, so at a far zoom two points the layout keeps apart can still touch
 * on the canvas and hide their line. These say how far apart two linked
 * points must sit in the world for a piece of their line to show at a
 * zoom, and the farthest zoom at which every line of a picture shows.
 */

/** The least length of line, in CSS pixels, that shows between two linked points. */
export const LINE_PX = 4;

/** What sizes a point on the canvas: its radius, its own floor, and its kind. */
export interface Sized {
  r: number;
  floor?: number;
  kind: NodeKind;
}

/** How a page draws a point's radius in pixels at a zoom. The Memory page's rule is the default. */
export type DrawnRadius = (p: Sized, k: number) => number;

export const pageRadius: DrawnRadius = (p, k) => screenRadius(p, p.kind, k);

/**
 * The world distance two linked points need so LINE_PX of their line shows
 * at zoom `k`. A drawn radius over the zoom never grows as the zoom does, so
 * what is enough at one zoom is enough at every closer one.
 */
export function lineRoom(a: Sized, b: Sized, k: number, drawn: DrawnRadius = pageRadius): number {
  if (!(k > 0) || !Number.isFinite(k)) return 0;
  return (drawn(a, k) + drawn(b, k) + LINE_PX) / k;
}

/** The farthest zoom tried, and how many halvings find the answer. */
const FAR = 1e-3;
const NEAR = 1e3;
const STEPS = 40;

/**
 * The farthest zoom out at which every line between the points shows: the
 * page lets the view go no further. Each line is solved on its own by
 * halving between a far zoom and a near one, which costs a few
 * milliseconds for ten thousand points. A link beside the tree draws a
 * line too (ties.ts), so it counts as one.
 */
export function lineZoom(
  nodes: readonly GraphNode[],
  pos: ReadonlyMap<string, Placed>,
  drawn: DrawnRadius = pageRadius,
): number {
  const kinds = new Map(nodes.map((n) => [n.id, n.kind]));
  let least = 0;
  for (const n of nodes) {
    const a = pos.get(n.id);
    if (!a) continue;
    const b = n.parent === null ? undefined : pos.get(n.parent);
    if (b) least = solveLine(a, n.kind, b, kinds.get(n.parent!)!, least, drawn);
    if (n.links)
      for (const l of n.links) {
        const c = l.to === n.id ? undefined : pos.get(l.to);
        if (c) least = solveLine(a, n.kind, c, kinds.get(l.to)!, least, drawn);
      }
  }
  return least;
}

/** The farthest zoom, no nearer than `least`, at which the line from a to b shows. */
function solveLine(a: Placed, ka: NodeKind, b: Placed, kb: NodeKind, least: number, drawn: DrawnRadius): number {
  const d = Math.hypot(a.x - b.x, a.y - b.y);
  const sa = { ...a, kind: ka };
  const sb = { ...b, kind: kb };
  const shows = (k: number): boolean => d >= lineRoom(sa, sb, k, drawn);
  if (shows(Math.max(least, FAR))) return least;
  let [lo, hi] = [Math.log(Math.max(least, FAR)), Math.log(NEAR)];
  for (let i = 0; i < STEPS; i++) {
    const mid = (lo + hi) / 2;
    if (shows(Math.exp(mid))) hi = mid;
    else lo = mid;
  }
  return Math.exp(hi);
}
