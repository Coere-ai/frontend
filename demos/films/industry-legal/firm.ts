import type { PlatformId } from "@coere/core";
import type { FactSource, FactView, GraphNode, IdentityValueView, MemoryNodeDetail } from "@coere/memory";
import { describeUrgency } from "@v2/packages/memory/src/time/labels";
import { field } from "../../../demos/industries/fields/legal.mjs";
import { FILM_NOW, ZONE } from "./clock";
import { addSections, grow, plantSections, sectionId } from "./grow";
import { MORE_WORKERS, roster } from "./roster";

/**
 * Whitlock & Rhee's memory as Coere for Teams files it from the firm's
 * chats: Company with how the firm works, its billing, its policies and
 * its team; Clients with a folder for each of its eight clients, holding
 * the client's contacts, its matters and its facts by slot; then the
 * firm's other sections, each with a few folders of its own (practice
 * areas, research, court and filings, writing, people, business
 * development, plans and deadlines), as coere-v2's Teams graph rings them
 * after Company and Clients. The same shapes the teams film builds from
 * coere-v2's agency corpus (memory.ts there), here written for a
 * litigation practice from the field's data
 * (demos/industries/fields/legal.mjs). Made up.
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

export interface Mem {
  now: number;
  nodes: Map<string, Node>;
  facts: Map<string, Fact>;
  self: string;
  sections: { company: string; clients: string };
  clientIds: Map<string, string>;
  chats: number;
  /** While a build runs, how many memories it has written; null once memory is built (always, in this film). */
  written: number | null;
}

export const FIRM = { name: field.firm, aliases: ["Whitlock & Rhee", "Whitlock"], domains: ["whitlockrhee.com"], industry: "law" as const };
export const SELF = { name: field.person.name, role: "Litigation associate", team: "Litigation" };

/** How many chats the firm's AIs hold across its people, every one of them a source of its memory. */
export const LIBRARY = 384;

/** The firm's clients as Settings lists them: the four the film names, then the four more it serves (roster.ts). */
export const CLIENTS: Array<{ key: string; name: string; aliases: string[]; domains: string[]; status: "active" | "paused" }> = [
  { key: "hartwell", name: "Hartwell Logistics", aliases: ["Hartwell"], domains: ["hartwelllogistics.com"], status: "active" as const },
  { key: "osei", name: "Osei Bakery", aliases: ["Osei"], domains: ["oseibakery.com"], status: "active" as const },
  { key: "calder", name: "Calder Foods", aliases: ["Calder"], domains: ["calderfoods.com"], status: "active" as const },
  { key: "dunmore", name: "Dunmore Clinic", aliases: ["Dunmore"], domains: ["dunmoreclinic.org"], status: "active" as const },
  ...roster(FILM_NOW).clients,
];

export const WORKERS = [
  { key: "grace", name: "Grace Rhee", team: "Litigation", role: "Partner" },
  { key: "daniel", name: "Daniel Whitlock", team: "Litigation", role: "Managing partner" },
  { key: "sam", name: "Sam Ortiz", team: "Litigation", role: "Paralegal" },
  ...MORE_WORKERS.map(({ key, name, team, role }) => ({ key, name, team, role })),
];

/** The chats the firm's memories come from: which AI, and when. */
const CHATS: Record<string, PlatformId> = {
  "Hartwell engagement letter": "claude",
  "Hartwell deposition outline": "chatgpt",
  "Mendes deposition prep": "claude",
  "Briarstone discovery requests": "chatgpt",
  "Hartwell case strategy": "claude",
  "Settlement range memo": "chatgpt",
  "Hartwell monthly report": "chatgpt",
  "Call notes with Tom Reyes": "gemini",
  "Expert witness questions": "chatgpt",
  "Trial calendar": "claude",
  "Billing narratives": "chatgpt",
  "Motion to compel draft": "chatgpt",
  "Damages model": "chatgpt",
  "Osei Bakery intake": "chatgpt",
  "Calder Foods lease review": "chatgpt",
  "Calder trademark search": "gemini",
  "Dunmore Clinic records request": "claude",
  "Conflicts check for Dunmore": "chatgpt",
  "Deposition practice notes": "claude",
  "Deposition exhibit list": "chatgpt",
  "October billing narrative": "chatgpt",
  "Court rules for the Northern District": "claude",
  "Firm staffing": "gemini",
  "Privilege log format": "claude",
  "Firm style guide": "claude",
  "Conflicts for Briarstone": "chatgpt",
};

