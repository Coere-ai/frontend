import type { FactHit, FactView, GraphEdge, GraphNode, GraphSlice, MemoryHit, MemoryNodeDetail, MemorySearchResult, MemorySettings, MemoryStatus, NodeRef, OpenNode, ReviewItem, TreeItem, ForgetPreview, ForgetReceipt } from "@coere/memory";
import type { ContextAnswer } from "@v2/packages/memory/src/import-context/types";
import { PLATFORMS } from "@coere/platforms";
import type { ClientView, OrgReviewItem, OrgSettings, WorkerView } from "@coere/solution";
import { FIRM, SAM } from "./field";
import type { Fact, Mem, Node } from "./memory";

/**
 * What the engine answers the dashboard about Northbeam's memory, in the
 * views packages/memory and packages/solution define (memory-v2.md 14.2,
 * coere-solution.md 9.2), read off the memory built in memory.ts. Taken
 * from demos/films/teams/views.ts, with the firm's own record in place of
 * the agency corpus's.
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

/** The facts the build has written so far, oldest chat first, or every fact once memory is built. */
export function writtenFacts(m: Mem): Fact[] {
  const all = [...m.facts.values()];
  if (m.written === null) return all;
  return all.sort((a, b) => (a.sources[0]!.at < b.sources[0]!.at ? -1 : 1)).slice(0, m.written);
}

/** The things drawn so far: every one with a written memory under it, the folders above them and what hangs on a drawn client. */
function liveIds(m: Mem): Set<string> | null {
  if (m.written === null) return null;
  const ids = new Set<string>([m.self]);
  const up = (id: string | null) => {
    for (let at = id; at && !ids.has(at); at = m.nodes.get(at)?.parent ?? null) ids.add(at);
  };
  for (const f of writtenFacts(m)) up(f.owner);
  for (const n of m.nodes.values()) if (n.kind === "person" && n.values.length && n.parent && ids.has(n.parent)) up(n.id);
  for (const n of m.nodes.values()) if (n.kind === "project" && n.parent && ids.has(n.parent)) ids.add(n.id);
  return ids;
}

const live = (m: Mem) => {
  const ids = liveIds(m);
  return [...m.nodes.values()].filter((n) => !ids || ids.has(n.id));
};

export function overview(m: Mem): GraphSlice {
  const written = new Set(writtenFacts(m).map((f) => f.id));
  const nodes = live(m).map((n) => ({ ...graphNode(n), facts: m.written === null ? n.facts : n.facts_.filter((f) => written.has(f)).length }));
  const ids = new Set(nodes.map((n) => n.id));
  const edges: GraphEdge[] = nodes.flatMap((n) => (n.parent ? [{ from: n.id, to: n.parent, type: "parent", label: null, history: false }] : []));
  for (const n of live(m))
    for (const r of n.relations)
      if (r.direction === "out" && ids.has(n.id) && ids.has(r.other.id)) edges.push({ from: n.id, to: r.other.id, type: r.type, label: null, history: false });
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
  const kids = id === null ? live(m).filter((n) => n.kind === "section") : (m.nodes.get(id)?.kids ?? []).map((k) => m.nodes.get(k)!);
  return {
    items: kids.map((k) => ({ id: k.id, kind: k.kind, label: k.label, facts: k.facts, children: k.kids.length, urgency: k.urgency, urgencyLabel: null, pinned: false })),
    next: null,
  };
}

export const allFacts = (m: Mem): Fact[] => [...m.facts.values()];

