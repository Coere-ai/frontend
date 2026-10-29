import { PAGE_PORT, type Snapshot, type ViewBox } from "@coere/actions";
import { overlay as copy } from "@coere/actions/copy";
import { createLayer, createPageKit, watchPerson, type Layer } from "@coere/actions/page";
import { pageEnv, recipeRunner } from "@coere/actions/recipes";
import { startHost } from "@v2/apps/extension/src/actions/page/host";
import { mountOverlay } from "@v2/apps/extension/src/actions/page/overlay";
import { WEEKLY, type CalendarBoot, type EditorSeed } from "@v2/tests/fake-google/calendar/boot";
import { parseDates } from "@v2/tests/fake-google/calendar/when";
import { addDays, utcToZoned } from "@v2/tests/fake-google/calendar/zone";
import type { DemoHost } from "../../stage/host";
import { installChrome } from "../../stage/tab/chrome";
import type { CalendarBridge, PagePort } from "./bridge";

/**
 * Fake Calendar's tab in the film: coere-v2's own Calendar page
 * (calendar-page.mts wrote it, with this script where its boot block
 * was), and Coere's Actions page script, which the film's service worker
 * part injects as the extension does. What a browser gives the page in the
 * extension is played here: the boot block is written from the film's
 * store for the address the tab stands for (as tests/fake-google/calendar/
 * server.ts writes it), the page's own address reads as Calendar's path so
 * its script draws the week or the editor, the sync calls answer from the
 * store, the page port runs to the worker part in the top page, and the
 * recipes read Calendar's host.
 */
const host = (parent as unknown as { __demo: DemoHost }).__demo;
const tab = (frameElement as HTMLIFrameElement).dataset.tab ?? "";
const bridge = host.extra.calendar as CalendarBridge;
installChrome(host.world, tab, host.assets);

// A tab is a top window: Coere's page code walks up to the frame element to see whether the page is shown and where it sits, and in the demo that is the stage's own frame, hidden while another tab is on camera.
Object.defineProperty(window, "frameElement", { get: () => null, configurable: true });

/** The Calendar address this load stands for, with the routes the server moves (render, the bare editor) moved as it does. */
const at = (() => {
  const u = new URL(new URLSearchParams(location.search).get("at") ?? "https://calendar.google.com/calendar/u/0/r");
  const p = u.pathname;
  if (p === "/" || p === "/calendar" || p === "/calendar/") u.pathname = "/calendar/u/0/r";
  if (p === "/calendar/render" || p === "/calendar/r/eventedit") {
    u.pathname = `/calendar/u/${u.searchParams.get("authuser") ?? "0"}/r/eventedit`;
  }
  return u;
})();

// The page's own script routes by its path, as Calendar's does: this load reads as the address it stands for.
history.replaceState(null, "", at.pathname + at.search + at.hash);

/** Calendar's location as the recipes read it: Calendar's host, this page's own path as its script moves it. */
const calLocation = {
  get hostname() {
    return "calendar.google.com";
  },
  get host() {
    return "calendar.google.com";
  },
  get origin() {
    return "https://calendar.google.com";
  },
  get protocol() {
    return "https:";
  },
  get pathname() {
    return location.pathname;
  },
  get search() {
    return location.search;
  },
  get hash() {
    return location.hash;
  },
  get href() {
    return `https://calendar.google.com${location.pathname}${location.search}${location.hash}`;
  },
  toString() {
    return this.href;
  },
};

const calDoc = new Proxy(document, {
  get(target, key) {
    if (key === "location") return calLocation;
    const value = Reflect.get(target, key, target);
    return typeof value === "function" ? value.bind(target) : value;
  },
}) as Document;

// The boot block fake Calendar's server writes for this address (tests/fake-google/calendar/server.ts bootFor), from the film's store.
const store = bridge.store;
const today = (zone: string) => utcToZoned(new Date().toISOString(), zone).slice(0, 10);

function dayOfRoute(route: string): string | null {
  const m = /^r\/\w+\/(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(route);
  return m ? `${m[1] ?? ""}-${(m[2] ?? "").padStart(2, "0")}-${(m[3] ?? "").padStart(2, "0")}` : null;
}

function editorFrom(route: string, url: URL): { editor: EditorSeed | null; missing: boolean; day: string | null } {
  const q = url.searchParams;
  const saved = /^r\/eventedit\/([\w-]+)$/.exec(route);
  if (saved) {
    const e = store.events.find((x) => x.id === saved[1] && x.deletedAt === null);
    if (!e) return { editor: null, missing: true, day: null };
    const start = utcToZoned(e.startUtc, e.zone);
    const end = e.allDay ? `${addDays(utcToZoned(e.endUtc, e.zone).slice(0, 10), -1)}T00:00` : utcToZoned(e.endUtc, e.zone);
    return { editor: { id: e.id, title: e.title, start, end, allDay: e.allDay, zone: e.zone, where: e.where, details: e.details, guests: [...e.guests] }, missing: false, day: start.slice(0, 10) };
  }
  if (route !== "r/eventedit") return { editor: null, missing: false, day: dayOfRoute(route) };
  const zone = q.get("ctz") || store.zone;
  const when = parseDates(q.get("dates") ?? "", zone);
  const hour = `${today(zone)}T${String(Math.min(23, new Date().getHours() + 1)).padStart(2, "0")}:00`;
  const start = when?.start ?? hour;
  return {
    editor: {
      id: null,
      title: q.get("text") ?? "",
      start,
      end: when?.end ?? `${start.slice(0, 11)}${String(Math.min(23, Number(start.slice(11, 13)) + 1)).padStart(2, "0")}:00`,
      allDay: when?.allDay ?? false,
      zone,
      where: q.get("location") ?? "",
      details: q.get("details") ?? "",
      guests: (q.get("add") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    },
    missing: false,
    day: start.slice(0, 10),
  };
}

const m = /^\/calendar\/u\/(\d+)\/(r(?:\/.*)?)$/.exec(at.pathname);
const account = Number(m?.[1] ?? 0);
const { editor, missing, day } = editorFrom(m?.[2] ?? "r", at);
const boot: CalendarBoot = {
  account,
  me: { name: "Maya Collins", address: store.accounts[account] ?? "" },
  accounts: store.accounts,
  zone: store.zone,
  contacts: store.contacts.filter((c) => c.accounts.includes(account)).map(({ name, address }) => ({ name, address })),
  events: store.events.filter((e) => e.account === account && e.deletedAt === null),
  weekly: account === 0 ? WEEKLY : [],
  // The week a demo tab opens on, as the person left it: the day Cori's last save showed, else today.
  day: day ?? bridge.day ?? today(store.zone),
  editor,
  missing,
};
const block = document.createElement("script");
block.type = "application/json";
block.id = "boot";
block.textContent = JSON.stringify(boot).replace(/</g, "\\u003c");
document.body.append(block);

// Calendar's sync calls (save, delete), answered from the film's store.
const realFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, location.href);
  const s = /^\/calendar\/u\/(\d+)\/sync\/(save|delete)$/.exec(url.pathname);
  if (!s) return realFetch(input, init);
  const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
  const answer = bridge.sync(Number(s[1]), s[2]!, body);
  return new Response(JSON.stringify(answer.body), { status: answer.status, headers: { "content-type": "application/json" } });
};

