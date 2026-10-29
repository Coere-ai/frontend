import { PAGE_PORT } from "@coere/actions";
import type { ActContext, ActWritten } from "@coere/memory/actions";
import { FakeRouterChrome } from "@v2/apps/extension/src/background/router-fake-chrome";
import type { StorageAreaLike } from "@v2/apps/extension/src/background/transfer-store";
import type { ActBrain } from "@v2/apps/extension/src/actions/run/brain";
import type { ActionsChrome } from "@v2/apps/extension/src/actions/run/chrome-actions";
import { RunManager } from "@v2/apps/extension/src/actions/run/manager";
import { handleActions } from "@v2/apps/extension/src/actions/run/messages";
import type { PortLike } from "@v2/apps/extension/src/actions/run/page-link";
import { RUN_POLICIES } from "@v2/apps/extension/src/actions/run/policies";
import { INJECTOR } from "@v2/tests/fake-google/gmail/mailbox";
import { createGoogleStore, type FakeDraft, type FakeGoogleStore } from "@v2/tests/fake-google/store";
import { writeEmail, type WriteTurn } from "@v2/tests/fake-claude/scenarios/actions-write";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";

/**
 * The service worker's part of Coere Actions in this film, kept in the
 * demo's top page: coere-v2's own RunManager (apps/extension/src/actions/run)
 * on a Chrome of tabs that are the demo's own frames. It answers the
 * `actions.*` messages the Cori page sends, opens Cori's Gmail tab as a
 * frame, injects the page script there and talks to it over a port, as
 * the extension does through `scripting` and `runtime.connect`. The
 * thinking model is the fake one of coere-v2's `actions-maya` scenario,
 * and fake Gmail's sync calls land in coere-v2's fake Google store.
 *
 * What only the extension's browser has is played here: requests to the
 * page wait a beat before each recipe step and the writing call takes a
 * moment, so a person can watch the page change, as the film's slower
 * fake model made it.
 */

const BASE = "/preview/live/actions-gmail/";

/** The page side of a port: what the worker part delivers into the tab. */
export interface PageSide {
  deliver(message: unknown): void;
  close(): void;
}

/** The tab side's chrome.runtime.Port. */
export interface PagePort {
  name: string;
  postMessage(message: unknown): void;
  disconnect(): void;
  onMessage: { addListener(fn: (m: unknown) => void): void; removeListener(fn: (m: unknown) => void): void };
  onDisconnect: { addListener(fn: () => void): void; removeListener(fn: () => void): void };
}

export interface GmailBridge {
  store: FakeGoogleStore;
  connect(tab: string, page: PageSide): { post(message: unknown): void; close(): void };
  sync(account: number, call: string, body: Record<string, unknown>): unknown;
  loaded(tab: string): void;
  /** Whether Cori works at a watchable pace now; false while the film skips ahead unseen. */
  paced(): boolean;
}

/** A storage area over one of the World's, shared with every tab, as chrome.storage is. */
function areaOf(world: World, name: string): StorageAreaLike {
  const keys = (k: string | string[]) => (typeof k === "string" ? [k] : k);
  return {
    get: async (k) => {
      const store = world.stores[name] ?? {};
      return Object.fromEntries(keys(k).flatMap((key) => (key in store ? [[key, structuredClone(store[key])]] : [])));
    },
    set: async (items) => world.write(name, structuredClone(items)),
    remove: async (k) => world.remove(name, keys(k)),
  };
}

/** Fake Gmail's own address for a page, as the frame that shows it. */
function srcFor(url: string): string {
  const u = new URL(url);
  const file = u.searchParams.get("view") === "cm" ? "gmail-cm.html" : "gmail.html";
  return `${BASE}${file}?at=${encodeURIComponent(u.origin + u.pathname + u.search)}${u.hash}`;
}

/** How long Cori takes over each recipe step, so the page can be watched. */
const STEP_MS: Record<string, number> = {
  account: 500,
  to: 900,
  search: 1100,
  read_results: 900,
  read_thread: 1300,
  compose: 700,
  subject: 900,
  body: 1000,
  save_draft: 2600,
  send: 1100,
  sent: 300,
};

export interface ActionsWorld {
  bridge: GmailBridge;
  manager: RunManager;
  /** The film's stage, set as the film starts, where Cori's tab opens. */
  stage: Stage | null;
  /** How fast Cori's steps go, 1 at the film's pace. */
  speed: number;
  /** While set, the writing call waits until the film lets it go, so a chapter starts at the same place every time. */
  holdWrite: Promise<void> | null;
  /** The step words of the run working now, as its bar shows them. */
  step(): string;
  /** Cori's own tab once it opened. */
  tab(): Tab | null;
  /** Resolves once Cori's tab finished loading the page it is on now. */
  settled(): Promise<void>;
}

class DemoRouter extends FakeRouterChrome {
  override readonly sessionArea: StorageAreaLike;
  override readonly localArea: StorageAreaLike;