/** One memory: what was said, in which chat and on which day, and how it is filed. */
type F = { text: string; chat: keyof typeof CHATS; on: string; kind?: FactView["kind"]; key?: string; slot?: string; due?: string; basis?: FactView["basis"] };

/** Something in memory: a folder, a client, a contact or a matter, its memories and what it holds. */
type T = { label: string; kind: GraphNode["kind"]; facts?: F[]; kids?: T[]; client?: string; aliases?: string[]; values?: Array<[IdentityValueView["field"], string]>; key?: string };

const k = field.client;

/** The day a "October 30" or "November 3" in a text falls on, in the film's year. */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function dueIn(text: string): string | undefined {
  const m = new RegExp(`\\b(${MONTHS.join("|")}) (\\d{1,2})\\b`).exec(text);
  if (!m) return undefined;
  return `2026-${String(MONTHS.indexOf(m[1]!) + 1).padStart(2, "0")}-${m[2]!.padStart(2, "0")}`;
}

/** The client sheet's lines from the field, with the chats they came from. */
const promise = (p: readonly string[], chat: F["chat"], on: string): F => ({ text: `${p[0]} ${p[1]}.`, chat, on, kind: "task", key: "promise.what" });
const deadline = (d: readonly string[], chat: F["chat"], on: string): F =>
  d.length === 4 ? { text: `${d[0]} ${d[1]}.`, chat, on, kind: "task", key: "due" } : { text: d[0]!, chat, on, kind: "task", key: "due" };

const HARTWELL: T = {
  label: k.name,
  kind: "organization",
  client: "hartwell",
  aliases: ["Hartwell", "hartwelllogistics.com"],
  facts: [
    { text: "Hartwell Logistics is an active client of the firm.", chat: "Hartwell engagement letter", on: "2026-09-02", kind: "attribute", key: "client.status" },
    { text: "Hartwell Logistics runs freight trucking across the Midwest from Joliet.", chat: "Hartwell engagement letter", on: "2026-09-02", kind: "attribute", key: "client.industry" },
    promise(k.promises[0]!, "Briarstone discovery requests", "2026-10-15"),
    promise(k.promises[1]!, "Mendes deposition prep", "2026-10-22"),
    promise(k.promises[2]!, "Settlement range memo", "2026-10-20"),
    { text: `${k.meeting[0]} ${k.meeting[1]} ${k.meeting[2]}`, chat: "Hartwell deposition outline", on: "2026-10-21", kind: "event", key: "meeting.when" },
    { text: k.requests[0]![0]!, chat: "Hartwell case strategy", on: "2026-10-09", kind: "preference", key: "request.what" },
    { text: `${k.requests[1]![0]} ${k.requests[1]![1]} ${k.requests[1]![2]}`, chat: "Hartwell monthly report", on: "2026-09-30", kind: "note", key: "request.what" },
    { text: k.requests[2]![0]!, chat: "Call notes with Tom Reyes", on: "2026-10-03", kind: "preference", key: "request.what" },
    deadline(k.deadlines[0]!, "Expert witness questions", "2026-10-12"),
    deadline(k.deadlines[1]!, "Trial calendar", "2026-09-18"),
    deadline(k.deadlines[2]!, "Trial calendar", "2026-10-01"),
    { text: k.billing[0]!, chat: "Billing narratives", on: "2026-08-19", kind: "attribute", key: "billing.terms" },
    { text: `${k.document[0]} ${k.document[1]} ${k.document[2]}`, chat: "Hartwell engagement letter", on: "2026-09-02", kind: "note", slot: "documents", basis: "pasted" },
  ],
  kids: [
    {
      label: k.contacts[0]!,
      kind: "person",
      key: "priya",
      values: [["email", "priya.hale@hartwelllogistics.com"], ["phone", "+1 (815) 555-0148"], ["role", "general counsel"]],
      facts: [{ text: "Priya Hale is the general counsel at Hartwell Logistics and signs off on every filing.", chat: "Hartwell engagement letter", on: "2026-09-02", kind: "attribute", key: "contact.role" }],
    },
    {
      label: k.contacts[1]!,
      kind: "person",
      key: "tom",
      values: [["email", "tom.reyes@hartwelllogistics.com"], ["role", "chief financial officer"]],
      facts: [{ text: "Tom Reyes is the CFO at Hartwell Logistics and keeps the legal budget.", chat: "Call notes with Tom Reyes", on: "2026-10-03", kind: "attribute", key: "contact.role" }],
    },
    {
      label: k.engagement,
      kind: "project",
      facts: [
        { text: "Carl Mendes of Briarstone is deposed on Thursday, October 29 at 10 am.", chat: "Mendes deposition prep", on: "2026-10-14", kind: "event", key: "due" },
        { text: "Briarstone says its trucks ran late because of a dispatch software outage in March.", chat: "Briarstone discovery requests", on: "2026-10-02" },
        { text: "Our theory is that Briarstone knew of the outage for two weeks and kept billing full rates.", chat: "Hartwell case strategy", on: "2026-10-09" },
        { text: "Carl Mendes ran dispatch at Briarstone from 2023 to 2026.", chat: "Briarstone discovery requests", on: "2026-10-02" },
        { text: "Exhibit 14 is the March 6 email where Mendes calls the outage a known issue.", chat: "Mendes deposition prep", on: "2026-10-14" },
        { text: "Hartwell claims lost contracts from the late March deliveries.", chat: "Damages model", on: "2026-10-07" },
        { text: "We filed the motion to compel Briarstone's dispatch records on October 5.", chat: "Motion to compel draft", on: "2026-10-05" },
      ],
    },
  ],
};

