/**
 * Where a node's chats sit round it: on even arcs that face away from its
 * parent, like the head of a dandelion. A few chats share one arc, a step
 * apart, and the arc widens with each one up to a half circle; past that
 * they fill more arcs further out, each as full as the one inside it, so
 * every arc is evenly spaced at one distance and nothing points back at the
 * parent. The first chat in the list sits on the nearest arc, so the page
 * puts the newest first. There is no randomness: the same library draws the
 * same picture on every visit (the owner, 2026-10-30).
 */

/** A child's place next to its parent, as a turn from the way the parent faces and a distance. */
export interface Local {
  turn: number;
  dist: number;
}

/** The widest arc a node other than the person spreads its chats over: the half circle that faces away from its parent. */
export const HALF = Math.PI;
/** The least turn between two chats on one arc, so a few chats read as a fan and not a clump. */
const LEAST_TURN = Math.PI / 7;
/** How far apart two arcs sit, as a share of the step between chats. */
const ROW = 1;

/** How many chats an arc at `dist` holds over `span`, each in a share of it a step long. */
const holds = (dist: number, span: number, step: number): number => Math.max(1, Math.floor((span * dist) / step));

/**
 * Places `count` chats round a node of radius `own`, on arcs centred on the
 * way it faces (the whole circle round the person), with at least `step`
 * between neighbours. Returns each place, in order, and how far the last
 * arc reaches.
 */
export function rings(
  count: number,
  own: number,
  whole: boolean,
  step: number,
  leafRadius: number,
): { places: Local[]; reach: number } {
  const places: Local[] = [];
  if (count === 0) return { places, reach: own };
  // The first arc keeps well clear of the node, which is drawn larger than its size when zoomed out.
  const start = own * 2 + step * 1.2;
  const span = whole ? Math.PI * 2 : HALF;
  const turn = Math.max(step / start, LEAST_TURN);
  // One arc while the chats fit on it a step apart, widening with each.
  if (whole ? count * turn <= span : (count - 1) * turn <= span) {
    const width = whole ? span / count : turn;
    for (let i = 0; i < count; i++) places.push({ turn: (i - (count - 1) / 2) * width, dist: start });
    return { places, reach: start + leafRadius * 1.4 };
  }
  // More arcs, the fewest that hold them all, each given chats by how many it holds, so each is as full as the next.
  const dists: number[] = [];
  let room = 0;
  for (let k = 0; room < count; k++) {
    const d = start + k * step * ROW;
    dists.push(d);
    room += holds(d, span, step);
  }
  const counts = shares(
    count,
    dists.map((d) => holds(d, span, step)),
  );
  dists.forEach((d, k) => {
    const n = counts[k]!;
    // Each chat in the middle of its own even share of the arc, so no chat sits on its edge.
    const width = span / n;
    for (let i = 0; i < n; i++) places.push({ turn: (i - (n - 1) / 2) * width, dist: d });
  });
  return { places, reach: dists[dists.length - 1]! + leafRadius * 1.4 };
}

/** Splits `count` over arcs in proportion to what each holds, by largest remainder, none over what it holds. */
function shares(count: number, room: readonly number[]): number[] {
  const total = room.reduce((s, r) => s + r, 0);
  const exact = room.map((r) => (count * r) / total);
  const out = exact.map((e) => Math.floor(e));
  const order = exact.map((e, i) => ({ i, left: e - Math.floor(e) })).sort((a, b) => b.left - a.left || a.i - b.i);
  let left = count - out.reduce((s, n) => s + n, 0);
  for (const { i } of order) {
    if (left === 0) break;
    if (out[i]! < room[i]!) {
      out[i]!++;
      left--;
    }
  }
  return out;
}
