import { HELLO_KEY } from "@v2/apps/extension/src/console/cori/hello";
import type { World } from "../../stage/world";
import built from "./data/build.json";
import apps from "./data/apps.json";

/**
 * The extension's side of the v3 film, every answer one coere-v2's own
 * code gave (bake.mts):
 *
 *   - memory: the real v2.2 build over Maya's chats, played back on the
 *     clock when Build my memory is pressed, and the built memory's reads;
 *   - access: the engine worker's real access layer, paired with a real
 *     coere-server, read at each step of the film (paired, the planner
 *     asks, allowed, used by the SDK and the planner, revoked);
 *   - the strip on ChatGPT: memory.contextFor for the same draft.
 *
 * The film moves `access` from step to step as the terminal shows each
 * command, the way the commands moved the real server.
 */

type Answer = { method: string; args?: unknown; answer: unknown };
type Entry = { t: number; event?: { name: string; [k: string]: unknown }; overview?: unknown; status?: unknown };
type Build = {
  now: number;
  before: { status: unknown; settings: unknown; estimate: { chats: number }; overview: unknown; platforms: Record<string, number> };
  timeline: Entry[];
  answers: Answer[];
  /** The overviews' nodes and edges, each once; an overview lists them by number (bake.mts packed). */
  pool: { nodes: unknown[]; edges: unknown[] };
};
type AppsRead = { status: { [k: string]: unknown }; tokens: unknown[]; log: unknown[]; connects: unknown[]; requests: unknown[] };
export type AccessStep = "paired" | "asked" | "allowed" | "used" | "revoked";
type Apps = {
  phases: Record<AccessStep, AppsRead>;
  decided: unknown;
  sent: Answer[];
  strip: Answer[];
  terminal: {
    connect: { command: string; asked: string; allowed: string };
    context: { command: string; out: string };
    plan: { command: string; out: string };
  };
};
const BUILD = unpacked(built as unknown as Build);
export const APPS = apps as unknown as Apps;

/** Each overview with its own nodes and edges again, from the pool. */
function unpacked(b: Build): Build {
  type Packed = { nodes: number[]; edges: number[] };
  const open = (o: unknown) => {
    const p = o as Packed;
    return { ...p, nodes: p.nodes.map((i) => ({ ...(b.pool.nodes[i] as object) })), edges: p.edges.map((i) => ({ ...(b.pool.edges[i] as object) })) };
  };
  return {
    ...b,
    timeline: b.timeline.map((e) => (e.overview ? { ...e, overview: open(e.overview) } : e)),
    answers: b.answers.map((a) => (a.method === "memory.overview" ? { ...a, answer: open(a.answer) } : a)),
  };
}

/**
 * The same key for the same arguments, whatever their order and with absent
 * fields left out. A draft's chat is a new session on each page load, so
 * the key keeps only its kind.
 */
function keyOf(method: string, args: unknown): string {
  const chat = (args as { chat?: { kind?: string } } | null)?.chat;
  if (chat && typeof chat === "object" && chat.kind === "draft") args = { ...(args as object), chat: { kind: "draft" } };
  const norm = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(norm)
      : v && typeof v === "object"
        ? Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, x]) => [k, norm(x)]))
        : v;
  return `${method} ${JSON.stringify(norm(args ?? null))}`;
}
const table = (list: Answer[]) => new Map(list.map((a) => [keyOf(a.method, a.args ?? null), a.answer]));
const AFTER = table(BUILD.answers);
const SENT = table(APPS.sent);
const after = (method: string, args?: unknown) => AFTER.get(keyOf(method, args ?? null));

/**
 * When each entry of the build plays back, in ms after Build my memory:
 * sorting the chats (which draws no graph) takes a second and a half, and
 * the graph's growth, which took Node most of two minutes over her 324
 * chats, plays in GROW_MS, as long as the film's own build of fewer chats
 * grew on camera, so the shot sees the same share of it.
 */
const SORT_MS = 1500;
const GROW_MS = 13_000;
const T0 = BUILD.timeline[0]?.t ?? 0;
const GROW = BUILD.timeline.find((e) => (e.event?.progress as { phase?: string } | undefined)?.phase === "building")?.t ?? T0;
const PACE = GROW_MS / Math.max(1, (BUILD.timeline.at(-1)?.t ?? GROW) - GROW);
const playAt = (t: number) => (t < GROW ? ((t - T0) / Math.max(1, GROW - T0)) * SORT_MS : SORT_MS + (t - GROW) * PACE);

export const AIS = ["chatgpt", "claude", "gemini"] as const;

export class FilmWorld {
  phase: "before" | "building" | "built" = "before";
  access: AccessStep = "paired";
  private status: unknown = BUILD.before.status;
  private overview: unknown = BUILD.before.overview;
  private progress: unknown = null;
  private timers: number[] = [];
  fast: () => boolean = () => false;
  /** Calls no baked answer covered, for whoever works on the film. */
  readonly missed: string[] = [];

  constructor(private readonly world: World) {}

