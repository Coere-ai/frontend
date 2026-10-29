import { PAGE_PORT } from "@coere/actions";
import type { ActContext } from "@coere/memory/actions";
import { codePick } from "@v2/packages/memory/src/actions/pick";
import { readStep, stepTurn } from "@v2/packages/memory/src/actions/step";
import { planForm } from "@v2/packages/memory/src/actions/forms/handler";
import { ACT_FIELD } from "@v2/packages/memory/src/actions/forms/jev";
import type { ActCaller } from "@v2/packages/memory/src/actions/models";
import { coriReader, type MemoryAccess } from "@v2/packages/memory/src/access/port";
import type { ClassifyRequest, ClassifyResult } from "@v2/packages/memory/src/classify/types";
import type { EntityRecord, FactRecord } from "@v2/packages/memory/src/model/records";
import { pickOf } from "@v2/tests/fake-jev/scenarios/actions-pick";
import { FakeRouterChrome } from "@v2/apps/extension/src/background/router-fake-chrome";
import type { StorageAreaLike } from "@v2/apps/extension/src/background/transfer-store";
import type { ActBrain } from "@v2/apps/extension/src/actions/run/brain";
import type { ActionsChrome } from "@v2/apps/extension/src/actions/run/chrome-actions";
import { RunManager } from "@v2/apps/extension/src/actions/run/manager";
import { handleActions } from "@v2/apps/extension/src/actions/run/messages";
import type { PortLike } from "@v2/apps/extension/src/actions/run/page-link";
import { RUN_POLICIES } from "@v2/apps/extension/src/actions/run/policies";
import { MAYA_PROFILE } from "@v2/tests/fake-pages/form/fields";
import type { FakePagesStore } from "@v2/tests/fake-pages/store";
import type { FakeHosts } from "@v2/tests/fake-sites/hosts";
import type { FakeResponse } from "@v2/tests/fake-sites/server/types";
import actionsGullible from "@v2/tests/fake-claude/scenarios/actions-gullible";
import actionsMaya from "@v2/tests/fake-claude/scenarios/actions-maya";
import { researchAnswer } from "@v2/tests/fake-claude/scenarios/actions-research";
import { createWorkerHandlers } from "@v2/packages/memory/src/actions/workers/handlers";
import { createWorkerRuns, type WorkerRuns } from "@v2/apps/extension/src/actions/workers/coordinator";
import { answerWorkerMessage } from "@v2/apps/extension/src/actions/workers/messages";
import { workerPages } from "@v2/apps/extension/src/actions/workers/page-ports";
import type { KeyStore, WorkerPorts, WorkerTabs } from "@v2/apps/extension/src/actions/workers/ports";
import { readWorkerMessage } from "@v2/apps/extension/src/actions/workers/read-message";
import { BROWSER_USE_KEY, readBrowserUse } from "@v2/apps/extension/src/lib/browser-use";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";

/**
 * The extension's part of Coere Actions in this film, kept in the demo's
 * top page: coere-v2's own RunManager (apps/extension/src/actions/run) on
 * coere-v2's FakeRouterChrome, whose tabs are the demo's own frames. It
 * answers the `actions.*` messages the toolbar popup sends, injects the
 * page script into the person's tab when a run asks for it and talks to it
 * over a port, as the extension does through `scripting` and
 * `runtime.connect`. The thinking model is coere-v2's fake one: the
 * `actions-maya` scenario, which answers from the fake pages' own truth,
 * and `actions-gullible`, which obeys what a page plants, read back
 * through the engine's own step reader. The fake pages themselves are
 * coere-v2's servers (tests/fake-pages), run here on one store, so the
 * quiz keeps her answers and the form its draft from page to page.
 */

/** The page side of a port: what the worker part delivers into the tab. */
export interface PageSide {
  deliver(message: unknown): void;
  close(): void;
}

/** What a page tab asks of the film's top page. */
export interface PagesBridge {
  /** One request to a fake host, as the films' fixture routes it. */
  serve(method: string, url: string, body: string | null): Promise<FakeResponse>;
  /** A page's HTML at once, for a tab that writes it in as it loads (the form and quiz servers answer at once). */
  page(url: string): FakeResponse;
  /** A tab started a page at a site's address. */
  arrived(tab: string, url: string): void;
  /** The tab's page finished loading. */
  loaded(tab: string): void;
  /** The tab's page is going away for another. */
  leaving(tab: string): void;
  /** The page script's port to the worker part. */
  connect(tab: string, page: PageSide): { post(message: unknown): void; close(): void };
  /** The tab the toolbar popup was opened over, as Chrome's activeTab gives it. */
  activeTab(): { id: number; url: string } | null;
}

