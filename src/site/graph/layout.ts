import { fanOut } from "./fan";
import { rings, type Local } from "./rings";
import { radiusOf, RADIUS } from "./size";
import { spread } from "./spread";
import { stretch } from "./stretch";
import { indexTree, postOrder, type TreeIndex } from "./tree";
import type { Bounds, GraphNode, Placed } from "./types";

/**
 * Where every point goes, as a pure function of the nodes and their order.
 * It is a balloon tree: the person in the middle, the hubs around them, and
 * under each node its leaves on even arcs close in and its branches on one
 * arc further out, given room for each whole subtree. A node other than the
 * core fans its children evenly over the half circle that faces away from
 * its parent, so nothing points back toward the middle and the line in from
 * the parent never crosses them. No physics and no randomness, so the same
 * data draws the same picture on every visit.
 */

/** How loosely a subtree is laid out: the step between chats and the gap between subtrees. */
export interface Spacing {
  leaf: number;
  gap: number;
}

/** The whole picture at rest. */
const REST: Spacing = { leaf: 11, gap: 18 };

/** The least room a section takes, so a section with little in it still has room for its name. */
const HUB_ROOM = 50;
/**
 * How much wider than tall the ring of sections is. The page shows the graph
 * in a wide card, so the sections spread sideways to fill it. Only the ring
 * is stretched: each section's own folders and chats keep their shape, and
 * stretching only moves sections further apart, so nothing comes to overlap.
 */
export const WIDE = 1.5;
/** The core faces down, so its first child sits at the top and the rest follow clockwise. */
const ROOT_FACING = Math.PI / 2;

export interface Layout {
  pos: ReadonlyMap<string, Placed>;
  bounds: Bounds;
  /** The farthest zoom its lines were made to show at, which an opened section keeps too. */
  zoom: number;
}

/** What measuring a subtree finds: each node's place by its parent, and how far each node's leaves and whole subtree reach. */
export interface Measured {
  local: Map<string, Local>;
  reach: Map<string | null, number>;
  extent: Map<string | null, number>;
}

/**
 * The picture at rest. Seen whole, a bigger picture is seen from further
 * out, where every point is drawn bigger than its size, so the lines need
 * more room. It is measured once, and each pass places it and gives every
 * line room at the zoom the last pass would be seen at (spread.ts,
 * stretch.ts), until that settles.
 */
export function layoutTree(nodes: readonly GraphNode[]): Layout {
  const ix = indexTree(nodes);
  const m = measure(ix, ix.top, REST);
  return spread((zoom) => restAt(ix, m, zoom));
}

/** The picture at rest placed from its measure, each line then given its room at `zoom`. */
function restAt(ix: TreeIndex, m: Measured, zoom: number): Layout {
  const pos = new Map<string, Placed>();
  if (ix.top !== null) {
    placeFrom(ix, m, ix.top, 0, 0, ROOT_FACING, pos);
    stretch(ix, pos, ix.top, zoom);
  } else
    for (const r of ix.roots) {
      const at = m.local.get(r.id) ?? { turn: 0, dist: 0 };
      const facing = ROOT_FACING + at.turn;
      const [x, y] = [Math.cos(facing) * at.dist * WIDE, Math.sin(facing) * at.dist];
      placeFrom(ix, m, r.id, x, y, facing, pos);
      stretch(ix, pos, r.id, zoom);
    }
  return { pos, bounds: boundsOf(pos), zoom };
}

/** Measures the subtree under `top` (null for the empty middle) with the given spacing. */
export function measure(ix: TreeIndex, top: string | null, sp: Spacing): Measured {
  const m: Measured = { local: new Map(), reach: new Map(), extent: new Map() };
  for (const id of postOrder(top, ix.kids, top === null ? ix.roots : [])) {
    const node = id === null ? null : ix.byId.get(id)!;
    const own = node ? radiusOf(node, ix.held.get(node.id)) : 0;
    const list = id === null ? ix.roots : (ix.kids.get(id) ?? []);
    const whole = id === ix.top;
    const done = arrange(ix, own, list, whole, sp, m);
    m.reach.set(id, done.reach);
    m.extent.set(id, done.extent);
  }
  return m;
}

