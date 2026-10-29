import { down, hitAt, Hover, insert, key, up, wheel, type Point } from "./input";
import { cardHtml, STAGE } from "./look";
import { resolve, type Query } from "./query";
import type { Person } from "./tab/dress";
import type { World } from "./world";

/**
 * What a film's script works with: the same moves as coere-v2's
 * tools/demo-video scripts (open a tab, film it, glide, click, type,
 * press, rest, title cards), done in the page on the real code, so a film
 * ports line by line. While the player skips ahead to a chapter, waits end
 * at once and text goes in whole, so it gets there quickly and in the
 * same state.
 */
export type Tab = { name: string; frame: HTMLIFrameElement; doc: Document; win: Window };

/** A replica chat site's setup: which site it stands for, whose account, and what it answers, in turn. */
export type SiteSetup = { host: string; path?: string; person: Person; replies?: readonly string[]; modes?: Record<string, unknown> };

export type View = { x: number; y: number; w: number };

export type StageHooks = {
  fast(): boolean;
  chapter(id: string): void;
  gate(): Promise<void>;
};

/** Slow at both ends, as a hand starts and settles. */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const RESTING = { x: 1480, y: 940 };
const frame = () => new Promise<void>((done) => requestAnimationFrame(() => done()));

export class Stage {
  readonly sites = new Map<string, SiteSetup>();
  private readonly tabs = new Map<string, Tab>();
  private readonly ready = new Map<string, () => void>();
  private readonly hovers = new WeakMap<Tab, Hover>();
  private on: Tab | null = null;
  private at: Point = { x: 720, y: 560 };

  constructor(
    readonly world: World,
    private readonly el: { tabs: HTMLElement; card: HTMLElement; pointer: HTMLElement; caption: HTMLElement; camera: HTMLElement },
    private readonly hooks: StageHooks,
  ) {}

  get fast(): boolean {
    return this.hooks.fast();
  }

  /** Opens a page in a tab of its own, off screen, and waits until it has drawn (and, on a chat site, until Coere has started on it). */
  async open(name: string, src: string, site?: SiteSetup): Promise<Tab> {
    this.tabs.get(name)?.frame.remove();
    if (site) this.sites.set(name, site);
    const frame = document.createElement("iframe");
    frame.dataset.tab = name;
    frame.title = "";
    const started = site ? new Promise<void>((done) => this.ready.set(name, done)) : Promise.resolve();
    const loaded = new Promise<void>((done) => frame.addEventListener("load", () => done(), { once: true }));
    frame.src = src;
    this.el.tabs.append(frame);
    await loaded;
    await Promise.race([started, new Promise((r) => setTimeout(r, 8000))]);
    const tab = { name, frame, doc: frame.contentDocument!, win: frame.contentWindow! };
    this.tabs.set(name, tab);
    await tab.doc.fonts?.ready;
    return tab;
  }

  /** Called by a chat site's tab once Coere's content script has started on it. */
  started(name: string): void {
    this.ready.get(name)?.();
  }

  /** Puts a tab on screen, as the director films it; the one before fades out. */
  async film(tab: Tab): Promise<void> {
    this.el.card.classList.remove("on");
    for (const t of this.tabs.values()) t.frame.classList.toggle("on", t === tab);
    this.on = tab;
    await this.rest();
    await this.wait(300);
  }

  close(tab: Tab): void {
    tab.frame.remove();
    this.tabs.delete(tab.name);
    if (this.on === tab) this.on = null;
  }

  /** A title card on screen for `ms`. */
  async card(title: string, line?: string, ms = 3000): Promise<void> {
    this.el.card.innerHTML = cardHtml(title, line);
    this.el.card.classList.add("on");
    this.pointer(false);
    await this.wait(ms);
  }

  /** Starts a chapter; the player may skip to one, or end the run at one. */
  chapter(id: string): void {
    this.hooks.chapter(id);
  }

  /** The caption line, shown only when the page was asked for captions. */
  say(line: string): void {
    this.el.caption.textContent = line;
  }

  async wait(ms: number): Promise<void> {
    await this.hooks.gate();
    if (this.fast) return frame();
    await new Promise((r) => setTimeout(r, ms));
  }

  /** Waits until a query finds a drawn element in the tab, as a locator's waitFor does. */
  async waitFor(tab: Tab, query: Query, timeout = 20_000): Promise<Element> {
    const until = Date.now() + timeout;
    for (;;) {
      const el = resolve(tab.doc, query);
      if (el) return el;
      if (Date.now() > until) throw new Error(`${tab.name}: nothing found for ${String(query)}`);
      await new Promise((r) => setTimeout(r, 50));
    }
  }

  /** Whether a query finds something now, without waiting. */
  has(tab: Tab, query: Query): boolean {
    return resolve(tab.doc, query) !== null;
  }

  /** The point on the stage in the middle of what a query finds, after scrolling it into view. */
  async centerOf(tab: Tab, query: Query): Promise<Point> {
    const el = await this.waitFor(tab, query);
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
    const box = el.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  }

