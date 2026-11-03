import type { NodeKind, Placed } from "./types";
import { toScreen, type Frame, type View } from "./view";

/**
 * Points as the canvas sees them for one view. Sizes grow with the zoom but
 * never shrink past a floor, so the sections stay easy to see and click when
 * the whole graph is in view, and stop growing past twice their size (a chat
 * past half again), so a close view stays light.
 */

export interface Projected {
  x: number;
  y: number;
}

/** The smallest a kind is drawn, as a share of its size at zoom 1. */
const FLOOR: Readonly<Record<NodeKind, number>> = { core: 0.9, hub: 0.8, branch: 0.55, leaf: 0.4 };
/** The largest, so an open folder's chats stay light dots beside their titles. */
const CEILING: Readonly<Record<NodeKind, number>> = { core: 2, hub: 2, branch: 2, leaf: 1.5 };

/**
 * How far a point's own floor may lift it, as a multiple of the zoom. An
 * open section's points are spaced widely enough that drawing them twice
 * as big as the zoom says never makes two touch, even when a big section
 * is framed from far out.
 */
const LIFT = 2;

export function screenRadius(p: Pick<Placed, "r" | "floor">, kind: NodeKind, k: number): number {
  const own = Math.min(p.floor ?? 0, LIFT * k);
  return p.r * Math.min(CEILING[kind], Math.max(FLOOR[kind], own, k));
}

/** Every placed point on the canvas, by id. */
export function project(pos: ReadonlyMap<string, Placed>, view: View, frame: Frame): Map<string, Projected> {
  const out = new Map<string, Projected>();
  for (const [id, p] of pos) out.set(id, toScreen(view, frame, p.x, p.y));
  return out;
}

/** Whether a point is on the canvas, or within `margin` pixels of it. */
export function onScreen(p: Projected, area: { width: number; height: number }, margin: number): boolean {
  return p.x >= -margin && p.y >= -margin && p.x <= area.width + margin && p.y <= area.height + margin;
}

/**
 * The point under the pointer: the nearest whose drawn circle, grown by a
 * few pixels so a small chat is easy to hit, holds it. A section wins over a
 * chat drawn on top of it at the same distance.
 */
export function pick(
  at: ReadonlyMap<string, Projected>,
  pos: ReadonlyMap<string, Placed>,
  kindOf: (id: string) => NodeKind,
  k: number,
  x: number,
  y: number,
  usable: (id: string) => boolean = () => true,
): string | null {
  let best: string | null = null;
  let bestScore = Infinity;
  for (const [id, p] of at) {
    const placed = pos.get(id);
    if (!placed || !usable(id)) continue;
    const reach = Math.max(screenRadius(placed, kindOf(id), k) + 4, 8);
    const d = Math.hypot(p.x - x, p.y - y);
    if (d > reach) continue;
    const score = d / reach;
    if (score < bestScore) {
      bestScore = score;
      best = id;
    }
  }
  return best;
}
