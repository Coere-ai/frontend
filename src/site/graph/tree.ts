import type { GraphNode } from "./types";

/**
 * Walks of the nodes as the tree they are, for the layout and the focus.
 * Data from a page can name a parent that is missing or make a loop of
 * parents, so each walk settles that the same way: such a node becomes a
 * root.
 */

/** The nodes as one tree, built once per set of data and shared by the layout, the focus and the keys. */
export interface TreeIndex {
  byId: ReadonlyMap<string, GraphNode>;
  kids: ReadonlyMap<string | null, GraphNode[]>;
  roots: readonly GraphNode[];
  /** The node in the middle: the only root, or null when several hang off an empty middle. */
  top: string | null;
  /** How many leaves each node holds, at any depth. */
  held: ReadonlyMap<string, number>;
  /** The parent each node hangs from in the tree: null for a root, or a node cut from a loop. */
  up: ReadonlyMap<string, string | null>;
}

export function indexTree(nodes: readonly GraphNode[]): TreeIndex {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const first = childMap(nodes, byId, new Set());
  // Points whose parents name each other never reach a root. They hang off the middle instead.
  const lost = unreached(nodes, first);
  const kids = lost.size > 0 ? childMap(nodes, byId, lost) : first;
  const roots = kids.get(null) ?? [];
  const top = roots.length === 1 ? roots[0]!.id : null;
  const held = new Map<string, number>();
  const up = new Map<string, string | null>();
  for (const [parent, list] of kids) for (const k of list) up.set(k.id, parent);
  for (const id of postOrder(top, kids, top === null ? roots : [])) {
    if (id === null) continue;
    const own = kids.get(id) ?? [];
    const leaf = byId.get(id)!.kind === "leaf" ? 1 : 0;
    held.set(id, own.reduce((s, k) => s + (held.get(k.id) ?? 0), 0) + leaf);
  }
  return { byId, kids, roots, top, held, up };
}

/** Each node's children in the order the nodes came. A parent not in the data, or one in `cut`, makes a root. */
export function childMap(
  nodes: readonly GraphNode[],
  byId: ReadonlyMap<string, GraphNode>,
  cut: ReadonlySet<string>,
): Map<string | null, GraphNode[]> {
  const kids = new Map<string | null, GraphNode[]>();
  for (const n of nodes) {
    const known = n.parent !== null && n.parent !== n.id && byId.has(n.parent);
    const parent = known && !cut.has(n.id) ? n.parent : null;
    const list = kids.get(parent);
    if (list) list.push(n);
    else kids.set(parent, [n]);
  }
  return kids;
}

/** The nodes no root leads to, which only a loop of parents makes. */
export function unreached(nodes: readonly GraphNode[], kids: ReadonlyMap<string | null, GraphNode[]>): Set<string> {
  const seen = new Set<string>();
  const queue = [...(kids.get(null) ?? [])];
  for (let i = 0; i < queue.length; i++) {
    const n = queue[i]!;
    if (seen.has(n.id)) continue;
    seen.add(n.id);
    queue.push(...(kids.get(n.id) ?? []));
  }
  return new Set(nodes.filter((n) => !seen.has(n.id)).map((n) => n.id));
}

/** Every node under `top` once, each after its children. A loop of parents is cut where it is found. */
export function postOrder(
  top: string | null,
  kids: ReadonlyMap<string | null, GraphNode[]>,
  roots: readonly GraphNode[],
): Array<string | null> {
  const out: Array<string | null> = [];
  const seen = new Set<string | null>([top]);
  // An explicit stack, because a long chain of points must not overflow the call stack.
  const stack: Array<{ id: string | null; next: number }> = [{ id: top, next: 0 }];
  while (stack.length > 0) {
    const frame = stack[stack.length - 1]!;
    const list = frame.id === null ? roots : (kids.get(frame.id) ?? []);
    const child = list[frame.next++];
    if (!child) {
      out.push(frame.id);
      stack.pop();
    } else if (!seen.has(child.id)) {
      seen.add(child.id);
      stack.push({ id: child.id, next: 0 });
    }
  }
  return out;
}
