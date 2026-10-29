import type { Conversation, PlatformId } from "@v2/packages/core/src/index";
import { platformById } from "@v2/packages/platforms/src/index";
import { createBatchRouter, isBatchMessage, type BatchRouter, type BatchSender } from "@v2/apps/extension/src/background/batch/router";
import type { RouterChrome } from "@v2/apps/extension/src/background/router-chrome";
import { relayProgress } from "@v2/apps/extension/src/background/router-progress";
import { FakeEngine } from "@v2/apps/extension/src/console/testing/fake-engine";
import type { Stage } from "../../stage/stage";
import type { Message, World } from "../../stage/world";

/**
 * Coere's service worker for this film, in the demo's top page. Extract
 * all is the worker's own batch logic (background/batch/router.ts), run
 * here over the demo's tabs: it opens each AI in a tab of the stage that is
 * never filmed, hands that tab its job when its content script says hello,
 * and keeps the batch in session storage, where the onboarding page and the
 * dashboard follow it. The library is the dashboard's own fake engine,
 * typed as the real one, which the content scripts fill as they save.
 */

const EXT = "chrome-extension://coere/";

/** A tab the worker knows: Chrome's id for it, and the address it stands at. */
type TabRef = { name: string; id: number; url: string };

/** The site page each AI's tab opens, and whose account it is. */
export type SiteOpen = (platform: PlatformId) => { name: string; src: string; host: string };

/** A chat's real dates, moved to the time the film plays: the replica sites list none. */
export type Dates = (conv: Conversation) => { createdAt: string; updatedAt: string } | undefined;

export class Worker {
  readonly engine = new FakeEngine();
  readonly router: BatchRouter;
  /** The film's stage, once the film starts: Extract all opens its tabs there. */
  stage: Stage | null = null;
  /** How each AI's tab opens, set by the film. */
  site: SiteOpen | null = null;
  private readonly tabs = new Map<string, TabRef>();
  private nextId = 100;
  /** platformConvId to the updatedAt the library holds, as the site listed it (the engine's knownUpdates). */
  private readonly known = new Map<string, Map<string, string | null>>();

  constructor(
    readonly world: World,
    private readonly dates: Dates,
  ) {
    this.router = createBatchRouter(this.api(), { settle: async () => undefined });
  }

  /** The tab a message came from, given an id the first time it speaks. */
  tab(name: string): TabRef {
    let tab = this.tabs.get(name);
    if (!tab) {
      tab = { name, id: this.nextId++, url: this.urlOf(name) };
      this.tabs.set(name, tab);
    }
    return tab;
  }

  /** Where a tab stands: an AI's site for a site tab, the extension's own page for the others. */
  private urlOf(name: string): string {
    const site = this.stage?.sites.get(name);
    if (site) return `https://${site.host}${site.path ?? "/"}`;
    return `${EXT}${name}.html`;
  }

  private sender(name: string): BatchSender {
    const tab = this.tab(name);
    return { id: "coere", url: tab.url, frameId: 0, tab: { id: tab.id, windowId: 1 } };
  }

  private frameOf(id: number): HTMLIFrameElement | null {
    const tab = [...this.tabs.values()].find((t) => t.id === id);
    return tab ? document.querySelector<HTMLIFrameElement>(`iframe[data-tab="${tab.name}"]`) : null;
  }

  /** One message to the listeners of one tab, with their answer, as chrome.tabs.sendMessage gives it. */
  sendToTab(id: number, message: unknown): Promise<unknown> {
    const tab = [...this.tabs.values()].find((t) => t.id === id);
    const listeners = tab && (this.world as unknown as { listeners: Map<string, Set<(m: unknown, s: unknown, r: (a: unknown) => void) => unknown>> }).listeners.get(tab.name);
    if (!listeners?.size) return Promise.reject(new Error("Could not establish connection. Receiving end does not exist."));
    return new Promise((resolve, reject) => {
      let waiting = false;
      for (const listener of listeners) if (listener(structuredClone(message), { id: "coere" }, (a) => resolve(structuredClone(a))) === true) waiting = true;
      if (!waiting) reject(new Error("The message port closed before a response was received."));
    });
  }

