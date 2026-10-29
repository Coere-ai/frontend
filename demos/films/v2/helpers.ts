import { down, focused, up } from "../../stage/input";
import { resolve, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";

/**
 * The film's own helpers, ported from the coere-v2 e2e helpers its
 * scripts call (tests/e2e/helpers: memory-graph, graph-points,
 * memory-scenes, v22, content/agent) and tools/demo-video/stage/graph.ts.
 */

/** Waits until a test holds. */
export async function until(tab: Tab, test: () => boolean, ms = 30_000): Promise<void> {
  const end = Date.now() + ms;
  while (!test()) {
    if (Date.now() > end) throw new Error(`${tab.name}: waited ${ms} ms in vain`);
    await new Promise((r) => setTimeout(r, 100));
  }
}

export const textOf = (tab: Tab, query: Query): string => (resolve(tab.doc, query)?.textContent ?? "").replace(/\s+/g, " ").trim();

/** A memory or engine call made from the film itself, as a spec's memoryCall makes it. */
export async function call<T>(s: Stage, method: string, args?: unknown): Promise<T> {
  const r = (await s.world.handle({ type: "engine.call", method, args }, "film")) as { ok: boolean; result: T };
  return r.result;
}

type Status = { state: string; held: unknown; set: { state: string } | null; counts: { chatsRead: number } };
const settledStatus = (s: Status | null): boolean => !!s && s.state === "ready" && s.held === null && (s.set === null || s.set.state === "ended") && s.counts.chatsRead > 0;

/** v22.ts waitForBuildEnd: the build has ended and stayed ended for three looks a second apart. */
export async function buildEnd(s: Stage, ms = 300_000): Promise<void> {
  // Playing back, the answers are the recording's own, so the looks need not be a second apart.
  const gap = new URLSearchParams(location.search).has("rec") ? 1000 : 250;
  const end = Date.now() + ms;
  let quiet = 0;
  while (quiet < 3) {
    if (Date.now() > end) throw new Error("the build never ended");
    quiet = settledStatus(await call<Status>(s, "memory.status")) ? quiet + 1 : 0;
    if (quiet < 3) await new Promise((r) => setTimeout(r, s.fast ? 50 : gap));
  }
}

const canvasOf = (tab: Tab) => tab.doc.querySelector<HTMLCanvasElement>("canvas.cx-mp-canvas");

/** What share of the graph's canvas, in tenths of a percent, shows something over the card. */
function drawnShare(tab: Tab): number {
  const c = canvasOf(tab);
  const ctx = c?.getContext("2d");
  if (!c || !ctx || c.width === 0) return 0;
  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  const [r0, g0, b0] = [data[0]!, data[1]!, data[2]!];
  let n = 0;
  for (let i = 0; i < data.length; i += 4) if (Math.abs(data[i]! - r0) + Math.abs(data[i + 1]! - g0) + Math.abs(data[i + 2]! - b0) > 60) n++;
  return Math.round((n / (c.width * c.height)) * 1000) / 10;
}

/** memory-graph.ts settledDrawn: waits until the graph stops changing. */
export async function settledDrawn(tab: Tab, ms = 20_000, fast = false): Promise<void> {
  if (fast) return;
  let last = drawnShare(tab);
  const end = Date.now() + ms;
  while (Date.now() < end) {
    await new Promise((r) => setTimeout(r, 700));
    const now = drawnShare(tab);
    if (last > 0 && Math.abs(now - last) / last < 0.03) return;
    last = now;
  }
}

/** graph-points.ts patchesOf: every patch of one colour on the canvas, biggest first, in the tab's pixels. */
function patchesOf(tab: Tab, hex: string, least = 30): { x: number; y: number; area: number }[] {
  const canvas = canvasOf(tab)!;
  const ctx = canvas.getContext("2d")!;
  const { width: w, height: h } = canvas;
  const ratio = w / canvas.clientWidth;
  const box = canvas.getBoundingClientRect();
  const { data } = ctx.getImageData(0, 0, w, h);
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const hit = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) if (Math.abs(data[i * 4]! - r!) + Math.abs(data[i * 4 + 1]! - g!) + Math.abs(data[i * 4 + 2]! - b!) <= 6) hit[i] = 1;
  const out: { x: number; y: number; area: number }[] = [];
  const stack: number[] = [];
  for (let start = 0; start < w * h; start++) {
    if (hit[start] !== 1) continue;
    hit[start] = 2;
    stack.push(start);
    let [n, sx, sy] = [0, 0, 0];
    while (stack.length) {
      const i = stack.pop()!;
      const [x, y] = [i % w, Math.floor(i / w)];
      n++;
      sx += x;
      sy += y;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1])
        if (j >= 0 && hit[j] === 1) {
          hit[j] = 2;
          stack.push(j);
        }
    }
    const area = n / (ratio * ratio);
    if (area >= least) out.push({ x: box.left + sx / n / ratio, y: box.top + sy / n / ratio, area });
  }
  return out.sort((a, b) => b.area - a.area);
}

