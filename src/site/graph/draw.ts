import type { LabelPlaced } from "./labels";
import { onScreen, screenRadius, type Projected } from "./project";
import { colorOf, type GraphTheme } from "./theme";
import type { GraphNode, Placed } from "./types";

/**
 * One frame of the graph: the card colour, straight lines from each point
 * to its parent, flat filled circles, a plain ring round the chosen and the
 * hovered point, and the labels. Lines and circles of one colour go in one
 * path each, so ten thousand chats cost a few dozen draw calls. Nothing is
 * shaded, blurred or blended.
 */

export interface DrawInput {
  nodes: readonly GraphNode[];
  pos: ReadonlyMap<string, Placed>;
  at: ReadonlyMap<string, Projected>;
  k: number;
  area: { width: number; height: number };
  theme: GraphTheme;
  fontFamily: string;
  /** How strongly each point is drawn, from 1 down: a filter or an open section dims the rest. */
  fade: (id: string) => number;
  selected: string | null;
  /** The hovered point, or the one the keyboard is on. */
  hovered: string | null;
  labels: readonly LabelPlaced[];
  /** The view is gliding, so the smallest dots may be drawn as squares. */
  moving: boolean;
}

/**
 * A line to a section or a folder takes the section's colour at half
 * strength, so each section reads as one group. A line to a chat is the
 * quiet theme line, so many chats stay calm.
 */
const SECTION_LINE = 0.5;
/**
 * While the view glides, a dot under this radius in pixels is drawn as a
 * square of the same area. The eye cannot tell them apart in motion, and a
 * square costs a third of a circle, which keeps a glide over five thousand
 * chats smooth. Still frames always draw circles.
 */
const SPECK = 2;

/** A group of shapes drawn in one call. */
interface Batch {
  color: string;
  alpha: number;
  width: number;
  parts: number[];
}

export function drawGraph(ctx: CanvasRenderingContext2D, d: DrawInput): void {
  ctx.globalAlpha = 1;
  ctx.fillStyle = d.theme.background;
  ctx.fillRect(0, 0, d.area.width, d.area.height);
  const lines = new Map<string, Batch[]>();
  const dots = new Map<string, Batch[]>();
  // Batches by colour, then by strength and width in one slot number, so ten thousand points build no keys.
  const add = (map: Map<string, Batch[]>, color: string, alpha: number, width: number) => {
    // Strengths are rounded, so a glide that fades points makes a few batches and not one per point.
    const step = Math.round(alpha * 20);
    const slot = step * 2 + (width > 1 ? 1 : 0);
    let row = map.get(color);
    if (!row) map.set(color, (row = []));
    return (row[slot] ??= { color, alpha: step / 20, width, parts: [] });
  };
  for (const n of d.nodes) {
    const p = d.at.get(n.id);
    const placed = d.pos.get(n.id);
    if (!p || !placed) continue;
    const fade = d.fade(n.id);
    const color = n.kind === "core" ? d.theme.ink : colorOf(d.theme, n.hue);
    const r = screenRadius(placed, n.kind, d.k);
    const from = n.parent === null ? undefined : d.at.get(n.parent);
    if (from && crosses(from, p, d.area)) {
      const leaf = n.kind === "leaf";
      const strength = (leaf ? 1 : SECTION_LINE) * fade;
      const batch = add(lines, leaf ? d.theme.line : color, strength, leaf ? 1 : 1.4);
      batch.parts.push(from.x, from.y, p.x, p.y);
    }
    if (!onScreen(p, d.area, r)) continue;
    // A negative radius marks a speck, drawn square.
    add(dots, color, fade, 0).parts.push(p.x, p.y, d.moving && r < SPECK ? -r : r);
  }
  for (const b of [...lines.values()].flat()) {
    ctx.globalAlpha = b.alpha;
    ctx.strokeStyle = b.color;
    ctx.lineWidth = b.width;
    ctx.beginPath();
    for (let i = 0; i < b.parts.length; i += 4) {
      ctx.moveTo(b.parts[i]!, b.parts[i + 1]!);
      ctx.lineTo(b.parts[i + 2]!, b.parts[i + 3]!);
    }
    ctx.stroke();
  }
  for (const b of [...dots.values()].flat()) {
    ctx.globalAlpha = b.alpha;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    for (let i = 0; i < b.parts.length; i += 3) {
      const x = b.parts[i]!;
      const y = b.parts[i + 1]!;
      const r = b.parts[i + 2]!;
      if (r < 0) {
        const half = -r * 0.886;
        ctx.rect(x - half, y - half, half * 2, half * 2);
        continue;
      }
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, Math.PI * 2);
    }
    ctx.fill();
  }
  ring(ctx, d, d.hovered !== d.selected ? d.hovered : null, 0.45, 1.5);
  ring(ctx, d, d.selected, 1, 2);
  drawLabels(ctx, d);
  ctx.globalAlpha = 1;
}

/** A plain ring a little outside a point, in ink. */
function ring(ctx: CanvasRenderingContext2D, d: DrawInput, id: string | null, alpha: number, width: number) {
  const p = id ? d.at.get(id) : undefined;
  const placed = id ? d.pos.get(id) : undefined;
  const n = id ? d.nodes.find((x) => x.id === id) : undefined;
  if (!p || !placed || !n) return;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = d.theme.ink;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(p.x, p.y, screenRadius(placed, n.kind, d.k) + 3.5, 0, Math.PI * 2);
  ctx.stroke();
}

function drawLabels(ctx: CanvasRenderingContext2D, d: DrawInput): void {
  ctx.globalAlpha = 1;
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = 3;
  ctx.strokeStyle = d.theme.halo;
  ctx.fillStyle = d.theme.text;
  for (const l of d.labels) {
    ctx.globalAlpha = l.alpha;
    ctx.font = `${l.weight} ${l.size}px ${d.fontFamily}`;
    if (l.lead) {
      leadAndName(ctx, l);
      continue;
    }
    ctx.textAlign = l.align;
    ctx.strokeText(l.text, l.x, l.y);
    ctx.fillText(l.text, l.x, l.y);
  }
}

/** How strongly a folded point's path is drawn against its name. */
const LEAD = 0.55;

/**
 * A label that starts with a quiet path: the path faint, then the name,
 * run on from the left edge the whole label would have, so the two read as
 * one label placed as one.
 */
function leadAndName(ctx: CanvasRenderingContext2D, l: LabelPlaced): void {
  const lead = l.text.slice(0, l.lead);
  const name = l.text.slice(l.lead);
  const whole = ctx.measureText(l.text).width;
  const left = l.align === "left" ? l.x : l.align === "right" ? l.x - whole : l.x - whole / 2;
  const at = left + ctx.measureText(lead).width;
  ctx.textAlign = "left";
  ctx.strokeText(l.text, left, l.y);
  ctx.globalAlpha = l.alpha * LEAD;
  ctx.fillText(lead, left, l.y);
  ctx.globalAlpha = l.alpha;
  ctx.fillText(name, at, l.y);
}

/** Whether a line may pass over the canvas, judged by its box, which is cheap and never misses one. */
function crosses(a: Projected, b: Projected, area: { width: number; height: number }): boolean {
  return (
    Math.max(a.x, b.x) >= 0 &&
    Math.min(a.x, b.x) <= area.width &&
    Math.max(a.y, b.y) >= 0 &&
    Math.min(a.y, b.y) <= area.height
  );
}