  /** Moves the pointer the way a hand does: eased, bowed a little, timed by the distance. */
  async moveTo(to: Point, o: { ms?: number; straight?: boolean } = {}): Promise<void> {
    const from = this.at;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const d = Math.hypot(dx, dy);
    this.pointer(true);
    if (this.fast || d < 1) return this.place(to);
    const ms = o.ms ?? Math.min(900, 240 + d * 0.5);
    const bow = o.straight ? 0 : Math.min(36, d * 0.04) * (dx >= 0 ? 1 : -1);
    const start = performance.now();
    for (;;) {
      await this.hooks.gate();
      const t = Math.min(1, (performance.now() - start) / ms);
      const e = ease(t);
      const arc = Math.sin(Math.PI * e) * bow;
      this.place({ x: from.x + dx * e + (-dy / d) * arc, y: from.y + dy * e + (dx / d) * arc });
      if (t >= 1) break;
      await frame();
    }
  }

  async glide(tab: Tab, query: Query): Promise<void> {
    await this.moveTo(await this.centerOf(tab, query));
  }

  /** A click as a person makes it: glide there, a short beat, press, and follow the target if it moved meanwhile. */
  async click(tab: Tab, query: Query, o: { after?: number; button?: number; count?: number } = {}): Promise<void> {
    let p = await this.centerOf(tab, query);
    await this.moveTo(p);
    await this.wait(180);
    const now = await this.centerOf(tab, query);
    if (Math.hypot(now.x - p.x, now.y - p.y) > 3) await this.moveTo((p = now), { ms: 220 });
    await this.pressAt(tab, p, o.button ?? 0, o.count ?? 1);
    await this.wait(o.after ?? 450);
  }

  async clickAt(tab: Tab, p: Point, o: { after?: number; button?: number; count?: number } = {}): Promise<void> {
    await this.moveTo(p);
    await this.wait(180);
    await this.pressAt(tab, p, o.button ?? 0, o.count ?? 1);
    await this.wait(o.after ?? 450);
  }

  private async pressAt(tab: Tab, p: Point, button: number, count: number): Promise<void> {
    for (let n = 1; n <= count; n++) {
      this.el.pointer.classList.add("down");
      const pressed = down(tab.doc, p, button, n);
      await this.wait(60);
      up(tab.doc, p, pressed, button, n);
      this.el.pointer.classList.remove("down");
    }
  }

  /** Types into what has the focus, one key at a time, with a person's small unevenness. */
  async type(tab: Tab, value: string, delay = 55): Promise<void> {
    if (this.fast) return insert(tab.doc, value);
    for (const ch of value) {
      await this.hooks.gate();
      key(tab.doc, ch);
      await new Promise((r) => setTimeout(r, delay * (0.7 + Math.random() * 0.6)));
    }
  }

  /** One key, or a combination such as "Meta+k". */
  async press(tab: Tab, combo: string, after = 120): Promise<void> {
    key(tab.doc, combo);
    await this.wait(after);
  }

  /** Moves the pointer aside, off the page, where it hovers nothing, and lets it fade. */
  async rest(): Promise<void> {
    await this.moveTo(RESTING);
    this.pointer(false);
  }

  /** Scrolls under the pointer, smoothly, as a trackpad does. */
  async wheel(tab: Tab, dy: number, steps = 12): Promise<void> {
    for (let i = 0; i < steps; i++) {
      wheel(tab.doc, this.at, dy / steps);
      await this.wait(30);
    }
  }

  /** Eases the view onto part of the stage (in the stage's pixels), or back to all of it. */
  async camera(view: View | null, ms = 1200): Promise<void> {
    const w = view ? Math.max(360, Math.min(STAGE.width, view.w)) : STAGE.width;
    const scale = STAGE.width / w;
    const h = STAGE.height / scale;
    const x = view ? Math.min(Math.max(0, view.x), STAGE.width - w) : 0;
    const y = view ? Math.min(Math.max(0, view.y), STAGE.height - h) : 0;
    this.el.camera.style.transition = this.fast ? "none" : `transform ${ms}ms cubic-bezier(0.22, 1, 0.36, 1)`;
    this.el.camera.style.transform = `scale(${scale}) translate(${-x}px, ${-y}px)`;
    await this.wait(ms);
  }

  /** The element drawn at a stage point in a tab, for scripts that need it. */
  hit(tab: Tab, p: Point): Element | null {
    return hitAt(tab.doc, p);
  }

  private place(p: Point): void {
    this.at = p;
    this.el.pointer.style.left = `${p.x}px`;
    this.el.pointer.style.top = `${p.y}px`;
    if (this.on) {
      const hover = this.hovers.get(this.on) ?? new Hover();
      this.hovers.set(this.on, hover);
      hover.move(this.on.doc, p);
    }
  }

  private pointer(show: boolean): void {
    this.el.pointer.style.opacity = show ? "1" : "0";
  }
}