const OSEI: T = {
  label: "Osei Bakery",
  kind: "organization",
  client: "osei",
  aliases: ["Osei", "oseibakery.com"],
  facts: [
    { text: "Osei Bakery is a family bakery with three shops in Evanston.", chat: "Osei Bakery intake", on: "2026-10-06", kind: "attribute", key: "client.industry" },
    { text: "Osei Bakery became an active client in October.", chat: "Osei Bakery intake", on: "2026-10-06", kind: "attribute", key: "client.status" },
    { text: "We promised Ama Osei a letter to the landlord by November 6.", chat: "Osei Bakery intake", on: "2026-10-06", kind: "task", key: "promise.what" },
  ],
  kids: [
    { label: "Ama Osei", kind: "person", key: "ama", values: [["role", "owner"]], facts: [{ text: "Ama Osei owns Osei Bakery and is our only contact there.", chat: "Osei Bakery intake", on: "2026-10-06", kind: "attribute", key: "contact.role" }] },
    {
      label: "Lease dispute",
      kind: "project",
      facts: [
        { text: "The landlord says the Main Street lease ends in March.", chat: "Osei Bakery intake", on: "2026-10-06" },
        { text: "Osei Bakery says the lease renews for five years under clause 12.", chat: "Osei Bakery intake", on: "2026-10-06" },
      ],
    },
  ],
};

const CALDER: T = {
  label: "Calder Foods",
  kind: "organization",
  client: "calder",
  aliases: ["Calder", "calderfoods.com"],
  facts: [
    { text: "Calder Foods makes frozen dumplings sold in grocery stores.", chat: "Calder trademark search", on: "2026-09-24", kind: "attribute", key: "client.industry" },
    { text: "Calder Foods is an active client.", chat: "Calder trademark search", on: "2026-09-24", kind: "attribute", key: "client.status" },
    { text: "Calder Foods wants the warehouse lease reviewed before it signs.", chat: "Calder Foods lease review", on: "2026-10-11", kind: "note", key: "request.what" },
  ],
  kids: [
    {
      label: "Calder trademark",
      kind: "project",
      facts: [
        { text: "The trademark search found two similar marks in class 30.", chat: "Calder trademark search", on: "2026-09-24" },
        { text: "The Calder trademark application goes in by November 20.", chat: "Calder trademark search", on: "2026-09-24", kind: "task", key: "due" },
      ],
    },
  ],
};

