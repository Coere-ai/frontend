import type { PlatformId } from "@coere/core";
import type { FactSource, FactView, GraphNode, IdentityValueView, MemoryNodeDetail } from "@coere/memory";
import { describeUrgency } from "@v2/packages/memory/src/time/labels";
import { field } from "../../../demos/industries/fields/education.mjs";
import { FILM_NOW, ZONE } from "./clock";
import { FIELD, TEAM } from "./corpus";
import { growTeam, type Grown } from "./scale";

/**
 * Westbrook High School's memory as Coere for Teams files it from Priya's
 * chats: Company with the school's own rules and calendar, Clients with a
 * folder per class holding its co-teachers, its units and its facts by
 * slot, and Tone and voice. The same shapes the teams film builds from
 * coere-v2's agency corpus (memory.ts there), here written for a biology
 * teacher from the field's data (demos/industries/fields/education.mjs).
 * Made up. The lines below are the ones the film shows; the rest of the
 * department's year and a half of chats (about 370 across its staff and
 * AIs, and some 460 memories) grows from a seed in corpus.ts and scale.ts
 * and is filed beside them, so every count the dashboard gives is real.
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
  sections: { company: string; clients: string; tone: string };
  clientIds: Map<string, string>;
  chats: number;
  /** While a build runs, how many memories it has written; null once memory is built (always, in this film). */
  written: number | null;
}

export const FIRM = { name: field.firm, aliases: ["Westbrook High", "Westbrook"], domains: ["westbrookhs.org"], industry: "education" as const };
export const SELF = { name: field.person.name, role: "Biology teacher", team: "Science" };

/** Priya's classes, as Settings lists them for Coere for Teams. */
const HAND_CLIENTS = [
  { key: "p3bio", name: "Period 3 Biology", aliases: ["Period 3", "P3 Biology"], domains: [], status: "active" as const },
  { key: "p5bio", name: "Period 5 Biology", aliases: ["Period 5", "P5 Biology"], domains: [], status: "active" as const },
  { key: "apes", name: "AP Environmental", aliases: ["AP Environmental Science", "APES"], domains: [], status: "active" as const },
  { key: "club", name: "Science club", aliases: ["Science Olympiad club"], domains: [], status: "active" as const },
];

const HAND_WORKERS = [
  { key: "dana", name: "Dana Brooks", team: "Science", role: "Department head" },
  { key: "omar", name: "Omar Haddad", team: "Science", role: "Chemistry teacher" },
  { key: "leah", name: "Leah Kim", team: "Science", role: "Lab technician" },
];

/** The chats the school's memories come from: which AI, and when. */
const CHATS: Record<string, PlatformId> = {
  "Period 3 photosynthesis unit": "claude",
  "Photosynthesis quiz results": "claude",
  "Lab report grading": "chatgpt",
  "Field trip planning": "claude",
  "Reading supports for period 3": "claude",
  "Unit test planning": "chatgpt",
  "Weekly family updates": "chatgpt",
  "Notes from Mr. Chen": "gemini",
  "Co-planning with Ms. Alvarez": "chatgpt",
  "Plain language test questions": "claude",
  "Science fair timeline": "chatgpt",
  "Field trip budget": "chatgpt",
  "Start of year class roster": "gemini",
  "Period 5 cell unit": "chatgpt",
  "Cell unit lab ideas": "claude",
  "AP Environmental field trip": "claude",
  "Watershed sampling plan": "gemini",
  "Science club budget": "chatgpt",
  "Science club meeting notes": "claude",
  "Lab safety quiz": "claude",
  "Grading policy wording": "chatgpt",
  "Rubric for lab reports": "chatgpt",
  "Department meeting notes": "gemini",
  "Bell schedule changes": "claude",
  "Parent email about grades": "chatgpt",
  "Writing for students": "claude",
};

/** One memory: what was said, in which chat and on which day, and how it is filed. */
type F = { text: string; chat: string; on: string; kind?: FactView["kind"]; key?: string; slot?: string; due?: string; basis?: FactView["basis"] };

/** Something in memory: a folder, a class, a co-teacher or a unit, its memories and what it holds. */
type T = { label: string; kind: GraphNode["kind"]; facts?: F[]; kids?: T[]; client?: string; aliases?: string[]; values?: Array<[IdentityValueView["field"], string]>; key?: string };

