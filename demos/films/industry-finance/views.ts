import type { FactHit, FactView, GraphEdge, GraphNode, GraphSlice, MemoryHit, MemoryNodeDetail, MemorySearchResult, MemorySettings, MemoryStatus, NodeRef, OpenNode, ReviewItem, TreeItem } from "@coere/memory";
import type { ContextAnswer } from "@v2/packages/memory/src/import-context/types";
import type { ClientView, OrgSettings, WorkerView } from "@coere/solution";
import { field } from "../../../demos/industries/fields/finance.mjs";
import { platformName, WORKERS, ZONE, type Fact, type Mem, type Node } from "./memory";

/**
 * What the engine answers the Teams dashboard, the chat site and Cori
 * about Ashgrove's memory, in the views packages/memory and
 * packages/solution define, read off memory.ts (the same readings as
 * demos/films/teams/views.ts).
 */

const graphNode = (n: Node): GraphNode => ({
  id: n.id,
  kind: n.kind,
  label: n.label,
  section: n.section,
  parent: n.kind === "self" || n.kind === "section" ? null : n.parent,
  importance: n.importance,
  pinned: n.pinned,
  urgency: n.urgency,
  facts: n.facts,
  ...(n.identity ? { identity: n.identity } : {}),
  history: false,
});

const factView = (f: Fact): FactView => {
  const { owner: _o, client: _c, ...view } = f;
  return view;
};

export const allFacts = (m: Mem): Fact[] => [...m.facts.values()];

export function overview(m: Mem): GraphSlice {
  const nodes = [...m.nodes.values()].map(graphNode);
  const edges: GraphEdge[] = nodes.flatMap((n) => (n.parent ? [{ from: n.id, to: n.parent, type: "parent", label: null, history: false }] : []));
  for (const n of m.nodes.values())
    for (const r of n.relations) if (r.direction === "out" && m.nodes.has(r.other.id)) edges.push({ from: n.id, to: r.other.id, type: r.type, label: null, history: false });
  return { scene: "overview", nodes, edges, more: {}, positions: null };
}

export function pathOf(m: Mem, n: Node): Array<{ id: string; label: string }> {
  const out: Array<{ id: string; label: string }> = [];
  for (let at = n.parent; at; ) {
    const up = m.nodes.get(at);
    if (!up || up.kind === "self") break;
    out.unshift({ id: up.id, label: up.label });
    at = up.parent;
  }
  return out;
}

const GROUP: Record<string, "facts" | "decisions" | "preferences" | "style"> = { decision: "decisions", preference: "preferences", style: "style" };

export function nodeDetail(m: Mem, id: string): MemoryNodeDetail | null {
  const n = m.nodes.get(id);
  if (!n) return null;
  const own = n.facts_.map((x) => m.facts.get(x)!).map(factView);
  const due = own.filter((f) => f.due !== null).sort((a, b) => (a.due!.at < b.due!.at ? -1 : 1));
  const rest = own.filter((f) => f.due === null);
  const groups = (["facts", "decisions", "preferences", "style"] as const)
    .map((name) => ({ name, facts: rest.filter((f) => (GROUP[f.kind] ?? "facts") === name) }))
    .filter((g) => g.facts.length > 0);
  return {
    ...(n.kind === "person" || n.kind === "self" ? { identity: n.values } : {}),
    node: { ...graphNode(n), aliases: n.aliases, path: pathOf(m, n), summary: n.summary },
    due,
    groups,
    earlier: [],
    relations: n.relations,
    review: [],
  };
}

export function children(m: Mem, id: string | null): { items: TreeItem[]; next: string | null } {
  const kids = id === null ? [...m.nodes.values()].filter((n) => n.kind === "section") : (m.nodes.get(id)?.kids ?? []).map((k) => m.nodes.get(k)!);
  return {
    items: kids.map((k) => ({ id: k.id, kind: k.kind, label: k.label, facts: k.facts, children: k.kids.length, urgency: k.urgency, urgencyLabel: null, pinned: false })),
    next: null,
  };
}

/** Due soon: what is due nearest first, the Lindqvist review on top as the field's page shows it. */
export function dueSoon(m: Mem, limit = 5): FactView[] {
  const rank = { overdue: 0, today: 1, soon: 2, upcoming: 3, later: 4 } as Record<string, number>;
  return allFacts(m)
    .filter((f) => f.due && f.urgency in rank)
    .sort((a, b) => rank[a.urgency]! - rank[b.urgency]! || (a.due!.at < b.due!.at ? -1 : 1))
    .slice(0, limit)
    .map(factView);
}

export function sourceChats(m: Mem): { all: number; by: Partial<Record<string, number>> } {
  const seen = new Map<string, string>();
  for (const f of m.facts.values()) for (const s of f.sources) seen.set(s.convId, s.platform);
  const by: Record<string, number> = {};
  for (const p of seen.values()) by[p] = (by[p] ?? 0) + 1;
  return { all: seen.size, by };
}

