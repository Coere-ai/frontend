import { describeUrgency } from "@v2/packages/memory/src/time/labels";
import type { FactView, GraphNode, GraphSlice, MemoryNodeDetail, MemoryStatus } from "@v2/packages/memory/src/index";
import type { World } from "../../stage/world";
import data from "./data.json";

/**
 * Maya's memory as the worker answers the Memory page and Home: the
 * sections, the things in them and the memories filed under each, with
 * the chats each came from (data.json, from the planted truth of her
 * chats). Urgency words come from memory's own function at the time the
 * film plays. One thing happens in it: when Coere saves the DATA 100 lab
 * chat again, memory reads it (the status says so for a moment) and the
 * lab's deadline moves to the date her update gave, the old one kept
 * under Earlier, as memory files a moved deadline.
 */

type Fact = (typeof data.memory.facts)[number];

const M = data.memory;
const ZONE = M.zone;
const SELF = "ent_self";
/** Every chat in her library once the later ones came in: memory has read them all. */
const LIBRARY = data.install.length + data.later.length;
const titles = new Map([...data.install, ...data.later].map((c) => [`${c.platform}:${c.id}`, c.title]));
const sectionOf = new Map(M.sections.map((s) => [s.id, s]));
const thingOf = new Map(M.things.map((t) => [t.id, t]));

/** The importance a node is drawn with: its weightiest memory's. */
const IMPORTANCE = (n: number) => Math.min(5, Math.max(2, n)) as 2 | 3 | 4 | 5;

/** The levels from most to least urgent, to find a thing's most urgent memory. */
const ORDER = ["overdue", "today", "soon", "upcoming", "later", "stale", "none"];

export class Memory {
  /** True once memory has read the lab chat as it stands today. */
  moved = false;
  private reading = false;
  /** When the move was read, for its "changed on" line. */
  private movedAt = Date.now();

  constructor(
    private readonly world: World,
    /** True while the player skips ahead, when memory reads at once. */
    private readonly fast: () => boolean = () => false,
  ) {}

  /** The facts as they stand: before her update, or after it, with the old deadline replaced. */
  private facts(): Fact[] {
    if (!this.moved) return M.facts;
    const today = new Date(this.movedAt).toISOString().slice(0, 10);
    const moved = { ...M.moved, sources: M.moved.sources.map((s) => ({ ...s, at: new Date(this.movedAt).toISOString() })) };
    return [...M.facts.map((f) => (f.id === M.lab ? { ...f, status: "superseded", supersededBy: moved.id, replacedOn: today } : f)), moved];
  }

  private view(f: Fact, now: number): FactView {
    const dated = (f.kind === "task" || f.kind === "event") && !f.history;
    const due = f.due ? { at: f.due, tz: ZONE } : null;
    const evidence = f.sources.map((s) => ({ at: s.at }));
    const { level, label } = dated
      ? describeUrgency({ status: f.status as "active", kind: f.kind as "task", progress: (f.progress ?? undefined) as never, urgency: due ? { due } : {}, ...(f.start ? { start: { at: f.start, tz: ZONE } } : {}), evidence }, now, ZONE)
      : { level: "none" as const, label: null };
    return {
      id: f.id,
      kind: f.kind,
      key: f.key,
      text: f.text,
      specifics: f.specifics as Array<[number, number]>,
      importance: IMPORTANCE(f.importance),
      urgency: level,
      urgencyLabel: label,
      due,
      progress: (f.progress ?? null) as FactView["progress"],
      status: f.status as FactView["status"],
      disagree: false,
      held: false,
      pinned: false,
      origin: "extracted",
      basis: "user_stated",
      sensitivity: f.sensitivity as FactView["sensitivity"],
      sources: f.sources.map((s, i) => {
        const [platform] = s.chat.split(":");
        return { evidenceId: `${f.id}#e${i}`, platform: platform as "claude", convId: s.chat, title: titles.get(s.chat) ?? "", msg: s.msg, role: s.role as "user", at: s.at, url: null, stale: false };
      }),
      supersededBy: f.supersededBy,
      replacedOn: f.replacedOn,
      changedBy: null,
      ...(f.history ? { freshness: "history" as const } : level === "stale" ? { freshness: "stale" as const } : {}),
    };
  }

  private current(now: number): FactView[] {
    return this.facts()
      .filter((f) => f.status === "active")
      .map((f) => this.view(f, now));
  }

