import { PAGE_PORT } from "@v2/packages/actions/src/page-port";
import { RUN_LIMITS } from "@v2/packages/memory/src/actions/budgets";
import { createWorkerHandlers } from "@v2/packages/memory/src/actions/workers/handlers";
import { FakeRouterChrome } from "@v2/apps/extension/src/background/router-fake-chrome";
import { PortHub } from "@v2/apps/extension/src/actions/run/attach";
import type { ActionsChrome } from "@v2/apps/extension/src/actions/run/chrome-actions";
import type { PortLike } from "@v2/apps/extension/src/actions/run/page-link";
import { createWorkerRuns, type WorkerRuns } from "@v2/apps/extension/src/actions/workers/coordinator";
import { PACE } from "@v2/apps/extension/src/actions/workers/pace";
import { workerPages } from "@v2/apps/extension/src/actions/workers/page-ports";
import type { KeyStore, WorkerPorts, WorkerTabs } from "@v2/apps/extension/src/actions/workers/ports";
import { BROWSER_USE_KEY, readBrowserUse } from "@v2/apps/extension/src/lib/browser-use";
import { researchAnswer } from "@v2/tests/fake-claude/scenarios/actions-research";
import type { World } from "../../stage/world";
import { BASE, fileFor, NONE } from "./web-path";

/**
 * Copied from the workers film (demos/films/workers/workers.ts); here the
 * Actions messages are answered with the lone runs' (actions.ts), workers
 * first, as the extension's install.ts routes them.
 *
 * The service worker's worker runs in this film, kept in the demo's top
 * page: coere-v2's own coordinator (apps/extension/src/actions/workers),
 * with its launch, pace, worker loops, preview loop, merge and ending, on
 * the ports the extension wires in background/actions.ts. The page reads
 * are its own too (page-ports.ts over the Actions page port), answered by
 * the page script in each worker's tab (worker-page.ts). The engine's
 * plan, extract and merge are packages/memory's own handlers, and the
 * thinking model behind them is coere-v2's fake one, the `actions-maya`
 * scenario's research answers, as the film used.
 *
 * What only Chrome has is played here: the workers' window is a frame
 * per worker, kept out of sight beside the stage as Chrome keeps it
 * behind the person's window, and each address opens the page of the
 * fake web kept for it (web.mts). Chrome's capture of a tab never works
 * here, so each preview is the page's own sketch, as when a capture
 * fails in the extension (10.5). The pace's gaps and the model's think
 * time follow the film's tempo, so the film can let the long middle of a
 * search pass quickly, as the film cut it.
 */

/** How long the fake model took per call in the film (claude.fake.knobs.latencyMs). */
const LATENCY_MS = 1200;

/** What the fake model's calls cost, in micro dollars, about as the fake server counts them. */
const COST = { plan: 1500, extract: 1100 } as const;

/** The workers' window: Chrome's size for it (chrome-ports.ts). */
const WINDOW = { width: 1280, height: 800 };

let tempo = 1;
const DEBUG = new URLSearchParams(location.search).has("debug");
// The pace reads its gaps each time a worker asks for a slot, so the film's tempo applies at once.
Object.defineProperty(PACE, "pageMs", { get: () => RUN_LIMITS.workerPageMs / tempo, configurable: true });
Object.defineProperty(PACE, "searchGapMs", { get: () => RUN_LIMITS.searchGapMs / tempo, configurable: true });

/**
 * The clock's sleep, at the film's tempo: a sleep counts down faster while
 * the tempo is up, also one that began before, and ends early on an abort,
 * as the clock's does.
 */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((done) => {
    let left = ms;
    let last = performance.now();
    let t: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      const now = performance.now();
      left -= (now - last) * tempo;
      last = now;
      if (left <= 0 || signal?.aborted) return done();
      t = setTimeout(tick, Math.min(left / tempo, 50));
    };
    signal?.addEventListener("abort", () => (clearTimeout(t), done()), { once: true });
    tick();
  });
}

/** A storage area over one of the World's, which every tab shares. */
function area(world: World, name: string): KeyStore {
  return {
    get: async (key) => structuredClone((world.stores[name] ?? {})[key]),
    set: async (key, value) => world.write(name, { [key]: structuredClone(value) }),
    remove: async (key) => world.remove(name, [key]),
  };
}

