import type { PlatformId } from "@coere/core";
import type { FactSource, FactView, GraphNode, IdentityValueView, MemoryNodeDetail } from "@coere/memory";
import { describeUrgency } from "@v2/packages/memory/src/time/labels";
import { Rng } from "@v2/tools/gen-corpus/rng";

/**
 * Grows a hand built memory to a firm's real size, from a roster of things
 * and the lines the firm's chats said about each (roster.ts). Seeded, so
 * the same roster always makes the same memory: every line becomes a
 * memory filed under its thing, the things nest as the roster nests them,
 * and the lines are spread over exactly as many chats as the firm's AIs
 * hold, each chat about one subject (a client, a vendor, a folder of the
 * firm's own), on one AI, on one day. The hand built part, with every fact
 * the film shows, is left as it is.
 */

type UrgencyKind = Parameters<typeof describeUrgency>[0]["kind"];

export type GNode = GraphNode & {
  aliases: string[];
  summary: string | null;
  kids: string[];
  facts_: string[];
  values: IdentityValueView[];
  relations: MemoryNodeDetail["relations"];
  client?: string;
  key?: string;
};
export type GFact = FactView & { owner: string; client: string | null };

/** One thing a chat said: its words, how memory files it, and, for a task or an event, the day it falls on (days from now). */
export type Line = {
  text: string;
  /**
   * What the chat it came from was called: lines with the same first topic share a chat when they can, and a
   * topic said over several chats takes the other names in turn.
   */
  topic: string | string[];
  slot?: string;
  kind?: FactView["kind"];
  key?: string;
  /** Days from now that it is due, or that the meeting is. */
  due?: number;
  basis?: FactView["basis"];
};

/** A thing in memory: a folder, a client, a person, a matter, and what it holds. */
export type Thing = {
  label: string;
  kind: "folder" | "organization" | "person" | "project";
  aliases?: string[];
  /** The client's key, on a client's own folder. */
  client?: string;
  key?: string;
  values?: Array<[IdentityValueView["field"], string]>;
  lines?: Line[];
  kids?: Thing[];
  /** Its lines and its kids' lines come from chats about it alone (a client, a vendor, a coworker). */
  subject?: boolean;
  importance?: GraphNode["importance"];
};

/** A chat the growth made: its id, AI, title and day. */
export type GChat = { id: string; platform: PlatformId; title: string; at: string };

export type Grown = { chats: GChat[]; facts: number; nodes: number };

const DAY = 86_400_000;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** The split of a person's chats across their AIs that every film on the site uses (148, 102 and 74 of 324). */
export const AI_SPLIT: ReadonlyArray<[PlatformId, number]> = [
  ["chatgpt", 148],
  ["claude", 102],
  ["gemini", 74],
];

/** "November 20", the day `days` from `now`. */
export const dayName = (now: number, days: number): string => {
  const d = new Date(now + days * DAY);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
};

/** The dates, emails and phones in a text, as the ranges the sheet sets in mono. */
function specificsOf(text: string): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const re = new RegExp(`\\b(?:${MONTHS.join("|")}) \\d{1,2}\\b|[\\w.]+@[\\w.-]+\\.[a-z]+|\\+\\d[\\d ()-]{7,}\\d`, "g");
  for (let m = re.exec(text); m; m = re.exec(text)) out.push([m.index, m.index + m[0].length]);
  return out;
}

/** Ids as the engine makes them, a prefix and a UUIDv7 from the record's time, numbered apart from the hand built ones. */
function idMaker() {
  let n = 0x800;
  const hex = (v: number, w: number) => Math.floor(v).toString(16).padStart(w, "0").slice(-w);
  return (prefix: string, at: number): string => {
    n += 1;
    const t = hex(Math.max(0, Math.floor(at)), 12);
    const r = (n * 2654435761) % 4294967296;
    return `${prefix}_${t.slice(0, 8)}-${t.slice(8, 12)}-7${hex(n, 3)}-${(8 + (n % 4)).toString(16)}${hex(r, 3)}-${hex(r * 7, 6)}${hex(n * 977, 6)}`;
  };
}

