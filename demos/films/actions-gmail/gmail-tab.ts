import { PAGE_PORT, type Snapshot, type ViewBox } from "@coere/actions";
import { overlay as copy } from "@coere/actions/copy";
import { createLayer, createPageKit, watchPerson, type Layer } from "@coere/actions/page";
import { pageEnv, recipeRunner } from "@coere/actions/recipes";
import { startHost } from "@v2/apps/extension/src/actions/page/host";
import { mountOverlay } from "@v2/apps/extension/src/actions/page/overlay";
import type { DemoHost } from "../../stage/host";
import { installChrome } from "../../stage/tab/chrome";
import type { GmailBridge, PagePort } from "./bridge";

/**
 * Fake Gmail's tab in the film: coere-v2's own Gmail page (gmail-pages.mts
 * wrote it, with this script where its boot block was), and Coere's
 * Actions page script, which the film's service worker part injects as
 * the extension does. Three things stand in for what a browser gives the
 * page in the extension: the boot block and the sync calls answer from
 * the film's store (as tests/fake-google/gmail/server.ts does), the page
 * port runs to the worker part in the top page, and the recipes read the
 * address Gmail would have, since this tab's own address is the demo's.
 */
const host = (parent as unknown as { __demo: DemoHost }).__demo;
const tab = (frameElement as HTMLIFrameElement).dataset.tab ?? "";
const bridge = host.extra.gmail as GmailBridge;
installChrome(host.world, tab, host.assets);

/** The Gmail address this load stands for, from the `at` the worker part loaded it with. */
const at = new URL(new URLSearchParams(location.search).get("at") ?? "https://mail.google.com/mail/u/0/");
const ACCOUNT = 0;
const PATH = `/mail/u/${ACCOUNT}/`;

let pendingHash: string | null = null;

/** Gmail's location as the recipes read it: Gmail's host and path, this page's own hash. */
const gmailLocation = {
  get hostname() {
    return "mail.google.com";
  },
  get host() {
    return "mail.google.com";
  },
  get origin() {
    return "https://mail.google.com";
  },
  get protocol() {
    return "https:";
  },
  get pathname() {
    return PATH;
  },
  // The send's own replaceState drops the query, as Gmail leaves its compose route for the mailbox.
  get search() {
    return new URLSearchParams(location.search).has("at") ? at.search : "";
  },
  // A thread Cori opened stays on screen a moment before he goes back to the list, so it can be read.
  get hash() {
    return pendingHash ?? location.hash;
  },
  set hash(value: string) {
    const leavesThread = /^#[^/]+\/[^/]+\/[0-9a-f]{8,}$|^#(inbox|sent|drafts|starred)\/[0-9a-f]{8,}$/.test(location.hash);
    if (!leavesThread || !bridge.paced()) {
      location.hash = value;
      return;
    }
    pendingHash = value;
    setTimeout(() => {
      if (pendingHash === value) {
        pendingHash = null;
        location.hash = value;
      }
    }, 900);
  },
  get href() {
    return `https://mail.google.com${PATH}${this.search}${location.hash}`;
  },
  toString() {
    return this.href;
  },
};

/** The document as the recipes see it: the page's own, at Gmail's address. */
const gmailDoc = new Proxy(document, {
  get(target, key) {
    if (key === "location") return gmailLocation;
    const value = Reflect.get(target, key, target);
    return typeof value === "function" ? value.bind(target) : value;
  },
}) as Document;

// The boot block the server would have written, from the store as it stands now.
const store = bridge.store;
const me = { name: "Maya Collins", address: store.accounts[ACCOUNT] ?? "" };
const boot = {
  account: ACCOUNT,
  me,
  accounts: [...store.accounts],
  threads: store.mailbox.filter((t) => t.account === ACCOUNT),
  drafts: store.drafts.filter((d) => d.account === ACCOUNT),
  sent: store.sent.filter((s) => s.account === ACCOUNT && s.undoneAt === null),
  contacts: store.contacts.filter((c) => c.accounts.includes(ACCOUNT)).map(({ name, address }) => ({ name, address })),
  undoSeconds: store.undoSeconds,
  composeOnly: gmailLocation.search.includes("view=cm"),
};
const block = document.createElement("script");
block.type = "application/json";
block.id = "boot";
block.textContent = JSON.stringify(boot).replace(/</g, "\\u003c");
document.body.append(block);

// Gmail's sync calls (draft, send, undo, discard), answered from the film's store.
const realFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, location.href);
  const m = /^\/mail\/u\/(\d+)\/sync\/(\w+)$/.exec(url.pathname);
  if (!m) return realFetch(input, init);
  const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
  const answer = bridge.sync(Number(m[1]), m[2]!, JSON.parse(JSON.stringify(body)));
  return new Response(JSON.stringify(answer), { headers: { "content-type": "application/json" } });
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
    postMessage: (m) => open && worker.post(structuredClone(m)),
    disconnect: () => {
      if (!open) return;
      open = false;
      worker.close();
    },
    onMessage: { addListener: (fn) => onMessage.add(fn), removeListener: (fn) => onMessage.delete(fn) },
    onDisconnect: { addListener: (fn) => onDisconnect.add(fn), removeListener: (fn) => onDisconnect.delete(fn) },
  };
  const worker = bridge.connect(tab, {
    deliver: (m) => {
      if (!open) return;
      const copy = structuredClone(m);
      for (const fn of onMessage) fn(copy);
    },
    close,
  });
  addEventListener("pagehide", () => port.disconnect(), { once: true });
  return port;
}
const chrome = (window as unknown as { chrome: { runtime: Record<string, unknown> } }).chrome;
chrome.runtime.connect = connect;

/**
 * Coere's Actions page script, as apps/extension/src/entrypoints/actions-page.ts
 * starts it, with two changes for the demo: the recipes read Gmail's
 * address through `gmailDoc`, and no event counts as the person's own
 * hand in this tab, since the demo's scripted events all read as trusted.
 */
function start(): void {
  let layer: Layer | null = null;
  const layerOnce = (): Layer => (layer ??= createLayer(document));
  const kit = createPageKit({ doc: document, startUrl: gmailLocation.href, layer: layerOnce });
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
  const recipes = recipeRunner(pageEnv(gmailDoc, pick, (n) => kit.session.element(n), preview));
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

/**
 * Gmail's full window compose shows the mailbox once its only window is
 * gone: fake Gmail does this after a send, and here after Save & close
 * too, so Cori's tab is never left blank between runs.
 */
addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("compose-root");
  const frame = document.getElementById("frame");
  if (!root || !frame?.classList.contains("compose-only")) return;
  new MutationObserver(() => {
    if (root.childElementCount > 0 || !frame.classList.contains("compose-only")) return;
    frame.classList.remove("compose-only");
    history.replaceState(null, "", `${location.pathname}#inbox`);
    dispatchEvent(new HashChangeEvent("hashchange"));
  }).observe(root, { childList: true });
});

Object.assign(window, { __coereActionsStart: start });
addEventListener("load", () => bridge.loaded(tab), { once: true });