  private api(): RouterChrome {
    const session = this.area("session");
    return {
      extensionId: "coere",
      getURL: (path) => EXT + path.replace(/^\//, ""),
      now: () => Date.now(),
      pageTabs: async () => [...this.tabs.values()].filter((t) => t.url.startsWith(EXT)).map((t) => ({ tabId: t.id, windowId: 1, documentUrl: t.url })),
      broadcast: async (message) => this.world.tell(message),
      createTab: async (url) => {
        const platform = (["chatgpt", "claude", "gemini"] as const).find((p) => url === platformById(p).newChatUrl);
        const open = platform && this.site?.(platform);
        if (!open || !this.stage) throw new Error(`no tab for ${url}`);
        const tab: TabRef = { name: open.name, id: this.nextId++, url: `https://${open.host}/` };
        this.tabs.set(open.name, tab);
        void this.stage.open(open.name, open.src, { host: open.host, person: MAYA });
        return { id: tab.id, windowId: 1 };
      },
      updateTab: async (id) => ({ id, windowId: 1 }),
      getTab: async (id) => {
        const tab = [...this.tabs.values()].find((t) => t.id === id);
        return tab && this.frameOf(id) ? { id, windowId: 1, url: tab.url, discarded: false, frozen: false } : null;
      },
      reloadTab: async () => undefined,
      removeTab: async (id) => {
        const tab = [...this.tabs.values()].find((t) => t.id === id);
        this.frameOf(id)?.remove();
        if (tab) this.tabs.delete(tab.name);
      },
      groupTab: async () => 1,
      groupWindow: async () => 1,
      updateGroup: async () => undefined,
      normalWindows: async () => [1],
      undiscardableTabs: async () => [],
      focusWindow: async () => undefined,
      activeTabId: async () => undefined,
      sendToTab: (id, message) => this.sendToTab(id, message),
      sessionGet: async (key) => structuredClone(this.world.stores.session?.[key]),
      sessionSet: async (key, value) => this.world.write("session", { [key]: structuredClone(value) }),
      sessionArea: session,
      localArea: this.area("local"),
      setActionPopup: async () => undefined,
      openActionPopup: async () => undefined,
    };
  }

  private area(name: string) {
    const world = this.world;
    return {
      async get(keys: string | string[]) {
        const store = world.stores[name] ?? {};
        const out: Record<string, unknown> = {};
        for (const key of typeof keys === "string" ? [keys] : keys) if (key in store) out[key] = structuredClone(store[key]);
        return out;
      },
      async set(items: Record<string, unknown>) {
        world.write(name, structuredClone(items));
      },
      async remove(keys: string | string[]) {
        world.remove(name, typeof keys === "string" ? [keys] : keys);
      },
    };
  }

  /** Answers the worker's messages: Extract all, the progress relay, and every engine call. */
  install(): void {
    const w = this.world;
    // A tab Coere closed keeps its listeners in the World; one that runs after its page is gone is let go quietly.
    const listen = w.listen.bind(w);
    w.listen = (tab, listener) => listen(tab, (m, s, r) => {
      try {
        return listener(m, s, r);
      } catch {
        return undefined;
      }
    });
    const watch = w.watchStorage.bind(w);
    w.watchStorage = (listener) => watch((changes, area) => {
      try {
        listener(changes, area);
      } catch {
        // The page this listener belonged to has closed.
      }
    });
    for (const type of ["batch.start", "batch.hello", "batch.report", "batch.ended", "batch.stop", "batch.action"])
      w.on(type, async (m, tab) => {
        if (!isBatchMessage(m)) return null;
        const reply = await this.router.handle(m, this.sender(tab));
        if (!reply.ok) throw new Error(reply.error.code);
        return reply.result;
      });
    w.on("batch.hello", async (m, tab) => {
      this.pace(tab);
      const reply = await this.router.handle(m as never, this.sender(tab));
      return reply.ok ? reply.result : null;
    });
    w.on("run.progress", (m, tab) => void relayProgress(this.api(), m as never, this.sender(tab), this.router));
    const engine = this.engine as unknown as Record<string, (a: unknown) => unknown>;
    for (const method of Object.getOwnPropertyNames(FakeEngine.prototype)) {
      if (method === "constructor" || method === "seed" || method === "store" || method === "track") continue;
      w.engine(method, (m) => engine[method]!.call(this.engine, m.args));
    }
    w.engine("knownUpdates", (m) => Object.fromEntries(this.known.get((m.args as { platform: string }).platform) ?? []));
    w.engine("upsertConversation", async (m) => (await this.save([(m.args as { conv: Conversation }).conv], (m.args as { runId?: string }).runId))[0]);
    // The library counts a short chat as one passage, as the engine's index does.
    w.engine("stats", async () => ({ ...(await this.engine.stats()), chunks: this.engine.convs.size }));
    w.engine("capture.tail", (m) => ({ count: this.engine.convs.get((m.args as { convId: string }).convId)?.messageCount ?? 0, tail: [] }));
    w.engine("upsertConversations", (m) => this.save((m.args as { convs: Conversation[] }).convs, (m.args as { runId?: string }).runId));
  }

  /** Clear on the dashboard: the finished run is put away, by the worker's own action. */
  async clearBatch(): Promise<void> {
    await this.router.handle({ ch: "coere", type: "batch.action", id: "clear", action: "clear" } as never, this.sender("dashboard"));
  }

  /**
   * A site answers each request after a moment, as a real one does over
   * the network (the films set 300 ms on the fake sites), so a run takes
   * the seconds a person sees it take. Set before the tab gets its job.
   */
  private pace(name: string): void {
    const win = document.querySelector<HTMLIFrameElement>(`iframe[data-tab="${name}"]`)?.contentWindow as (Window & { __paced?: true }) | null;
    if (!win || win.__paced) return;
    win.__paced = true;
    const ms = this.latency[this.stage?.sites.get(name)?.host ?? ""] ?? 300;
    const real = win.fetch.bind(win);
    win.fetch = async (input, init) => {
      // While the player skips ahead to a chapter, the sites answer at once.
      if (!this.stage?.fast) await new Promise((r) => setTimeout(r, ms * (0.7 + Math.random() * 0.6)));
      return real(input, init);
    };
  }

  /** Hears each chat the library saves, as memory's capture does. */
  onSaved: ((convId: string, messages: number) => void) | null = null;

  /** How long each site takes to answer, by host. */
  latency: Record<string, number> = {};

  /**
   * chrome.tabs as an extension page reaches it, answered from the tabs
   * this worker knows, put on a page once it has loaded (the demo's own
   * chrome.tabs answers nothing for these calls).
   */
  patchTabs(name: string, win: Window): void {
    const tabs = (win as unknown as { chrome: { tabs: Record<string, unknown> } }).chrome.tabs;
    const known = (id: number) => [...this.tabs.values()].find((t) => t.id === id && this.frameOf(id));
    const chromeTab = (t: TabRef) => ({ id: t.id, windowId: 1, url: t.url, discarded: false, frozen: false, status: "complete", active: false });
    tabs.get = async (id: number) => {
      const t = known(id);
      if (!t) throw new Error(`No tab with id: ${id}.`);
      return chromeTab(t);
    };
    tabs.update = async (id: number) => {
      const t = known(id);
      if (!t) throw new Error(`No tab with id: ${id}.`);
      return chromeTab(t);
    };
    tabs.remove = async (id: number) => void this.api().removeTab(id);
    tabs.getCurrent = async () => chromeTab(this.tab(name));
    tabs.query = async () => [];
    tabs.sendMessage = (id: number, message: unknown) => this.sendToTab(id, message);
  }

  /** Saves chats as the engine does, with each chat's own dates, and tells every page the library changed. */
  private async save(convs: Conversation[], runId?: string): Promise<unknown[]> {
    const out: unknown[] = [];
    for (const conv of convs) {
      const known = this.known.get(conv.platform) ?? new Map<string, string | null>();
      known.set(conv.platformConvId, conv.updatedAt ?? null);
      this.known.set(conv.platform, known);
      const dated = { ...conv, ...this.dates(conv) };
      const result = await this.engine.upsertConversation({ conv: dated, ...(runId ? { runId } : {}) });
      out.push({ ok: true, ...result });
      this.onSaved?.(result.id, conv.messages.length);
      this.world.tell({ ch: "coere", type: "engine.event", event: { name: "library.changed", ids: [result.id], platform: conv.platform } });
    }
    return out;
  }
}

export const MAYA = { name: "Maya Collins", first: "Maya", initials: "MC" };

export type { Message };
