/**
 * Which labels to draw and where. The caller asks in order of importance,
 * the person and sections first, and names the sides a label may take, best
 * first. Each label takes the first side where it touches no label placed
 * before it, no point, chat dots included, and no line between two points
 * (the owner, 2026-10-25 and 2026-10-30), and stays inside the part of the
 * canvas the page's controls leave free. A name that must show, or a
 * folder's, also tries round its point a few steps out. A label with no
 * clear spot is skipped, so the graph never shows a pile of words. A forced
 * label (the hovered or chosen point) is drawn on its first side when none
 * is clear, and the others keep clear of it.
 */

/** Beside a point, under or over it, or off one of its corners, where a line in from straight above or below leaves room. */
export type Side = "left" | "right" | "below" | "above" | "below-right" | "below-left" | "above-right" | "above-left";

export interface LabelAsk {
  id: string;
  text: string;
  /** The point's middle on the canvas, and how far round it to keep clear, in CSS pixels. */
  x: number;
  y: number;
  r: number;
  /** The sides to try, best first. */
  sides: readonly Side[];
  size: number;
  weight: 400 | 600;
  force: boolean;
  /** A point that stepped back, whose label is drawn faint. */
  quiet?: boolean;
  /** The person, a section or what is open, whose name should show: it tries round its point, further out, before it is left out. */
  firm?: boolean;
  /** A folder's name, which also tries round its point, though not as far out as a firm one. */
  roam?: boolean;
  /** How many characters at the start of `text` are a quiet path, drawn fainter than the name. */
  lead?: number;
}

export interface LabelPlaced {
  id: string;
  text: string;
  /** Where the text is drawn, with its baseline in the middle. */
  x: number;
  y: number;
  align: "left" | "right" | "center";
  size: number;
  weight: 400 | 600;
  /** How strongly the text is drawn: 1, or less for a point that stepped back. */
  alpha: number;
  /** How many characters at the start are a quiet path. */
  lead?: number;
}

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** A chat dot, which no label covers either; the mark lets a caller tell the two apart. */
  soft?: boolean;
}

/** A line between two points on the canvas, which no label may cross. A line to a chat dot is marked soft, like the dot. */
export interface Segment {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  soft?: boolean;
}

/** The gap between a point and its label, and the space kept round each label. */
const GAP = 5;
const PAD = 3;
/** The size of a cell in the grid that finds nearby boxes fast. */
const CELL = 48;
/** How strongly a quiet label is drawn. */
const QUIET = 0.6;

/**
 * `free` is the part of the canvas a label may use. `obstacles` are boxes
 * no label may cover: every point on the canvas, chat dots included.
 */
export function placeLabels(
  asks: readonly LabelAsk[],
  measure: (text: string, size: number, weight: 400 | 600) => number,
  free: Box,
  obstacles: readonly Box[] = [],
  lines: readonly Segment[] = [],
): LabelPlaced[] {
  const crosses = lineGrid(lines);
  // Cells are keyed by one number, and walked in place, since a big library puts thousands of boxes here each frame.
  const grid = new Map<number, Box[]>();
  const key = (gx: number, gy: number): number => gx * 100_003 + gy;
  const hits = (b: Box): boolean => {
    for (let gx = Math.floor(b.x0 / CELL); gx <= Math.floor(b.x1 / CELL); gx++)
      for (let gy = Math.floor(b.y0 / CELL); gy <= Math.floor(b.y1 / CELL); gy++) {
        const list = grid.get(key(gx, gy));
        if (!list) continue;
        for (const o of list) if (b.x0 < o.x1 && o.x0 < b.x1 && b.y0 < o.y1 && o.y0 < b.y1) return true;
      }
    return false;
  };
  const keep = (b: Box): void => {
    for (let gx = Math.floor(b.x0 / CELL); gx <= Math.floor(b.x1 / CELL); gx++)
      for (let gy = Math.floor(b.y0 / CELL); gy <= Math.floor(b.y1 / CELL); gy++) {
        const list = grid.get(key(gx, gy));
        if (list) list.push(b);
        else grid.set(key(gx, gy), [b]);
      }
  };
  const inside = (b: Box): boolean => b.x0 >= free.x0 && b.y0 >= free.y0 && b.x1 <= free.x1 && b.y1 <= free.y1;
  for (const o of obstacles) keep(o);

  const out: LabelPlaced[] = [];
  // Forced labels go first, so a skipped label is never one the person is looking at.
  const order = [...asks.filter((a) => a.force), ...asks.filter((a) => !a.force)];
  /** Places one label at its first clear spot. False when none is clear. */
  const tryPlace = (a: LabelAsk): boolean => {
    const width = measure(a.text, a.size, a.weight);
    // Its sides first, then, for a name that should show, round its point a few steps out.
    const far = a.firm || a.force ? STEPS_OUT.length : a.roam ? NEAR_STEPS : 0;
    const spots = [...a.sides.map((side) => position(a, width, side)), ...ring(a, far)];
    for (const placed of spots) {
      const box = boxOf(placed, width);
      if (!inside(box) || hits(box) || crosses(box)) continue;
      keep(box);
      // The lead is set on the one spot taken, so the many spots tried cost no more than before.
      if (a.lead) placed.lead = a.lead;
      out.push(placed);
      return true;
    }
    return false;
  };
  for (const ask of order) {
    if (tryPlace(ask)) continue;
    // A quiet path goes before the name does: with no room for both, the name alone tries again.
    if (ask.lead) {
      const { lead, ...rest } = ask;
      if (tryPlace({ ...rest, text: ask.text.slice(lead) })) continue;
    }
    // A forced label with no clear spot still shows, on its first side. Only a forced one pays for this.
    if (!ask.force) continue;
    const width = measure(ask.text, ask.size, ask.weight);
    const first = ask.sides[0] ? position(ask, width, ask.sides[0]) : ring(ask, 1)[0];
    if (first) {
      if (ask.lead) first.lead = ask.lead;
      keep(boxOf(first, width));
      out.push(first);
    }
  }
  return out;
}

