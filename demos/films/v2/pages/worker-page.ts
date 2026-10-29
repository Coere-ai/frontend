import type { Snapshot, ViewBox } from "@v2/packages/actions/src";
import { overlay as copy } from "@v2/packages/actions/src/copy";
import { createLayer, createPageKit, watchPerson, type Layer } from "@v2/packages/actions/src/page";
import { pageEnv, recipeRunner } from "@v2/packages/actions/src/recipes";
import { startHost } from "@v2/apps/extension/src/actions/page/host";
import { mountOverlay } from "@v2/apps/extension/src/actions/page/overlay";
import type { PortLike } from "@v2/apps/extension/src/actions/run/page-link";

/**
 * Copied from the workers film (demos/films/workers/worker-page.ts).
 *
 * The Coere Actions page script in a worker's tab (entrypoints/actions-page.ts,
 * started the same way): the page kit reads the page on rung 1 and draws
 * its sketch for the grid's preview, the search recipe reads a results
 * page's rows, and the host answers the worker over its port and draws
 * the worker's glow and bar. The tab is a frame of the demo that holds a
 * page of coere-v2's fake web, so two things differ: the kit and the
 * recipes read the page at the site's own address, as they do on the
 * site, and a box is measured in the tab, which is the top window of its
 * own window in the browser. The worker's side injects it by calling
 * `__workerStart` with the page's end of a port.
 */
type Win = Window & { __demoAddress?: string; __workerStart?: (port: PortLike) => void };
const win = window as Win;
const address = win.__demoAddress ?? location.href;

/** The document at the site's own address, as the kit and the recipes read it on the site. */
function docAt(doc: Document, href: string): Document {
  const url = new URL(href);
  const at = { href: url.href, origin: url.origin, protocol: url.protocol, host: url.host, hostname: url.hostname, pathname: url.pathname, search: url.search, hash: url.hash, toString: () => url.href };
  return new Proxy(doc, {
    get(target, key) {
      if (key === "location") return at;
      if (key === "URL" || key === "documentURI") return url.href;
      const value = Reflect.get(target, key, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

function start(port: PortLike): void {
  const doc = docAt(document, address);
  let layer: Layer | null = null;
  const layerOnce = (): Layer => (layer ??= createLayer(document));
  const rect = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  };
  const kit = createPageKit({ doc, startUrl: address, layer: layerOnce, env: { rect } });
  const pick = async (description: string): Promise<number | null> => {
    const snap = await kit.handle({ id: "pick", type: "snapshot", step: 0, steps: 0, viewportOnly: false });
    return snap.ok && snap.type === "snapshot" ? host.pick(description, (snap.result as Snapshot).elements) : null;
  };
  let anchorBox: ViewBox | null = null;
  let redrawCard: (() => void) | null = null;
  const preview = {
    layer: () => layerOnce().root,
    emit: (e: Parameters<typeof host.emit>[0]) => host.emit(e),
    anchor: (box: ViewBox | null) => {
      anchorBox = box;
      redrawCard?.();
    },
    goBackLabel: copy.GO_BACK,
    alive: () => layer !== null,
  };
  const recipes = recipeRunner(pageEnv(doc, pick, (n) => kit.session.element(n), preview));
  const host = startHost({
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
  // A load takes the script away with the page, and its port closes, as Chrome closes it.
  addEventListener("pagehide", () => port.disconnect(), { once: true });
}

win.__workerStart = start;