/** Places `top` at (x, y) facing `facing`, then everything under it from its measured places. */
export function placeFrom(
  ix: TreeIndex,
  m: Measured,
  top: string,
  x: number,
  y: number,
  facing: number,
  pos: Map<string, Placed>,
): void {
  const put = (id: string, px: number, py: number, f: number) => {
    const r = radiusOf(ix.byId.get(id)!, ix.held.get(id));
    pos.set(id, { x: px, y: py, r, reach: m.reach.get(id) ?? r, facing: f });
  };
  put(top, x, y, facing);
  const queue = [{ id: top, x, y, facing }];
  for (let i = 0; i < queue.length; i++) {
    const at = queue[i]!;
    // Only the core's ring is stretched sideways; everything below it keeps its shape.
    const wide = at.id === ix.top ? WIDE : 1;
    for (const child of ix.kids.get(at.id) ?? []) {
      if (pos.has(child.id)) continue;
      const l = m.local.get(child.id) ?? { turn: 0, dist: 0 };
      const turned = at.facing + l.turn;
      const cx = at.x + Math.cos(turned) * l.dist * wide;
      const cy = at.y + Math.sin(turned) * l.dist;
      // A section faces the way its stretched line runs, so its own fan points straight out from the person.
      const f = wide === 1 || l.dist === 0 ? turned : Math.atan2(cy - at.y, cx - at.x);
      put(child.id, cx, cy, f);
      queue.push({ id: child.id, x: cx, y: cy, facing: f });
    }
  }
}

/**
 * Sets where each child of one node goes and returns how far its own leaves
 * reach and how far its whole subtree does. Leaves sit on even arcs close
 * in, and branches on one arc outside them (rings.ts, fan.ts).
 */
function arrange(
  ix: TreeIndex,
  own: number,
  list: readonly GraphNode[],
  whole: boolean,
  sp: Spacing,
  m: Measured,
): { reach: number; extent: number } {
  // A section or folder with nothing in it yet still sits with the branches, never among the chats.
  const ringed = (n: GraphNode): boolean => n.kind === "leaf" && !ix.kids.has(n.id);
  const leaves = list.filter(ringed);
  const branches = list.filter((n) => !ringed(n));
  let reach = own;
  if (leaves.length > 0) {
    const biggest = Math.max(...leaves.map((n) => radiusOf(n)));
    // Bigger chats need a longer step, so two of them never touch.
    const step = Math.max(sp.leaf, biggest * 2 + 3.5);
    const done = rings(leaves.length, own, whole, step, Math.max(RADIUS.leaf, biggest));
    leaves.forEach((n, i) => m.local.set(n.id, done.places[i]!));
    reach = done.reach;
  }
  if (branches.length === 0) return { reach, extent: reach };
  const fan = fanOut(
    branches.map((b) => ({
      size: Math.max(m.extent.get(b.id) ?? radiusOf(b, ix.held.get(b.id)), b.kind === "hub" ? HUB_ROOM : 0),
    })),
    { inner: reach, whole, gap: sp.gap },
  );
  branches.forEach((b, i) => m.local.set(b.id, fan.places[i]!));
  return { reach, extent: fan.extent };
}

/** The box every point fits in. An empty layout is a box of nothing at the middle. */
export function boundsOf(pos: Iterable<Placed> | ReadonlyMap<string, Placed>): Bounds {
  const list = pos instanceof Map ? pos.values() : (pos as Iterable<Placed>);
  const b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const p of list) {
    b.minX = Math.min(b.minX, p.x - p.r);
    b.minY = Math.min(b.minY, p.y - p.r);
    b.maxX = Math.max(b.maxX, p.x + p.r);
    b.maxY = Math.max(b.maxY, p.y + p.r);
  }
  return b.minX === Infinity ? { minX: 0, minY: 0, maxX: 0, maxY: 0 } : b;
}
