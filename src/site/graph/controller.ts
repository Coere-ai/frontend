import { layoutTree, type Layout } from "./layout";
import { lineZoom } from "./line-room";
import { createMeasure, paint } from "./paint";
import { pick, type Projected } from "./project";
import { LIGHT_THEME } from "./theme";
import type { GraphNode } from "./types";
import * as cam from "./view";

/**
 * The canvas side of the site's memory graph: it lays the tree out once,
 * paints only when something changed, and turns drag, wheel and pinch into
 * pans and zooms, the way the product's graph does. The page holds no
 * opening of sections here: the site's graph is for looking, so a click
 * only marks a point and names it.
 */

export interface CanvasGraph {
  setNodes(nodes: readonly GraphNode[]): void;
  setDimmed(dimmed: ReadonlySet<string> | null): void;
  zoomBy(factor: number): void;
  fit(): void;
  destroy(): void;
}

/** The zoom for a wheel turn: down zooms out, and a trackpad pinch (a wheel with ctrlKey) a little faster. */
export function wheelZoom(deltaY: number, deltaMode: number, ctrlKey: boolean): number {
  const pixels = deltaMode === 1 ? deltaY * 16 : deltaMode === 2 ? deltaY * 400 : deltaY;
  const capped = Math.min(240, Math.max(-240, Number.isFinite(pixels) ? pixels : 0));
  return Math.exp(-capped * (ctrlKey ? 0.011 : 0.0022));
}

/** How far a press may move and still count as a click. */
const DRAG = 4;

export function createCanvasGraph(canvas: HTMLCanvasElement, fontFamily: () => string): CanvasGraph {
  const ctx = canvas.getContext("2d");
  let nodes: readonly GraphNode[] = [];
  let kinds = new Map<string, GraphNode["kind"]>();
  let layout: Layout = layoutTree([]);
  let least = 0;
  let frame: cam.Frame = { width: 0, height: 0, top: 0, bottom: 0 };
  let view: cam.View = { cx: 0, cy: 0, k: 1 };
  let at = new Map<string, Projected>();
  let dimmed: ReadonlySet<string> | null = null;
  let hovered: string | null = null;
  let selected: string | null = null;
  let touched = false;
  let pending: number | null = null;
  const measure = ctx ? createMeasure(ctx, fontFamily) : () => 0;

  const request = () => {
    if (!ctx || pending !== null) return;
    pending = requestAnimationFrame(() => {
      pending = null;
      const state = { nodes, layout, view, frame, theme: LIGHT_THEME, fontFamily: fontFamily(), dimmed };
      const marks = { strength: () => 1, inside: null, open: null, moving: false, selected, hovered };
      at = paint(canvas, ctx, window.devicePixelRatio || 1, { ...state, ...marks }, measure);
    });
  };
  const measureFrame = () => {
    const r = canvas.getBoundingClientRect();
    frame = { ...frame, width: r.width, height: r.height };
    return r.width > 0 && r.height > 0;
  };
  const refit = () => {
    if (measureFrame()) view = cam.fitView(layout.bounds, frame, undefined, least);
    request();
  };
  const limits = () => cam.limitsFor(cam.fitView(layout.bounds, frame).k, least);
  const zoomAt = (factor: number, x: number, y: number) => {
    touched = true;
    view = cam.zoomAt(view, frame, factor, x, y, limits());
    request();
  };
  const hitAt = (x: number, y: number) => pick(at, layout.pos, (id) => kinds.get(id) ?? "leaf", view.k, x, y);
  const local = (e: PointerEvent | WheelEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // Pointers down, for a drag with one and a pinch with two.
  const pointers = new Map<number, { x: number; y: number }>();
  let down: { x0: number; y0: number; x: number; y: number; dragging: boolean } | null = null;
  let span = 0;
  const spanOf = () => {
    const [a, b] = [...pointers.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const p = local(e);
    pointers.set(e.pointerId, p);
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // A pointer already gone cannot be captured; the drag still works over the canvas.
    }
    if (pointers.size === 2) [down, span] = [null, spanOf()];
    else if (pointers.size === 1) down = { x0: p.x, y0: p.y, x: p.x, y: p.y, dragging: false };
  };
  const onMove = (e: PointerEvent) => {
    const p = local(e);
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, p);
    if (pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const next = spanOf();
      if (span > 0 && next > 0 && a && b) zoomAt(next / span, (a.x + b.x) / 2, (a.y + b.y) / 2);
      span = next;
      return;
    }
    if (down) {
      if (!down.dragging && Math.hypot(p.x - down.x0, p.y - down.y0) >= DRAG) down.dragging = true;
      if (down.dragging) {
        touched = true;
        view = cam.panBy(view, p.x - down.x, p.y - down.y);
        request();
      }
      [down.x, down.y] = [p.x, p.y];
      return;
    }
    if (e.pointerType === "touch") return;
    const id = hitAt(p.x, p.y);
    if (id === hovered) return;
    hovered = id;
    canvas.style.cursor = id ? "pointer" : "";
    request();
  };
  const onUp = (e: PointerEvent) => {
    const pinching = pointers.size >= 2;
    pointers.delete(e.pointerId);
    if (pinching) span = 0;
    const was = down;
    down = null;
    if (pinching || !was || was.dragging || e.type === "pointercancel") return;
    selected = hitAt(was.x, was.y);
    request();
  };
  const onLeave = () => {
    if (down || hovered === null) return;
    hovered = null;
    request();
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const p = local(e);
    zoomAt(wheelZoom(e.deltaY, e.deltaMode, e.ctrlKey), p.x, p.y);
  };
  const listeners: Array<[string, EventListener, AddEventListenerOptions?]> = [
    ["pointerdown", onDown as EventListener],
    ["pointermove", onMove as EventListener],
    ["pointerup", onUp as EventListener],
    ["pointercancel", onUp as EventListener],
    ["pointerleave", onLeave],
    ["wheel", onWheel as EventListener, { passive: false }],
  ];
  canvas.style.touchAction = "none";
  for (const [type, fn, opts] of listeners) canvas.addEventListener(type, fn, opts);
  const observer = new ResizeObserver(() => (touched ? (measureFrame(), request()) : refit()));
  observer.observe(canvas);

  return {
    setNodes(next) {
      nodes = next;
      kinds = new Map(next.map((n) => [n.id, n.kind]));
      layout = layoutTree(next);
      least = lineZoom(next, layout.pos);
      [hovered, selected, touched] = [null, null, false];
      refit();
    },
    setDimmed(next) {
      dimmed = next;
      request();
    },
    zoomBy: (factor) => zoomAt(factor, frame.width / 2, frame.height / 2),
    fit() {
      touched = false;
      refit();
    },
    destroy() {
      if (pending !== null) cancelAnimationFrame(pending);
      for (const [type, fn] of listeners) canvas.removeEventListener(type, fn);
      observer.disconnect();
    },
  };
}