const DUNMORE: T = {
  label: "Dunmore Clinic",
  kind: "organization",
  client: "dunmore",
  aliases: ["Dunmore", "dunmoreclinic.org"],
  facts: [
    { text: "Dunmore Clinic is a community health clinic in Oak Park.", chat: "Dunmore Clinic records request", on: "2026-10-14", kind: "attribute", key: "client.industry" },
    { text: "Dunmore Clinic asked for help answering a patient records request.", chat: "Dunmore Clinic records request", on: "2026-10-14", kind: "note", key: "request.what" },
    { text: "The Dunmore records request must be answered by November 13.", chat: "Dunmore Clinic records request", on: "2026-10-14", kind: "task", key: "due" },
    { text: "Dunmore Clinic is an active client.", chat: "Conflicts check for Dunmore", on: "2026-10-16", kind: "attribute", key: "client.status" },
    { text: "Conflicts for Dunmore Clinic cleared on October 16.", chat: "Conflicts check for Dunmore", on: "2026-10-16", kind: "attribute" },
  ],
};

/**
 * The firm's own folders the film's chats filled, and the section each now
 * sits in: how the firm works, its billing and its team in Company, the
 * court's rules in Court and filings, its templates and its briefs in
 * Writing (roster.ts holds the rest of each section).
 */
const OWN: Array<T & { home: string }> = [
  {
    home: "company",
    label: "How we work",
    kind: "folder",
    facts: [
      { text: "Every deposition outline starts with the witness's role and who they reported to.", chat: "Deposition practice notes", on: "2026-09-10" },
      { text: "Exhibits are premarked and sent to the court reporter two days before a deposition.", chat: "Deposition exhibit list", on: "2026-10-19" },
      { text: "A second associate takes notes at every deposition.", chat: "Deposition practice notes", on: "2026-09-10" },
      { text: "Every new client gets a conflicts check before the intake call.", chat: "Conflicts check for Dunmore", on: "2026-10-16" },
      { text: "Conflicts for Briarstone and its affiliates were cleared on September 3.", chat: "Conflicts for Briarstone", on: "2026-09-03" },
    ],
  },
  {
    home: "company",
    label: "Billing",
    kind: "folder",
    facts: [
      { text: "Time is billed in tenths of an hour.", chat: "October billing narrative", on: "2026-10-02" },
      { text: "Billing narratives name the task and the matter, never the client's staff.", chat: "Billing narratives", on: "2026-08-19" },
      { text: "Invoices go out on the fifth of each month.", chat: "October billing narrative", on: "2026-10-02" },
    ],
  },
  {
    home: "company",
    label: "Team",
    kind: "folder",
    kids: [
      { label: "Grace Rhee", kind: "person", key: "grace", facts: [{ text: "Grace Rhee is the partner on Hartwell v. Briarstone.", chat: "Firm staffing", on: "2026-09-04" }] },
      { label: "Daniel Whitlock", kind: "person", key: "daniel", facts: [{ text: "Daniel Whitlock approves every settlement range before it goes to a client.", chat: "Settlement range memo", on: "2026-10-20" }] },
      { label: "Sam Ortiz", kind: "person", key: "sam", facts: [{ text: "Sam Ortiz is the paralegal who keeps the exhibit list.", chat: "Deposition exhibit list", on: "2026-10-19" }] },
    ],
  },
  {
    home: "court",
    label: "Northern District",
    kind: "folder",
    facts: [
      { text: "The Northern District of Illinois wants a joint status report before each hearing.", chat: "Court rules for the Northern District", on: "2026-09-15" },
      { text: "Briefs over 15 pages need leave of court.", chat: "Motion to compel draft", on: "2026-10-05" },
    ],
  },
  {
    home: "writing",
    label: "Templates",
    kind: "folder",
    facts: [
      { text: "The firm's deposition outline template has five parts.", chat: "Deposition practice notes", on: "2026-09-10" },
      { text: "The privilege log lists Bates ranges in the first column.", chat: "Privilege log format", on: "2026-09-28" },
    ],
  },
  {
    home: "writing",
    label: "Briefs",
    kind: "folder",
    facts: [
      { text: "Write short plain sentences, one point to a paragraph.", chat: "Firm style guide", on: "2026-08-28", kind: "style" },
      { text: "Lead each section of a brief with what we ask the court for.", chat: "Firm style guide", on: "2026-08-28", kind: "style" },
    ],
  },
];