/** The rest of the department's chats and memories, grown from a seed (corpus.ts, scale.ts). */
const GROWN = growTeam(FIELD, FILM_NOW, Object.keys(CHATS), ["Priya", "Alvarez", "Chen", "Dana", "Omar", "Leah", "Brooks", "Haddad", "Kim", "Raman"]);

/** Every chat memory came from, with its AI: the ones written here and the grown ones. */
const AI = new Map<string, PlatformId>([...(Object.entries(CHATS) as Array<[string, PlatformId]>), ...[...GROWN.g.chats].map(([title, c]) => [title, c.ai] as [string, PlatformId])]);

/** A grown thing as this file writes one. */
const toT = (t: Grown): T => ({
  label: t.label,
  kind: t.kind,
  facts: t.facts.map((f) => ({ text: f.text, chat: f.chat, on: f.on, kind: f.kind, key: f.key, slot: f.slot, due: f.due, basis: f.basis })),
  kids: t.kids.map(toT),
  ...(t.client ? { client: t.client } : {}),
  ...(t.aliases ? { aliases: t.aliases } : {}),
  ...(t.values ? { values: t.values } : {}),
  ...(t.key ? { key: t.key } : {}),
});

/** Priya's classes and programs, as Settings lists them for Coere for Teams: the four the film names and the grown ones. */
export const CLIENTS = [
  ...HAND_CLIENTS,
  ...GROWN.clients.map((c) => ({ key: c.client!, name: c.label, aliases: (c.aliases ?? []).filter((a) => !a.includes(".")), domains: (c.aliases ?? []).filter((a) => a.includes(".")), status: "active" as const })),
];

/** The staff memory knows: the three the film names and the rest of the school. */
export const WORKERS = [...HAND_WORKERS, ...TEAM.map(([name, team, role]) => ({ key: name.split(" ")[0]!.toLowerCase(), name, team, role }))];

const k = field.client;

/** The day a "October 30" or "November 3" in a text falls on, in the film's year. */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function dueIn(text: string): string | undefined {
  const m = new RegExp(`\\b(${MONTHS.join("|")}) (\\d{1,2})\\b`).exec(text);
  if (!m) return undefined;
  return `2026-${String(MONTHS.indexOf(m[1]!) + 1).padStart(2, "0")}-${m[2]!.padStart(2, "0")}`;
}

/** The class sheet's lines from the field, with the chats they came from. */
const promise = (p: readonly string[], chat: F["chat"], on: string): F => ({ text: `${p[0]} ${p[1]}.`, chat, on, kind: "task", key: "promise.what" });
const deadline = (d: readonly string[], chat: F["chat"], on: string): F =>
  d.length === 4 ? { text: `${d[0]} ${d[1]}.`, chat, on, kind: "task", key: "due" } : { text: d[0]!, chat, on, kind: "task", key: "due" };

