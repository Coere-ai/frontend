import { PAGE_PORT } from "@coere/actions";
import type { ActContext } from "@coere/memory/actions";
import { FakeRouterChrome } from "@v2/apps/extension/src/background/router-fake-chrome";
import type { StorageAreaLike } from "@v2/apps/extension/src/background/transfer-store";
import type { ActBrain } from "@v2/apps/extension/src/actions/run/brain";
import type { ActionsChrome } from "@v2/apps/extension/src/actions/run/chrome-actions";
import { RunManager } from "@v2/apps/extension/src/actions/run/manager";
import { handleActions } from "@v2/apps/extension/src/actions/run/messages";
import type { PortLike } from "@v2/apps/extension/src/actions/run/page-link";
import { RUN_POLICIES } from "@v2/apps/extension/src/actions/run/policies";
import type { MemoryAccess } from "@v2/packages/memory/src/access/port";
import { actContext } from "@v2/packages/memory/src/actions/context";
import { checkWritten, strangerWritten } from "@v2/packages/memory/src/actions/write";
import { addDays, zonedToUtc } from "@v2/tests/fake-google/calendar/zone";
import { MAYA, PEOPLE } from "@v2/tests/fake-google/gmail/mailbox";
import { createGoogleStore, type FakeEvent, type FakeGoogleStore } from "@v2/tests/fake-google/store";
import { eventFrom, type WriteTurn } from "@v2/tests/fake-claude/scenarios/actions-write";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";

/**
 * The service worker's part of Coere Actions in this film, kept in the
 * demo's top page: coere-v2's own RunManager (apps/extension/src/actions/run)
 * on a Chrome whose tabs are the demo's own frames. It answers the
 * `actions.*` messages the Cori page sends, opens Cori's Calendar tab as a
 * frame, injects the page script there and talks to it over a port, as
 * the extension does through `scripting` and `runtime.connect`.
 *
 * The engine's side is coere-v2's own code too: memory's `actContext`
 * reads Maya's memory (her people with their addresses, and the dated
 * fact of her CS 162 project) through a MemoryAccess over the records
 * coere-v2's Actions eval imports for her (tools/gen-fake-memory/maya),
 * the event comes from the fake thinking model of the `actions-maya`
 * scenario, and the engine's `checkWritten` checks it as it checks a
 * real model's. Fake Calendar's sync calls land in coere-v2's fake Google
 * store.
 *
 * What only the extension's browser has is played here: each recipe step
 * waits a beat before it reaches the page, and the writing call takes a
 * moment, so a person can watch the editor fill, as the film's slower
 * fake model made it.
 */

const BASE = "/preview/live/actions-calendar/";

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