export function review(m: Mem): ReviewItem[] {
  return allFacts(m)
    .filter((f) => f.urgency === "stale")
    .map((f, i) => ({ n: i + 1, kind: "stale_task" as const, fact: factView(f) }));
}

export function status(m: Mem): MemoryStatus {
  const chats = sourceChats(m);
  return {
    state: "ready",
    models: { extract: "claude-opus-5-5", consolidate: "claude-opus-5-5", short: "claude-haiku-5-5" },
    until: null,
    stopClass: null,
    set: null,
    held: null,
    counts: {
      memories: m.facts.size,
      dueSoon: dueSoon(m, 99).length,
      review: review(m).length,
      sourceChats: chats.all,
      sourceChatsBy: chats.by,
      held: 0,
      chatsRead: chats.all,
      chatsInLibrary: chats.all,
      failedJobs: 0,
      refusedJobs: 0,
    },
    spend: { monthMicros: 2_410_000, capMicros: 20_000_000 },
    poolSlots: { used: 0, capacity: 6 },
    lastVerify: null,
  } as MemoryStatus;
}

export function settings(m: Mem): MemorySettings {
  const by = sourceChats(m).by;
  return {
    readFrom: Object.entries(by).map(([platform, chats]) => ({ platform: platform as never, on: true, chats: chats ?? 0, projectsOff: [] })),
    recall: true,
    backfillMode: "direct",
    capUsd: 20,
    timeZone: ZONE,
    copyToFolder: false,
    showTrivia: false,
    extractScope: { v: 1, all: true },
  } as MemorySettings;
}

export function clientViews(m: Mem): ClientView[] {
  return m.clients.map((c) => {
    const id = m.clientIds.get(c.key)!;
    const n = m.nodes.get(id)!;
    const mine = allFacts(m).filter((f) => f.client === c.key);
    const open = mine.filter((f) => f.kind === "task" && f.due && f.urgency !== "stale").sort((a, b) => (a.due!.at < b.due!.at ? -1 : 1))[0];
    return {
      id,
      key: c.key,
      name: c.name,
      aliases: c.aliases,
      domains: [],
      status: "active",
      state: "kept",
      contacts: n.kids.filter((k) => m.nodes.get(k)?.kind === "person").length,
      next: open ? { text: open.text, at: open.due!.at } : null,
      activeAt: Math.max(0, ...mine.map((f) => Date.parse(f.sources[0]!.at))),
    };
  });
}

export function workerViews(m: Mem): WorkerView[] {
  return [{ id: m.self, key: "daniel", name: field.person.name, team: "Advice", role: "Financial advisor", self: true }, ...WORKERS.map((w) => ({ ...w, id: `wk_${w.key}`, self: false }))];
}

/** The firm as the first run set it up (packages/solution OrgRecord), for storage and memory.orgGet. */
export function orgRecord(m: Mem) {
  return {
    v: 1 as const,
    company: { name: field.firm, aliases: ["Ashgrove"], domains: ["ashgrovewealth.com"], industry: "finance" as const },
    self: { name: field.person.name, role: "Financial advisor", team: "Advice" },
    clients: m.clients.map((c) => ({ key: c.key, name: c.name, aliases: c.aliases, domains: [], status: "active" as const })),
    workers: WORKERS,
    switches: { findClients: true, learnCoworkers: true },
    notClients: [],
    setupAt: m.now - 200 * 86_400_000,
  };
}

export function orgSettings(m: Mem): OrgSettings {
  const r = orgRecord(m);
  return { company: r.company, self: r.self, switches: r.switches } as OrgSettings;
}

export function refOf(m: Mem, n: Node): NodeRef {
  return {
    id: n.id,
    kind: n.kind === "section" ? "section" : (n.kind as NodeRef["kind"]),
    name: n.label,
    path: pathOf(m, n).map((p) => ({ id: p.id, name: p.label, kind: m.nodes.get(p.id)?.kind === "section" ? "section" : (m.nodes.get(p.id)!.kind as NodeRef["kind"]) })),
  };
}

const words = (q: string) => q.toLowerCase().split(/[^a-z0-9@.]+/).filter((w) => w.length > 1);

function ranges(text: string, tokens: readonly string[]): Array<[number, number]> {
  const lower = text.toLowerCase();
  const out: Array<[number, number]> = [];
  for (const t of tokens) for (let i = lower.indexOf(t); i >= 0; i = lower.indexOf(t, i + t.length)) out.push([i, i + t.length]);
  return out.sort((a, b) => a[0] - b[0]);
}