export interface ActionsWorld {
  bridge: PagesBridge;
  manager: RunManager;
  router: FakeRouterChrome;
  /** The fake pages' store, once the film loaded the servers. */
  store: FakePagesStore | null;
  usePages(hosts: FakeHosts, store: FakePagesStore): void;
  /** The tab the popup is opened over, by its stage name. */
  active: string | null;
  /** How long the thinking model takes over a step at the film's pace. */
  stepMs: number;
  /** How long a form field takes to fill at the film's pace. */
  fillMs: number;
  /** While set, the next step waits until the film lets it go, so a chapter starts where it should. */
  hold: Promise<void> | null;
  /** True while the model believes what pages say (the film's last task). */
  gullible: boolean;
  /** Where the workers' tabs open, set as the film starts. */
  stage: Stage | null;
  /** The research run's workers, on the same page ports as the lone runs. */
  workers: WorkerRuns;
  /** The workers' tabs by tab id, behind the person's window. */
  workerTabs: Map<number, Tab>;
  /** How long a worker's model call takes at the film's pace. */
  extractMs: number;
  /** The workers' polite pace (10.4) runs this much faster in the film, as its cut leaves waits out. */
  paceScale: number;
  /** The newest run's status, as the surfaces hear it. */
  status(): string;
  /** The words on the bar of the run working now. */
  step(): string;
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

class DemoRouter extends FakeRouterChrome {
  override readonly sessionArea: StorageAreaLike;
  override readonly localArea: StorageAreaLike;

  constructor(private readonly world: World) {
    super();
    this.sessionArea = areaOf(world, "session");
    this.localArea = areaOf(world, "local");
  }

  override now(): number {
    return Date.now();
  }

  override async broadcast(message: unknown): Promise<unknown> {
    const m = message as { type?: string; state?: { status?: string; step?: number }; result?: unknown };
    if ((window as unknown as { __debugRun?: boolean }).__debugRun && m.type === "actions.state") console.log("RSTATE", Math.round(performance.now()), m.state?.status, m.state?.step, JSON.stringify(m.result ?? null).slice(0, 200));
    this.world.tell(structuredClone(message));
    return undefined;
  }

  override async sessionGet(key: string): Promise<unknown> {
    return (await this.sessionArea.get(key))[key];
  }

