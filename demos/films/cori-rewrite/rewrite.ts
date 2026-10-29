import { PAGE_PORT } from "@v2/packages/actions/src/page-port";
import { engineBrain } from "@v2/apps/extension/src/actions/run/brain";
import type { ActionsChrome } from "@v2/apps/extension/src/actions/run/chrome-actions";
import { RunManager } from "@v2/apps/extension/src/actions/run/manager";
import type { PortLike } from "@v2/apps/extension/src/actions/run/page-link";
import { RUN_POLICIES } from "@v2/apps/extension/src/actions/run/policies";
import type { StartBody } from "@v2/apps/extension/src/actions/run/start";
import { FakeRouterChrome } from "@v2/apps/extension/src/background/router-fake-chrome";
import { startHost } from "@v2/apps/extension/src/actions/page/host";
import { mountOverlay } from "@v2/apps/extension/src/actions/page/overlay";
import { overlay as copy } from "@v2/packages/actions/src/copy";
import { createLayer, createPageKit, watchPerson, type Layer } from "@v2/packages/actions/src/page";
import { pageEnv, recipeRunner } from "@v2/packages/actions/src/recipes";
import type { Snapshot, ViewBox } from "@v2/packages/actions/src";
import { BROWSER_USE_DEFAULT, BROWSER_USE_KEY } from "@v2/apps/extension/src/lib/browser-use";
import "@v2/tests/kit/rewrite/truth";
import type { DemoHost } from "../../stage/host";
import { installChrome } from "../../stage/tab/chrome";

/**
 * Cori Rewrite in a demo tab: the service worker's real run manager
 * (apps/extension/src/actions/run) with Rewrite's runner, and the real
 * Actions page script it injects (entrypoints/actions-page.ts: the page
 * kit, the recipes with Rewrite's change preview, the host and the
 * overlay), which reads the selection, draws Cori's picker and cards,
 * writes the rewrite in and boxes each change. Chrome's tabs and storage
 * are coere-v2's own in-memory fake, as its runtime tests run the
 * manager, and the port is a pair of ends that pass messages as Chrome's
 * do. The model calls go to the demo's World. Three things differ for a
 * page inside a demo's frame: Coere's layer is open, so the scripted hand
 * can find and press its buttons; the page reads as the top window, as a
 * tab is; and the recipes read the site's address, as the page script
 * does on the site itself.
 */
type Win = Window & { __demoAddress?: string; __rewrite?: unknown; chrome?: { runtime: Record<string, unknown> } };
const win = window as Win;
const host = (parent as unknown as { __demo: DemoHost }).__demo;
const tabName = (frameElement as HTMLIFrameElement).dataset.tab ?? "";

// The replica Google pages carry no content script, so this gives them the demo's chrome; Claude's tab already has it.
if (!win.chrome?.runtime?.sendMessage) installChrome(host.world, tabName, host.assets);

// A tab is the top window; the rewrite's geometry adds up frames to the top, and this one is a frame of the demo.
(window as unknown as { parent: Window }).parent = window;

// Coere's layer, open in the demo so the hand can see its buttons, as the kit's own rewrite specs open it.
const attach = Element.prototype.attachShadow;
Element.prototype.attachShadow = function (this: Element, init: ShadowRootInit) {
  return attach.call(this, this.localName === "coere-layer" ? { ...init, mode: "open" } : init);
};

// Fake Gmail and Docs save each change to their server; here the page answers its own sync calls.
const realFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, location.href);
  const sync = /\/mail\/u\/\d+\/sync\/(\w+)$/.exec(url.pathname);
  const save = /\/document\/d\/([\w-]+)\/save$/.exec(url.pathname);
  if (!sync && !save) return realFetch(input, init);
  const body = (() => {
    try {
      return JSON.parse(String(init?.body ?? "{}")) as { id?: string };
    } catch {
      return {};
    }
  })();
  const answer = save ? { id: save[1], saved: true } : sync![1] === "undo" ? { id: body.id, undone: true } : { id: body.id, savedAt: Date.now() };
  return new Response(JSON.stringify(answer), { status: 200, headers: { "content-type": "application/json" } });
};