  constructor(
    private readonly world: World,
    private readonly open: (id: number, url: string) => void,
    private readonly go: (id: number, url: string) => void,
  ) {
    super();
    this.sessionArea = areaOf(world, "session");
    this.localArea = areaOf(world, "local");
  }

  override now(): number {
    return Date.now();
  }

  override async broadcast(message: unknown): Promise<unknown> {
    this.world.tell(structuredClone(message));
    return undefined;
  }

  override async createTab(url: string, options: Parameters<FakeRouterChrome["createTab"]>[1] = {}) {
    const ref = await super.createTab(url, options);
    const tab = this.tab(ref.id!);
    tab.loading = true;
    this.open(tab.id, url);
    return ref;
  }

  override async updateTab(tabId: number, props: { active?: boolean; url?: string; autoDiscardable?: boolean }) {
    const ref = await super.updateTab(tabId, props);
    if (props.url) {
      this.tab(tabId).loading = true;
      this.go(tabId, props.url);
    }
    return ref;
  }

  override async sessionGet(key: string): Promise<unknown> {
    return (await this.sessionArea.get(key))[key];
  }

  override async sessionSet(key: string, value: unknown): Promise<void> {
    await this.sessionArea.set({ [key]: value });
  }
}

/** The person's world as the engine's memory gives it to a writing call: her name and zone, nobody's address. */
function contextFor(): ActContext {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  return { person: { name: "Maya Collins", timeZone: "America/Los_Angeles", today }, style: [], facts: [], people: [], form: {} };
}

