import { PAGE_PORT, type Snapshot } from "@coere/actions";
import { overlay as copy } from "@coere/actions/copy";
import { createFormEngine } from "@coere/actions/forms";
import { createLayer, createPageKit, watchPerson, type Layer } from "@coere/actions/page";
import { pageEnv, recipeRunner } from "@coere/actions/recipes";
import { startHost } from "@v2/apps/extension/src/actions/page/host";
import { chromeBarPlace } from "@v2/apps/extension/src/actions/page/bar-place";
import { mountOverlay } from "@v2/apps/extension/src/actions/page/overlay";
import type { DemoHost } from "../../stage/host";
import { installChrome } from "../../stage/tab/chrome";
import type { PagesBridge } from "./bridge";

/**
 * A web page in a tab of the film: the page coere-v2's fake server makes
 * for the tab's address (the quiz, the intake form), written into this
 * document as it loads, and Coere's Actions page script, which the film's
 * worker part injects when a run asks for the tab, as the extension does.
 * The page's own requests and moves go where a browser would send them:
 * its calls to its server go to that server in the top page, and a link
 * or a script that moves to another of the site's addresses loads that
 * address in this tab. Four things stand in for what a real tab is: the
 * page reads its site's address as its own (its base address and
 * document.URL), the tab is a top window with no frame around it, Coere's
 * layer is open so the scripted hand can press its buttons, and no event
 * counts as the person's own hand, since the demo's events all read as
 * trusted.
 */
const host = (parent as unknown as { __demo: DemoHost }).__demo;
const tab = (frameElement as HTMLIFrameElement).dataset.tab ?? "";
const bridge = host.extra.anywhere as PagesBridge;

/** The site's address this load stands for. */
const at = new URL(new URLSearchParams(location.search).get("at") ?? "https://quiz.northfield.edu/");
const here = () => new URL(location.hash, at).href;
/** This tab's own address for a site's address. */
const pageFor = (url: URL) => `${location.origin}${location.pathname}?at=${encodeURIComponent(url.origin + url.pathname + url.search)}${url.hash}`;

installChrome(host.world, tab, host.assets);
bridge.arrived(tab, at.href);

// The page resolves its links against its own site, and reads that address as its own.
const base = document.createElement("base");
base.href = at.href;
document.head.append(base);
Object.defineProperty(document, "URL", { get: here, configurable: true });
Object.defineProperty(document, "documentURI", { get: here, configurable: true });

// A tab is a top window: nothing outside it is part of its page.
Object.defineProperty(window, "frameElement", { get: () => null, configurable: true });
(window as unknown as { parent: Window }).parent = window;

// Coere's layer, open in the demo so the hand can find its buttons, as coere-v2's kit specs open it.
const attach = Element.prototype.attachShadow;
Element.prototype.attachShadow = function (this: Element, init: ShadowRootInit) {
  return attach.call(this, this.localName === "coere-layer" ? { ...init, mode: "open" } : init);
};

// The page's calls to its own server, answered by that server in the top page.
const realFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, document.baseURI);
  if (url.protocol !== "https:") return realFetch(input, init);
  const answer = await bridge.serve(init?.method ?? "GET", url.href, typeof init?.body === "string" ? init.body : null);
  return new Response(answer.body as BodyInit, { status: answer.status, headers: { "content-type": answer.contentType, ...answer.headers } });
};

/** A move to another of the site's addresses loads it in this tab, as the browser would load the real one. */
type NavigateEvent = Event & { destination: { url: string }; canIntercept: boolean; hashChange: boolean; cancelable: boolean };
const navigation = (window as unknown as { navigation?: EventTarget }).navigation;
navigation?.addEventListener("navigate", (event) => {
  const e = event as NavigateEvent;
  const to = new URL(e.destination.url);
  if (to.origin === location.origin && to.pathname === location.pathname) return;
  if (e.hashChange) return;
  e.preventDefault();
  const site = to.origin === location.origin ? new URL(to.pathname + to.search + to.hash, at) : to;
  location.assign(pageFor(site));
});
addEventListener("pagehide", () => bridge.leaving(tab));
addEventListener("load", () => bridge.loaded(tab), { once: true });