export function dueSoon(m: Mem, limit = 5): FactView[] {
  const rank = { overdue: 0, today: 1, soon: 2, upcoming: 3, later: 4 } as Record<string, number>;
  return allFacts(m)
    .filter((f) => f.due && f.urgency in rank)
    .sort((a, b) => rank[a.urgency]! - rank[b.urgency]! || (a.due!.at < b.due!.at ? 1 : -1))
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

/** Review's cards from memory: each past due task gone quiet, as the engine's lifetime rule lists them (memory-v2-2.md 4.15). */
export function review(m: Mem): ReviewItem[] {
  return allFacts(m)
    .filter((f) => f.urgency === "stale")
    .map((f, i) => ({ n: i + 1, kind: "stale_task" as const, fact: factView(f) }));
}

export function status(m: Mem, o: { memories?: number; state?: MemoryStatus["state"]; set?: MemoryStatus["set"] } = {}): MemoryStatus {
  const chats = sourceChats(m);
  return {
    state: o.state ?? "ready",
    models: { extract: "claude-opus-5-5", consolidate: "claude-opus-5-5", short: "claude-haiku-5-5" },
    until: null,
    stopClass: null,
    set: o.set ?? null,
    held: null,
    counts: {
      memories: o.memories ?? writtenFacts(m).length,
      dueSoon: dueSoon(m, 99).length,
      review: review(m).length + orgReview(m).length,
      sourceChats: chats.all,
      sourceChatsBy: chats.by,
      held: 0,
      chatsRead: m.chats.length,
      chatsInLibrary: m.chats.length,
      failedJobs: 0,
      refusedJobs: 0,
    },
    spend: { monthMicros: 1_840_000, capMicros: 20_000_000 },
    poolSlots: { used: 2, capacity: 6 },
    lastVerify: null,
  };
}

export function settings(m: Mem): MemorySettings {
  const by = new Map<string, number>();
  for (const c of m.chats) by.set(c.platform, (by.get(c.platform) ?? 0) + 1);
  return {
    readFrom: [...by].map(([platform, chats]) => ({ platform: platform as never, on: true, chats, projectsOff: [] })),
    recall: true,
    backfillMode: "direct",
    capUsd: 20,
    timeZone: "America/Los_Angeles",
    copyToFolder: false,
    showTrivia: false,
    extractScope: { v: 1, all: true },
  };
}

export function clientViews(m: Mem): ClientView[] {
  const out: ClientView[] = [];
  for (const [key, id] of m.clientIds) {
    const n = m.nodes.get(id)!;
    const c = m.clients.find((x) => x.key === key)!;
    const mine = allFacts(m).filter((f) => f.client === key);
    const open = mine.filter((f) => f.kind === "task" && f.due && f.urgency !== "stale" && f.urgency !== "overdue").sort((a, b) => (a.due!.at < b.due!.at ? -1 : 1))[0];
    out.push({
      id,
      key,
      name: n.label,
      aliases: c.aliases,
      domains: c.domains,
      status: "active",
      state: "kept",
      contacts: n.kids.filter((k) => m.nodes.get(k)?.kind === "person").length,
      next: open ? { text: open.text, at: open.due!.at } : null,
      activeAt: Math.max(0, ...mine.map((f) => Date.parse(f.sources[0]!.at))),
    });
  }
  return out;
}

export function workerViews(m: Mem): WorkerView[] {
  const ids = new Map([...m.nodes.values()].filter((n) => n.kind === "person" && n.section === m.sections.company).map((n) => [n.key, n.id]));
  return [
    { id: m.self, key: "sam", name: SAM.name, team: "Engineering", role: "Backend engineer", self: true },
    ...m.workers.map((w) => ({ id: ids.get(w.key) ?? `wk_${w.key}`, key: w.key, name: w.name, team: w.team, role: w.role, self: false })),
  ];
}

/** The firm's record, as the first run saved it (packages/solution OrgRecord). */
export function orgRecord(m: Mem) {
  return {
    v: 1 as const,
    company: { name: FIRM, aliases: ["Northbeam"], domains: ["northbeamlabs.io"], industry: "it_services" as const },
    self: { name: SAM.name, role: "Backend engineer", team: "Engineering" },
    clients: m.clients.map((c) => ({ ...c, status: "active" as const })),
    workers: m.workers,
    switches: { findClients: true, learnCoworkers: true },
    notClients: [],
    setupAt: m.now - 200 * 86_400_000,
  };
}

export function orgSettings(m: Mem): OrgSettings {
  const r = orgRecord(m);
  return { company: r.company, self: r.self, switches: r.switches };
}

export function orgReview(_m: Mem): OrgReviewItem[] {
  return [];
}

/** A node as search and Cori name it, with its path from the section down. */
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

const QUESTION = new Set(["what", "which", "does", "do", "the", "use", "uses", "is", "on", "run", "runs", "we", "our", "of", "for", "about"]);

/** Memory's search (memory-v2.md 11): a thing named by the query opens, and the facts that hold its words, by the thing they are filed under. */
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
  // A fact's words and the names of the folders it is filed under, as memory's index holds them; question words are no topic.
  const asked = tokens.filter((t) => !QUESTION.has(t));
  const byOwner = new Map<string, Fact[]>();
  for (const f of m.facts.values()) {
    const owner = m.nodes.get(f.owner)!;
    const text = [f.text, owner.label, ...pathOf(m, owner).map((p) => p.label)].join(" ").toLowerCase();
    if (asked.length && asked.every((t) => text.includes(t))) byOwner.set(f.owner, [...(byOwner.get(f.owner) ?? []), f]);
  }
  const hits: MemoryHit[] = [...byOwner]
    .map(([owner, list]) => ({ node: refOf(m, m.nodes.get(owner)!), facts: list.slice(0, 3).map((f) => factHit(f, tokens, 0.8)), score: list.length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return { stage: 1, intent: { deadline: false, history: false, people: false, window: null }, open, hits, library: [], total: hits.length + (open ? 1 : 0), capped: false };
}

/** Words of a draft that say what it is for, not what it is about. */
const STOP = new Set(["help", "me", "answer", "about", "the", "and", "for", "with", "write", "reply", "to", "dates", "date"]);

/**
 * `memory.contextFor` in a Coere for Teams build (coere-solution.md 6.1,
 * 6.2): the client the draft names, and only that one, goes as its card,
 * with the lines the draft asks about first; the answer names the client
 * so the strip can say whose context goes. A draft that names no client
 * gets nothing here.
 */
/** The client's contacts, by full name and first name, which name the client in a draft as its own name does. */
const contactNames = (m: Mem, node: Node): string[] =>
  node.kids.map((k) => m.nodes.get(k)!).filter((k) => k.kind === "person").flatMap((k) => [k.label, k.label.split(" ")[0]!]);

export function contextFor(m: Mem, tail: string): ContextAnswer & { client: { id: string; name: string } | null } {
  const text = ` ${tail.toLowerCase()} `;
  const named = [...m.clientIds]
    .map(([key, id]) => ({ key, node: m.nodes.get(id)! }))
    .find(({ node }) => [node.label, ...node.aliases, ...contactNames(m, node)].some((n) => n.length > 3 && text.includes(` ${n.toLowerCase()} `)));
  const empty = { pending: [], also: [], topic: [], tokens: 0, sources: [], chats: [], block: "", client: null };
  if (!named) return empty;
  const asked = words(tail).filter((w) => !named.node.label.toLowerCase().includes(w) && !STOP.has(w));
  // The client's own lines the draft is about, the dated ones first, as the card's lines rank (packages/solution/src/context).
  const facts = allFacts(m)
    .filter((f) => f.client === named.key && f.owner === named.node.id)
    .map((f) => ({ f, score: asked.filter((t) => f.text.toLowerCase().includes(t)).length + (f.specifics.length > 0 ? 2 : 0) + (f.kind === "task" ? 1 : 0) }))
    .filter((x) => x.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.f);
  const sources = [...new Set(facts.flatMap((f) => f.sources).sort((a, b) => (a.at < b.at ? 1 : -1)).map((s) => s.platform))];
  const chats = [...new Set(facts.flatMap((f) => f.sources.map((s) => s.convId)))];
  const path = ["Clients", named.node.label];
  const lines = facts.map((f) => {
    const s = f.sources[0]!;
    const day = new Date(s.at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
    return `- ${f.text} (${PLATFORMS.find((p) => p.id === s.platform)?.name ?? s.platform}, ${day})`;
  });
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
  };
}

/** What a client's export holds (coere-solution.md 6.7): its memories, contacts and documents, counted as the file would hold them. */
export function scopeCounts(m: Mem, key: string): { memories: number; contacts: number; documents: number; workers: number } {
  const id = m.clientIds.get(key);
  const node = id ? m.nodes.get(id) : undefined;
  if (!node) return { memories: 0, contacts: 0, documents: 0, workers: 0 };
  const under = (n: typeof node): number => n.facts_.length + n.values.length + n.kids.reduce((sum, k) => sum + under(m.nodes.get(k)!), 0);
  return {
    memories: under(node),
    contacts: node.kids.filter((k) => m.nodes.get(k)?.kind === "person").length,
    documents: allFacts(m).filter((f) => f.client === key && f.slot === "documents").length,
    workers: 0,
  };
}

type ForgetSet = { topic: string; token: string; nodes: string[]; facts: string[]; mentions: string[] };
const tokens = new Map<string, ForgetSet>();

/** The thing a topic names: its folder by id, else a thing whose name or alias it is. */
function topicNode(m: Mem, topic: string, id: string | null): Node | null {
  if (id && m.nodes.has(id)) return m.nodes.get(id)!;
  const t = topic.trim().toLowerCase();
  return [...m.nodes.values()].find((n) => n.kind !== "section" && n.kind !== "self" && [n.label, ...n.aliases].some((a) => a.toLowerCase() === t)) ?? null;
}

/**
 * Delete everything about X (memory-v2-2.md 6.2, 6.3): the thing, every
 * folder and memory under it, and the memories elsewhere that name it,
 * as the confirm sheet lists them and the graph lights them.
 */
export function forgetPreview(m: Mem, topic: string, id: string | null): ForgetPreview {
  const node = topicNode(m, topic, id);
  if (!node) return { kind: "none", topic };
  const nodes: string[] = [];
  const walk = (n: Node) => {
    nodes.push(n.id);
    n.kids.forEach((k) => walk(m.nodes.get(k)!));
  };
  walk(node);
  const facts = nodes.flatMap((n) => m.nodes.get(n)!.facts_);
  const names = [node.label, ...node.aliases.filter((a) => !a.includes("."))].map((a) => a.toLowerCase());
  const mentions = allFacts(m)
    .filter((f) => !facts.includes(f.id) && names.some((a) => f.text.toLowerCase().includes(a)))
    .map((f) => f.id);
  const token = `fg_${crypto.randomUUID()}`;
  tokens.set(token, { topic: node.label, token, nodes, facts, mentions });
  const item = (id: string, label: string, path: string[]) => ({ id, label, path, tone: "remove" as const });
  const pathFor = (n: Node) => pathOf(m, n).map((p) => p.label);
  const folderItems = nodes.map((id) => m.nodes.get(id)!).map((n) => item(n.id, n.label, pathFor(n)));
  const memoryItems = facts.map((id) => m.facts.get(id)!).map((f) => item(f.id, f.text, [...pathFor(m.nodes.get(f.owner)!), m.nodes.get(f.owner)!.label]));
  const mentionItems = mentions.map((id) => m.facts.get(id)!).map((f) => item(f.id, f.text, [...pathFor(m.nodes.get(f.owner)!), m.nodes.get(f.owner)!.label]));
  const groups = [
    { group: "folders" as const, count: folderItems.length, items: folderItems },
    { group: "memories" as const, count: memoryItems.length, items: memoryItems },
    { group: "mentions" as const, count: mentionItems.length, items: mentionItems },
  ].filter((g) => g.count > 0);
  const total = groups.reduce((n, g) => n + g.count, 0);
  const inSet = new Set([...facts, ...mentions]);
  const byChat = new Map<string, boolean>();
  for (const f of allFacts(m)) for (const s of f.sources) byChat.set(s.convId, (byChat.get(s.convId) ?? true) && inSet.has(f.id));
  const chats = [...byChat.values()].filter(Boolean).length;
  return { kind: "set", topic: node.label, token, groups, chats, total, typeName: total > 50 };
}

/** Deletes the set a preview named, then checks nothing of it is left, and keeps the receipt's counts (6.4 to 6.7). */
export function forgetTopic(m: Mem, token: string): { receipt: ForgetReceipt; changed: string[] } {
  const set = tokens.get(token);
  if (!set) throw new Error("stale_token");
  tokens.delete(token);
  for (const id of [...set.facts, ...set.mentions]) {
    const f = m.facts.get(id);
    if (!f) continue;
    const owner = m.nodes.get(f.owner);
    if (owner) owner.facts_ = owner.facts_.filter((x) => x !== id);
    m.facts.delete(id);
  }
  for (const id of set.nodes) {
    const n = m.nodes.get(id);
    if (!n) continue;
    const parent = n.parent ? m.nodes.get(n.parent) : undefined;
    if (parent) parent.kids = parent.kids.filter((k) => k !== id);
    for (const other of m.nodes.values()) other.relations = other.relations.filter((r) => r.other.id !== id);
    m.nodes.delete(id);
  }
  for (const [key, id] of m.clientIds) if (!m.nodes.has(id)) m.clientIds.delete(key);
  const left = [...set.nodes, ...set.facts, ...set.mentions].some((id) => m.nodes.has(id) || m.facts.has(id));
  const receipt: ForgetReceipt = {
    id: `rcpt_${crypto.randomUUID()}`,
    at: new Date().toISOString(),
    counts: { folders: set.nodes.length, memories: set.facts.length, documents: 0, mentions: set.mentions.length, paragraphs: 0, links: 0, chats: 0 },
    chatsDeleted: false,
    blocked: false,
    batchesDeleted: 0,
    apps: [],
    verified: left ? "left_over" : "ok",
    sentToModels: false,
    chatPages: [],
  };
  return { receipt, changed: [...set.nodes, ...set.facts, ...set.mentions] };
}
