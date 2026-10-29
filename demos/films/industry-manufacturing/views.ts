import type { FactHit, FactView, GraphEdge, GraphNode, GraphSlice, MemoryHit, MemoryNodeDetail, MemorySearchResult, MemoryStatus, NodeRef, OpenNode, TreeItem } from "@coere/memory";
import type { ContextAnswer } from "@v2/packages/memory/src/import-context/types";
import type { ClientView, OrgSettings, WorkerView } from "@coere/solution";
import { ORG_RECORD_KEY } from "@coere/solution";
import { HELLO_KEY } from "@v2/apps/extension/src/console/cori/hello";
import { HINT_KEY } from "@v2/apps/extension/src/content/agent/hint/seen";
import type { World } from "../../stage/world";
import { CLIENT, FIRM, NOW, PERSON, ZONE, type Fact, type Mem, type Node } from "./memory";
import { field } from "../../../demos/industries/fields/manufacturing.mjs";

/**
 * What the engine answers the Teams dashboard, the Teams chat site and
 * Cori about Brightwater's memory, in the views packages/memory and
 * packages/solution define, read off the memory memory.ts builds. Shaped
 * as the teams film answers the same calls (demos/films/teams/views.ts).
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

const all = (m: Mem): Fact[] => [...m.facts.values()];

export function overview(m: Mem): GraphSlice {
  const nodes = [...m.nodes.values()].map(graphNode);
  const edges: GraphEdge[] = nodes.flatMap((n) => (n.parent ? [{ from: n.id, to: n.parent, type: "parent", label: null, history: false }] : []));
  for (const n of m.nodes.values())
    for (const r of n.relations) if (r.direction === "out" && m.nodes.has(r.other.id)) edges.push({ from: n.id, to: r.other.id, type: r.type, label: null, history: false });
  return { scene: "overview", nodes, edges, more: {}, positions: null };
}

function pathOf(m: Mem, n: Node): Array<{ id: string; label: string }> {
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

export function dueSoon(m: Mem, limit = 5): FactView[] {
  const rank = { overdue: 0, today: 1, soon: 2, upcoming: 3, later: 4 } as Record<string, number>;
  return all(m)
    .filter((f) => f.due && f.urgency in rank)
    .sort((a, b) => rank[a.urgency]! - rank[b.urgency]! || (a.due!.at < b.due!.at ? -1 : 1))
    .slice(0, limit)
    .map(factView);
}

/** What the graph's caption counts: field.graph.count, "176 memories from 109 chats in 3 topics". */
const COUNTS = /(\d+) memories from (\d+) chats/.exec(field.graph.count as string)!;

export function status(m: Mem): MemoryStatus {
  return {
    state: "ready",
    models: { extract: "claude-opus-5-5", consolidate: "claude-opus-5-5", short: "claude-haiku-5-5" },
    until: null,
    stopClass: null,
    set: null,
    held: null,
    counts: {
      memories: Number(COUNTS[1]),
      dueSoon: dueSoon(m, 99).length,
      review: 0,
      sourceChats: Number(COUNTS[2]),
      sourceChatsBy: { chatgpt: 49, claude: 37, gemini: 23 },
      held: 0,
      chatsRead: Number(COUNTS[2]),
      chatsInLibrary: Number(COUNTS[2]),
      failedJobs: 0,
      refusedJobs: 0,
    },
    spend: { monthMicros: 2_140_000, capMicros: 20_000_000 },
    poolSlots: { used: 0, capacity: 6 },
    lastVerify: null,
  } as MemoryStatus;
}

export function settings() {
  return {
    readFrom: [
      { platform: "chatgpt", on: true, chats: 49, projectsOff: [] },
      { platform: "claude", on: true, chats: 37, projectsOff: [] },
      { platform: "gemini", on: true, chats: 23, projectsOff: [] },
    ],
    recall: true,
    backfillMode: "direct",
    capUsd: 20,
    timeZone: ZONE,
    copyToFolder: false,
    showTrivia: false,
    extractScope: { v: 1, all: true },
  };
}

