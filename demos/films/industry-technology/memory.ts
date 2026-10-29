import type { FactSource, FactView, GraphNode, IdentityValueView, MemoryNodeDetail } from "@coere/memory";
import { describeUrgency } from "@v2/packages/memory/src/time/labels";
import { chatOf, CHATS, dayAt, iso, monthDay, ZONE, type SourceChat } from "./field";
import { grow } from "./grow";
import { MORE_WORKERS, roster } from "./roster";

/**
 * Northbeam Labs' memory as Coere for Teams files it from the team's chats,
 * in the shapes the engine answers the dashboard with (the same shape
 * demos/films/teams builds from coere-v2's agency corpus): Company with
 * its catalog folders and coworkers, Clients with a folder per client
 * holding its contacts, its projects and its facts by slot, and Tone and
 * voice. The Ledger API keeps its stack and its decisions in folders of
 * their own. Made up, dated from today.
 */

type UrgencyKind = Parameters<typeof describeUrgency>[0]["kind"];

export type Node = GraphNode & {
  aliases: string[];
  summary: string | null;
  kids: string[];
  facts_: string[];
  values: IdentityValueView[];
  relations: MemoryNodeDetail["relations"];
  client?: string;
  key?: string;
};

export type Fact = FactView & { owner: string; client: string | null };

export type Client = { key: string; name: string; aliases: string[]; domains: string[] };

export interface Mem {
  now: number;
  chats: SourceChat[];
  nodes: Map<string, Node>;
  facts: Map<string, Fact>;
  self: string;
  sections: { company: string; clients: string; tone: string };
  clientIds: Map<string, string>;
  clients: Client[];
  workers: Array<{ key: string; name: string; team: string; role: string }>;
  written: null;
}

/** The fact kind each client slot holds, as the client template files them. */
const SLOT_KIND: Record<string, FactView["kind"]> = { promises: "task", deadlines: "task", meetings: "event", decisions: "decision", preferences: "preference", contacts: "attribute", overview: "attribute" };

/** The key each client slot files a fact under (packages/solution's client_account template). */
const SLOT_KEY: Record<string, string> = {
  promises: "promise.what",
  deadlines: "due",
  meetings: "meeting.when",
  requests: "request.what",
  decisions: "client_decision.what",
  scope: "scope.item",
  billing: "billing.terms",
  overview: "client.industry",
  relationship: "client.owner",
  documents: "document.what",
};

/** One memory as written here: its words, the chat that said it, and for a client its slot and the day it is due. */
type Line = { text: string; chat: string; slot?: string; kind?: FactView["kind"]; due?: number };

const on = (n: number) => monthDay(dayAt(n));

export const CLIENTS: Client[] = [
  { key: "halcyon", name: "Halcyon Health", aliases: ["Halcyon"], domains: ["halcyonhealth.io"] },
  { key: "brightline", name: "Brightline Freight", aliases: ["Brightline"], domains: ["brightlinefreight.io"] },
  { key: "osprey", name: "Osprey Pay", aliases: ["Osprey"], domains: ["ospreypay.io"] },
];

export const WORKERS = [
  { key: "priya", name: "Priya Nair", team: "Leadership", role: "CTO" },
  { key: "leo", name: "Leo Grant", team: "Platform", role: "Staff engineer" },
  { key: "ana", name: "Ana Ruiz", team: "Engineering", role: "Engineering manager" },
];

/** How many chats the team's AIs hold across its people, every one of them a source of its memory. */
export const LIBRARY = 368;

/** The Ledger API's stack and decisions, as the chats on three AIs settled them. */
export const STACK: Line[] = [
  { text: "The Ledger API is Go 1.23 with Postgres 16 through pgx v5.", chat: "spec" },
  { text: "Events go over NATS JetStream with at least once delivery.", chat: "nats" },
  { text: "It runs on Fly.io in two regions, iad and fra.", chat: "flyio" },
  { text: "Invoices live in one Postgres table, partitioned by month.", chat: "index" },
];
export const DECISIONS: Line[] = [
  { text: "Webhook handlers must be idempotent on the event id.", chat: "retry", kind: "decision" },
  { text: "Retries back off at 2, 8 and 30 seconds, then go to the dead letter queue.", chat: "limiter", kind: "decision" },
  { text: "The Ledger API moved from lib/pq to pgx v5 for batch inserts.", chat: "pgx", kind: "decision" },
];

