import type { World } from "../world";

/**
 * The `chrome` object Coere's code reaches for, in a tab of a live demo.
 * Each call goes to the World in the demo's top page, so every tab shares
 * one extension, as in the browser. Values cross between the two pages by
 * structured clone, so each page only ever holds its own objects.
 */
export function installChrome(world: World, tab: string, assets: string): void {
  const copy = <T>(value: T): T => (value === undefined ? value : structuredClone(value));

  const area = (name: string) => ({
    get(keys?: string | string[] | Record<string, unknown> | null) {
      const store = world.stores[name] ?? {};
      if (keys == null) return Promise.resolve(copy(store));
      const list = typeof keys === "string" ? [keys] : Array.isArray(keys) ? keys : Object.keys(keys);
      const defaults = typeof keys === "object" && !Array.isArray(keys) ? keys : {};
      const out: Record<string, unknown> = {};
      for (const key of list) {
        if (key in store) out[key] = copy(store[key]);
        else if (key in defaults) out[key] = defaults[key];
      }
      return Promise.resolve(out);
    },
    set(items: Record<string, unknown>) {
      world.write(name, copy(items));
      return Promise.resolve();
    },
    remove(keys: string | string[]) {
      world.remove(name, typeof keys === "string" ? [keys] : keys);
      return Promise.resolve();
    },
    clear() {
      world.remove(name, Object.keys(world.stores[name] ?? {}));
      return Promise.resolve();
    },
    onChanged: event<(changes: unknown) => void>((fn) => world.watchStorage((changes, where) => where === name && fn(copy(changes)), tab)),
  });

  const chrome = {
    runtime: {
      id: "coere",
      lastError: undefined,
      getURL: (path: string) => assets + path.replace(/^\//, ""),
      getManifest: () => ({ version: "2.0.0", name: "Coere" }),
      sendMessage: async (message: unknown) => copy(await world.handle(copy(message) as never, tab)),
      connect: () => port(),
      onMessage: event<(message: unknown, sender: unknown, reply: (a: unknown) => void) => unknown>((fn) =>
        world.listen(tab, (message, sender, reply) => fn(copy(message), sender, reply)),
      ),
      onConnect: event(() => () => undefined),
    },
    storage: {
      local: area("local"),
      session: area("session"),
      sync: area("sync"),
      onChanged: event<(changes: unknown, area: string) => void>((fn) => world.watchStorage((changes, where) => fn(copy(changes), where), tab)),
    },
    i18n: { getUILanguage: () => "en-US", getMessage: () => "" },
    tabs: { sendMessage: (_tab: number, message: unknown) => world.tell(copy(message)), query: async () => [], create: async () => ({}) },
  };
  // A frame without the clipboard permission rejects Copy; a demo's Copy only has to succeed.
  if (navigator.clipboard) Object.defineProperty(navigator.clipboard, "writeText", { value: () => Promise.resolve(), configurable: true });
  const whole = fallback(chrome);
  Object.assign(window, { chrome: whole, browser: whole });
}

/**
 * Any other chrome API a page touches (tabs events, windows, permissions,
 * alarms): its events take listeners and never fire, and its calls answer
 * nothing, as an extension with nothing to report would.
 */
function fallback<T extends object>(known: T): T {
  const stub = (): unknown =>
    new Proxy(() => Promise.resolve(undefined), {
      get: (_t, key) => (typeof key === "string" && /^on[A-Z]/.test(key) ? event(() => () => undefined) : key === "then" ? undefined : stub()),
    });
  const wrap = (obj: object): unknown =>
    new Proxy(obj, {
      get(target, key) {
        if (key in target) {
          const value = Reflect.get(target, key);
          return value && typeof value === "object" && !Array.isArray(value) && !("addListener" in value) ? wrap(value) : value;
        }
        if (typeof key !== "string" || key === "then") return undefined;
        return /^on[A-Z]/.test(key) ? event(() => () => undefined) : stub();
      },
    });
  return wrap(known) as T;
}

/** A chrome event object: addListener and removeListener, wired to a subscribe that returns its own stop. */
function event<F>(subscribe: (fn: F) => () => void) {
  const stops = new Map<F, () => void>();
  return {
    addListener(fn: F) {
      stops.set(fn, subscribe(fn));
    },
    removeListener(fn: F) {
      stops.get(fn)?.();
      stops.delete(fn);
    },
    hasListener: (fn: F) => stops.has(fn),
  };
}

/** A port nothing listens on; long uploads in a film are answered by message instead. */
function port() {
  const none = event(() => () => undefined);
  return { name: "", postMessage: () => undefined, disconnect: () => undefined, onMessage: none, onDisconnect: none };
}