export interface CalendarBridge {
  store: FakeGoogleStore;
  /** The day the Calendar tab last showed after a save, so a reload opens on that week as Calendar's address keeps it. */
  day: string | null;
  connect(tab: string, page: PageSide): { post(message: unknown): void; close(): void };
  sync(account: number, call: string, body: Record<string, unknown>): { status: number; body: unknown };
  /** A beat before Cori's own press or typing in the page, so it can be followed; none while the film skips ahead. */
  beat(kind: "click" | "type" | "key"): Promise<void>;
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

/** Fake Calendar's address for a page, as the frame that shows it. */
function srcFor(url: string): string {
  const u = new URL(url);
  return `${BASE}calendar.html?at=${encodeURIComponent(u.origin + u.pathname + u.search)}${u.hash}`;
}

/** How long Cori takes over each recipe step, so the page can be watched. */
const STEP_MS: Record<string, number> = {
  account: 700,
  open_editor: 900,
  guests: 700,
  check: 900,
  save: 800,
  saved: 300,
  delete: 600,
};

/** The beat before each of Cori's own presses and typing in the page. */
const BEAT_MS = { click: 700, type: 650, key: 450 } as const;

export interface ActionsWorld {
  bridge: CalendarBridge;
  manager: RunManager;
  /** The film's stage, set as the film starts, where Cori's tab opens. */
  stage: Stage | null;
  /** Cori's own tab once it opened. */
  tab(): Tab | null;
  /** Resolves once Cori's tab finished loading the page it is on now. */
  settled(): Promise<void>;
  /** The newest run's status, as the worker keeps it. */
  status(): string;
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

/**
 * Maya's memory as Cori's MemoryAccess reads it, from the records
 * tools/gen-fake-memory/maya writes for her: herself in Los Angeles, the
 * six people she writes to with the address each gave, and her CS 162
 * project's due date as a dated fact. Every read answers what the access
 * layer answers for those records with Cori's grant.
 */
const MEMORY_PEOPLE = [PEOPLE.samLee, PEOPLE.priya, PEOPLE.jordan, PEOPLE.reyes, PEOPLE.alex, PEOPLE.nora];
const DUE = "CS 162 project 3 is due November 13.";

function mayaAccess(): MemoryAccess {
  type Rec = Record<string, unknown>;
  const self = { id: "ent_self", kind: "self", name: MAYA.name } as Rec;
  const people = MEMORY_PEOPLE.map((p, i) => ({ id: `ent_p${i}`, kind: "person", name: p.name, address: p.address }));
  const facts = [
    ...people.map((p) => `${p.name}'s email is ${p.address}.`),
    "Maya is a student taking CS 162 and MATH 54.",
    DUE,
    "Maya lives in Berkeley.",
  ];
  const words = (s: string) => (s.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((w) => w.length > 2);
  const style = { writing: [], tone: [], answers: [], snapshots: [] };
  return {
    reader: { scopes: ["memory:read", "memory:identity"], sections: null },
    profile: () => ({ self, timeZone: "America/Los_Angeles", bySection: [], style, dueSoon: [] }) as never,
    style: () => style,
    corePack: () => ({ lines: [], about: "", tokens: 0 }),
    search: () => [],
    context: async (draft: string) => {
      const said = new Set(words(draft));
      const lines = facts.filter((f) => words(f).some((w) => said.has(w)));
      return { lines, records: [], tokens: lines.join(" ").length / 4 };
    },
    identity: (id: string) => {
      const p = people.find((x) => x.id === id);
      return p ? { person: { id: p.id, name: p.name }, values: [{ fact: `fact_${p.id}`, key: "email", kind: "email", label: null, value: p.address }] } : null;
    },
    upcoming: () => [{ id: "fact_due", text: DUE, urgency: { due: { at: "2026-11-13" } } }] as never,
    resolve: (name: string) => {
      const said = name.toLowerCase().split(/\s+/).filter(Boolean);
      return people.filter((p) => said.every((w) => p.name.toLowerCase().split(" ").includes(w))) as never;
    },
  } as unknown as MemoryAccess;
}

export function actionsWorld(world: World, pace: () => boolean): ActionsWorld {
  const store = createGoogleStore();
  const frames = new Map<number, Tab>();
  const names = new Map<string, number>();
  const pages = new Map<number, Set<{ page: PageSide; worker: PortLike & { fire(m: unknown): void; end(): void } }>>();
  const waiting: Array<() => void> = [];
  const wait = (ms: number) => (pace() ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve());
  const access = mayaAccess();

  const self: ActionsWorld = {
    bridge: null as unknown as CalendarBridge,
    manager: null as unknown as RunManager,
    stage: null,
    tab: () => [...frames.values()][0] ?? null,
    settled: () => new Promise<void>((done) => (router.tabs.some((t) => t.loading) ? waiting.push(done) : done())),
    status: () => {
      const all = Object.values((world.stores.session?.["coere.actions.runs"] ?? {}) as Record<string, { status?: string }>);
      return all[all.length - 1]?.status ?? "";
    },
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

  // Settings' Allow was answered when Browser Use was turned on: Chrome holds Gmail and Calendar.
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
    // Cori's tab is never the one Chrome would capture, so its preview is the page's own picture of itself.
    tabActive: async () => false,
  };

  const brain: ActBrain = {
    "memory.act.step": async () => ({ ok: false, failure: "no_tool", usdMicros: 0 }),
    "memory.act.see": async () => ({ ok: false, failure: "no_tool", usdMicros: 0 }),
    "memory.act.pick": async () => ({ ok: true, n: null, via: "none", confidence: 0, usdMicros: 0 }),
    "memory.act.check": async () => ({ ok: true, verdict: "held", p: 1, usdMicros: 0 }),
    // The engine's own act context, over Maya's memory.
    "memory.act.context": async (a) => actContext(access, a as never, { now: Date.now(), zone: "America/Los_Angeles" }) as Promise<ActContext>,
    "memory.act.abort": async () => undefined,
    "memory.act.log": async () => undefined,
    // act-write@1 as coere-v2's actions-maya scenario answers it, then the engine's own checks of the tool's input.
    "memory.act.write": async (a) => {
      await wait(1600);
      const request = a.request as never;
      const input = eventFrom(a.request as unknown as WriteTurn);
      if (strangerWritten(request, input)) return { ok: false, failure: "injected", usdMicros: 0 };
      const written = checkWritten(request, input);
      return written ? { ok: true, written, usdMicros: 900 } : { ok: false, failure: "invalid", usdMicros: 0 };
    },
  } as ActBrain;

  const manager = new RunManager({ router, chrome, brain, policies: RUN_POLICIES, now: () => Date.now(), newId: () => crypto.randomUUID() });

  const bridge: CalendarBridge = {
    store,
    day: null,
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
    sync: (account, call, b) => {
      const answer = syncCall(store, account, call, b);
      const saved = answer.body as Partial<FakeEvent>;
      if (call === "save" && typeof saved.startUtc === "string") bridge.day = dayIn(saved.startUtc, store.zone);
      return answer;
    },
    beat: (kind) => wait(BEAT_MS[kind]),
  };

  const sender = { id: router.extensionId };
  for (const type of ["actions.start", "actions.answer", "actions.stop", "actions.undo", "actions.retry", "actions.takeover", "actions.handback", "actions.focus", "actions.watch", "actions.allow", "actions.allowed", "actions.get", "actions.chat"])
    world.on(type, async (message) => (await handleActions(manager, { ...message, ch: "coere", id: String(message.id ?? crypto.randomUUID()) }, sender)) ?? null);

  self.bridge = bridge;
  self.manager = manager;
  return self;
}

/** The calendar day of a UTC instant in a zone. */
function dayIn(utc: string, zone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(utc));
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const strs = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : []);
const newEventId = () => Array.from({ length: 26 }, () => "abcdefghijklmnopqrstuv0123456789"[Math.floor(Math.random() * 32)]).join("");

/** Fake Calendar's sync calls on the store, as tests/fake-google/calendar/server.ts answers them. */
function syncCall(store: FakeGoogleStore, account: number, call: string, b: Record<string, unknown>): { status: number; body: unknown } {
  if (call === "delete") {
    const e = store.events.find((x) => x.id === str(b.id) && x.account === account && x.deletedAt === null);
    if (e) e.deletedAt = Date.now();
    return { status: 200, body: { id: str(b.id), deleted: e !== undefined } };
  }
  const zone = str(b.zone) || store.zone;
  const allDay = b.allDay === true;
  const start = str(b.start);
  const end = str(b.end);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(end)) return { status: 400, body: { error: "bad time" } };
  const event: FakeEvent = {
    id: str(b.id) || newEventId(),
    account,
    title: str(b.title),
    startUtc: zonedToUtc(allDay ? `${start.slice(0, 10)}T00:00` : start, zone),
    endUtc: zonedToUtc(allDay ? `${addDays(end.slice(0, 10), 1)}T00:00` : end, zone),
    zone,
    allDay,
    where: str(b.where),
    guests: strs(b.guests),
    details: str(b.details),
    invitationsSent: b.invitationsSent === true,
    deletedAt: null,
  };
  const at = store.events.findIndex((x) => x.id === event.id);
  if (at >= 0) store.events[at] = event;
  else store.events.push(event);
  return { status: 200, body: event };
}