/** chrome-ports.ts's scale, in the page: the picture drawn again at a width, as JPEG. */
async function scale(dataUrl: string, width: number): Promise<string | null> {
  try {
    const bitmap = await createImageBitmap(await (await fetch(dataUrl)).blob());
    const height = Math.max(1, Math.round((bitmap.height * width) / bitmap.width));
    const canvas = new OffscreenCanvas(width, height);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
    const bytes = new Uint8Array(await (await canvas.convertToBlob({ type: "image/jpeg", quality: 0.7 })).arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return `data:image/jpeg;base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

/** Two ends of one runtime port: what one posts the other hears, a task later and as a copy, as Chrome's ports do. */
function portPair(tabId: number): { page: PortLike; worker: PortLike; close(): void } {
  type Ends = { heard: Set<(m: unknown) => void>; closed: Set<() => void> };
  const a: Ends = { heard: new Set(), closed: new Set() };
  const b: Ends = { heard: new Set(), closed: new Set() };
  let open = true;
  const call = (fns: Iterable<(...x: never[]) => void>, ...args: unknown[]) => {
    for (const fn of [...fns])
      try {
        (fn as (...x: unknown[]) => void)(...args);
      } catch {
        // A page that has gone away with its frame.
      }
  };
  const close = () => {
    if (!open) return;
    open = false;
    setTimeout(() => (call(a.closed), call(b.closed)), 0);
  };
  const end = (me: Ends, other: Ends, sender?: PortLike["sender"]): PortLike => ({
    name: PAGE_PORT,
    sender,
    postMessage(message) {
      if (!open) return;
      const copy = structuredClone(message);
      setTimeout(() => open && call(other.heard, copy), 0);
    },
    disconnect: close,
    onMessage: { addListener: (fn) => void me.heard.add(fn) },
    onDisconnect: { addListener: (fn) => void me.closed.add(fn) },
  });
  return { page: end(a, b), worker: end(b, a, { tab: { id: tabId }, frameId: 0 }), close };
}

export interface WorkersBackEnd {
  runs: WorkerRuns;
  /** The workers' tabs open now. */
  tabs(): number;
  /** How many times faster than the film's own pace the workers read and think. */
  setTempo(n: number): void;
  dispose(): void;
}

class DemoRouter extends FakeRouterChrome {
  override now(): number {
    return Date.now();
  }
}

export function workersBackEnd(world: World): WorkersBackEnd {
  tempo = 1;
  const router = new DemoRouter();
  const hub = new PortHub();
  const frames = new Map<number, HTMLIFrameElement>();
  const ports = new Map<number, Set<() => void>>();
  const removed = new Set<(tabId: number) => void>();
  let gone = false;

  // The workers' own window, behind the person's: out of sight beside the stage, at Chrome's size for it.
  const window_ = document.createElement("div");
  window_.dataset.workers = "";
  window_.style.cssText = `position:fixed;left:${-WINDOW.width - 400}px;top:0;width:${WINDOW.width}px;height:${WINDOW.height}px;overflow:hidden;pointer-events:none`;
  document.body.append(window_);

  const endPorts = (tabId: number) => {
    for (const close of ports.get(tabId) ?? []) close();
    ports.delete(tabId);
  };

  /** Opens an address in a worker's tab: the fake web's page for it, and waits for its load, 8 seconds at most. */
  function load(tabId: number, url: string): Promise<boolean> {
    const frame = frames.get(tabId);
    if (!frame || gone) return Promise.resolve(false);
    const tab = router.tab(tabId);
    tab.url = url;
    tab.loading = true;
    endPorts(tabId);
    return new Promise<boolean>((done) => {
      const finish = (ok: boolean) => {
        clearTimeout(timer);
        if (router.tabs.includes(tab)) tab.loading = false;
        done(ok && !gone);
      };
      const timer = setTimeout(() => finish(false), 8000);
      frame.addEventListener("load", () => finish(true), { once: true });
      frame.src = BASE + (fileFor(url) ?? NONE);
      if (DEBUG) console.log("LOAD", tabId, url);
    });
  }

  const tabs: WorkerTabs = {
    async openWindow(count) {
      const tabIds: number[] = [];
      for (let i = 0; i < count; i++) {
        const ref = await router.createTab("about:blank", { windowId: 2, active: i === 0 });
        const frame = document.createElement("iframe");
        frame.title = "";
        frame.style.cssText = `position:absolute;inset:0;width:${WINDOW.width}px;height:${WINDOW.height}px;border:0;background:#fff`;
        frame.src = "about:blank";
        window_.append(frame);
        frames.set(ref.id!, frame);
        tabIds.push(ref.id!);
      }
      return { windowId: 2, tabIds, groupId: 1 };
    },
    async closeTabs(tabIds) {
      for (const id of tabIds) {
        endPorts(id);
        frames.get(id)?.remove();
        frames.delete(id);
        if (router.tabs.some((t) => t.id === id)) await router.removeTab(id);
        for (const fn of removed) fn(id);
      }
    },
    // Coere never picks the engine: the person's default, Google on a fresh profile.
    search: (tabId, text) => load(tabId, `https://www.google.com/search?q=${encodeURIComponent(text).replace(/%20/g, "+")}`),
    navigate: load,
    focus: async () => true,
    activate: async (tabId) => void (await router.updateTab(tabId, { active: true }).catch(() => undefined)),
    capture: async () => null,
    windowFocused: async () => false,
    onRemoved(listener) {
      removed.add(listener);
      return () => removed.delete(listener);
    },
  };

  // The worker's scripting.executeScript: the Actions page script starts in the tab and connects back on a fresh port.
  const chrome: ActionsChrome = {
    queryTabs: async () => [],
    inject: async (tabId) => {
      const win = frames.get(tabId)?.contentWindow as (Window & { __workerStart?: (port: PortLike) => void }) | null;
      if (!win?.__workerStart || gone) return false;
      const pair = portPair(tabId);
      const set = ports.get(tabId) ?? new Set();
      set.add(pair.close);
      ports.set(tabId, set);
      win.__workerStart(pair.page);
      setTimeout(() => hub.offer(pair.worker), 0);
      return true;
    },
    capture: async () => null,
    granted: async () => true,
    tabActive: async () => false,
  };

  // packages/memory's worker methods, with the fake model's research answers behind them.
  const handlers = createWorkerHandlers({
    call: async ({ prompt, turn, signal }) => {
      await sleep(LATENCY_MS, signal);
      if (signal.aborted) return { ok: false, failure: "aborted", usdMicros: 0 };
      const reply = researchAnswer({ task: turn.task, turn } as never) as { content: Array<{ input?: unknown }> };
      return { ok: true, input: reply.content[0]?.input, usdMicros: COST[prompt] };
    },
  });

  const pages = workerPages({ router, chrome, hub, onEvent: () => undefined });
  if (DEBUG)
    for (const key of Object.keys(pages) as Array<keyof typeof pages>) {
      const fn = pages[key] as (...a: unknown[]) => Promise<unknown>;
      (pages as Record<string, unknown>)[key] = async (...a: unknown[]) => {
        const t = performance.now();
        const r = await fn(...a);
        console.log("PAGE", key, a[0], Math.round(performance.now() - t), r === null ? "null" : "ok");
        return r;
      };
    }
  const workerPorts: WorkerPorts = {
    tabs,
    pages,
    engine: {
      "memory.act.plan": (a) => handlers["memory.act.plan"](a),
      "memory.act.extract": (a) => handlers["memory.act.extract"](a),
      "memory.act.merge": (a) => handlers["memory.act.merge"](a),
      "memory.act.abort": async ({ runId }) => handlers.abortRun(runId),
      "memory.act.log": async () => undefined,
    } as WorkerPorts["engine"],
    // Chrome holds all sites from an earlier run's Allow, so a small run starts at once (fake-actions-workers.spec.ts).
    grant: { held: async () => true, give: async () => true },
    session: area(world, "session"),
    local: area(world, "local"),
    browserUse: async () => readBrowserUse(world.stores.local?.[BROWSER_USE_KEY]),
    broadcast: (message) => {
      if (!gone) world.tell(structuredClone({ ch: "coere", ...message }));
    },
    download: async () => true,
    scale,
    clock: { now: () => Date.now(), sleep },
    today: () => new Date().toLocaleDateString("en-CA"),
  };

  const runs = createWorkerRuns(workerPorts);

  return {
    runs,
    tabs: () => frames.size,
    setTempo: (n) => void (tempo = n),
    dispose() {
      void runs.stopAll("person").catch(() => undefined);
      gone = true;
      for (const id of frames.keys()) endPorts(id);
      window_.remove();
    },
  };
}