export function buildMemory(now: number): Mem {
  let n = 0;
  const id = (prefix: string) => `${prefix}_${(++n).toString(36).padStart(4, "0")}-northbeam`;
  const nodes = new Map<string, Node>();
  const facts = new Map<string, Fact>();

  const node = (o: Partial<Node> & Pick<Node, "id" | "kind" | "label" | "section">): Node => {
    const made: Node = { parent: null, importance: 3, pinned: false, urgency: "none", facts: 0, history: false, aliases: [], summary: null, kids: [], facts_: [], values: [], relations: [], ...o };
    nodes.set(made.id, made);
    if (made.parent) nodes.get(made.parent)?.kids.push(made.id);
    return made;
  };

  const self = node({ id: id("ent"), kind: "self", label: "You", section: "", importance: 5 });
  const sections = { company: "sec_company", clients: "sec_clients", tone: "sec_tone" };
  node({ id: sections.company, kind: "section", label: "Company", section: sections.company });
  node({ id: sections.clients, kind: "section", label: "Clients", section: sections.clients });
  node({ id: sections.tone, kind: "section", label: "Tone and voice", section: sections.tone });

  const sourceOf = (key: string, msg: number): FactSource => {
    const c = chatOf(key);
    const at = iso(dayAt(-c.ago, 16));
    return { evidenceId: "", platform: c.platform, convId: `${c.platform}:${c.key}`, title: c.title, msg, role: "user", at, url: null, stale: false };
  };

  const file = (owner: Node, client: string | null, lines: Line[]) => {
    lines.forEach((l, i) => {
      const kind: FactView["kind"] = l.kind ?? (l.slot && SLOT_KIND[l.slot]) ?? (owner.section === sections.tone ? "style" : "note");
      const source = sourceOf(l.chat, 2 * i);
      const fid = id("fact");
      source.evidenceId = `${fid}#e0`;
      const due = l.due === undefined ? null : { at: iso(dayAt(l.due, 12)).slice(0, 10), tz: null };
      const urgency = describeUrgency(
        { status: "active", kind: kind as UrgencyKind, progress: kind === "task" ? "needs-action" : undefined, urgency: due ? { due: { at: due.at } } : undefined, evidence: [{ at: source.at }] },
        now,
        ZONE,
      );
      const specifics: Array<[number, number]> = [];
      const date = /\b(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}\b/.exec(l.text);
      if (date) specifics.push([date.index, date.index + date[0].length]);
      facts.set(fid, {
        id: fid,
        kind,
        key: (client && l.slot && SLOT_KEY[l.slot]) || "",
        text: l.text,
        specifics,
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
        basis: l.slot === "documents" ? "pasted" : "user_stated",
        sensitivity: null,
        sources: [source],
        supersededBy: null,
        replacedOn: null,
        changedBy: null,
        slot: l.slot,
        owner: owner.id,
        client,
      } as Fact);
      owner.facts_.push(fid);
    });
  };

  // Company: catalog folders, and the coworkers in People.
  const folder = (section: string, parent: string, label: string, lines: Line[], owner: string | null = null) => {
    const f = node({ id: id("ent"), kind: "folder", label, section, parent, ...(owner ? { client: owner } : {}) });
    file(f, owner, lines);
    return f;
  };
  folder(sections.company, sections.company, "Runbooks and checklists", [
    { text: "Every pull request needs a test and a reviewer from another team.", chat: "checklist" },
    { text: "The code review checklist asks for a rollback plan on every migration.", chat: "checklist" },
    { text: "The on call engineer acks a page within 15 minutes.", chat: "oncall" },
    { text: "Rollbacks go out with fly deploy and the last good image.", chat: "oncall" },
  ]);
  folder(sections.company, sections.company, "Tech stack", [
    { text: "New services start in Go with Postgres unless a client asks otherwise.", chat: "generics" },
    { text: "We use pgx v5 for Postgres in every Go service.", chat: "pgx" },
    { text: "Every service runs on Fly.io.", chat: "flyio" },
  ]);
  folder(sections.company, sections.company, "Technical decisions", [
    { text: "We decided on NATS JetStream for events in client projects.", chat: "nats", kind: "decision" },
    { text: "Public APIs get a design doc before any change.", chat: "review", kind: "decision" },
  ]);
  folder(sections.company, sections.company, "How we work", [
    { text: "The interview loop has a pairing session in Go and a system design round.", chat: "loop" },
    { text: "Coding standards: errors are wrapped with the call that failed.", chat: "generics" },
  ]);
  folder(sections.company, sections.company, "Tools and systems", [
    { text: "Errors go to Sentry, and alerts go to the shared on call channel.", chat: "sentry" },
    { text: "Tickets live in Linear, one project per client.", chat: "onboard" },
  ]);
  const people = folder(sections.company, sections.company, "People", []);
  const workerLines: Record<string, Line[]> = {
    priya: [{ text: "Priya Nair is the CTO and approves architecture changes.", chat: "review" }],
    leo: [{ text: "Leo Grant owns the NATS setup across client projects.", chat: "nats" }],
    ana: [{ text: "Ana Ruiz runs the team offsite and the hiring loop.", chat: "offsite" }],
  };
  for (const w of WORKERS) {
    const p = node({ id: id("ent"), kind: "person", label: w.name, section: sections.company, parent: people.id, key: w.key });
    file(p, null, workerLines[w.key] ?? []);
  }

  // Clients: a folder each, with contacts, projects and facts by slot.
  const clientIds = new Map<string, string>();
  const client = (c: Client, contacts: Array<{ key: string; name: string; role: string; email: string; chat: string }>) => {
    const f = node({ id: id("ent"), kind: "organization", label: c.name, section: sections.clients, parent: sections.clients, importance: 4, aliases: [...c.aliases, ...c.domains], client: c.key });
    clientIds.set(c.key, f.id);
    for (const k of contacts) {
      const p = node({ id: id("ent"), kind: "person", label: k.name, section: sections.clients, parent: f.id, key: k.key });
      const said = iso(dayAt(-chatOf(k.chat).ago)).slice(0, 10);
      const src = [{ ...sourceOf(k.chat, 0), evidenceId: `${p.id}#e0` }];
      p.values = [
        { id: id("fact"), field: "email", value: k.email, href: `mailto:${k.email}`, sources: src, said },
        { id: id("fact"), field: "role", value: k.role, href: null, sources: src, said },
        { id: id("fact"), field: "org", value: c.name, href: null, sources: [], said: null },
      ];
      p.relations = [{ type: "works_at", label: "Works at", direction: "out", other: { id: f.id, label: c.name, kind: "organization" } }];
      f.relations.push({ type: "works_at", label: `${k.name} works here`, direction: "in", other: { id: p.id, label: k.name, kind: "person" } });
    }
    return f;
  };
  const project = (owner: Node, label: string, lines: Line[]) => {
    const p = node({ id: id("ent"), kind: "project", label, section: sections.clients, parent: owner.id });
    owner.relations.unshift({ type: "for", label: `${label} is for this`, direction: "in", other: { id: p.id, label, kind: "project" } });
    file(p, owner.client ?? null, lines);
    return p;
  };

  const halcyon = client(CLIENTS[0]!, [
    { key: "maya", name: "Maya Chen", role: "Head of engineering", email: "maya.chen@halcyonhealth.io", chat: "onboard" },
    { key: "ravi", name: "Ravi Patel", role: "Platform lead", email: "ravi.patel@halcyonhealth.io", chat: "review" },
  ]);
  const ledger = project(halcyon, "Ledger API", [
    { text: "The Ledger API bills Halcyon's clinics and sends invoice webhooks to their apps.", chat: "spec" },
  ]);
  folder(sections.clients, ledger.id, "Tech stack", STACK, "halcyon");
  folder(sections.clients, ledger.id, "Decisions", DECISIONS, "halcyon");
  project(halcyon, "Patient portal", [{ text: "The patient portal reads balances from the Ledger API.", chat: "onboard" }]);
  file(halcyon, "halcyon", [
    { text: "Halcyon Health runs 40 clinics and bills patients through the Ledger API.", chat: "onboard", slot: "overview" },
    { text: `Halcyon agreed to share production logs for the double webhook before ${on(-5)}.`, chat: "idem", slot: "promises", due: -5 },
    { text: `We promised Maya the retry fix on staging by ${on(1)}.`, chat: "retry", slot: "promises", due: 1 },
    { text: `I told Ravi I would write up the idempotency design by ${on(2)}.`, chat: "retry", slot: "promises", due: 2 },
    { text: `Architecture review with Halcyon on ${on(6)} to walk through the event pipeline.`, chat: "review", slot: "meetings", due: 6 },
    { text: "Maya asked that every schema change come with a migration plan.", chat: "pgx", slot: "requests" },
    { text: "Halcyon wants a weekly status note with three items and any risk to the launch.", chat: "onboard", slot: "requests" },
    { text: "Ravi wants all alerts routed to the shared on call channel.", chat: "sentry", slot: "requests" },
    { text: `The patient portal launch is set for ${on(20)}.`, chat: "spec", slot: "deadlines", due: 20 },
    { text: "The pgx v5 migration has to finish before the launch freeze.", chat: "pgx", slot: "deadlines" },
    { text: "Halcyon pays monthly against the retainer, with overage billed hourly.", chat: "retainer", slot: "billing" },
    { text: "The Ledger API spec lists the endpoints, the events and the three services that read them.", chat: "spec", slot: "documents" },
  ]);
  for (const [who, line] of [
    ["Maya Chen", "Maya Chen is the head of engineering at Halcyon Health and signs off on releases."],
    ["Ravi Patel", "Ravi Patel runs Halcyon's platform team and owns their on call."],
  ] as const) {
    const p = [...nodes.values()].find((x) => x.label === who)!;
    file(p, "halcyon", [{ text: line, chat: who === "Maya Chen" ? "onboard" : "review", slot: "contacts" }]);
  }

  const brightline = client(CLIENTS[1]!, [{ key: "jonas", name: "Jonas Weber", role: "VP of engineering", email: "jonas@brightlinefreight.io", chat: "routing" }]);
  project(brightline, "Routing service", [
    { text: "The routing service is Python 3.12 with FastAPI and Redis.", chat: "routing" },
    { text: "Routes are recomputed every five minutes from truck positions.", chat: "routing" },
  ]);
  file(brightline, "brightline", [
    { text: `We promised Brightline a load test report by ${on(9)}.`, chat: "routing", slot: "promises", due: 9 },
    { text: "Jonas wants the routing service to stay under 200 ms at the 99th percentile.", chat: "routing", slot: "requests" },
  ]);

  const osprey = client(CLIENTS[2]!, [{ key: "elena", name: "Elena Park", role: "Head of risk", email: "elena.park@ospreypay.io", chat: "fraud" }]);
  project(osprey, "Fraud rules", [
    { text: "Fraud rules run in a Rust service beside the payments API.", chat: "fraud" },
    { text: "Each rule ships behind a flag and runs in shadow mode for a week.", chat: "fraud" },
  ]);
  file(osprey, "osprey", [{ text: `The fraud rules review with Elena is on ${on(14)}.`, chat: "fraud", slot: "meetings", due: 14 }]);

  // Tone and voice: how Sam likes his answers.
  folder(sections.tone, sections.tone, "How you want to come across", [
    { text: "Answer with code first, then one line on why.", chat: "generics" },
    { text: "Client updates are short and lead with the dates.", chat: "onboard" },
  ]);

  // The rest of the studio, grown from its roster to its real size (grow.ts, roster.ts): the other clients and
  // their projects, the studio's practices, policies, vendors and engineers, from as many chats as its AIs hold.
  const r = roster(now);
  const byLabel = (label: string) => [...nodes.values()].find((x) => x.label === label && x.kind === "folder" && x.parent && nodes.get(x.parent)?.kind === "section")!.id;
  const existing = [...new Map([...facts.values()].flatMap((f) => f.sources).map((src) => [src.convId, { platform: src.platform, title: src.title }])).values()];
  const grown = grow({
    seed: 0x7ec4,
    now,
    zone: ZONE,
    nodes,
    facts,
    chats: LIBRARY,
    existing,
    plant: [
      { parent: sections.company, section: sections.company, things: r.company },
      { parent: people.id, section: sections.company, things: r.people },
      { parent: sections.clients, section: sections.clients, things: r.clientThings },
      ...Object.entries(r.more).map(([label, lines]) => ({ parent: byLabel(label), section: nodes.get(byLabel(label))!.section, lines })),
    ],
  });
  for (const t of r.clientThings) {
    const x = [...nodes.values()].find((y) => y.kind === "organization" && y.client === t.client);
    if (x && t.client) clientIds.set(t.client, x.id);
  }
  const chats: SourceChat[] = [...CHATS, ...grown.chats.map((c) => ({ key: c.id.split(":")[1]!, title: c.title, platform: c.platform, ago: Math.round((now - Date.parse(c.at)) / 86_400_000) }))];

  // Counts and urgency roll up the tree, as the overview's node stats do.
  const rank = ["none", "later", "upcoming", "soon", "today", "overdue"];
  const roll = (x: Node): GraphNode["urgency"] => {
    let urgency: GraphNode["urgency"] = "none";
    for (const f of x.facts_.map((k) => facts.get(k)!)) if (rank.indexOf(f.urgency) > rank.indexOf(urgency)) urgency = f.urgency;
    for (const k of x.kids) {
      const u = roll(nodes.get(k)!);
      if (rank.indexOf(u) > rank.indexOf(urgency)) urgency = u;
    }
    x.facts = x.facts_.length + x.values.length;
    if (x.values.length) x.identity = x.values.length;
    x.urgency = urgency;
    return urgency;
  };
  for (const s of Object.values(sections)) for (const k of nodes.get(s)!.kids) roll(nodes.get(k)!);

  return { now, chats, nodes, facts, self: self.id, sections, clientIds, clients: [...CLIENTS, ...r.clients], workers: [...WORKERS, ...MORE_WORKERS.map(({ key, name, team, role }) => ({ key, name, team, role }))], written: null };
}
