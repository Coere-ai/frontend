import type { Local } from "./rings";

/**
 * Where a node's branches go. Each subtree is a disc that keeps outside the
 * parent's own chats and clear of every sibling's disc, which is what keeps
 * every point clear of every other.
 *
 * Round the person (the whole circle) the sections sit at even turns, a
 * whole turn shared out equally with the first straight up, all at one
 * distance: the least at which no two sections' discs meet (the owner,
 * 2026-10-30). A big section pushes every spoke out alike rather than
 * taking more of the circle.
 *
 * Below the person the branches sit on one arc at one distance, at even
 * turns centred on the way the parent faces, so they fan straight out from
 * it. The turn between two is a fixed step until the arc reaches a half
 * circle, and the distance is the least that keeps every two discs apart.
 */

export interface Branch {
  /** How far the branch's own subtree reaches round it. */
  size: number;
}

export interface FanRoom {
  /** How far the parent's own chats reach, which every branch keeps outside. */
  inner: number;
  /** Whether the branches go the whole way round (the person's sections) or on the arc that faces out. */
  whole: boolean;
  gap: number;
}

/** The turn between two branches on an arc, until the arc reaches a half circle: two make a wide V, three nearly a half circle. */
const STEP = (Math.PI * 5) / 12;
/** The widest arc branches spread over: the half circle that faces away from the parent. */
const HALF = Math.PI;

/** The places of the branches, in order, and how far the whole lot reaches from the parent. */
export function fanOut(branches: readonly Branch[], room: FanRoom): { places: Local[]; extent: number } {
  const places = room.whole ? round(branches, room) : arc(branches, room);
  const extent = Math.max(room.inner, ...branches.map((b, i) => places[i]!.dist + b.size));
  return { places, extent };
}

/**
 * Branches at even turns `turn` apart, centred on `first`, all at one
 * distance: the least at which no two discs meet, and every disc clears the
 * parent's own chats.
 */
function even(branches: readonly Branch[], room: FanRoom, turn: number, first: number): Local[] {
  const n = branches.length;
  let dist = room.inner + room.gap + Math.max(...branches.map((b) => b.size));
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      // Two discs `apart` turns apart at one distance d are 2 d sin(apart / 2) apart; round the circle the short way counts.
      const apart = Math.min(j - i, room.whole ? n - (j - i) : Infinity) * turn;
      const chord = 2 * Math.sin(apart / 2);
      if (chord > 1e-9) dist = Math.max(dist, (branches[i]!.size + branches[j]!.size + room.gap) / chord);
    }
  return branches.map((_, i) => ({ turn: first + i * turn, dist }));
}

/** One arc facing away from the parent. */
function arc(branches: readonly Branch[], room: FanRoom): Local[] {
  const n = branches.length;
  const turn = n > 1 ? Math.min(STEP, HALF / (n - 1)) : 0;
  return even(branches, room, turn, (-(n - 1) / 2) * turn);
}

/** The whole circle, shared out equally, the first section straight up. */
function round(branches: readonly Branch[], room: FanRoom): Local[] {
  return even(branches, room, (Math.PI * 2) / branches.length, -Math.PI);
}