  override async sessionSet(key: string, value: unknown): Promise<void> {
    await this.sessionArea.set({ [key]: value });
  }
}

/**
 * What memory gives a form run (packages/memory/src/actions/context.ts
 * `formOf`) from Maya's memory as coere-v2's tools/gen-fake-memory/maya
 * writes it: her name, her email and phone as identity, and the birth date
 * and street address facts she said in her clinic chat.
 */
function contextFor(kind: string): ActContext {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  const p = MAYA_PROFILE;
  const form =
    kind === "form"
      ? {
          name: "Maya Collins",
          email: p.email,
          phone: p.phone,
          birth_date: `Maya's date of birth is ${p.birthDate}.`,
          address: `Maya's street address is ${p.street}, ${p.city}, ${p.state} ${p.zip}.`,
        }
      : {};
  return { person: { name: "Maya Collins", timeZone: "America/Los_Angeles", today }, style: [], facts: [], people: [], form };
}

/**
 * Maya's memory as a form run reads it through Cori's MemoryAccess
 * (packages/memory/src/actions/forms/profile.ts), the same details
 * coere-v2's tools/gen-fake-memory/maya writes for a form: her name on
 * her self, her email and phone as identity, and the birth date and
 * street address facts she said in her clinic chat.
 */
function mayaAccess(): MemoryAccess {
  const p = MAYA_PROFILE;
  const self = { id: "ent_self", name: "Maya Collins", kind: "self" } as EntityRecord;
  const fact = (id: string, key: string, text: string, value?: FactRecord["value"]) => ({ id, key, text, status: "active", ...(value ? { value } : {}) }) as FactRecord;
  const email = fact("fact_email", "email", `Maya's email is ${p.email}.`, { type: "email", email: p.email } as FactRecord["value"]);
  const phone = fact("fact_phone", "phone", `Maya's phone is ${p.phone}.`, { type: "phone", phone: p.phone } as FactRecord["value"]);
  const facts = [
    email,
    phone,
    fact("fact_birth", "birth_date", `Maya's date of birth is ${p.birthDate}.`),
    fact("fact_street", "street_address", `Maya's street address is ${p.street}, ${p.city}, ${p.state} ${p.zip}.`),
  ];
  const style = { writing: [], tone: [], answers: [], snapshots: [] };
  return {
    reader: coriReader({ sensitive: false }),
    profile: () => ({ self, timeZone: "America/Los_Angeles", bySection: [{ section: "sec_personal", facts }], style, dueSoon: [] }),
    style: () => style,
    corePack: () => ({ lines: [], about: "", tokens: 0 }),
    search: () => [],
    context: async () => ({ lines: [], records: [], tokens: 0 }),
    identity: (id) => ({
      person: { id, name: self.name },
      values: [
        { fact: email.id, key: "email", kind: "email", label: null, value: p.email },
        { fact: phone.id, key: "phone", kind: "phone", label: null, value: p.phone },
      ],
    }),
    upcoming: () => [],
    resolve: () => [],
  } as MemoryAccess;
}

/**
 * Jev's pick of a form field's detail (20.3 step 3), as coere-v2's fake
 * Jev answers `act_field`: the key whose words the question shares most,
 * with that share as the confidence, so a question about none of her
 * details stays blank.
 */
function fieldPicks(req: ClassifyRequest): ClassifyResult {
  const labels = (req.tasks as Record<string, { labels: Array<{ id: string; description: string }> }>)[ACT_FIELD]?.labels ?? [];
  const criteria = Object.fromEntries(labels.map((l) => [l.id, l.description]));
  return {
    decisions: req.items.map((item) => {
      const best = pickOf(item.text.split(". Options:")[0] ?? item.text, criteria);
      const probs = Object.fromEntries(labels.map((l) => [l.id, l.id === best.label ? best.share : 0]));
      return { itemId: item.id, answers: { [ACT_FIELD]: { probs, picked: [best.label], confidence: best.share } }, calibrated: true };
    }),
    missing: [],
    usage: { provider: "jev", model: "jev", requests: 1, inputTokens: 0, outputTokens: 0, cacheRead: 0, cacheWrite: 0 },
  } as ClassifyResult;
}

/** The form planner's model calls: Jev's field pick, and no writing call, since a plain form writes nothing of its own (20.5). */
const formCaller = {
  askJev: async (_role: string, _a: unknown, req: ClassifyRequest) => ({ result: fieldPicks(req), usd: 30 }),
  ask: async () => ({ ok: false, failure: "no_tool", usdMicros: 0 }),
  abort: () => undefined,
} as unknown as ActCaller;

export function actionsWorld(world: World, pace: () => boolean): ActionsWorld {
  const router = new DemoRouter(world);
  const ids = new Map<string, number>();
  const frames = new Map<number, string>();
  const ports = new Map<number, Set<{ end(): void }>>();
  let hosts: FakeHosts | null = null;
  const wait = (ms: number) => (pace() && ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve());

  const self: ActionsWorld = {
    bridge: null as unknown as PagesBridge,
    manager: null as unknown as RunManager,
    router,
    store: null,
    usePages(h, store) {
      hosts = h;
      self.store = store;
    },
    active: null,
    stage: null,
    workers: null as unknown as WorkerRuns,
    workerTabs: new Map(),
    extractMs: 450,
    paceScale: 0.1,
    stepMs: 480,
    fillMs: 420,
    hold: null,
    gullible: false,
    status: () => {
      const all = [...(manager as unknown as { sessions: Map<string, { state: { status: string } }> }).sessions.values()];
      return all[all.length - 1]?.state.status ?? "";
    },
    step: () => manager.live()[0]?.view.stepLine ?? "",
  };

  const tabOf = (name: string): number | null => ids.get(name) ?? null;
  const loads = new Map<number, Array<() => void>>();

  // The person's tab is one Chrome lets the popup see (activeTab), so its address is known and the script goes in.
  const chrome: ActionsChrome = {
    queryTabs: async () => [],
    inject: async (tabId) => {
      const name = frames.get(tabId);
      const frame = name ? (document.querySelector(`iframe[data-tab="${CSS.escape(name)}"]`) as HTMLIFrameElement | null) : null;
      const win = frame?.contentWindow as (Window & { __coereActionsStart?: () => void }) | null;
      if (!win?.__coereActionsStart) return false;
      win.__coereActionsStart();
      return true;
    },
    capture: async () => null,
    granted: async () => true,
    // The demo's tabs are not Chrome's to capture, so a preview is the page's own picture of itself (10.5).
    tabActive: async () => false,
  };

  /** The fake model's answer to one step turn, read back as the engine reads `next_action`. */
  const think = (request: Parameters<ActBrain["memory.act.step"]>[0]["request"]) => {
    const scenario = self.gullible ? actionsGullible : actionsMaya;
    const reply = scenario.answer({ task: "act-step@1", model: "claude-haiku-4-5", turn: stepTurn(request) });
    const call = reply.content.find((b) => b.type === "tool_use");
    return call && call.type === "tool_use" ? readStep(call.input, { vision: false }) : null;
  };

  const brain: ActBrain = {
    "memory.act.step": async (a) => {
      await self.hold;
      await wait(self.stepMs);
      const step = think(a.request);
      return step ? { ok: true, step, usdMicros: 140 } : { ok: false, failure: "invalid", usdMicros: 70 };
    },
    "memory.act.see": async () => ({ ok: false, failure: "no_tool", usdMicros: 0 }),
    "memory.act.write": async () => ({ ok: false, failure: "no_tool", usdMicros: 0 }),
    "memory.act.pick": async (a) => {
      const n = codePick(a.description, a.candidates);
      return n === null ? { ok: true, n: null, via: "none", confidence: 0, usdMicros: 0 } : { ok: true, n, via: "code", confidence: 1, usdMicros: 0 };
    },
    // The engine's own cheapest check: the expected words already in what changed need no model.
    "memory.act.check": async (a) => {
      const fold = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
      const held = a.expect.trim() !== "" && fold(a.diff).includes(fold(a.expect));
      return { ok: true, verdict: held ? "held" : "unsure", p: held ? 1 : null, usdMicros: 0 };
    },
    "memory.act.context": async (a) => contextFor(a.kind),
    // A page of a form planned from memory by the engine's own planner (20.3): code first, then Jev.
    "memory.act.form": async (a) => {
      await wait(self.stepMs);
      return planForm(mayaAccess(), formCaller, a, false);
    },
    "memory.act.abort": async () => undefined,
    "memory.act.log": async () => undefined,
  } as ActBrain;

  let next = 0;
  const manager = new RunManager({ router, chrome, brain, policies: RUN_POLICIES, now: () => Date.now(), newId: () => `demo${++next}` });

  const bridge: PagesBridge = {
    async serve(method, url, body) {
      const u = new URL(url);
      const server = hosts?.get(u.hostname);
      if (!server) return { status: 404, contentType: "text/plain", headers: {}, body: "" };
      return server.serve(method, u, body);
    },
    page(url) {
      const u = new URL(url);
      const answer = hosts?.get(u.hostname)?.serve("GET", u, null);
      if (!answer || answer instanceof Promise) return { status: 404, contentType: "text/html", headers: {}, body: "<!doctype html><title></title>" };
      return answer;
    },
    arrived(name, url) {
      let id = tabOf(name);
      if (id === null) {
        id = router.openSite(url);
        ids.set(name, id);
        frames.set(id, name);
      }
      const tab = router.tab(id);
      tab.url = url;
      tab.loading = true;
    },
    loaded(name) {
      const id = tabOf(name);
      if (id === null) return;
      router.tab(id).loading = false;
      for (const done of loads.get(id)?.splice(0) ?? []) done();
    },
    leaving(name) {
      const id = tabOf(name);
      if (id === null) return;
      router.tab(id).loading = true;
      for (const p of ports.get(id) ?? []) p.end();
    },
    connect(name, page) {
      const tabId = tabOf(name) ?? -1;
      const listeners = new Set<(m: unknown) => void>();
      const closers = new Set<() => void>();
      let open = true;
      const set = ports.get(tabId) ?? new Set();
      ports.set(tabId, set);
      const entry = {
        end() {
          if (!open) return;
          open = false;
          set.delete(entry);
          page.close();
          for (const fn of closers) fn();
        },
      };
      set.add(entry);
      const worker: PortLike = {
        name: PAGE_PORT,
        sender: { tab: { id: tabId, windowId: 1 }, frameId: 0 },
        postMessage(m) {
          if (!open) return;
          const copy = structuredClone(m);
          // A field is filled at a person's pace in the film, as each quiz step is; the engine itself fills at once.
          const call = (copy as { type?: string; call?: { op?: string } }).type === "form" ? (copy as { call: { op?: string } }).call : null;
          setTimeout(() => open && page.deliver(copy), call?.op === "fill" && pace() ? self.fillMs : 0);
        },
        disconnect() {
          if (!open) return;
          open = false;
          set.delete(entry);
          page.close();
        },
        onMessage: { addListener: (fn) => void listeners.add(fn) },
        onDisconnect: { addListener: (fn) => void closers.add(fn) },
      };
      setTimeout(() => manager.hub.offer(worker), 0);
      return {
        post: (m) => {
          if (!open) return;
          const copy = structuredClone(m);
          setTimeout(() => open && listeners.forEach((fn) => fn(copy)), 0);
        },
        close: () => entry.end(),
      };
    },
    activeTab() {
      const id = self.active ? tabOf(self.active) : null;
      if (id === null) return null;
      return { id, url: router.tab(id).url };
    },
  };

  // The toolbar popup's Actions messages, as the service worker's listener answers them.
  // A research run's own requests first (its start, Start, a worker's id), then the lone runs', as the service worker's router answers them.
  const workers = createWorkerRuns(workerPorts(world, self, router, manager, loads, wait, pace));
  const sender = { id: router.extensionId };
  for (const type of ["actions.start", "actions.answer", "actions.stop", "actions.undo", "actions.retry", "actions.takeover", "actions.handback", "actions.focus", "actions.watch", "actions.allow", "actions.allowed", "actions.get", "actions.chat", "actions.workers", "actions.export"])
    world.on(type, async (message) => {
      const msg = { ...message, ch: "coere", id: String(message.id ?? crypto.randomUUID()) };
      const forWorkers = readWorkerMessage(msg);
      const reply = (forWorkers ? answerWorkerMessage(workers, forWorkers) : undefined) ?? handleActions(manager, msg, sender);
      return (await reply) ?? null;
    });
  self.workers = workers;

  self.bridge = bridge;
  self.manager = manager;
  register = (name, id) => {
    ids.set(name, id);
    frames.set(id, name);
  };
  return self;
}

/** Names a worker's tab for the bridge, so its page finds its tab id; set by actionsWorld. */
let register: (name: string, id: number) => void = () => undefined;

/** A key store over one of the World's storage areas. */
const keyStore = (world: World, area: string): KeyStore => ({
  get: async (key) => structuredClone((world.stores[area] ?? {})[key]),
  set: async (key, value) => world.write(area, { [key]: structuredClone(value) }),
  remove: async (key) => world.remove(area, [key]),
});

/**
 * A research run's ports (actions/workers/ports.ts), as chrome-ports.ts
 * gives them in the extension: the workers' tabs are frames of the demo
 * behind the person's own (Chrome's unfocused window), each load waits for
 * its page, a search goes to the person's default engine (the fake
 * www.google.com), and a picture of a worker's screen is the page's own
 * sketch, since the demo cannot capture a tab. The page reads go over the
 * same page ports as a lone run's (page-ports.ts), and the model calls go
 * through the engine's own worker handlers to coere-v2's fake research
 * model, whose plan and rows the handlers check as they check a real one's.
 */
function workerPorts(
  world: World,
  aw: ActionsWorld,
  router: FakeRouterChrome,
  manager: RunManager,
  loads: Map<number, Array<() => void>>,
  wait: (ms: number) => Promise<unknown>,
  paced: () => boolean,
): WorkerPorts {
  const removed = new Set<(tabId: number) => void>();
  let opened = 0;

  /** Loads a site's address in a worker's tab; true once the page loaded, false after 8 seconds. */
  const load = (tabId: number, url: string): Promise<boolean> => {
    const tab = aw.workerTabs.get(tabId);
    if (!tab) return Promise.resolve(false);
    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => resolve(false), 8_000);
      const list = loads.get(tabId) ?? [];
      list.push(() => {
        clearTimeout(timer);
        resolve(true);
      });
      loads.set(tabId, list);
      router.tab(tabId).loading = true;
      tab.frame.src = `page.html?at=${encodeURIComponent(url)}`;
    });
  };

  const tabs: WorkerTabs = {
    async openWindow(count) {
      const tabIds: number[] = [];
      for (let i = 0; i < count; i++) {
        const name = `worker-${++opened}`;
        const id = router.openSite("about:blank");
        register(name, id);
        const tab = await aw.stage!.open(name, "about:blank");
        tab.frame.addEventListener("load", () => {
          tab.doc = tab.frame.contentDocument!;
          tab.win = tab.frame.contentWindow!;
        });
        aw.workerTabs.set(id, tab);
        tabIds.push(id);
      }
      return { windowId: 2, tabIds, groupId: null };
    },
    async closeTabs(tabIds) {
      for (const id of tabIds) {
        const tab = aw.workerTabs.get(id);
        aw.workerTabs.delete(id);
        if (tab) aw.stage?.close(tab);
        if (router.tabs.some((t) => t.id === id)) await router.removeTab(id);
        for (const fn of removed) fn(id);
      }
    },
    search: (tabId, text) => load(tabId, `https://www.google.com/search?q=${encodeURIComponent(text)}`),
    navigate: (tabId, url) => load(tabId, url),
    async focus(tabId) {
      const tab = aw.workerTabs.get(tabId);
      if (!tab || !aw.stage) return false;
      await aw.stage.film(tab);
      return true;
    },
    activate: async () => undefined,
    capture: async () => null,
    windowFocused: async () => false,
    onRemoved(listener) {
      removed.add(listener);
      return () => removed.delete(listener);
    },
  };

  const handlers = createWorkerHandlers({
    call: async ({ call, prompt, turn }) => {
      await wait(aw.extractMs);
      const reply = researchAnswer({ task: prompt === "plan" ? "act-plan@1" : "act-extract@1", model: call.model, turn });
      const block = reply.content.find((b) => b.type === "tool_use");
      return block && block.type === "tool_use" ? { ok: true, input: block.input, usdMicros: prompt === "plan" ? 900 : 1_400 } : { ok: false, failure: "invalid", usdMicros: 0 };
    },
  });

  return {
    tabs,
    pages: workerPages({ router, chrome: manager.deps.chrome, hub: manager.hub, onEvent: () => undefined }),
    engine: {
      "memory.act.plan": handlers["memory.act.plan"],
      "memory.act.extract": handlers["memory.act.extract"],
      "memory.act.merge": handlers["memory.act.merge"],
      "memory.act.abort": async (a) => handlers.abortRun(a.runId),
      "memory.act.log": async () => undefined,
    },
    grant: { held: async () => true, give: async () => true },
    session: keyStore(world, "session"),
    local: keyStore(world, "local"),
    browserUse: async () => readBrowserUse((world.stores.local ?? {})[BROWSER_USE_KEY]),
    broadcast: (message) => {
      if ((window as unknown as { __debugRun?: boolean }).__debugRun && message.type === "actions.state") console.log("WSTATE", Math.round(performance.now()), JSON.stringify({ s: message.state.status, g: message.grid, r: (message as { result?: unknown }).result }).slice(0, 900));
      world.tell(structuredClone({ ch: "coere", ...message }));
    },
    download: async () => false,
    scale: async (dataUrl, width) => {
      try {
        const bitmap = await createImageBitmap(await (await fetch(dataUrl)).blob());
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = Math.max(1, Math.round((bitmap.height * width) / bitmap.width));
        canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/jpeg", 0.8);
      } catch {
        return null;
      }
    },
    clock: {
      now: () => Date.now(),
      sleep: (ms, signal) =>
        new Promise<void>((resolve) => {
          const t = setTimeout(resolve, paced() ? ms * aw.paceScale : 0);
          signal?.addEventListener("abort", () => (clearTimeout(t), resolve()), { once: true });
        }),
    },
    today: () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" }),
  };
}