function position(a: LabelAsk, width: number, side: Side): LabelPlaced {
  const base = {
    id: a.id,
    text: a.text,
    size: a.size,
    weight: a.weight,
    alpha: a.quiet ? QUIET : 1,
  };
  const half = a.size / 2;
  switch (side) {
    case "below":
      return { ...base, x: a.x, y: a.y + a.r + GAP + half, align: "center" };
    case "above":
      return { ...base, x: a.x, y: a.y - a.r - GAP - half, align: "center" };
    case "right":
      return { ...base, x: a.x + a.r + GAP, y: a.y, align: "left" };
    case "left":
      return { ...base, x: a.x - a.r - GAP, y: a.y, align: "right" };
    default: {
      // Off a corner: the text starts past the point's edge on the diagonal and runs away from it.
      const d = a.r * Math.SQRT1_2 + GAP / 2;
      const y = side.startsWith("below") ? a.y + d + half : a.y - d - half;
      return side.endsWith("right")
        ? { ...base, x: a.x + d, y, align: "left" }
        : { ...base, x: a.x - d, y, align: "right" };
    }
  }
}

/** Directions tried round a label's point, and how many steps out along each: all for a firm one, the first two for a folder's. */
const RING = 16;
const STEPS_OUT = [1, 1.8, 2.8, 4, 5.5, 7] as const;
const NEAR_STEPS = 2;

/**
 * More places for a name that must show, once its sides are taken: round
 * the point in sixteen directions and a few steps out, the text running
 * away from the point. Between the line in and the fan of lines out of a
 * section there is nearly always a gap one of these lands in. A section
 * whose folders ring it all round takes the first gap past their lines.
 */
function ring(a: LabelAsk, steps: number): LabelPlaced[] {
  const out: LabelPlaced[] = [];
  const half = a.size / 2;
  for (const step of STEPS_OUT.slice(0, steps))
    for (let i = 0; i < RING; i++) {
      const t = (i / RING) * Math.PI * 2 + Math.PI / 2;
      const [dx, dy] = [Math.cos(t), Math.sin(t)];
      const d = (a.r + GAP) * step;
      const [x, y] = [a.x + dx * d, a.y + dy * d + dy * half];
      const align = dx > 0.35 ? "left" : dx < -0.35 ? "right" : "center";
      out.push({
        id: a.id,
        text: a.text,
        size: a.size,
        weight: a.weight,
        alpha: a.quiet ? QUIET : 1,
        x,
        y,
        align,
      });
    }
  return out;
}

/** The box a placed label covers, with a little room round it. */
function boxOf(p: LabelPlaced, width: number): Box {
  const x0 = p.align === "left" ? p.x : p.align === "right" ? p.x - width : p.x - width / 2;
  const half = p.size * 0.65;
  return { x0: x0 - PAD, y0: p.y - half - PAD, x1: x0 + width + PAD, y1: p.y + half + PAD };
}

/**
 * A test of whether a box crosses any of the lines, with the lines kept in
 * the same grid of cells as the boxes, so a label only checks the lines
 * that pass near it.
 */
function lineGrid(lines: readonly Segment[]): (b: Box) => boolean {
  if (lines.length === 0) return () => false;
  const grid = new Map<number, Segment[]>();
  const key = (gx: number, gy: number): number => gx * 100_003 + gy;
  for (const l of lines)
    for (let gx = Math.floor(Math.min(l.x0, l.x1) / CELL); gx <= Math.floor(Math.max(l.x0, l.x1) / CELL); gx++)
      for (let gy = Math.floor(Math.min(l.y0, l.y1) / CELL); gy <= Math.floor(Math.max(l.y0, l.y1) / CELL); gy++) {
        const list = grid.get(key(gx, gy));
        if (list) list.push(l);
        else grid.set(key(gx, gy), [l]);
      }
  return (b) => {
    for (let gx = Math.floor(b.x0 / CELL); gx <= Math.floor(b.x1 / CELL); gx++)
      for (let gy = Math.floor(b.y0 / CELL); gy <= Math.floor(b.y1 / CELL); gy++)
        for (const l of grid.get(key(gx, gy)) ?? []) if (segmentInBox(l, b)) return true;
    return false;
  };
}

/** Whether a line passes through a box: Liang and Barsky's clip, which needs no square root. */
export function segmentInBox(l: Segment, b: Box): boolean {
  const dx = l.x1 - l.x0;
  const dy = l.y1 - l.y0;
  let lo = 0;
  let hi = 1;
  for (const [p, q] of [
    [-dx, l.x0 - b.x0],
    [dx, b.x1 - l.x0],
    [-dy, l.y0 - b.y0],
    [dy, b.y1 - l.y0],
  ] as const) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const t = q / p;
    if (p < 0) lo = Math.max(lo, t);
    else hi = Math.min(hi, t);
    if (lo > hi) return false;
  }
  return true;
}