// The page itself, as the server answers its address, written in while this document is still being read.
document.write(String(bridge.page(at.href).body));

/** chrome.runtime.connect, for the page script's one port, to the worker part in the top page. */
type Fn<T = unknown> = (m: T) => void;
function connect(info?: { name?: string }) {
  const onMessage = new Set<Fn>();
  const onDisconnect = new Set<() => void>();
  let open = true;
  const port = {
    name: info?.name ?? "",
    postMessage: (m: unknown) => open && worker.post(structuredClone(m)),
    disconnect: () => {
      if (!open) return;
      open = false;
      worker.close();
    },
    onMessage: { addListener: (fn: Fn) => onMessage.add(fn), removeListener: (fn: Fn) => onMessage.delete(fn) },
    onDisconnect: { addListener: (fn: () => void) => onDisconnect.add(fn), removeListener: (fn: () => void) => onDisconnect.delete(fn) },
  };
  const worker = bridge.connect(tab, {
    deliver: (m) => {
      if (!open) return;
      for (const fn of onMessage) fn(structuredClone(m));
    },
    close: () => {
      if (!open) return;
      open = false;
      for (const fn of onDisconnect) fn();
    },
  });
  addEventListener("pagehide", () => port.disconnect(), { once: true });
  return port;
}
(window as unknown as { chrome: { runtime: Record<string, unknown> } }).chrome.runtime.connect = connect;

/** The document as the recipes read it: this page, at the site's own address (the search recipe checks it is on an engine). */
function docAt(doc: Document): Document {
  const at = () => {
    const url = new URL(here());
    return { href: url.href, origin: url.origin, protocol: url.protocol, host: url.host, hostname: url.hostname, pathname: url.pathname, search: url.search, hash: url.hash, toString: () => url.href };
  };
  return new Proxy(doc, {
    get(target, key) {
      if (key === "location") return at();
      const value = Reflect.get(target, key, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

/** Coere's Actions page script, as apps/extension/src/entrypoints/actions-page.ts starts it. */
function start(): void {
  let layer: Layer | null = null;
  const layerOnce = (): Layer => (layer ??= createLayer(document));
  const kit = createPageKit({ doc: document, startUrl: here(), layer: layerOnce });
  const pick = async (description: string): Promise<number | null> => {
    const snap = await kit.handle({ id: "pick", type: "snapshot", step: 0, steps: 0, viewportOnly: false });
    return snap.ok && snap.type === "snapshot" ? pageHost.pick(description, (snap.result as Snapshot).elements) : null;
  };
  const preview = {
    layer: () => layerOnce().root,
    emit: (e: Parameters<typeof pageHost.emit>[0]) => pageHost.emit(e),
    anchor: () => undefined,
    goBackLabel: copy.GO_BACK,
    alive: () => layer !== null,
  };
  const recipes = recipeRunner(pageEnv(docAt(document), pick, (n) => kit.session.element(n), preview));
  // The form engine reads and fills the page's form (20.1), on the kit's own view of the page.
  const forms = createFormEngine(kit.env);
  const pageHost = startHost({
    connect: () => connect({ name: PAGE_PORT }) as never,
    kit: {
      handle: (req) => kit.handle(req),
      dispose: () => {
        kit.dispose();
        layer?.remove();
        layer = null;
      },
    },
    overlay: (onPress) => mountOverlay(layerOnce().root, /Mac/i.test(navigator.platform), onPress, chromeBarPlace(at.host)),
    recipes,
    forms: (call) => forms.handle(call),
    watchPerson: (on) => watchPerson(document, on, { trusted: () => false }),
  });
}

Object.assign(window, { __coereActionsStart: start });