  install(): void {
    const w = this.world;
    // Cori says hello on her first visit to the dashboard, which this film does not show.
    w.write("local", { [HELLO_KEY]: { at: BUILD.now - 3_600_000 } });

    w.engine("memory.status", () => (this.phase === "built" ? after("memory.status") : this.status));
    w.engine("memory.settings", () => after("memory.settings") ?? BUILD.before.settings);
    w.engine("memory.setSettings", (m) => ({ ...(after("memory.settings") as object), ...(m.args as object) }));
    w.engine("memory.buildEstimate", () => (this.phase === "before" ? BUILD.before.estimate : { ...BUILD.before.estimate, progress: this.phase === "building" ? this.progress : null }));
    w.engine("memory.overview", (m) => (this.phase === "built" ? this.answer("memory.overview", m.args) : this.overview));
    w.engine("memory.control", (m) => {
      const action = (m.args as { action?: string } | null)?.action;
      if (action === "build" && this.phase === "before") this.play();
      return this.status;
    });
    for (const method of ["memory.children", "memory.dueSoon", "memory.review", "memory.learned", "memory.stats"]) w.engine(method, (m) => this.answer(method, m.args));
    w.engine("memory.savePositions", () => null);
    w.engine("memory.hint", () => null);

    // What it was sent: the memory reads that turn the log's ids into words.
    w.engine("memory.corePack", (m) => SENT.get(keyOf("memory.corePack", m.args ?? null)) ?? after("memory.corePack"));
    w.engine("memory.node", (m) => this.sent("memory.node", m.args));
    w.engine("memory.documents", (m) => this.sent("memory.documents", m.args) ?? []);

    // The Apps section, at the film's step.
    const read = () => APPS.phases[this.access];
    w.engine("access.status", () => read().status);
    w.engine("access.syncNow", () => read().status);
    w.engine("access.tokens.list", () => read().tokens);
    w.engine("access.contextLog", () => read().log);
    w.engine("access.connects.list", () => read().connects);
    w.engine("access.requests", () => read().requests);
    w.engine("access.suggestions.list", () => []);
    w.engine("access.connects.decide", () => {
      this.step("allowed");
      return APPS.decided;
    });
    w.engine("access.tokens.revoke", () => {
      this.step("revoked");
      return null;
    });

    // The strip on ChatGPT, for the draft.
    const strip = table(APPS.strip);
    for (const method of ["memory.contextFor", "memory.contextMore", "memory.contextChat", "memory.contextSent", "memory.contextDeeper", "memory.contextAsk", "memory.contextGraph", "memory.contextFind", "memory.contextRelated"])
      w.engine(method, (m) => {
        const hit = strip.get(keyOf(method, m.args ?? null));
        if (hit === undefined) this.missed.push(keyOf(method, m.args ?? null));
        return hit ?? null;
      });
    w.engine("memory.skipChats", () => []);
    // Opening ChatGPT saves its chats by themselves; Extract all saved every one already, so each is unchanged.
    w.engine("upsertConversation", (m) => {
      const conv = (m.args as { conv?: { platformConvId?: string; platform?: string } })?.conv;
      return { id: `${conv?.platform ?? "chatgpt"}:${conv?.platformConvId ?? "new"}`, hash: "", chunks: 0, bytes: 0, unchanged: true };
    });
    w.engine("capture.tail", () => null);
  }

  /** Moves the Apps section to a step of the film, and tells the pages, as the worker's access.status event does. */
  step(to: AccessStep): void {
    this.access = to;
    this.world.tell({ ch: "coere", type: "engine.event", event: { name: "access.status", status: APPS.phases[to].status } });
  }

  private sent(method: string, args: unknown): unknown {
    const hit = SENT.get(keyOf(method, args ?? null));
    if (hit === undefined) this.missed.push(keyOf(method, args ?? null));
    return hit ?? null;
  }

  private answer(method: string, args: unknown): unknown {
    const hit = AFTER.get(keyOf(method, args ?? null));
    if (hit === undefined) this.missed.push(keyOf(method, args ?? null));
    return hit ?? null;
  }

  /** Plays the build back: its events go to every page, and each overview becomes the answer when it was read. */
  private play(): void {
    this.phase = "building";
    if (this.fast()) return this.finish();
    for (const entry of BUILD.timeline) {
      this.timers.push(window.setTimeout(() => this.apply(entry), playAt(entry.t)));
    }
  }

  private apply(entry: Entry): void {
    if (entry.overview) this.overview = entry.overview;
    if (entry.status) this.status = entry.status;
    if (!entry.event) return;
    const { name } = entry.event;
    if (name === "memory.status") this.status = entry.event.status;
    if (name === "memory.build") this.progress = entry.event.progress;
    if (name === "memory.built") this.phase = "built";
    this.world.tell({ ch: "coere", type: "engine.event", event: entry.event });
  }

  /** The build ends at once: every event goes out now, so the pages land where the build ended. */
  finish(): void {
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
    for (const entry of BUILD.timeline) this.apply(entry);
    this.phase = "built";
    this.status = after("memory.status");
    this.overview = after("memory.overview", {});
  }

  stop(): void {
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
  }
}

export const PLATFORM_CHATS = BUILD.before.platforms;
