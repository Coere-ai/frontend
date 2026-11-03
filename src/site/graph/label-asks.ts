import type { LabelAsk, Side } from "./labels";
import type { GraphNode, NodeKind, Placed } from "./types";
import { onScreen, screenRadius, type Projected } from "./project";

/**
 * Which points ask for a label, in the order they get one. In the whole
 * picture the person and every section ask first, a section's label under
 * or over it, never on a line, then the folders past their chats, then the
 * chats once the view is close enough to read them. With a section or
 * folder open, what is open asks first and its chats ask at any zoom, so
 * their titles show wherever there is room, and what stepped back asks last
 * with a faint label. The hovered, chosen and keyboard points always get
 * theirs. Only points on the canvas ask, so ten thousand chats never cost
 * ten thousand measures.
 */

/** The zoom from which chats carry their titles in the whole picture. */
export const LEAF_LABEL_ZOOM = 1.15;
/** The most chat labels asked for in one frame. */
const MAX_LEAF_ASKS = 300;

/** What joins a folded point's quiet path to its name: a middle dot with a space each side. */
export const PATH_JOIN = " \u00b7 ";

const SIZE: Readonly<Record<NodeKind, number>> = { core: 13, hub: 13, branch: 12, leaf: 11.5 };
const RANK: Readonly<Record<NodeKind, number>> = { core: 0, hub: 1, branch: 2, leaf: 3 };

export interface AskState {
  k: number;
  area: { width: number; height: number };
  /** Points a filter dims, which keep quiet unless forced. */
  filtered: (id: string) => boolean;
  /** Points that stepped back for an open section or folder. */
  stepped: (id: string) => boolean;
  /** The open node and everything under it, or null for the whole picture. */
  inside: ReadonlySet<string> | null;
  /** The open node, whose name sits under it like a title. */
  open: string | null;
  /** The view is gliding, so chats wait for it to end before they ask, which keeps each frame light. */
  moving: boolean;
  forced: ReadonlySet<string>;
}

/** The order labels are asked in: lower first. */
function orderOf(n: GraphNode, s: AskState): number {
  if (s.inside === null) return RANK[n.kind];
  if (n.id === s.open) return -1;
  if (s.inside.has(n.id)) return n.kind === "leaf" ? 2 : 0;
  return n.kind === "core" || n.kind === "hub" ? 1 : 3 + RANK[n.kind];
}

export function labelAsks(
  nodes: readonly GraphNode[],
  pos: ReadonlyMap<string, Placed>,
  at: ReadonlyMap<string, Projected>,
  s: AskState,
): LabelAsk[] {
  const asks: LabelAsk[] = [];
  let leaves = 0;
  // A bucket per place in the order, which costs far less than sorting every point every frame.
  const buckets: GraphNode[][] = Array.from({ length: 8 }, () => []);
  for (const n of nodes) if (!s.moving || n.kind !== "leaf" || s.forced.has(n.id)) buckets[orderOf(n, s) + 1]!.push(n);
  for (const n of buckets.flat()) {
    const p = at.get(n.id);
    const placed = pos.get(n.id);
    if (!p || !placed || !n.label) continue;
    const force = s.forced.has(n.id);
    const stepped = s.stepped(n.id);
    if (!force) {
      if (s.filtered(n.id) || !onScreen(p, s.area, 0)) continue;
      if (n.kind === "leaf") {
        const open = s.inside?.has(n.id) ?? false;
        if (s.moving || stepped || (!open && s.k < LEAF_LABEL_ZOOM)) continue;
        if (leaves++ >= MAX_LEAF_ASKS) continue;
      }
    }
    const titled = n.id === s.open;
    const own = screenRadius(placed, n.kind, s.k);
    const path = n.path ? `${n.path}${PATH_JOIN}` : "";
    const ask: LabelAsk = {
      id: n.id,
      text: path + n.label,
      x: p.x,
      y: p.y,
      // A folder's label clears the ring of its chats. The person's and a section's sit close by their
      // point, since what hangs off them is spread wide on lines a label far out would cross.
      r: titled || n.kind === "core" || n.kind === "hub" ? own : Math.max(own, placed.reach * s.k),
      sides: titled ? ["below", "above", "right", "left", ...CORNERS] : sidesFor(n.kind, placed.facing),
      size: titled ? SIZE.hub : SIZE[n.kind],
      weight: titled || n.kind === "core" || n.kind === "hub" ? 600 : 400,
      force,
      quiet: stepped && !force,
      // A section that stepped back for an open one needs no name, so it looks no further for one.
      firm: (titled || n.kind === "core" || n.kind === "hub") && !(stepped && !force),
      roam: n.kind === "branch" && !stepped,
    };
    if (path) ask.lead = path.length;
    asks.push(ask);
  }
  return asks;
}

/** The four corners, the lower ones first. */
const CORNERS: readonly Side[] = ["below-right", "below-left", "above-right", "above-left"];

/** Each side and the way it lies from the point, on the canvas, where y runs down. */
const AROUND: ReadonlyArray<readonly [Side, number]> = [
  ["right", 0],
  ["below-right", Math.PI / 4],
  ["below", Math.PI / 2],
  ["below-left", (Math.PI * 3) / 4],
  ["left", Math.PI],
  ["above-left", -(Math.PI * 3) / 4],
  ["above", -Math.PI / 2],
  ["above-right", -Math.PI / 4],
];

/**
 * Where a label may go, best first. Every point but the person names
 * itself outward, on the side that lies nearest the way it faces from its
 * parent (the owner, 2026-10-30), then the sides next to that one, so a
 * name reads away from the middle at the same small gap every time. A
 * section's own folders fan out on that side, so when their lines cross
 * it the next side round takes the name.
 */
function sidesFor(kind: NodeKind, facing: number): Side[] {
  if (kind === "core") return ["below", "above", ...CORNERS, "right", "left"];
  const off = (t: number): number => Math.abs(Math.atan2(Math.sin(t - facing), Math.cos(t - facing)));
  return [...AROUND].sort((a, b) => off(a[1]) - off(b[1])).map(([side]) => side);
}
