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

/**
 * Where the biggest solid disc of one colour sits on the canvas, in the
 * tab's pixels: a section's node is the largest dot of its colour, while
 * its many memories crowd into patches of small ones. Found by the
 * distance from each pixel of the colour to the nearest other pixel
 * (a two pass chamfer transform), whose peak is the disc's middle.
 */
function discOf(tab: Tab, hex: string): { x: number; y: number; r: number } | null {
  const canvas = canvasOf(tab);
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx || canvas.width === 0) return null;
  const { width: w, height: h } = canvas;
  const ratio = w / canvas.clientWidth;
  const box = canvas.getBoundingClientRect();
  const { data } = ctx.getImageData(0, 0, w, h);
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const d = new Uint16Array(w * h);
  for (let i = 0; i < w * h; i++) d[i] = Math.abs(data[i * 4]! - r!) + Math.abs(data[i * 4 + 1]! - g!) + Math.abs(data[i * 4 + 2]! - b!) <= 6 ? 60000 : 0;
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : d[y * w + x]!);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (d[i]) d[i] = Math.min(d[i]!, at(x - 1, y) + 3, at(x, y - 1) + 3, at(x - 1, y - 1) + 4, at(x + 1, y - 1) + 4);
    }
  let best = 0;
  let bx = 0;
  let by = 0;
  for (let y = h - 1; y >= 0; y--)
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x;
      if (!d[i]) continue;
      d[i] = Math.min(d[i]!, at(x + 1, y) + 3, at(x, y + 1) + 3, at(x + 1, y + 1) + 4, at(x - 1, y + 1) + 4);
      if (d[i]! > best) [best, bx, by] = [d[i]!, x, y];
    }
  if (best === 0) return null;
  return { x: box.left + bx / ratio, y: box.top + by / ratio, r: best / 3 / ratio };
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
 * stage/graph.ts sectionSpot: which colour a section has on the Memory
 * graph, found off camera: a press on the biggest dot of each colour, the
 * biggest of them first, says which section it is, and Escape steps back out. `spotOf` then finds the
 * section's dot by that colour wherever the graph has drawn it.
 */
export async function sectionSpot(s: Stage, tab: Tab, name: string): Promise<string> {
  for (let round = 0; round < 3; round++) {
    // The biggest dots first: a section with many memories, as the film's is, is drawn largest.
    const discs = LIGHT_COLORS.map((hex) => ({ hex, disc: discOf(tab, hex) })).sort((a, b) => (b.disc?.r ?? 0) - (a.disc?.r ?? 0));
    for (const { hex, disc } of discs) {
      if (!disc) continue;
      const before = said(tab);
      pressQuietly(tab, disc);
      // The graph says where it went once it has moved there.
      const end = Date.now() + 2500;
      while (said(tab) === before && Date.now() < end) await new Promise((r) => setTimeout(r, 100));
      const now = said(tab);
      key(tab, "Escape");
      await new Promise((r) => setTimeout(r, 600));
      await settledDrawn(tab, 4000);
      if (now === `Showing ${name} up close.`) return hex;
    }
    await settledDrawn(tab, 4000);
  }
  throw new Error(`no section on the graph is called ${name}`);
}

/** Where a section's dot is now, by the colour sectionSpot found for it. */
export function spotOf(tab: Tab, hex: string): { x: number; y: number } | null {
  return discOf(tab, hex);
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
