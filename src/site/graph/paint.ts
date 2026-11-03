import { drawGraph } from "./draw";
import { labelAsks } from "./label-asks";
import { placeLabels, type Box, type Segment } from "./labels";
import type { Layout } from "./layout";
import { onScreen, project, screenRadius, type Projected } from "./project";
import type { GraphTheme } from "./theme";
import type { GraphNode } from "./types";
import type { Frame, View } from "./view";

/**
 * Paints one frame for the graph's state: sizes the canvas's backing store
 * to the pixel ratio, projects the points, picks the labels and draws. It
 * gives back where each point landed, which the pointer's hit test reads.
 */

export interface PaintState {
  nodes: readonly GraphNode[];
  layout: Layout;
  view: View;
  frame: Frame;
  theme: GraphTheme;
  fontFamily: string;
  /** Points a filter dims. */
  dimmed: ReadonlySet<string> | null;
  /** How strongly each point is drawn for the open section or folder: 1, or less for one that stepped back. */
  strength: (id: string) => number;
  /** The open node and everything under it, or null for the whole picture. */
  inside: ReadonlySet<string> | null;
  /** The open section or folder, or null. */
  open: string | null;
  /** The view or the points are gliding. */
  moving: boolean;
  selected: string | null;
  hovered: string | null;
  /** What a control laid over the canvas covers, which no label goes under. */
  cover?: Box | null;
}

/** Remembers text widths, since a label is measured on every frame it might show. */
export function createMeasure(ctx: CanvasRenderingContext2D, fontFamily: () => string) {
  const cache = new Map<string, number>();
  return (text: string, size: number, weight: 400 | 600): number => {
    const key = `${weight}|${size}|${text}`;
    const known = cache.get(key);
    if (known !== undefined) return known;
    if (cache.size > 6000) cache.clear();
    ctx.font = `${weight} ${size}px ${fontFamily()}`;
    const width = ctx.measureText(text).width;
    cache.set(key, width);
    return width;
  };
}

export function paint(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  ratio: number,
  s: PaintState,
  measure: (text: string, size: number, weight: 400 | 600) => number,
): Map<string, Projected> {
  const w = Math.max(1, Math.round(s.frame.width * ratio));
  const h = Math.max(1, Math.round(s.frame.height * ratio));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const area = { width: s.frame.width, height: s.frame.height };
  const at = project(s.layout.pos, s.view, s.frame);
  const filtered = (id: string): boolean => s.dimmed !== null && s.dimmed.has(id);
  // A filtered point keeps a fifth of its strength, and one that stepped back what its scene gives it.
  const fade = (id: string): number => Math.min(filtered(id) ? FILTERED : 1, s.strength(id));
  // Labels stay off the bands the page's controls cover, and off the section and folder points.
  const free = { x0: 0, y0: s.frame.top, x1: area.width, y1: area.height - s.frame.bottom };
  const forced = new Set([s.selected, s.hovered].filter((id): id is string => id !== null));
  const asks = labelAsks(s.nodes, s.layout.pos, at, {
    k: s.view.k,
    area,
    filtered,
    stepped: (id) => s.strength(id) < 1,
    inside: s.inside,
    open: s.open,
    moving: s.moving,
    forced,
  });
  const boxes = obstacles(s.nodes, s.layout.pos, at, s.view.k, area, s.moving);
  drawGraph(ctx, {
    nodes: s.nodes,
    pos: s.layout.pos,
    at,
    k: s.view.k,
    area,
    theme: s.theme,
    fontFamily: s.fontFamily,
    fade,
    selected: s.selected,
    hovered: s.hovered,
    labels: placeLabels(
      asks,
      measure,
      free,
      [...boxes, ...(s.cover ? [s.cover] : [])],
      lines(s.nodes, at, area, s.moving),
    ),
    moving: s.moving,
  });
  return at;
}

/** How strongly a point a filter leaves out is drawn. */
const FILTERED = 0.2;

/**
 * The boxes of the points on the canvas, which no label may cover. While
 * the view glides no chat asks for a label, and the chats are left out too,
 * so a glide over thousands of chats builds no box for each.
 */
function obstacles(
  nodes: readonly GraphNode[],
  pos: PaintState["layout"]["pos"],
  at: ReadonlyMap<string, Projected>,
  k: number,
  area: { width: number; height: number },
  moving: boolean,
): Box[] {
  const out: Box[] = [];
  for (const n of nodes) {
    if (moving && n.kind === "leaf") continue;
    const p = at.get(n.id);
    const placed = pos.get(n.id);
    if (!p || !placed) continue;
    const r = screenRadius(placed, n.kind, k);
    if (!onScreen(p, area, r)) continue;
    out.push({ x0: p.x - r, y0: p.y - r, x1: p.x + r, y1: p.y + r, soft: n.kind === "leaf" });
  }
  return out;
}

/**
 * The lines between points on the canvas, which no label may cross (the
 * owner, 2026-10-25). A line to a chat is soft, as the chat dot is, and
 * while the view glides those are left out with the chats.
 */
function lines(
  nodes: readonly GraphNode[],
  at: ReadonlyMap<string, Projected>,
  area: { width: number; height: number },
  moving: boolean,
): Segment[] {
  const out: Segment[] = [];
  for (const n of nodes) {
    if (n.parent === null || (moving && n.kind === "leaf")) continue;
    const a = at.get(n.id);
    const b = at.get(n.parent);
    if (!a || !b) continue;
    // A line wholly off one side of the canvas can cross no label.
    if (Math.max(a.x, b.x) < 0 || Math.min(a.x, b.x) > area.width) continue;
    if (Math.max(a.y, b.y) < 0 || Math.min(a.y, b.y) > area.height) continue;
    out.push({ x0: b.x, y0: b.y, x1: a.x, y1: a.y, soft: n.kind === "leaf" });
  }
  return out;
}