  overview(): GraphSlice {
    const now = Date.now();
    // Every current memory by the thing it is filed on, and every thing by its parent, read once: her memory holds hundreds.
    const ownerOf = new Map(this.facts().map((f) => [f.id, f.owner]));
    const byOwner = new Map<string, FactView[]>();
    for (const v of this.current(now)) {
      const owner = ownerOf.get(v.id)!;
      byOwner.set(owner, [...(byOwner.get(owner) ?? []), v]);
    }
    const kids = new Map<string, string[]>();
    for (const t of M.things) if (t.parent) kids.set(t.parent, [...(kids.get(t.parent) ?? []), t.id]);
    const mine = (id: string) => byOwner.get(id) ?? [];
    const under = (id: string): string[] => [id, ...(kids.get(id) ?? []).flatMap(under)];
    const urgent = (id: string) => {
      const levels = under(id).flatMap((x) => mine(x).filter((v) => v.freshness !== "history").map((v) => v.urgency));
      return (levels.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))[0] ?? "none") as GraphNode["urgency"];
    };
    const node = (id: string, kind: string, label: string, section: string, parent: string | null, facts: number, importance = 3): GraphNode => ({ id, kind, label, section, parent, importance: IMPORTANCE(importance), pinned: false, urgency: kind === "section" || kind === "self" ? "none" : urgent(id), facts, history: false });
    const nodes: GraphNode[] = [
      node(SELF, "self", "Maya Collins", "sec_personal_info", null, 0),
      ...M.sections.map((s) => node(s.id, "section", s.label, s.id, null, 0)),
      ...M.things.map((t) => node(t.id, t.kind, t.label, t.section, t.parent, mine(t.id).length, Math.max(3, ...mine(t.id).map((v) => v.importance)))),
    ];
    const edges = M.things.filter((t) => t.parent).map((t) => ({ from: t.parent!, to: t.id, type: "parent", label: null, history: false }));
    return { scene: "overview", nodes, edges, more: {}, positions: null };
  }

  node(id: string): MemoryNodeDetail | null {
    const now = Date.now();
    const graph = this.overview().nodes.find((n) => n.id === id);
    if (!graph) return null;
    const facts = this.facts().filter((f) => f.owner === id);
    const views = facts.map((f) => this.view(f, now));
    const active = views.filter((v) => v.status === "active");
    const isDue = (v: FactView) => (v.key === "due" || v.key === "start") && v.freshness !== "history";
    const path: Array<{ id: string; label: string }> = [];
    for (let at: string | null = id; at; at = thingOf.get(at)?.parent ?? null) {
      const t = thingOf.get(at);
      if (t) path.unshift({ id: t.id, label: t.label });
    }
    const section = sectionOf.get(graph.section);
    if (section && section.id !== id) path.unshift({ id: section.id, label: section.label });
    const parent = thingOf.get(id)?.parent;
    const up = parent ? thingOf.get(parent) : null;
    return {
      node: { ...graph, aliases: [], path, summary: null },
      due: active.filter(isDue),
      groups: [{ name: "facts", facts: active.filter((v) => !isDue(v)) }],
      earlier: views.filter((v) => v.status === "superseded"),
      relations: up ? [{ type: "part_of", label: `Part of ${up.label}`, direction: "out", other: { id: up.id, label: up.label, kind: up.kind } }] : [],
      review: [],
    };
  }

  dueSoon(limit = 5): FactView[] {
    const now = Date.now();
    return this.current(now)
      .filter((v) => ["overdue", "today", "soon", "upcoming"].includes(v.urgency) && v.freshness !== "history")
      .sort((a, b) => ORDER.indexOf(a.urgency) - ORDER.indexOf(b.urgency))
      .slice(0, limit);
  }

  status(): MemoryStatus {
    const views = this.current(Date.now());
    const chats = new Set(views.flatMap((v) => v.sources.map((s) => s.convId)));
    const by: Record<string, number> = {};
    for (const c of chats) {
      const p = c.split(":")[0]!;
      by[p] = (by[p] ?? 0) + 1;
    }
    return {
      state: this.reading ? "running" : "ready",
      models: { extract: "claude-sonnet-4-5", consolidate: "claude-sonnet-4-5", short: "claude-haiku-4-5" },
      until: null,
      stopClass: null,
      set: this.reading
        ? { id: "ws_lab", origin: "capture", mode: "direct", state: "running", byPlatform: { claude: { chats: 1, read: 0, failed: 0, refused: 0, batched: 0 } }, linking: { queued: 0, done: 0 }, factsFound: 0, spentMicros: 0, etaSec: null }
        : null,
      held: null,
      counts: { memories: views.length, dueSoon: this.dueSoon(99).length, review: 0, sourceChats: chats.size, sourceChatsBy: by, held: 0, chatsRead: LIBRARY, chatsInLibrary: LIBRARY, failedJobs: 0, refusedJobs: 0 },
      spend: { monthMicros: 410_000, capMicros: 20_000_000 },
      poolSlots: { used: 0, capacity: 6 },
      lastVerify: null,
    } as MemoryStatus;
  }

  /** A chat was saved: the lab chat, saved with her update, is read again, and memory follows it. */
  saved(convId: string, messages: number): void {
    if (this.moved || this.reading || convId !== `${data.changed.platform}:${data.changed.id}` || messages < data.changed.messages.length) return;
    this.reading = true;
    this.tellStatus();
    setTimeout(() => {
      this.reading = false;
      this.moved = true;
      this.movedAt = Date.now();
      this.world.tell({ ch: "coere", type: "engine.event", event: { name: "memory.changed", all: true } });
      this.tellStatus();
    }, this.fast() ? 0 : 2600);
  }

  private tellStatus(): void {
    this.world.tell({ ch: "coere", type: "engine.event", event: { name: "memory.status", status: this.status() } });
  }

  /** Answers memory's methods the pages call. */
  install(): void {
    const w = this.world;
    w.engine("memory.status", () => this.status());
    w.engine("memory.overview", () => this.overview());
    w.engine("memory.focus", () => this.overview());
    w.engine("memory.node", (m) => this.node((m.args as { id: string }).id));
    w.engine("memory.dueSoon", (m) => this.dueSoon((m.args as { limit?: number } | undefined)?.limit));
    w.engine("memory.children", () => ({ items: [], next: null }));
    w.engine("memory.review", () => []);
    w.engine("memory.skipChats", () => []);
  }
}
