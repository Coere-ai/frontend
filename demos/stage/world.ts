/**
 * The extension's side of a live demo, kept in the demo's top page. The
 * real content script and dashboard run in the tabs below it and talk to
 * Coere's service worker by chrome.runtime messages; here those messages
 * are answered from the film's own data, the way the e2e harnesses in
 * coere-v2 answer them, so every screen the real code draws is the one it
 * draws for that data. Storage is shared by every tab, as the extension's
 * storage is.
 */

/** A message as the extension sends it: every one carries a `type`, and engine calls a `method`. */
export type Message = { type?: string; method?: string; args?: unknown; [key: string]: unknown };
export type Handler = (message: Message, tab: string) => unknown;

type Listener = (message: unknown, sender: unknown, reply: (answer: unknown) => void) => unknown;
type StorageListener = (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>, area: string) => void;

export class World {
  private readonly types = new Map<string, Handler>();
  private readonly methods = new Map<string, Handler>();
  private readonly listeners = new Map<string, Set<Listener>>();
  private readonly storageListeners = new Set<StorageListener>();
  readonly stores: Record<string, Record<string, unknown>> = { local: {}, session: {}, sync: {} };
  /** Messages nothing answered, with the tab that sent them, for whoever builds a film. */
  readonly unanswered: { tab: string; type: string }[] = [];

  constructor() {
    // What a quiet extension answers at a page's start: no job waiting, nothing new to read.
    this.on("batch.hello", () => null)
      .on("transfer.claim", () => null)
      .engine("knownUpdates", () => ({}));
  }

  /** Answers one message type. */
  on(type: string, handler: Handler): this {
    this.types.set(type, handler);
    return this;
  }

  /** Answers one engine method (an `engine.call` message). */
  engine(method: string, handler: Handler): this {
    this.methods.set(method, handler);
    return this;
  }

  /** Runs a message to its handler and wraps the answer as the service worker's Reply. */
  async handle(message: Message, tab: string): Promise<unknown> {
    const type = String(message?.type ?? "");
    const handler = type === "engine.call" ? this.methods.get(String(message.method)) : this.types.get(type);
    if (!handler) {
      this.unanswered.push({ tab, type: type === "engine.call" ? `engine.${message.method}` : type });
      return { ok: true, result: null };
    }
    try {
      return { ok: true, result: (await handler(message, tab)) ?? null };
    } catch (error) {
      return { ok: false, error: { code: "internal", message: String(error) } };
    }
  }

  /** A tab's chrome.runtime.onMessage listeners. */
  listen(tab: string, listener: Listener): () => void {
    const set = this.listeners.get(tab) ?? new Set();
    set.add(listener);
    this.listeners.set(tab, set);
    return () => set.delete(listener);
  }

  /** Sends a message to the content script or page of one tab, or every tab, as chrome.tabs.sendMessage does. */
  tell(message: unknown, tab?: string): void {
    for (const [name, set] of this.listeners) {
      if (tab && name !== tab) continue;
      for (const listener of set) listener(message, { id: "coere" }, () => undefined);
    }
  }

  /** Writes storage and tells every tab that listens, as chrome.storage.onChanged does. */
  write(area: string, items: Record<string, unknown>): void {
    const store = (this.stores[area] ??= {});
    const changes: Record<string, { oldValue?: unknown; newValue?: unknown }> = {};
    for (const [key, value] of Object.entries(items)) {
      changes[key] = { oldValue: store[key], newValue: value };
      store[key] = value;
    }
    for (const listener of this.storageListeners) listener(changes, area);
  }

  remove(area: string, keys: string[]): void {
    const store = (this.stores[area] ??= {});
    const changes: Record<string, { oldValue?: unknown }> = {};
    for (const key of keys) {
      changes[key] = { oldValue: store[key] };
      delete store[key];
    }
    for (const listener of this.storageListeners) listener(changes, area);
  }

  watchStorage(listener: StorageListener): () => void {
    this.storageListeners.add(listener);
    return () => this.storageListeners.delete(listener);
  }

  /** Forgets every tab's listeners, before a film starts over. */
  reset(): void {
    this.listeners.clear();
    this.storageListeners.clear();
  }
}
