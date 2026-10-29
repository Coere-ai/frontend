import type { World, Message } from "../../stage/world";

/**
 * Coere's engine worker for this film, as the World answers it: every
 * engine and memory call the real code makes in any tab goes here. In
 * record mode (`?rec=` on the page, with record/server.mts running) each
 * call goes to the real engine and memory core in Node, which keep the
 * answers. Otherwise the film plays back those answers (data/tape.json):
 * the same call, at the same point of the film, gets what the real code
 * said then, and memory's events reach the tabs when they came.
 *
 * The film is told in parts (`phase`), the ones the recorder kept. A part
 * whose length is given plays the recording faster or slower, so a build
 * the real pipeline took a minute over fits the shot the film gives it.
 */
type Answer = { ok: true; result: unknown } | { ok: false; error: { code: string; message: string } };
type TapePhase = { name: string; ms: number; calls: [number, string, string][]; events: [number, unknown][] };
export type Tape = { pool: Record<string, unknown>; phases: TapePhase[] };
export type PhaseOptions = { ms?: number; speed?: number; claude?: number; jev?: number; scenario?: string; actions?: string[]; gap?: number };

/** Arguments as a stable key: object keys sorted, as the recorder keys them. */
export function keyOf(method: string, args: unknown): string {
  const sort = (v: unknown): unknown =>
    Array.isArray(v) ? v.map(sort) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sort((v as Record<string, unknown>)[k])])) : v;
  return `${method} ${JSON.stringify(sort(args) ?? null)}`;
}

type Entry = { t: number; ans: string };

class Indexed {
  readonly byKey = new Map<string, Entry[]>();
  readonly byMethod = new Map<string, Entry[]>();
  constructor(readonly phase: TapePhase) {
    for (const [t, key, ans] of phase.calls) {
      const method = key.slice(0, key.indexOf(" "));
      for (const [map, k] of [[this.byKey, key], [this.byMethod, method]] as const) {
        const list = map.get(k) ?? [];
        list.push({ t, ans });
        map.set(k, list);
      }
    }
  }
}

/** The latest entry at or before t, else null. */
const upTo = (list: Entry[] | undefined, t: number): Entry | null => {
  let found: Entry | null = null;
  for (const e of list ?? []) if (e.t <= t) found = e;
  return found;
};

export class FilmEngine {
  private readonly phases: Indexed[];
  private at = 0;
  private started = 0;
  private scale = 1;
  private queue: [number, unknown][] = [];
  /** How far into the current part its events have come, in the part's own ms. */
  private heard = 0;
  private lastTick = performance.now();
  private sinceEvent = 0;
  private timer: number;
  readonly misses: string[] = [];

  /** Whether calls go to the recorder now: from the part `recFrom` names on, or from the start without one. */
  private live: boolean;

  constructor(
    private readonly world: World,
    private readonly tape: Tape | null,
    private readonly recorder: string | null,
    private readonly recFrom: string | null = null,
  ) {
    this.live = Boolean(recorder) && !recFrom;
    this.phases = (tape?.phases ?? []).map((p) => new Indexed(p));
    this.started = performance.now();
    // Memory's events reach every tab, as the worker broadcasts them.
    this.timer = window.setInterval(() => void this.tick(), recorder ? 200 : 100);
    const handle = world.handle.bind(world);
    const known = (world as unknown as { methods: Map<string, unknown> }).methods;
    world.handle = async (message: Message, tab: string) => {
      if (message?.type === "engine.call" && !known.has(String(message.method))) return this.answer(String(message.method), message.args);
      return handle(message, tab);
    };
  }

  stop(): void {
    clearInterval(this.timer);
  }

  /** Starts a part of the film; `ms` is how long this telling gives it. */
  /** The recorder, while calls go to it. */
  private get rec(): string | null {
    return this.live ? this.recorder : null;
  }

  async phase(name: string, o: PhaseOptions = {}): Promise<void> {
    if (name === this.recFrom) this.live = true;
    if (this.rec) {
      await fetch(`${this.rec}/phase`, { method: "POST", body: JSON.stringify({ name, ...o }) }).catch(() => undefined);
      return;
    }
    const i = this.phases.findIndex((p, n) => n >= this.at && p.phase.name === name);
    if (i < 0) {
      console.warn("tape has no part", name);
      return;
    }
    this.at = i;
    this.started = performance.now();
    const p = this.phases[i]!.phase;
    this.scale = o.ms ? p.ms / o.ms : 1;
    this.queue = [...p.events];
    this.heard = 0;
    this.lastTick = performance.now();
  }

  /** While the player skips ahead unseen, each part reads as it ended. */
  fast: () => boolean = () => false;

  /** Where the recording is now, in the current part's own ms. */
  private now(): number {
    return this.fast() ? Infinity : (performance.now() - this.started) * this.scale;
  }

  async answer(method: string, args: unknown): Promise<Answer> {
    if (this.rec) {
      const r = await fetch(`${this.rec}/call`, { method: "POST", body: JSON.stringify({ method, args }) });
      return (await r.json()) as Answer;
    }
    const key = keyOf(method, args);
    const found = this.find((p) => p.byKey.get(key)) ?? this.find((p) => p.byMethod.get(method));
    if (!found) {
      this.misses.push(key.slice(0, 300));
      return { ok: true, result: null };
    }
    return structuredClone(this.tape!.pool[found.ans]) as Answer;
  }

  /** The answer for now: this part's latest so far, else the last one an earlier part gave, else this part's first. */
  private find(list: (p: Indexed) => Entry[] | undefined): Entry | null {
    const here = upTo(list(this.phases[this.at]!), this.now());
    if (here) return here;
    for (let i = this.at - 1; i >= 0; i--) {
      const l = list(this.phases[i]!);
      if (l?.length) return l[l.length - 1]!;
    }
    const first = list(this.phases[this.at]!)?.[0];
    if (first) return first;
    // A call the recording only saw later in the film reads as it was answered then.
    for (let i = this.at + 1; i < this.phases.length; i++) {
      const l = list(this.phases[i]!);
      if (l?.length) return l[0]!;
    }
    return null;
  }

  private async tick(): Promise<void> {
    if (this.rec) {
      const r = await fetch(`${this.rec}/events?since=${this.sinceEvent}`).catch(() => null);
      if (!r?.ok) return;
      const { next, events } = (await r.json()) as { next: number; events: unknown[] };
      this.sinceEvent = next;
      for (const event of events) this.world.tell({ ch: "coere", type: "engine.event", event });
      return;
    }
    // Events keep their order and come twenty times as fast while the player skips: a page opened meanwhile still hears the ones it waits for.
    const now = performance.now();
    this.heard += (now - this.lastTick) * this.scale * (this.fast() ? 20 : 1);
    this.lastTick = now;
    const t = this.heard;
    while (this.queue.length && this.queue[0]![0] <= t) this.world.tell({ ch: "coere", type: "engine.event", event: this.queue.shift()![1] });
  }
}
