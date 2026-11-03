/**
 * The data the page hands to the graph. The engine knows nothing of memory,
 * chats or sections: it draws a tree of points joined to their parents by
 * straight lines, and the page decides what each point means.
 */

/** The core is the person in the middle. Hubs hang off it, then branches, then leaves at the tips. */
export type NodeKind = "core" | "hub" | "branch" | "leaf";

export interface GraphNode {
  id: string;
  /** The node this one hangs from. Null for the core, and for a hub with no core. */
  parent: string | null;
  kind: NodeKind;
  /** An index into the colours of the theme. The engine wraps it past the end. */
  hue: number;
  /** How big the point is for its kind. 1 is usual, and the engine keeps it between 0.7 and 1.4. */
  weight: number;
  /** The words beside the point. */
  label: string;
  /**
   * Quiet words drawn before the label, such as the folder a point was
   * folded into ("Mathematics" before "MATH 54"), so a step that is not
   * drawn still shows where the point sits.
   */
  path?: string;
  /** What this point is linked to beside the tree, each line with its words (ties.ts). */
  links?: readonly NodeLink[];
}

/**
 * One link from a point to another, in words read from this point: "For
 * Tidepool" on the interview, "PearX interview is for this" on Tidepool.
 * A page lists a link on both ends, and `out` marks the end it reads from
 * first, whose words a line shows when the pointer is on it.
 */
export interface NodeLink {
  to: string;
  words: string;
  out: boolean;
}

/** A point where the layout put it, in world units (a pixel at zoom 1). */
export interface Placed {
  x: number;
  y: number;
  /** The drawn radius. */
  r: number;
  /** How far the point's own leaves reach round it, or its radius when it has none. Its label keeps clear of them. */
  reach: number;
  /** The direction the point faces away from its parent, in radians, which says on which side its label goes. */
  facing: number;
  /** The smallest share of its size the point is drawn at however far out the view is, past its kind's own. An open section's points set it, so they never shrink to specks. */
  floor?: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