const PERIOD3: T = {
  label: k.name,
  kind: "organization",
  client: "p3bio",
  aliases: ["Period 3", "P3 Biology"],
  facts: [
    { text: "Period 3 Biology is an active class this school year.", chat: "Start of year class roster", on: "2026-08-28", kind: "attribute", key: "client.status" },
    { text: "Period 3 Biology is a tenth grade class of 28 students.", chat: "Start of year class roster", on: "2026-08-28", kind: "attribute", key: "client.industry" },
    promise(k.promises[0]!, "Reading supports for period 3", "2026-10-14"),
    promise(k.promises[1]!, "Lab report grading", "2026-10-22"),
    promise(k.promises[2]!, "Field trip planning", "2026-10-20"),
    { text: `${k.meeting[0]} ${k.meeting[1]} ${k.meeting[2]}`, chat: "Co-planning with Ms. Alvarez", on: "2026-10-21", kind: "event", key: "meeting.when" },
    { text: k.requests[0]![0]!, chat: "Plain language test questions", on: "2026-10-08", kind: "preference", key: "request.what" },
    { text: `${k.requests[1]![0]} ${k.requests[1]![1]} ${k.requests[1]![2]}`, chat: "Weekly family updates", on: "2026-09-01", kind: "note", key: "request.what" },
    { text: k.requests[2]![0]!, chat: "Notes from Mr. Chen", on: "2026-09-25", kind: "preference", key: "request.what" },
    deadline(k.deadlines[0]!, "Lab report grading", "2026-10-22"),
    deadline(k.deadlines[1]!, "Unit test planning", "2026-10-06"),
    deadline(k.deadlines[2]!, "Science fair timeline", "2026-10-01"),
    { text: k.billing[0]!, chat: "Field trip budget", on: "2026-10-03", kind: "attribute", key: "billing.terms" },
    { text: `${k.document[0]} ${k.document[1]} ${k.document[2]}`, chat: "Period 3 photosynthesis unit", on: "2026-10-01", kind: "note", slot: "documents", basis: "pasted" },
  ],
  kids: [
    {
      label: k.contacts[0]!,
      kind: "person",
      key: "alvarez",
      values: [["email", "m.alvarez@westbrookhs.org"], ["role", "special education co-teacher"]],
      facts: [{ text: "Ms. Alvarez co-teaches period 3 and plans the reading and test supports.", chat: "Co-planning with Ms. Alvarez", on: "2026-10-21", kind: "attribute", key: "contact.role" }],
    },
    {
      label: k.contacts[1]!,
      kind: "person",
      key: "chen",
      values: [["email", "d.chen@westbrookhs.org"], ["phone", "+1 (914) 555-0172"], ["role", "assistant principal"]],
      facts: [{ text: "Mr. Chen is the assistant principal who signs off on field trips.", chat: "Notes from Mr. Chen", on: "2026-09-25", kind: "attribute", key: "contact.role" }],
    },
    {
      label: k.engagement,
      kind: "project",
      facts: [
        { text: "Period 3 finished the leaf structure lesson on October 20.", chat: "Period 3 photosynthesis unit", on: "2026-10-20" },
        { text: "Many in period 3 mixed up the light and dark reactions on the quiz.", chat: "Photosynthesis quiz results", on: "2026-10-16" },
        { text: "The unit covers inputs and outputs, the light reactions and the Calvin cycle.", chat: "Period 3 photosynthesis unit", on: "2026-10-01" },
        { text: "The leaf disk lab takes about 25 minutes and fits one class.", chat: "Period 3 photosynthesis unit", on: "2026-10-21" },
        { text: "Period 3 does best with short labs and pair work.", chat: "Co-planning with Ms. Alvarez", on: "2026-09-18" },
        { text: "Four students in period 3 have extended time on tests.", chat: "Reading supports for period 3", on: "2026-08-28" },
      ],
    },
  ],
};

const PERIOD5: T = {
  label: "Period 5 Biology",
  kind: "organization",
  client: "p5bio",
  aliases: ["Period 5", "P5 Biology"],
  facts: [
    { text: "Period 5 Biology is a tenth grade class of 31 students.", chat: "Start of year class roster", on: "2026-08-28", kind: "attribute", key: "client.industry" },
    { text: "Period 5 Biology is an active class this school year.", chat: "Start of year class roster", on: "2026-08-28", kind: "attribute", key: "client.status" },
    { text: "I promised period 5 their cell model grades by November 4.", chat: "Period 5 cell unit", on: "2026-10-23", kind: "task", key: "promise.what" },
  ],
  kids: [
    {
      label: "Cell unit",
      kind: "project",
      facts: [
        { text: "Period 5 is two weeks behind period 3 because of the assembly schedule.", chat: "Period 5 cell unit", on: "2026-10-23" },
        { text: "The cell unit test for period 5 is on November 12.", chat: "Period 5 cell unit", on: "2026-10-23", kind: "task", key: "due" },
      ],
    },
  ],
};

const APES: T = {
  label: "AP Environmental",
  kind: "organization",
  client: "apes",
  aliases: ["AP Environmental Science", "APES"],
  facts: [
    { text: "AP Environmental is a class of 22 juniors and seniors.", chat: "AP Environmental field trip", on: "2026-09-14", kind: "attribute", key: "client.industry" },
    { text: "AP Environmental is an active class this school year.", chat: "AP Environmental field trip", on: "2026-09-14", kind: "attribute", key: "client.status" },
  ],
  kids: [
    {
      label: "Field trip",
      kind: "project",
      facts: [
        { text: "AP Environmental samples water at Saw Mill River on November 17.", chat: "AP Environmental field trip", on: "2026-09-14", kind: "event", key: "meeting.when" },
        { text: "Each sampling team needs one test kit and one adult.", chat: "Watershed sampling plan", on: "2026-10-09" },
      ],
    },
  ],
};