function factHit(f: Fact, tokens: readonly string[], score: number): FactHit {
  const s = f.sources[0]!;
  return {
    id: f.id,
    kind: f.kind as FactHit["kind"],
    key: f.key,
    text: f.text,
    highlights: ranges(f.text, tokens),
    specifics: f.specifics,
    status: f.status,
    progress: f.progress,
    importance: f.importance,
    urgency: f.urgency,
    urgencyLabel: f.urgencyLabel,
    basis: f.basis,
    sensitivity: f.sensitivity,
    evidence: { evidenceId: s.evidenceId, platform: s.platform, convId: s.convId, title: s.title, msg: s.msg, at: s.at, stale: false },
    score,
  };
}

/** Memory's search: a thing named by the query opens, and the facts that hold its words. */
export function search(m: Mem, q: string, limit = 8): MemorySearchResult {
  const tokens = words(q);
  const query = q.trim().toLowerCase();
  const things = [...m.nodes.values()].filter((n) => n.kind !== "section" && n.kind !== "self");
  const named = things.find((n) => n.label.toLowerCase() === query) ?? things.find((n) => query.length > 2 && n.label.toLowerCase().startsWith(query));
  let open: OpenNode | null = null;
  if (named) {
    open = {
      node: refOf(m, named),
      children: named.kids.map((k) => m.nodes.get(k)!).map((k) => ({ id: k.id, kind: k.kind as OpenNode["children"][number]["kind"], name: k.label, factCount: k.facts, urgency: k.urgency })),
      facts: named.facts_.map((id) => factHit(m.facts.get(id)!, tokens, 1)),
      related: named.relations.map((r) => ({ type: r.type, label: r.label, other: refOf(m, m.nodes.get(r.other.id)!) })),
    };
  }
  const byOwner = new Map<string, Fact[]>();
  for (const f of m.facts.values()) {
    const text = f.text.toLowerCase();
    if (tokens.length && tokens.every((t) => text.includes(t))) byOwner.set(f.owner, [...(byOwner.get(f.owner) ?? []), f]);
  }
  const hits: MemoryHit[] = [...byOwner]
    .filter(([owner]) => owner !== named?.id)
    .map(([owner, list]) => ({ node: refOf(m, m.nodes.get(owner)!), facts: list.slice(0, 3).map((f) => factHit(f, tokens, 0.8)), score: list.length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return { stage: 1, intent: { deadline: false, history: false, people: false, window: null }, open, hits, library: [], total: hits.length + (open ? 1 : 0), capped: false } as MemorySearchResult;
}

/** The household's lines a note about trimming stocks is about, in the order the card ranks them. */
const NOTE_LINES = [/68 percent stocks/, /target at 60 percent/, /uneasy about stocks/, /fewer trades/, /rebalancing plan back to 60/];

/**
 * `memory.contextFor` in a Coere for Teams build (coere-solution.md 6.1,
 * 6.2): the one client the draft names, by its name, an alias or a
 * contact, goes as its card with the lines the draft is about, and the
 * answer names the client so the strip says whose context goes. Nothing
 * from any other household goes with it.
 */
export function contextFor(m: Mem, tail: string): ContextAnswer & { client: { id: string; name: string } | null } {
  const text = ` ${tail.toLowerCase()} `;
  const empty = { pending: [], also: [], topic: [], tokens: 0, sources: [], chats: [], block: "", client: null };
  const named = m.clients.find((c) => [c.name, ...c.aliases].some((a) => a.length > 3 && new RegExp(`\\b${a.toLowerCase()}\\b`).test(text)));
  if (!named) return empty;
  const id = m.clientIds.get(named.key)!;
  const mine = allFacts(m).filter((f) => f.client === named.key);
  const facts = named.key === "lindqvist" ? NOTE_LINES.flatMap((re) => mine.filter((f) => re.test(f.text))) : mine.filter((f) => f.kind === "task").slice(0, 4);
  const sources = [...new Set(facts.flatMap((f) => f.sources).sort((a, b) => (a.at < b.at ? 1 : -1)).map((s) => s.platform))];
  const chats = [...new Set(facts.flatMap((f) => f.sources.map((s) => s.convId)))];
  const path = ["Clients", named.name];
  const lines = facts.map((f) => {
    const s = f.sources[0]!;
    const day = new Date(s.at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
    return `- ${f.text} (${platformName(s.platform)}, ${day})`;
  });
  const block = ["[Context from Coere, my saved memory. Use it if it helps.]", path.join(" / "), ...lines, "[End of context from Coere]", "", ""].join("\n");
  const cost = Math.ceil(block.length / 3.6);
  return {
    pending: [{ id: `client:${id}`, path, reason: "name", sources, chats, tokens: cost, changedOnly: false, version: `v-${facts.map((f) => f.id.slice(-4)).join("")}` }],
    also: [],
    topic: [named.name],
    tokens: cost,
    sources,
    chats: [],
    block,
    client: { id, name: named.name },
  } as never;
}