/** chrome.runtime.connect, for the page script's one port, to the worker part in the top page. */
function connect(info?: { name?: string }): PagePort {
  const onMessage = new Set<(m: unknown) => void>();
  const onDisconnect = new Set<() => void>();
  let open = true;
  const close = () => {
    if (!open) return;
    open = false;
    for (const fn of onDisconnect) fn();
  };
  const port: PagePort = {
    name: info?.name ?? "",
    postMessage: (msg) => open && worker.post(structuredClone(msg)),
    disconnect: () => {
      if (!open) return;
      open = false;
      worker.close();
    },
    onMessage: { addListener: (fn) => onMessage.add(fn), removeListener: (fn) => onMessage.delete(fn) },
    onDisconnect: { addListener: (fn) => onDisconnect.add(fn), removeListener: (fn) => onDisconnect.delete(fn) },
  };
  const worker = bridge.connect(tab, {
    deliver: (msg) => {
      if (!open) return;
      const copied = structuredClone(msg);
      for (const fn of onMessage) fn(copied);
    },
    close,
  });
  addEventListener("pagehide", () => port.disconnect(), { once: true });
  return port;
}
(window as unknown as { chrome: { runtime: Record<string, unknown> } }).chrome.runtime.connect = connect;

/**
 * Coere's Actions page script, as apps/extension/src/entrypoints/actions-page.ts
 * starts it, with two changes for the demo: the recipes read Calendar's
 * address through `calDoc`, and no event counts as the person's own hand
 * in this tab, since the demo's scripted events all read as trusted.
 */
function start(): void {
  let layer: Layer | null = null;
  const layerOnce = (): Layer => (layer ??= createLayer(document));
  const kit = createPageKit({ doc: document, startUrl: calLocation.href, layer: layerOnce });
  const pick = async (description: string): Promise<number | null> => {
    const snap = await kit.handle({ id: "pick", type: "snapshot", step: 0, steps: 0, viewportOnly: false });
    return snap.ok && snap.type === "snapshot" ? pageHost.pick(description, (snap.result as Snapshot).elements) : null;
  };
  let anchorBox: ViewBox | null = null;
  let redrawCard: (() => void) | null = null;
  const preview = {
    layer: () => layerOnce().root,
    emit: (e: Parameters<typeof pageHost.emit>[0]) => pageHost.emit(e),
    anchor: (box: ViewBox | null) => {
      anchorBox = box;
      redrawCard?.();
    },
    goBackLabel: copy.GO_BACK,
    alive: () => layer !== null,
  };
  const env = pageEnv(calDoc, pick, (n) => kit.session.element(n), preview);
  // Cori's own presses and typing, as the page env makes them, each after the beat the film gives it, so a person can follow.
  const beat = bridge.beat;
  const paced = {
    ...env,
    click: async (el: Element) => {
      await beat("click");
      return env.click(el);
    },
    type: async (el: HTMLElement, text: string, replace: boolean) => {
      await beat("type");
      return env.type(el, text, replace);
    },
    key: async (el: Element, key: Parameters<typeof env.key>[1]) => {
      await beat("key");
      return env.key(el, key);
    },
  };
  const recipes = recipeRunner(paced);
  const pageHost = startHost({
    connect: () => (window as unknown as { chrome: { runtime: { connect(i: { name: string }): PagePort } } }).chrome.runtime.connect({ name: PAGE_PORT }),
    kit: {
      handle: (req) => kit.handle(req),
      dispose: () => {
        kit.dispose();
        layer?.remove();
        layer = null;
      },
    },
    overlay: (onPress) =>
      mountOverlay(layerOnce().root, /Mac/i.test(navigator.platform), onPress, undefined, {
        box: () => anchorBox,
        listen: (redraw) => (redrawCard = redraw),
      }),
    recipes,
    watchPerson: (on) => watchPerson(document, on, { trusted: () => false }),
  });
}

Object.assign(window, { __coereActionsStart: start });