const CLUB: T = {
  label: "Science club",
  kind: "organization",
  client: "club",
  aliases: ["Science Olympiad club"],
  facts: [
    { text: "Science club meets Thursdays after school in room 214.", chat: "Science club meeting notes", on: "2026-09-10", kind: "attribute", key: "client.industry" },
    { text: "Science club is active this school year.", chat: "Science club meeting notes", on: "2026-09-10", kind: "attribute", key: "client.status" },
    { text: "Science club has 300 dollars for the year from the parent association.", chat: "Science club budget", on: "2026-10-02", kind: "attribute", key: "billing.terms" },
    { text: "Science club entries for the regional fair are due by December 4.", chat: "Science club budget", on: "2026-10-02", kind: "task", key: "due" },
  ],
};

const g = field.graph.hubs;
const companyName = (i: number) => g[0]!.children[i]!.label;

const COMPANY: T[] = [
  {
    label: companyName(0),
    kind: "folder",
    facts: [
      { text: "Goggles stay on for every lab with heat or liquids.", chat: "Lab safety quiz", on: "2026-09-03" },
      { text: "Every student passes the lab safety quiz before the first lab.", chat: "Lab safety quiz", on: "2026-09-03" },
      { text: "Broken glass goes in the white box by the sink, never the trash.", chat: "Lab safety quiz", on: "2026-09-03" },
    ],
  },
  {
    label: companyName(1),
    kind: "folder",
    facts: [
      { text: "Tests and labs are 60 percent of the grade, homework is 20 and classwork is 20.", chat: "Grading policy wording", on: "2026-08-25" },
      { text: "Late work loses 10 percent a day, up to three days.", chat: "Grading policy wording", on: "2026-08-25" },
    ],
  },
  {
    label: companyName(2),
    kind: "folder",
    facts: [
      { text: "Lab reports are graded on question, method, data and conclusion, 4 points each.", chat: "Rubric for lab reports", on: "2026-09-12" },
      { text: "Every rubric has a student friendly version with the same points.", chat: "Rubric for lab reports", on: "2026-09-12" },
    ],
  },
  {
    label: companyName(3),
    kind: "folder",
    kids: [
      { label: "Dana Brooks", kind: "person", key: "dana", facts: [{ text: "Dana Brooks is the science department head and approves unit tests.", chat: "Department meeting notes", on: "2026-09-08" }] },
      { label: "Omar Haddad", kind: "person", key: "omar", facts: [{ text: "Omar Haddad teaches chemistry and shares the lab room on Fridays.", chat: "Department meeting notes", on: "2026-09-08" }] },
      { label: "Leah Kim", kind: "person", key: "leah", facts: [{ text: "Leah Kim sets up labs when the request is in two days before.", chat: "Department meeting notes", on: "2026-09-08" }] },
    ],
  },
  {
    label: companyName(4),
    kind: "folder",
    facts: [
      { text: "Report cards close on November 13.", chat: "Bell schedule changes", on: "2026-10-05" },
      { text: "School is closed November 26 and 27 for Thanksgiving.", chat: "Bell schedule changes", on: "2026-10-05" },
    ],
  },
  {
    label: companyName(5),
    kind: "folder",
    facts: [
      { text: "Grades go to families through the portal, never by text message.", chat: "Parent email about grades", on: "2026-09-20" },
      { text: "Families hear back within two school days.", chat: "Parent email about grades", on: "2026-09-20" },
    ],
  },
];