/** Two ends of one runtime port: what one posts the other hears, a task later and as a copy, as Chrome's ports do. */
function portPair(tabId: number): { page: PortLike; worker: PortLike } {
  type Ends = { heard: Set<(m: unknown) => void>; closed: Set<() => void> };
  const a: Ends = { heard: new Set(), closed: new Set() };
  const b: Ends = { heard: new Set(), closed: new Set() };
  let open = true;
  const end = (me: Ends, other: Ends, sender?: PortLike["sender"]): PortLike => ({
    name: PAGE_PORT,
    sender,
    postMessage(message) {
      if (!open) return;
      const copy = structuredClone(message);
      setTimeout(() => open && other.heard.forEach((fn) => fn(copy)), 0);
    },
    disconnect() {
      if (!open) return;
      open = false;
      setTimeout(() => other.closed.forEach((fn) => fn()), 0);
    },
    onMessage: { addListener: (fn) => void me.heard.add(fn) },
    onDisconnect: { addListener: (fn) => void me.closed.add(fn) },
  });
  return { page: end(a, b), worker: end(b, a, { tab: { id: tabId }, frameId: 0 }) };
}

const router = new FakeRouterChrome();
router.local.set(BROWSER_USE_KEY, { ...BROWSER_USE_DEFAULT, on: true, level: "autonomous", grantedAt: 1 });

let ids = 0;
const newId = () => `demo${++ids}`;
const runtime = win.chrome!.runtime as { sendMessage: (m: unknown) => Promise<unknown> };

/** The document as the recipes read it: this page, at the site's own address (Docs' recipe checks it is on a document). */
function docAt(doc: Document, address: string): Document {
  const url = new URL(address);
  const at = { href: url.href, origin: url.origin, protocol: url.protocol, host: url.host, hostname: url.hostname, pathname: url.pathname, search: url.search, hash: url.hash, toString: () => url.href };
  return new Proxy(doc, {
    get(target, key) {
      if (key === "location") return at;
      const value = Reflect.get(target, key, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

/**
 * The Actions page script's start, as entrypoints/actions-page.ts makes
 * it, on the port the worker's injection hands it.
 */
function startPage(port: PortLike): void {
  let layer: Layer | null = null;
  const layerOnce = (): Layer => (layer ??= createLayer(document));
  const kit = createPageKit({ doc: document, startUrl: location.href, layer: layerOnce });
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
  const recipes = recipeRunner(pageEnv(docAt(document, win.__demoAddress ?? location.href), pick, (n) => kit.session.element(n), preview));
  const pageHost = startHost({
    connect: () => port as never,
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
    watchPerson: (on) => watchPerson(document, on),
  });
}

const chromeActions: ActionsChrome = {
  queryTabs: async () => [],
  // The worker's scripting.executeScript: the page script starts in this page and connects back on a fresh port.
  inject: async (tabId) => {
    setTimeout(() => {
      const { page, worker } = portPair(tabId);
      startPage(page);
      manager.hub.offer(worker);
    }, 0);
    return true;
  },
  capture: async () => null,
  granted: async () => true,
  tabActive: async () => true,
};

const manager = new RunManager({
  router,
  chrome: chromeActions,
  brain: engineBrain((msg) => runtime.sendMessage(msg) as never, newId),
  policies: RUN_POLICIES,
  now: () => Date.now(),
  newId,
});

let tabId: number | null = null;
let runs = 0;

/**
 * What Chrome's Rewrite shortcut (Option Shift R) sends the worker for this
 * tab, or a menu item with its mode: the same start the Rewrite specs send.
 */
async function start(mode: "rewrite" | "improve" | "grammar" | null = null): Promise<unknown> {
  tabId ??= (await router.createTab(win.__demoAddress ?? location.href)).id;
  const n = ++runs;
  const body: StartBody = {
    runId: `rewrite-demo-${n}`,
    surface: mode ? "menu" : "shortcut",
    convId: `conv-demo-${n}`,
    line: "",
    plan: { kind: "text_rewrite", target: "", fields: [{ name: "how", value: "" }, ...(mode ? [{ name: "mode", value: mode }] : [])], confirm: true } as StartBody["plan"],
    tabId,
    model: null,
    origin: null,
  };
  return manager.start(body);
}

win.__rewrite = { start, manager };