/** Ids as the engine makes them: a prefix and a UUIDv7 from the record's time, with seeded bits after (as the teams film makes them). */
function idMaker() {
  let n = 0;
  const hex = (v: number, w: number) => Math.floor(v).toString(16).padStart(w, "0").slice(-w);
  return (prefix: string, at: number): string => {
    n += 1;
    const t = hex(Math.max(0, Math.floor(at)), 12);
    const r = (n * 2654435761) % 4294967296;
    return `${prefix}_${t.slice(0, 8)}-${t.slice(8, 12)}-7${hex(n, 3)}-${(8 + (n % 4)).toString(16)}${hex(r, 3)}-${hex(r * 7, 6)}${hex(n * 977, 6)}`;
  };
}

/** The dates, emails and phones in a text, as the ranges the sheet sets in mono. */
function specificsOf(text: string): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const re = new RegExp(`\\b(?:${MONTHS.join("|")}) \\d{1,2}\\b|[\\w.]+@[\\w.-]+\\.[a-z]+|\\+\\d[\\d ()-]{7,}\\d`, "g");
  for (let m = re.exec(text); m; m = re.exec(text)) out.push([m.index, m.index + m[0].length]);
  return out;
}

export function buildFirm(): Mem {
  const now = FILM_NOW;
  const id = idMaker();
  const nodes = new Map<string, Node>();
  const facts = new Map<string, Fact>();
  const clientIds = new Map<string, string>();
  const chatIds = new Map(Object.keys(CHATS).map((title, i) => [title, `c${(i + 1).toString(36)}${title.length.toString(36)}`]));
  const used = new Set<string>();
  const start = Date.parse("2025-06-02T15:00:00Z");

  const node = (o: Partial<Node> & Pick<Node, "id" | "kind" | "label" | "section">): Node => {
    const n: Node = { parent: null, importance: 3, pinned: false, urgency: "none", facts: 0, history: false, aliases: [], summary: null, kids: [], facts_: [], values: [], relations: [], ...o };
    nodes.set(n.id, n);
    if (n.parent) nodes.get(n.parent)?.kids.push(n.id);
    return n;
  };

  const self = node({ id: id("ent", start), kind: "self", label: "You", section: "", importance: 5 });
  const sections = { company: "sec_company", clients: "sec_clients" };
  node({ id: sections.company, kind: "section", label: "Company", section: sections.company });
  node({ id: sections.clients, kind: "section", label: "Clients", section: sections.clients });
  // The firm's other sections, after Company and Clients as Coere for Teams rings them (roster.ts).
  const r = roster(now);
  addSections(nodes, r.sections.filter((x) => x.key !== "company"));

  const sourceOf = (f: F, fid: string): FactSource => {
    const convId = chatIds.get(f.chat)!;
    used.add(convId);
    return { evidenceId: `${fid}#e0`, platform: CHATS[f.chat]!, convId, title: f.chat, msg: 0, role: "user", at: `${f.on}T15:30:00Z`, url: null, stale: false };
  };

  const addFact = (f: F, owner: Node, client: string | null) => {
    const at = Date.parse(`${f.on}T15:30:00Z`);
    const fid = id("fact", at);
    const kind = f.kind ?? "note";
    const dueDay = kind === "task" || kind === "event" ? dueIn(f.text) : undefined;
    const due = dueDay ? { at: dueDay, tz: null } : null;
    const source = sourceOf(f, fid);
    // A meeting that already took place keeps its day for the sheet and a catch up, and nothing about it is due any more.
    const held = kind === "event" && due !== null && Date.parse(`${due.at}T23:59:59Z`) < now;
    const urgency = describeUrgency(
      { status: "active", kind: kind as UrgencyKind, progress: kind === "task" ? "needs-action" : undefined, urgency: due && !held ? { due: { at: due.at } } : undefined, evidence: [{ at: source.at }] },
      now,
      ZONE,
    );
    const fact: Fact = {
      id: fid,
      kind,
      key: f.key ?? "",
      text: f.text,
      specifics: specificsOf(f.text),
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
      basis: f.basis ?? "user_stated",
      sensitivity: null,
      sources: [source],
      supersededBy: null,
      replacedOn: null,
      changedBy: null,
      slot: f.slot ?? null,
      owner: owner.id,
      client,
    } as Fact;
    facts.set(fid, fact);
    owner.facts_.push(fid);
  };

  const place = (t: T, parent: Node, section: string, client: string | null) => {
    const first = Math.min(...(t.facts ?? []).map((f) => Date.parse(`${f.on}T15:30:00Z`)), now - 30 * 86_400_000);
    const n = node({ id: id("ent", first), kind: t.kind, label: t.label, section, parent: parent.id, importance: t.kind === "organization" ? 4 : 3, aliases: t.aliases ?? [], ...(t.client ? { client: t.client } : {}), ...(t.key ? { key: t.key } : {}) });
    const mine = t.client ?? client;
    if (t.client) clientIds.set(t.client, n.id);
    for (const f of t.facts ?? []) addFact(f, n, mine);
    for (const kid of t.kids ?? []) place(kid, n, section, mine);
    if (t.values) {
      const said = t.facts?.[0];
      n.values = [
        ...t.values.map(([fieldName, value], i) => ({
          id: id("fact", first + i),
          field: fieldName,
          value,
          href: fieldName === "email" ? `mailto:${value}` : fieldName === "phone" ? `tel:${value.replace(/[^\d+]/g, "")}` : null,
          sources: said ? [sourceOf(said, `v${i}`)] : [],
          said: said?.on ?? null,
        })),
        { id: id("fact", first + 9), field: "org", value: parent.label, href: null, sources: [], said: null },
      ] as IdentityValueView[];
    }
    // A contact works at its client, and a matter is for it, as the sheet's Related lists them.
    if (t.kind === "person" && parent.kind === "organization") {
      n.relations = [{ type: "works_at", label: "Works at", direction: "out", other: { id: parent.id, label: parent.label, kind: "organization" } }];
      parent.relations.push({ type: "works_at", label: `${t.label} works here`, direction: "in", other: { id: n.id, label: t.label, kind: "person" } });
    }
    if (t.kind === "project" && parent.kind === "organization")
      parent.relations.unshift({ type: "for", label: `${t.label} is for this`, direction: "in", other: { id: n.id, label: t.label, kind: "project" } });
    return n;
  };

  const clients = nodes.get(sections.clients)!;
  for (const t of OWN) place(t, nodes.get(sectionId(t.home))!, sectionId(t.home), null);
  for (const t of [HARTWELL, OSEI, CALDER, DUNMORE]) place(t, clients, sections.clients, null);

  // The rest of the firm, grown from its roster to its real size (grow.ts, roster.ts): four more clients, the
  // firm's team, and every other section's folders, from as many chats as the firm's AIs hold.
  const team = [...nodes.values()].find((n) => n.label === "Team" && n.parent === sections.company)!.id;
  const existing = [...new Map([...facts.values()].flatMap((f) => f.sources).map((src) => [src.convId, { platform: src.platform, title: src.title }])).values()];
  const grown = grow({
    seed: 0x1e6a1,
    now,
    zone: ZONE,
    nodes,
    facts,
    chats: LIBRARY,
    existing,
    plant: [
      { parent: team, section: sections.company, things: r.people },
      { parent: sections.clients, section: sections.clients, things: r.clientThings },
      ...Object.entries(r.named).map(([key, lines]) => ({ parent: clientIds.get(key)!, section: sections.clients, lines, client: key })),
      ...plantSections(nodes, r.sections, now),
    ],
  });
  for (const t of r.clientThings) {
    const n = [...nodes.values()].find((x) => x.kind === "organization" && x.client === t.client);
    if (n && t.client) clientIds.set(t.client, n.id);
  }
  void used;

  return { now, nodes, facts, self: self.id, sections, clientIds, chats: existing.length + grown.chats.length, written: null };
}