export function clientViews(m: Mem): ClientView[] {
  const out: ClientView[] = [];
  for (const [key, id] of m.clientIds) {
    const n = m.nodes.get(id)!;
    const mine = all(m).filter((f) => f.client === key);
    const open = mine.filter((f) => f.kind === "task" && f.due && f.urgency !== "overdue").sort((a, b) => (a.due!.at < b.due!.at ? -1 : 1))[0];
    out.push({
      id,
      key,
      name: n.label,
      aliases: n.aliases,
      domains: [],
      status: "active",
      state: "kept",
      contacts: n.kids.filter((k) => m.nodes.get(k)?.kind === "person").length,
      next: open ? { text: open.text, at: open.due!.at } : null,
      activeAt: Math.max(0, ...mine.map((f) => Date.parse(f.sources[0]!.at))),
    });
  }
  return out;
}

const WORKERS = [
  { key: "ana", name: "Ana Ruiz", team: "Production", role: "Night shift lead" },
  { key: "daniel", name: "Daniel Ortiz", team: "Maintenance", role: "Maintenance lead" },
  { key: "priya", name: "Priya Shah", team: "Quality", role: "Quality manager" },
];

export function workerViews(m: Mem): WorkerView[] {
  return [{ id: m.self, key: "luis", name: PERSON.name, team: "Engineering", role: "Process engineer", self: true }, ...WORKERS.map((w) => ({ id: `wk_${w.key}`, ...w, self: false }))];
}

/** The company record the first run saved, as Settings and the rail read it. */
export function orgRecord(m: Mem) {
  return {
    v: 1,
    company: { name: FIRM, aliases: ["Brightwater"], domains: [], industry: "manufacturing" },
    self: { name: PERSON.name, role: "Process engineer", team: "Engineering" },
    clients: clientViews(m).map((c) => ({ key: c.key, name: c.name, aliases: c.aliases, domains: [], status: "active" })),
    workers: WORKERS,
    switches: { findClients: true, learnCoworkers: true },
    notClients: [],
    setupAt: NOW - 200 * 86_400_000,
  };
}

export function orgSettings(m: Mem): OrgSettings {
  const r = orgRecord(m);
  return { company: r.company, self: r.self, switches: r.switches } as OrgSettings;
}

