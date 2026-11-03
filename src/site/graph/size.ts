import type { GraphNode, NodeKind } from "./types";

/**
 * How big each point is drawn. A section or a folder grows with how much it
 * holds, so a big section reads as big at a glance and a small one stays
 * small, while the person and the chats keep one size. The growth follows
 * the square root of the count, so it is gentle, and it has a floor and a
 * cap, so a folder of one chat is still easy to click and a section of a
 * thousand does not swallow its neighbours.
 */

/** The drawn radius of each kind at weight 1 and an ordinary count, in world units. */
export const RADIUS: Readonly<Record<NodeKind, number>> = {
  core: 13,
  hub: 10,
  branch: 6.5,
  leaf: 3.5,
};

/** The smallest and largest share of its usual radius a section or folder takes. */
const HOLD_FLOOR = 0.7;
const HOLD_CAP = 1.6;
/** The count at which a section or a folder reaches its cap. */
const HOLD_FULL: Readonly<Record<NodeKind, number>> = { core: 1, hub: 140, branch: 40, leaf: 1 };

/** The share of its usual radius a node takes for what it holds. The person and the chats are always 1. */
function holdScale(kind: NodeKind, held: number): number {
  if (kind !== "hub" && kind !== "branch") return 1;
  const share = Math.min(1, Math.sqrt(Math.max(0, held) / HOLD_FULL[kind]));
  return HOLD_FLOOR + (HOLD_CAP - HOLD_FLOOR) * share;
}

/** The page's own nudge, kept between 0.7 and 1.4, so data from a page cannot make a point vanish or explode. */
const weightOf = (n: GraphNode): number => Math.min(1.4, Math.max(0.7, Number.isFinite(n.weight) ? n.weight : 1));

/** The drawn radius of a node that holds `held` leaves. */
export const radiusOf = (n: GraphNode, held = 0): number => RADIUS[n.kind] * holdScale(n.kind, held) * weightOf(n);