const TONE: T = {
  label: g[2]!.children[0]!.label,
  kind: "folder",
  facts: [
    { text: "Write for students in short plain sentences, one step at a time.", chat: "Writing for students", on: "2026-08-30", kind: "style" },
    { text: "Start every handout with what students will be able to do.", chat: "Writing for students", on: "2026-08-30", kind: "style" },
  ],
};

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
  const chatIds = new Map([...AI.keys()].map((title, i) => [title, `c${(i + 1).toString(36)}${title.length.toString(36)}`]));
  const used = new Set<string>();
  const start = Date.parse("2025-06-02T15:00:00Z");

  const node = (o: Partial<Node> & Pick<Node, "id" | "kind" | "label" | "section">): Node => {
    const n: Node = { parent: null, importance: 3, pinned: false, urgency: "none", facts: 0, history: false, aliases: [], summary: null, kids: [], facts_: [], values: [], relations: [], ...o };
    nodes.set(n.id, n);
    if (n.parent) nodes.get(n.parent)?.kids.push(n.id);
    return n;
  };

  const self = node({ id: id("ent", start), kind: "self", label: "You", section: "", importance: 5 });
  const sections = { company: "sec_company", clients: "sec_clients", tone: "sec_tone" };
  node({ id: sections.company, kind: "section", label: "Company", section: sections.company });
  node({ id: sections.clients, kind: "section", label: "Clients", section: sections.clients });
  node({ id: sections.tone, kind: "section", label: "Tone and voice", section: sections.tone });

  const sourceOf = (f: F, fid: string): FactSource => {
    const convId = chatIds.get(f.chat)!;
    used.add(convId);
    return { evidenceId: `${fid}#e0`, platform: AI.get(f.chat)!, convId, title: f.chat, msg: 0, role: "user", at: `${f.on}T15:30:00Z`, url: null, stale: false };
  };

  const addFact = (f: F, owner: Node, client: string | null) => {
    const at = Date.parse(`${f.on}T15:30:00Z`);
    const fid = id("fact", at);
    const kind = f.kind ?? "note";
    const dueDay = f.due ?? (kind === "task" || kind === "event" ? dueIn(f.text) : undefined);
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
        ...(parent.kind === "organization" ? [{ id: id("fact", first + 9), field: "org", value: parent.label, href: null, sources: [], said: null }] : []),
      ] as IdentityValueView[];
    }
    // A co-teacher works with the class, and a unit is for it, as the sheet's Related lists them.
    if (t.kind === "person" && parent.kind === "organization") {
      n.relations = [{ type: "works_at", label: "Works with", direction: "out", other: { id: parent.id, label: parent.label, kind: "organization" } }];
      parent.relations.push({ type: "works_at", label: `${t.label} works with this class`, direction: "in", other: { id: n.id, label: t.label, kind: "person" } });
    }
    if (t.kind === "project" && parent.kind === "organization")
      parent.relations.unshift({ type: "for", label: `${t.label} is for this`, direction: "in", other: { id: n.id, label: t.label, kind: "project" } });
    return n;
  };

  const company = nodes.get(sections.company)!;
  const clients = nodes.get(sections.clients)!;
  const tone = nodes.get(sections.tone)!;
  for (const t of COMPANY) place(t, company, sections.company, null);
  // The rest of the department's chats, grown from a seed (corpus.ts): the school's own folders, more classes and
  // programs and more on the three the film names, each line in the chat that said it. Period 3 Biology stays as written above.
  const kid = (parent: Node, label: string) => parent.kids.map((x) => nodes.get(x)!).find((x) => x.label === label);
  const fill = (n: Node, t: T, section: string, client: string | null) => {
    for (const f of t.facts ?? []) addFact(f, n, client);
    for (const k of t.kids ?? []) place(k, n, section, client);
  };
  for (const t of GROWN.company.map(toT)) {
    const known = kid(company, t.label);
    if (known) fill(known, t, sections.company, null);
    else place(t, company, sections.company, null);
  }
  for (const [label, t] of GROWN.more) {
    const known = kid(company, label);
    if (known) fill(known, toT(t), sections.company, null);
  }
  for (const t of [PERIOD3, PERIOD5, APES, CLUB]) place(t, clients, sections.clients, null);
  for (const t of GROWN.clients) place(toT(t), clients, sections.clients, null);
  for (const [key, t] of GROWN.grown) fill(nodes.get(clientIds.get(key)!)!, toT(t), sections.clients, key);
  const own = place(TONE, tone, sections.tone, null);
  fill(own, toT(GROWN.tone), sections.tone, null);

  // Counts and urgency roll up the tree, as the overview's node stats do.
  const rank = ["none", "later", "upcoming", "soon", "today", "overdue"];
  const roll = (n: Node): void => {
    let urgency: GraphNode["urgency"] = "none";
    for (const f of n.facts_.map((x) => facts.get(x)!)) if (rank.indexOf(f.urgency) > rank.indexOf(urgency)) urgency = f.urgency;
    for (const kid of n.kids) {
      roll(nodes.get(kid)!);
      const u = nodes.get(kid)!.urgency;
      if (rank.indexOf(u) > rank.indexOf(urgency)) urgency = u;
    }
    n.facts = n.facts_.length + n.values.length;
    if (n.values.length) n.identity = n.values.length;
    n.urgency = urgency;
  };
  for (const s of Object.values(sections)) for (const kid of nodes.get(s)!.kids) roll(nodes.get(kid)!);

  return { now, nodes, facts, self: self.id, sections, clientIds, chats: used.size, written: null };
}
