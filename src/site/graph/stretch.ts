import { createCrowd, type Dot } from "./crowd";
import { lineRoom, pageRadius, type Sized } from "./line-room";
import { postOrder, type TreeIndex } from "./tree";
import type { GraphNode, Placed } from "./types";

/**
 * Gives every line the room it needs to show (line-room.ts) once the tree
 * is placed. Room made while measuring would grow every disc of the
 * balloon tree, and a disc clears its parent's chats by its whole size, so
 * room would double at every level of a deep library and never settle.
 * Here each node is settled after everything under it, so its children
 * only ever move as a whole:
 *
 *   its chats move out together by what the nearest one lacks, so their
 *   arcs keep their shape, and below the person its branches move out by
 *   as much so they stay clear of the chats;
 *   then its branches move out together (spread), so they keep one
 *   distance: below the person all by one length, round the person all by
 *   one share of their line, which keeps the ring of sections even however
 *   wide it is drawn.
 *
 * Every move is straight out along the child's own line, which keeps a
 * subtree in its wedge, so room adds up along a path instead of doubling.
 */

export function stretch(ix: TreeIndex, pos: Map<string, Placed>, top: string, zoom: number, floor?: number): void {
  if (!(zoom > 0) || !Number.isFinite(zoom)) return;
  const sized = (id: string): Sized => ({ r: pos.get(id)!.r, floor, kind: ix.byId.get(id)!.kind });
  const lacks = (from: string, to: string): number =>
    lineRoom(sized(from), sized(to), zoom) - apart(pos.get(from)!, pos.get(to)!);
  // Points keep clear of each other as big as they are drawn at the zoom, which far out is more than their size.
  const drawn = (id: string): Dot => {
    const p = pos.get(id)!;
    return { x: p.x, y: p.y, r: Math.max(p.r, pageRadius(sized(id), zoom) / zoom) };
  };
  let biggest = 0;
  for (const id of pos.keys()) biggest = Math.max(biggest, drawn(id).r);
  const under = (id: string): Dot[] => postOrder(id, ix.kids, []).flatMap((x) => (x === null ? [] : [drawn(x)]));
  for (const id of postOrder(top, ix.kids, [])) {
    if (id === null) continue;
    const kids = (ix.kids.get(id) ?? []).filter((k) => pos.has(k.id));
    const ringed = new Set(kids.filter((k) => k.kind === "leaf" && !ix.kids.has(k.id)));
    let chats = 0;
    for (const k of ringed) chats = Math.max(chats, lacks(id, k.id));
    if (chats > 0) {
      // Round the person only the chats move here; the sections move out together below, by their share, so their ring stays even.
      for (const k of kids) if (ringed.has(k) || id !== ix.top) moveOut(ix, pos, id, k.id, chats);
      // Its chats now reach that much further, and its label keeps clear of them.
      const self = pos.get(id)!;
      pos.set(id, { ...self, reach: self.reach + chats });
    }
    const branches = kids.filter((k) => !ringed.has(k));
    spread(ix, pos, id, branches, ringed, { lacks, drawn, under, biggest });
  }
}

const apart = (a: { x: number; y: number }, b: { x: number; y: number }): number => Math.hypot(a.x - b.x, a.y - b.y);

/** How many times a node's branches are pushed out together before they are left as they are. */
const ROUNDS = 24;

/**
 * Moves a node's branches out together until every line shows and every
 * subtree, as big as it now is, clears the node, its chats and the siblings
 * before it. Each moves by its share of the shortest line, so branches at
 * one distance stay at one distance and a ring drawn wider than tall keeps
 * its shape. Moving out together also spreads them apart, so a few rounds
 * settle it.
 */
function spread(
  ix: TreeIndex,
  pos: Map<string, Placed>,
  id: string,
  branches: readonly GraphNode[],
  ringed: ReadonlySet<GraphNode>,
  s: {
    lacks: (from: string, to: string) => number;
    drawn: (id: string) => Dot;
    under: (id: string) => Dot[];
    biggest: number;
  },
): void {
  if (branches.length === 0) return;
  const self = pos.get(id)!;
  const lens = branches.map((k) => apart(pos.get(k.id)!, self));
  const least = Math.min(...lens);
  // How far each moves for each unit the shortest line moves.
  const share = lens.map((l) => (least > 0 ? l / least : 1));
  const ways = branches.map((k, i) => {
    const p = pos.get(k.id)!;
    return lens[i]! > 0
      ? [(p.x - self.x) / lens[i]!, (p.y - self.y) / lens[i]!]
      : [Math.cos(p.facing), Math.sin(p.facing)];
  }) as Array<[number, number]>;
  const points = branches.map((k) => s.under(k.id));
  const moveAll = (by: number): void => {
    branches.forEach((k, i) => {
      const d = by * share[i]!;
      moveOut(ix, pos, id, k.id, d);
      const [ux, uy] = ways[i]!;
      for (const p of points[i]!) [p.x, p.y] = [p.x + ux * d, p.y + uy * d];
    });
  };
  const short = Math.max(...branches.map((k, i) => s.lacks(id, k.id) / share[i]!));
  if (short > 0) moveAll(short);
  const home = [s.drawn(id), ...[...ringed].map((k) => s.drawn(k.id))];
  for (let round = 0; round < ROUNDS; round++) {
    const crowd = createCrowd(s.biggest);
    crowd.add(home);
    let push = 0;
    points.forEach((list, i) => {
      push = Math.max(push, crowd.pushFor(list, ...ways[i]!) / share[i]!);
      crowd.add(list);
    });
    if (push <= 0) break;
    moveAll(push);
  }
}

/** Moves `child` and everything under it `by` further from `parent`, along the line between them. */
function moveOut(ix: TreeIndex, pos: Map<string, Placed>, parent: string, child: string, by: number): void {
  const [a, b] = [pos.get(parent)!, pos.get(child)!];
  const len = apart(a, b);
  // A child on top of its parent moves the way it faces.
  const [ux, uy] = len > 0 ? [(b.x - a.x) / len, (b.y - a.y) / len] : [Math.cos(b.facing), Math.sin(b.facing)];
  const move = (id: string): void => {
    const p = pos.get(id);
    if (p) pos.set(id, { ...p, x: p.x + ux * by, y: p.y + uy * by });
  };
  // Most children are chats with nothing under them, so they skip the walk.
  if (!ix.kids.has(child)) return move(child);
  for (const id of postOrder(child, ix.kids, [])) if (id !== null) move(id);
}