function refOf(m: Mem, n: Node): NodeRef {
  const kind = (k: string) => (k === "section" ? "section" : k) as NodeRef["kind"];
  return { id: n.id, kind: kind(n.kind), name: n.label, path: pathOf(m, n).map((p) => ({ id: p.id, name: p.label, kind: kind(m.nodes.get(p.id)!.kind) })) };
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

/** Memory's search: a thing the query names opens, and the facts that hold its words, by the thing they are filed under. */
export function search(m: Mem, q: string, limit = 8): MemorySearchResult {
  const tokens = words(q);
  const query = q.trim().toLowerCase();
  const things = [...m.nodes.values()].filter((n) => n.kind !== "section" && n.kind !== "self");
  const named = things.find((n) => n.label.toLowerCase() === query) ?? things.find((n) => query.length > 2 && n.label.toLowerCase().startsWith(query));
  let open: OpenNode | null = null;
  if (named)
    open = {
      node: refOf(m, named),
      children: named.kids.map((k) => m.nodes.get(k)!).map((k) => ({ id: k.id, kind: k.kind as OpenNode["children"][number]["kind"], name: k.label, factCount: k.facts, urgency: k.urgency })),
      facts: named.facts_.map((id) => factHit(m.facts.get(id)!, tokens, 1)),
      related: named.relations.map((r) => ({ type: r.type, label: r.label, other: refOf(m, m.nodes.get(r.other.id)!) })),
    };
  const byOwner = new Map<string, Fact[]>();
  for (const f of m.facts.values()) {
    const text = f.text.toLowerCase();
    if (tokens.length && tokens.every((t) => text.includes(t))) byOwner.set(f.owner, [...(byOwner.get(f.owner) ?? []), f]);
  }
  const hits: MemoryHit[] = [...byOwner]
    .map(([owner, list]) => ({ node: refOf(m, m.nodes.get(owner)!), facts: list.slice(0, 3).map((f) => factHit(f, tokens, 0.8)), score: list.length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return { stage: 1, intent: { deadline: false, history: false, people: false, window: null }, open, hits, library: [], total: hits.length + (open ? 1 : 0), capped: false };
}

const PLATFORM_NAMES: Record<string, string> = { chatgpt: "ChatGPT", claude: "Claude", gemini: "Gemini" };
const dayOf = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** The customer's lines an update on the Line 3 faults takes, the faults first (field.clientLine). */
const UPDATE_LINES = [
  "In August the torque faults on Line 3 came from a worn spindle on station 4.",
  "Night shift found the faults rise when the hall drops below 15 degrees.",
  "We promised Hannah a root cause report on the torque faults by October 31.",
  "Hannah asked to be told of any fault that stops the line for more than an hour.",
  "Quality review with Hannah Weiss on November 3 to walk through the Line 3 faults.",
];

/** How many chats the line says the customer's context comes from (field.clientLine.from, "From 6 chats"). */
const LINE_CHATS = Number(/\d+/.exec(field.clientLine.from as string)![0]);

/**
 * `memory.contextFor` in a Coere for Teams build: the customer the draft
 * names, by its name, a contact or its line, and only that one, goes as
 * its card with the lines the draft is about; the answer names the
 * customer so the strip can say whose context goes. A draft that names no
 * customer gets nothing.
 */
export function contextFor(m: Mem, tail: string): ContextAnswer & { client: { id: string; name: string } | null } {
  const text = ` ${tail.toLowerCase()} `;
  const named = [...m.clientIds]
    .map(([key, id]) => ({ key, node: m.nodes.get(id)! }))
    .find(({ node }) => [node.label, ...node.aliases, ...node.kids.map((k) => m.nodes.get(k)!.label)].some((n) => n.length > 3 && text.includes(n.toLowerCase())));
  const empty = { pending: [], also: [], topic: [], tokens: 0, sources: [], chats: [], block: "", client: null };
  if (!named) return empty;
  const mine = all(m).filter((f) => f.client === named.key);
  const facts = named.node.label === CLIENT ? UPDATE_LINES.map((t) => mine.find((f) => f.text === t)!).filter(Boolean) : mine.slice(0, 3);
  const sources = [...new Set(facts.flatMap((f) => f.sources).sort((a, b) => (a.at < b.at ? 1 : -1)).map((s) => s.platform))];
  const chats = [...new Set(mine.flatMap((f) => f.sources.map((s) => s.convId)))].slice(0, LINE_CHATS);
  const path = ["Clients", named.node.label];
  const lines = facts.map((f) => `- ${f.text} (${PLATFORM_NAMES[f.sources[0]!.platform]}, ${dayOf(f.sources[0]!.at)})`);
  const block = ["[Context from Coere, my saved memory. Use it if it helps.]", path.join(" / "), ...lines, "[End of context from Coere]", "", ""].join("\n");
  const cost = Math.ceil(block.length / 3.6);
  return {
    pending: [{ id: `client:${named.node.id}`, path, reason: "name", sources, chats, tokens: cost, changedOnly: false, version: `v-${facts.map((f) => f.id.slice(-6)).join("")}` }],
    also: [],
    topic: [named.node.label],
    tokens: cost,
    sources,
    chats: [],
    block,
    client: { id: named.node.id, name: named.node.label },
  } as never;
}

type Args = Record<string, unknown>;
const args = (m: { args?: unknown }): Args => (m.args ?? {}) as Args;

/** Cori's history (memory.chat.*): the conversations this run made, as the engine keeps them. */
function answerCoriHistory(world: World): void {
  type Conv = { id: string; title: string; startedOn: string; createdAt: number; updatedAt: number; turns: number };
  const convs: Conv[] = [];
  const turns = new Map<string, unknown[]>();
  let n = 0;
  world
    .engine("memory.chat.list", () => ({ convs: [...convs].sort((a, b) => b.updatedAt - a.updatedAt), next: null }))
    .engine("memory.chat.get", (m) => {
      const conv = convs.find((c) => c.id === args(m).id);
      return conv ? { conv, turns: turns.get(conv.id) ?? [] } : null;
    })
    .engine("memory.chat.search", () => [])
    .engine("memory.chat.append", (m) => {
      const a = args(m) as { convId: string | null; startedOn: string; turn: { role: string; text: string; blocks: unknown[]; runId: string | null; at?: number } };
      const at = a.turn.at ?? Date.now();
      let conv = convs.find((c) => c.id === a.convId);
      if (!conv) {
        conv = { id: `cc_${(++n).toString(36)}${Date.now().toString(36)}`, title: a.turn.text.slice(0, 48), startedOn: a.startedOn, createdAt: at, updatedAt: at, turns: 0 };
        convs.push(conv);
      }
      conv.turns += 1;
      conv.updatedAt = at;
      turns.set(conv.id, [...(turns.get(conv.id) ?? []), { convId: conv.id, n: conv.turns, role: a.turn.role, at, text: a.turn.text, blocks: a.turn.blocks, runId: a.turn.runId }]);
      return { conv, n: conv.turns };
    })
    .engine("memory.chat.update", () => undefined)
    .engine("memory.chat.keep", () => ({ keep: { days: null }, cleared: 0 }));
}

/** Every engine call the Teams pages make, answered from Brightwater's memory. `teamsTabs` names the tabs that run the Teams build. */
export function answerTeams(world: World, mem: Mem): void {
  answerCoriHistory(world);
  world.write("local", {
    [ORG_RECORD_KEY]: orgRecord(mem),
    // She has opened the dashboard and an AI before: Cori said his hello, and his tip was shown.
    [HELLO_KEY]: { at: NOW - 30 * 86_400_000 },
    [HINT_KEY]: { v: 1, seen: true, at: NOW - 30 * 86_400_000 },
  });
  world
    .engine("memory.status", () => status(mem))
    .engine("memory.settings", () => settings())
    .engine("memory.buildEstimate", () => ({ chats: 109, seconds: 0, measured: true, progress: null }))
    .engine("memory.overview", () => overview(mem))
    .engine("memory.node", (m) => nodeDetail(mem, String(args(m).id)))
    .engine("memory.children", (m) => children(mem, (args(m).id as string | null) ?? null))
    .engine("memory.dueSoon", (m) => dueSoon(mem, Number(args(m).limit ?? 5)))
    .engine("memory.corePack", () => ({ version: null, lines: [], chats: 0, hidden: [] }))
    .engine("memory.learned", () => ({ sections: [], keywords: [], blocked: [] }))
    .engine("memory.review", () => [])
    .engine("memory.estimate", () => null)
    .engine("memory.savePositions", () => null)
    .engine("memory.hint", () => null)
    .engine("memory.clients", () => ({ clients: clientViews(mem) }))
    .engine("memory.workers", () => ({ workers: workerViews(mem) }))
    .engine("memory.orgGet", () => orgSettings(mem))
    .engine("memory.orgReview", () => ({ items: [] }))
    .engine("memory.search", (m) => search(mem, String(args(m).q ?? ""), Number(args(m).limit ?? 8)))
    .engine("memory.documents", () => [])
    .engine("memory.quote", () => null)
    .engine("search", (m) => ({ hits: [], totalMatches: 0, ms: 4, stage: 1, queryTokens: String(args(m).query ?? "").toLowerCase().split(/\s+/).filter(Boolean) }))
    .engine("listConversations", () => ({ rows: [], total: 109 }))
    .engine("stats", () => ({ conversations: 109, chunks: 1360, projects: 0, textBytes: 1_900_000, dbBytes: 12_000_000, byPlatform: {} }));
}

export { ZONE };