export function actionsWorld(world: World, pace: () => boolean): ActionsWorld {
  const store = createGoogleStore();
  // Maya keeps Gmail's Undo send at its longest, 30 seconds.
  store.undoSeconds = 30;
  // The planted email of coere-v2's injection tests is left out: this film is not about it, and its words would read as the demo's own.
  store.mailbox = store.mailbox.filter((t) => !t.messages.some((m) => m.from.address === INJECTOR.address));
  const frames = new Map<number, Tab>();
  const names = new Map<string, number>();
  const pages = new Map<number, Set<{ page: PageSide; worker: PortLike & { fire(m: unknown): void; end(): void } }>>();
  const waiting: Array<() => void> = [];
  const wait = (ms: number) => (pace() ? new Promise((r) => setTimeout(r, ms * self.speed)) : Promise.resolve());

  const self: ActionsWorld = {
    bridge: null as unknown as GmailBridge,
    manager: null as unknown as RunManager,
    stage: null,
    speed: 1,
    holdWrite: null,
    step: () => manager.live()[0]?.view.stepLine ?? "",
    tab: () => [...frames.values()][0] ?? null,
    settled: () => new Promise<void>((done) => (router.tabs.some((t) => t.loading) ? waiting.push(done) : done())),
  };

  const landed = (id: number) => {
    router.tab(id).loading = false;
    if (!router.tabs.some((t) => t.loading)) for (const done of waiting.splice(0)) done();
  };

  const router: DemoRouter = new DemoRouter(
    world,
    (id, url) => {
      const name = `cori-${id}`;
      names.set(name, id);
      void self.stage!.open(name, srcFor(url)).then((tab) => {
        frames.set(id, tab);
        landed(id);
      });
    },
    (id, url) => {
      const tab = frames.get(id);
      if (!tab) return;
      for (const p of pages.get(id) ?? []) p.worker.end();
      tab.frame.addEventListener(
        "load",
        () => {
          tab.doc = tab.frame.contentDocument!;
          tab.win = tab.frame.contentWindow!;
          landed(id);
        },
        { once: true },
      );
      tab.frame.src = srcFor(url);
    },
  );
  // The Allow page was answered when Settings turned Browser Use on: Chrome holds Gmail and Calendar.
  const chrome: ActionsChrome = {
    queryTabs: async (patterns) =>
      router.tabs.filter((t) => patterns.some((p) => t.url.startsWith(p.replace("*", "")))).map((t) => ({ id: t.id, windowId: t.windowId, url: t.url, active: t.active })),
    inject: async (tabId) => {
      const win = frames.get(tabId)?.frame.contentWindow as (Window & { __coereActionsStart?: () => void }) | null;
      if (!win?.__coereActionsStart) return false;
      win.__coereActionsStart();
      return true;
    },
    capture: async () => null,
    granted: async () => true,
    // Cori's tab is never the one Chrome would capture, so its preview is the page's own picture of itself (10.5).
    tabActive: async () => false,
  };

  const brain: ActBrain = {
    "memory.act.step": async () => ({ ok: false, failure: "no_tool", usdMicros: 0 }),
    "memory.act.see": async () => ({ ok: false, failure: "no_tool", usdMicros: 0 }),
    "memory.act.pick": async () => ({ ok: true, n: null, via: "none", confidence: 0, usdMicros: 0 }),
    "memory.act.check": async () => ({ ok: true, verdict: "held", p: 1, usdMicros: 0 }),
    "memory.act.context": async () => contextFor(),
    "memory.act.abort": async () => undefined,
    "memory.act.log": async () => undefined,
    // act-write@1 as coere-v2's actions-maya scenario answers it: Maya's email from the plan's points.
    "memory.act.write": async (a) => {
      await self.holdWrite;
      await wait(2600);
      const r = a.request as unknown as WriteTurn & { kind: string };
      const written: ActWritten = { kind: "email", email: writeEmail(r) };
      return { ok: true, written, usdMicros: 1800 };
    },
  } as ActBrain;

  const manager = new RunManager({ router, chrome, brain, policies: RUN_POLICIES, now: () => Date.now(), newId: () => crypto.randomUUID() });

  const bridge: GmailBridge = {
    store,
    connect(name, page) {
      const tabId = names.get(name) ?? -1;
      const listeners = new Set<(m: unknown) => void>();
      const closers = new Set<() => void>();
      let open = true;
      let queue = Promise.resolve();
      const worker = {
        name: PAGE_PORT,
        sender: { tab: { id: tabId, windowId: 1 }, frameId: 0 },
        postMessage(m: unknown) {
          const msg = structuredClone(m) as { type?: string; call?: { step?: string } };
          const ms = msg.type === "recipe" ? (STEP_MS[msg.call?.step ?? ""] ?? 600) : 0;
          if ((window as unknown as { __debugRun?: boolean }).__debugRun) console.log("REQ", Math.round(performance.now()), tabId, JSON.stringify(msg).slice(0, 160));
          queue = queue.then(() => wait(ms)).then(() => {
            if (open) page.deliver(msg);
          });
        },
        disconnect() {
          if (!open) return;
          open = false;
          page.close();
          set.delete(entry);
        },
        onMessage: { addListener: (fn: (m: unknown) => void) => listeners.add(fn) },
        onDisconnect: { addListener: (fn: () => void) => closers.add(fn) },
        fire(m: unknown) {
          if ((window as unknown as { __debugRun?: boolean }).__debugRun) console.log("ANS", Math.round(performance.now()), tabId, JSON.stringify(m).slice(0, 200));
          for (const fn of listeners) fn(structuredClone(m));
        },
        end() {
          if (!open) return;
          open = false;
          set.delete(entry);
          page.close();
          for (const fn of closers) fn();
        },
      };
      const entry = { page, worker };
      const set = pages.get(tabId) ?? new Set();
      set.add(entry);
      pages.set(tabId, set);
      setTimeout(() => manager.hub.offer(worker), 0);
      return { post: (m) => open && setTimeout(() => worker.fire(m), 0), close: () => worker.end() };
    },
    sync: (account, call, b) => syncCall(store, account, call, b),
    loaded: () => undefined,
    paced: pace,
  };

  const sender = { id: router.extensionId };
  for (const type of ["actions.start", "actions.answer", "actions.stop", "actions.undo", "actions.retry", "actions.takeover", "actions.handback", "actions.focus", "actions.watch", "actions.allow", "actions.allowed", "actions.get", "actions.chat"])
    world.on(type, async (message) => (await handleActions(manager, { ...message, ch: "coere", id: String(message.id ?? crypto.randomUUID()) }, sender)) ?? null);

  self.bridge = bridge;
  self.manager = manager;
  return self;
}

/** Fake Gmail's sync calls on the store, as tests/fake-google/gmail/server.ts answers them. */
function syncCall(store: FakeGoogleStore, account: number, call: string, b: Record<string, unknown>): unknown {
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const strs = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : []);
  const id = str(b.id);
  const draftOf = (): FakeDraft => ({ id, account, to: strs(b.to), cc: strs(b.cc), subject: str(b.subject), body: str(b.body), savedAt: Date.now() });
  const at = store.drafts.findIndex((d) => d.id === id);
  if (call === "draft") {
    const draft = draftOf();
    if (at >= 0) store.drafts[at] = draft;
    else store.drafts.push(draft);
    return { id, savedAt: draft.savedAt };
  }
  if (call === "discard") {
    if (at >= 0) store.drafts.splice(at, 1);
    return { id };
  }
  if (call === "send") {
    if (at >= 0) store.drafts.splice(at, 1);
    const now = Date.now();
    store.sent.push({ ...draftOf(), sentAt: now, undoneAt: null });
    return { id, sentAt: now };
  }
  const sent = store.sent.find((s) => s.id === id && s.undoneAt === null);
  const now = Date.now();
  if (!sent || now - sent.sentAt > store.undoSeconds * 1000 + 1000) return { id, undone: false };
  sent.undoneAt = now;
  const { sentAt: _s, undoneAt: _u, ...draft } = sent;
  store.drafts.push({ ...draft, savedAt: now });
  return { id, undone: true };
}