/** The section colours of coere-v2's packages/ui graph2d theme, light card. */
const LIGHT_COLORS = ["#5267f7", "#0e8a86", "#b26f12", "#cc4b78", "#3a8a55", "#8a5cf0", "#2a80c0", "#c25a28", "#a24f98", "#6b7280"];

/** A press with no pointer drawn, for the looks a script takes off camera. */
function pressQuietly(tab: Tab, p: { x: number; y: number }): void {
  const el = down(tab.doc, p);
  up(tab.doc, p, el);
}

const said = (tab: Tab) => {
  const all = tab.doc.querySelectorAll('.cx-mp-hero [aria-live="polite"]');
  return (all[all.length - 1]?.textContent ?? "").trim();
};

/**
 * stage/graph.ts sectionSpot: where a section sits on the Memory graph,
 * found off camera by its colour, a press on the biggest patch of each
 * colour saying which section it is, and Escape stepping back out.
 */
export async function sectionSpot(s: Stage, tab: Tab, name: string): Promise<{ x: number; y: number }> {
  for (let round = 0; round < 3; round++) {
    for (const hex of LIGHT_COLORS) {
      const [patch] = patchesOf(tab, hex);
      if (!patch) continue;
      const before = said(tab);
      pressQuietly(tab, patch);
      // The graph says where it went once it has moved there.
      const end = Date.now() + 2500;
      while (said(tab) === before && Date.now() < end) await new Promise((r) => setTimeout(r, 100));
      const now = said(tab);
      key(tab, "Escape");
      await new Promise((r) => setTimeout(r, 600));
      await settledDrawn(tab, 4000);
      if (now === `Showing ${name} up close.`) return patch;
    }
    await settledDrawn(tab, 4000);
  }
  throw new Error(`no section on the graph is called ${name}`);
}

export const graphSays = said;

/** A key as the browser sends it, with its code and side, on what has the focus. */
export function key(tab: Tab, name: string, o: { code?: string; location?: number; type?: "keydown" | "keyup" } = {}): void {
  const el = focused(tab.doc) ?? tab.doc.body;
  const init = { key: name, code: o.code ?? name, location: o.location ?? 0, bubbles: true, cancelable: true, composed: true };
  for (const type of o.type ? [o.type] : (["keydown", "keyup"] as const)) el.dispatchEvent(new tab.win.KeyboardEvent(type, init));
}

/** agent.ts tapOption: Right Option pressed and let go alone, 60 ms apart. */
export async function tapOption(tab: Tab): Promise<void> {
  key(tab, "Alt", { code: "AltRight", location: 2, type: "keydown" });
  await new Promise((r) => setTimeout(r, 60));
  key(tab, "Alt", { code: "AltRight", location: 2, type: "keyup" });
}

/** memory-scenes.ts clearDock: presses Clear in the Extract all dock, off camera, until the dock is gone. */
export async function clearDock(tab: Tab): Promise<void> {
  const dock = () => tab.doc.querySelector('[data-testid="coere-extract-all-dock"]');
  for (let i = 0; i < 30 && dock(); i++) {
    const clear = [...dock()!.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Clear");
    clear?.click();
    await new Promise((r) => setTimeout(r, 300));
  }
}