type Placed = { line: Line; owner: GNode; client: string | null };
type Subject = { name: string; lines: Placed[]; persons: Array<{ node: GNode; values: Array<[IdentityValueView["field"], string]>; first: Placed | null }> };

export interface GrowInput {
  seed: number;
  now: number;
  zone: string;
  nodes: Map<string, GNode>;
  facts: Map<string, GFact>;
  /** Where each roster tree goes: a parent node's id and the things under it. */
  plant: Array<{ parent: string; section: string; things?: Thing[]; lines?: Line[]; client?: string | null }>;
  /** How many chats the firm's AIs hold in all, the hand built ones counted. */
  chats: number;
  /** The chats the hand built memory already cites, by AI, and their titles. */
  existing: Array<{ platform: PlatformId; title: string }>;
  /** How far back the firm's chats go, in days. */
  span?: number;
}

/** Plants the roster, files every line as a memory from its chat, and rolls the counts and urgency up the whole tree. */
export function grow(input: GrowInput): Grown {
  const { now, zone, nodes, facts } = input;
  const rng = Rng.derive(input.seed, "grow");
  const id = idMaker();
  const span = input.span ?? 540;
  const subjects: Subject[] = [];

  const node = (o: Partial<GNode> & Pick<GNode, "id" | "kind" | "label" | "section">): GNode => {
    const n: GNode = { parent: null, importance: 3, pinned: false, urgency: "none", facts: 0, history: false, aliases: [], summary: null, kids: [], facts_: [], values: [], relations: [], ...o };
    nodes.set(n.id, n);
    if (n.parent) nodes.get(n.parent)?.kids.push(n.id);
    return n;
  };

  const place = (t: Thing, parent: GNode, section: string, client: string | null, subject: Subject | null) => {
    const n = node({
      id: id("ent", now - span * DAY),
      kind: t.kind,
      label: t.label,
      section,
      parent: parent.id,
      importance: t.importance ?? (t.kind === "organization" ? 4 : 3),
      aliases: t.aliases ?? [],
      ...(t.client ? { client: t.client } : {}),
      ...(t.key ? { key: t.key } : {}),
    });
    const mine = t.client ?? client;
    let own = subject;
    if (!subject && (t.subject || (t.lines?.length ?? 0) > 0)) {
      own = { name: t.label, lines: [], persons: [] };
      subjects.push(own);
    }
    for (const line of t.lines ?? []) own!.lines.push({ line, owner: n, client: mine });
    if (t.values?.length) own!.persons.push({ node: n, values: t.values, first: own!.lines.find((p) => p.owner === n) ?? null });
    // A person works at the organization above them, and a matter or project is for it, as the sheet's Related lists them.
    if (t.kind === "person" && parent.kind === "organization") {
      n.relations = [{ type: "works_at", label: "Works at", direction: "out", other: { id: parent.id, label: parent.label, kind: "organization" } }];
      parent.relations.push({ type: "works_at", label: `${t.label} works here`, direction: "in", other: { id: n.id, label: t.label, kind: "person" } });
    }
    if (t.kind === "project" && parent.kind === "organization") {
      n.relations = [{ type: "for", label: "For", direction: "out", other: { id: parent.id, label: parent.label, kind: "organization" } }];
      parent.relations.unshift({ type: "for", label: `${t.label} is for this`, direction: "in", other: { id: n.id, label: t.label, kind: "project" } });
    }
    // What is under a subject comes from that subject's chats; under a plain folder, each thing has chats of its own.
    for (const kid of t.kids ?? []) place(kid, n, section, mine, subject ?? (t.subject ? own : null));
    return n;
  };
  for (const p of input.plant) {
    const parent = nodes.get(p.parent);
    if (!parent) throw new Error(`grow: no node ${p.parent}`);
    // Lines for a thing the hand built memory already has come from chats of their own about it.
    if (p.lines?.length) subjects.push({ name: parent.label, lines: p.lines.map((line) => ({ line, owner: parent, client: p.client ?? null })), persons: [] });
    for (const t of p.things ?? []) place(t, parent, p.section, p.client ?? null, null);
  }

  // How many chats each subject's lines came from: at least one, at most one a line, the rest by size.
  for (const s of subjects) if (s.lines.length === 0) throw new Error(`grow: ${s.name} has nothing said about it`);
  const needed = input.chats - input.existing.length;
  const total = subjects.reduce((n, s) => n + s.lines.length, 0);
  if (needed < subjects.length || needed > total) throw new Error(`grow: ${needed} chats for ${subjects.length} subjects and ${total} lines`);
  const allot = subjects.map(() => 1);
  for (let left = needed - subjects.length; left > 0; left--) {
    let best = -1;
    for (let i = 0; i < subjects.length; i++)
      if (allot[i]! < subjects[i]!.lines.length && (best < 0 || subjects[i]!.lines.length / (allot[i]! + 1) > subjects[best]!.lines.length / (allot[best]! + 1))) best = i;
    allot[best]! += 1;
  }

  // The AI of each new chat, from a shuffled bag, so all the firm's chats split across the AIs as the site's other films do.
  const weight = AI_SPLIT.reduce((n, [, w]) => n + w, 0);
  const want = new Map(AI_SPLIT.map(([p, w]) => [p, Math.round((input.chats * w) / weight)]));
  for (const e of input.existing) want.set(e.platform, (want.get(e.platform) ?? 0) - 1);
  const bag: PlatformId[] = [];
  for (const [p, n] of want) for (let i = 0; i < Math.max(0, n); i++) bag.push(p);
  while (bag.length < needed) bag.push(AI_SPLIT[0]![0]);
  bag.length = needed;
  const ais = rng.shuffle(bag);

  const titles = new Set(input.existing.map((e) => e.title));
  const topics = (l: Line): string[] => (Array.isArray(l.topic) ? l.topic : [l.topic]);
  /** The first of a chat's names no other chat has, or its main name marked as a later chat on it. */
  const titled = (names: string[]): string => {
    for (const f of names) if (!titles.has(f)) return titles.add(f), f;
    for (const f of [`${names[0]} follow up`, ...Array.from({ length: 30 }, (_, i) => `${names[0]} part ${i + 2}`)]) if (!titles.has(f)) return titles.add(f), f;
    throw new Error(`grow: no title left for ${names[0]}`);
  };

  const chats: GChat[] = [];
  let made = 0;
  const said = new Map<Placed, FactSource>();
  subjects.forEach((s, si) => {
    // Lines on one topic sit together, so a chat holds what was said about one thing at one sitting.
    const byTopic = new Map<string, Placed[]>();
    for (const p of s.lines) {
      const key = topics(p.line)[0]!;
      byTopic.set(key, [...(byTopic.get(key) ?? []), p]);
    }
    let runs = rng.shuffle([...byTopic.values()]);
    const k = allot[si]!;
    // Fewer chats than topics: the smallest topic joins the next one's chat. More: the biggest chat splits in two.
    while (runs.length > k) {
      let i = 0;
      for (let j = 1; j < runs.length; j++) if (runs[j]!.length < runs[i]!.length) i = j;
      const into = i === runs.length - 1 ? i - 1 : i + 1;
      runs[into] = into < i ? [...runs[into]!, ...runs[i]!] : [...runs[i]!, ...runs[into]!];
      runs.splice(i, 1);
    }
    while (runs.length < k) {
      let i = 0;
      for (let j = 1; j < runs.length; j++) if (runs[j]!.length > runs[i]!.length) i = j;
      const run = runs[i]!;
      const cut = rng.int(1, run.length - 1);
      runs = [...runs.slice(0, i), run.slice(0, cut), run.slice(cut), ...runs.slice(i + 1)];
    }
    for (const run of runs) {
      const platform = ais[made]!;
      made += 1;
      // A chat about something due is recent; anything else was said some time in the last year and a half, more often lately.
      const dated = run.some((p) => p.line.due !== undefined);
      const ago = dated ? rng.int(2, 40) : 2 + Math.floor(span * rng.next() ** 1.7);
      const when = now - ago * DAY - rng.int(15, 23 * 60) * 60_000;
      const title = titled(topics(run[0]!.line));
      const convId = `${platform}:g${made.toString(36)}${title.length.toString(36)}`;
      chats.push({ id: convId, platform, title, at: new Date(when).toISOString() });
      run.forEach((p, msg) => said.set(p, { evidenceId: "", platform, convId, title, msg: msg * 2, role: "user", at: new Date(when + msg * 180_000).toISOString(), url: null, stale: false }));
    }
  });

  let filed = 0;
  for (const s of subjects) {
    for (const p of s.lines) {
      const source = { ...said.get(p)! };
      const at = Date.parse(source.at);
      const fid = id("fact", at);
      source.evidenceId = `${fid}#e0`;
      const kind = p.line.kind ?? "note";
      const due = p.line.due === undefined ? null : { at: new Date(now + p.line.due * DAY).toISOString().slice(0, 10), tz: null };
      const urgency = describeUrgency(
        { status: "active", kind: kind as UrgencyKind, progress: kind === "task" ? "needs-action" : undefined, urgency: due ? { due: { at: due.at } } : undefined, evidence: [{ at: source.at }] },
        now,
        zone,
      );
      const fact: GFact = {
        id: fid,
        kind,
        key: p.line.key ?? "",
        text: p.line.text,
        specifics: specificsOf(p.line.text),
        importance: kind === "task" ? 4 : 3,
        urgency: urgency.level,
        urgencyLabel: urgency.label,
        due,
        progress: kind === "task" ? "needs-action" : null,
        status: "active",
        disagree: false,
        held: false,
        pinned: false,
        origin: "extracted",
        basis: p.line.basis ?? (p.line.slot === "documents" ? "pasted" : "user_stated"),
        sensitivity: null,
        sources: [source],
        supersededBy: null,
        replacedOn: null,
        changedBy: null,
        slot: p.line.slot ?? null,
        owner: p.owner.id,
        client: p.client,
      };
      facts.set(fid, fact);
      p.owner.facts_.push(fid);
      filed += 1;
    }
    // A person's email, phone and role, said in the chat that first named them.
    for (const person of s.persons) {
      const from = person.first ?? s.lines[0]!;
      const src = said.get(from)!;
      const day = src.at.slice(0, 10);
      const parent = person.node.parent ? nodes.get(person.node.parent) : undefined;
      person.node.values = [
        ...person.values.map(([field, value], i): IdentityValueView => {
          const vid = id("fact", Date.parse(src.at) + i);
          return {
            id: vid,
            field,
            value,
            href: field === "email" ? `mailto:${value}` : field === "phone" ? `tel:${value.replace(/[^\d+]/g, "")}` : null,
            sources: [{ ...src, evidenceId: `${vid}#e0` }],
            said: day,
          };
        }),
        ...(parent?.kind === "organization" ? [{ id: id("fact", Date.parse(src.at) + 9), field: "org" as const, value: parent.label, href: null, sources: [], said: null }] : []),
      ];
    }
  }

  rollUp(nodes, facts);
  return { chats, facts: filed, nodes: subjects.length };
}

/** Each thing's own count and the most urgent memory at or under it, as the overview's node stats give them. */
export function rollUp(nodes: Map<string, GNode>, facts: Map<string, GFact>): void {
  const rank = ["none", "later", "upcoming", "soon", "today", "overdue"];
  const roll = (n: GNode): GraphNode["urgency"] => {
    let urgency: GraphNode["urgency"] = "none";
    const raise = (u: GraphNode["urgency"]) => {
      if (rank.indexOf(u) > rank.indexOf(urgency)) urgency = u;
    };
    for (const f of n.facts_) raise(facts.get(f)!.urgency);
    for (const k of n.kids) raise(roll(nodes.get(k)!));
    n.facts = n.facts_.length + n.values.length;
    if (n.values.length) n.identity = n.values.length;
    n.urgency = urgency;
    return urgency;
  };
  for (const n of [...nodes.values()].filter((x) => x.kind === "section")) for (const k of n.kids) roll(nodes.get(k)!);
}
