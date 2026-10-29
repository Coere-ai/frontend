import type { PlatformId } from "@coere/core";
import type { FactSource, FactView, GraphNode, IdentityValueView, MemoryNodeDetail } from "@coere/memory";
import { describeUrgency } from "@v2/packages/memory/src/time/labels";
import { field } from "../../../scripts/industries/fields/energy.mjs";
import { FILM_NOW, ZONE } from "./clock";

/**
 * Crestline Renewables' memory as Coere for Teams files it from the crews'
 * chats: Company with how the field teams work (lockout, cranes, safety,
 * spares, vendors, permits and the crews), Clients with a folder per site
 * operator holding its contacts, its turbines and work, and its facts by
 * slot, and Tone and voice. The same shapes the teams film builds from
 * coere-v2's agency corpus (memory.ts there), here written for wind and
 * solar field maintenance from the field's data
 * (scripts/industries/fields/energy.mjs). Made up.
 */


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


export const FIRM = { name: field.firm, aliases: ["Crestline"], domains: ["crestlinerenewables.com"], industry: "other" as const };
export const SELF = { name: field.person.name, role: "Field maintenance lead", team: "Field maintenance" };

/** The company's clients, the site operators, as Settings lists them. */
export const CLIENTS = [
  { key: "altamont", name: "Altamont Wind", aliases: ["Altamont"], domains: ["altamontwind.com"], status: "active" as const },
  { key: "kern", name: "Kern Solar", aliases: ["Kern"], domains: ["kernsolar.com"], status: "active" as const },
  { key: "mesa", name: "Mesa Storage", aliases: ["Mesa"], domains: ["mesastorage.com"], status: "active" as const },
  { key: "pine", name: "Pine Ridge Wind", aliases: ["Pine Ridge"], domains: ["pineridgewind.com"], status: "active" as const },
];

export const WORKERS = [
  { key: "marcus", name: "Marcus Bell", team: "Field maintenance", role: "Crew lead" },
  { key: "joel", name: "Joel Tanaka", team: "Field maintenance", role: "Wind technician" },
  { key: "dana", name: "Dana Whitfield", team: "Operations", role: "Operations manager" },
];

/** The chats the company's memories come from: which AI, and when. */
const CHATS: Record<string, PlatformId> = {
  "Turbine 14 oil sample": "claude",
  "Altamont turbine 14 gearbox": "chatgpt",
  "Grid curtailment notice": "claude",
  "Crane booking for November": "claude",
  "Safety briefing plan": "gemini",
  "Turbine 14 maintenance history": "chatgpt",
  "SCADA alarm list": "chatgpt",
  "Altamont site access": "gemini",
  "Crane wind limits": "chatgpt",
  "Altamont site rules": "gemini",
  "Availability report": "chatgpt",
  "Call notes with Ana Ruiz": "gemini",
  "Weekly plan with Ray": "chatgpt",
  "Permit renewals": "claude",
  "Altamont service agreement": "claude",
  "Kern Solar inverter faults": "chatgpt",
  "Kern site visit notes": "gemini",
  "Mesa Storage battery bid": "claude",
  "Pine Ridge permit": "chatgpt",
  "Bird survey findings": "chatgpt",
  "Lockout tagout steps": "claude",
  "Safety stand down notes": "chatgpt",
  "Spare parts on site": "chatgpt",
  "Vendor contacts": "gemini",
  "Crew rota for December": "gemini",
  "Field plan style": "claude",
};

/** One memory: what was said, in which chat and on which day, and how it is filed. */
type F = { text: string; chat: keyof typeof CHATS; on: string; kind?: FactView["kind"]; key?: string; slot?: string; due?: string; basis?: FactView["basis"] };

/** Something in memory: a folder, a client, a contact, a turbine or a job, its memories and what it holds. */
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

const ALTAMONT: T = {
  label: k.name,
  kind: "organization",
  client: "altamont",
  aliases: ["Altamont", "altamontwind.com"],
  facts: [
    { text: "Altamont Wind is an active site. Crestline runs its maintenance.", chat: "Altamont service agreement", on: "2026-04-15", kind: "attribute", key: "client.status" },
    { text: "Altamont Wind runs 54 turbines in the hills east of Livermore.", chat: "Altamont service agreement", on: "2026-04-15", kind: "attribute", key: "client.industry" },
    promise(k.promises[0]!, "Turbine 14 oil sample", "2026-10-18"),
    promise(k.promises[1]!, "Altamont turbine 14 gearbox", "2026-10-22"),
    promise(k.promises[2]!, "Grid curtailment notice", "2026-10-20"),
    { text: `${k.meeting[0]} ${k.meeting[1]} ${k.meeting[2]}`, chat: "Safety briefing plan", on: "2026-10-22", kind: "event", key: "meeting.when" },
    { text: k.requests[0]![0]!, chat: "Altamont site rules", on: "2026-09-10", kind: "preference", key: "request.what" },
    { text: `${k.requests[1]![0]} ${k.requests[1]![1]} ${k.requests[1]![2]}`, chat: "Availability report", on: "2026-06-02", kind: "note", key: "request.what" },
    { text: k.requests[2]![0]!, chat: "Call notes with Ana Ruiz", on: "2026-08-21", kind: "preference", key: "request.what" },
    deadline(k.deadlines[0]!, "Weekly plan with Ray", "2026-10-22"),
    deadline(k.deadlines[1]!, "Crane booking for November", "2026-10-20"),
    deadline(k.deadlines[2]!, "Permit renewals", "2026-09-28"),
    { text: k.billing[0]!, chat: "Altamont service agreement", on: "2026-04-15", kind: "attribute", key: "billing.terms" },
    { text: `${k.document[0]} ${k.document[1]} ${k.document[2]}`, chat: "Altamont service agreement", on: "2026-09-28", kind: "note", slot: "documents", basis: "pasted" },
  ],
  kids: [
    {
      label: k.contacts[0]!,
      kind: "person",
      key: "ray",
      values: [["email", "ray.delgado@altamontwind.com"], ["phone", "+1 (925) 555-0172"], ["role", "site manager"]],
      facts: [{ text: "Ray Delgado is the site manager at Altamont Wind and signs off on every lift plan.", chat: "Altamont site rules", on: "2026-09-10", kind: "attribute", key: "contact.role" }],
    },
    {
      label: k.contacts[1]!,
      kind: "person",
      key: "ana",
      values: [["email", "ana.ruiz@altamontwind.com"], ["role", "operations lead"]],
      facts: [{ text: "Ana Ruiz runs operations at Altamont Wind and talks to the grid operator.", chat: "Call notes with Ana Ruiz", on: "2026-08-21", kind: "attribute", key: "contact.role" }],
    },
    {
      label: k.engagement,
      kind: "project",
      facts: [
        { text: "Turbine 14 gearbox work starts on November 3.", chat: "Crane booking for November", on: "2026-10-20", kind: "task", key: "due" },
        { text: "Turbine 14's gearbox oil showed metal particles on October 18.", chat: "Turbine 14 oil sample", on: "2026-10-18" },
        { text: "The last bearing on turbine 14 was replaced in March 2025.", chat: "Turbine 14 maintenance history", on: "2026-09-03" },
        { text: "The 90 tonne crane is booked for Altamont from November 3 to 7.", chat: "Crane booking for November", on: "2026-10-20" },
        { text: "Gearbox vibration on turbine 14 rose by a third in September.", chat: "SCADA alarm list", on: "2026-09-29" },
        { text: "Turbine 14 is a 2.3 megawatt machine from 2011 on the north ridge.", chat: "Turbine 14 maintenance history", on: "2026-09-03" },
      ],
    },
    {
      label: "Site access",
      kind: "place",
      facts: [
        { text: "The north gate at Altamont is locked after 6 pm; the code is with the site office.", chat: "Altamont site access", on: "2026-08-09" },
        { text: "Wind over 12 meters a second stops crane work at Altamont.", chat: "Crane wind limits", on: "2026-10-02" },
      ],
    },
  ],
};

const KERN: T = {
  label: "Kern Solar",
  kind: "organization",
  client: "kern",
  aliases: ["Kern", "kernsolar.com"],
  facts: [
    { text: "Kern Solar runs a 40 megawatt solar farm near Bakersfield.", chat: "Kern site visit notes", on: "2026-09-16", kind: "attribute", key: "client.industry" },
    { text: "Kern Solar is an active site.", chat: "Kern site visit notes", on: "2026-09-16", kind: "attribute", key: "client.status" },
    { text: "We promised Lena Park a fault report on the inverters by November 6.", chat: "Kern Solar inverter faults", on: "2026-10-19", kind: "task", key: "promise.what" },
  ],
  kids: [
    { label: "Lena Park", kind: "person", key: "lena", values: [["role", "plant manager"]], facts: [{ text: "Lena Park is the plant manager at Kern Solar.", chat: "Kern site visit notes", on: "2026-09-16", kind: "attribute", key: "contact.role" }] },
    {
      label: "Inverter faults",
      kind: "project",
      facts: [
        { text: "Inverters 3 and 7 at Kern trip on hot afternoons.", chat: "Kern Solar inverter faults", on: "2026-10-19" },
        { text: "The inverter vendor sends a field engineer to Kern on November 12.", chat: "Kern Solar inverter faults", on: "2026-10-19" },
      ],
    },
  ],
};

const MESA: T = {
  label: "Mesa Storage",
  kind: "organization",
  client: "mesa",
  aliases: ["Mesa", "mesastorage.com"],
  facts: [
    { text: "Mesa Storage is building a battery plant beside the Mesa substation.", chat: "Mesa Storage battery bid", on: "2026-10-08", kind: "attribute", key: "client.industry" },
    { text: "Mesa Storage is an active client.", chat: "Mesa Storage battery bid", on: "2026-10-08", kind: "attribute", key: "client.status" },
    { text: "Mesa asked for the service price per year, not per visit.", chat: "Mesa Storage battery bid", on: "2026-10-08", kind: "note", key: "request.what" },
  ],
  kids: [
    { label: "Omar Haddad", kind: "person", key: "omar", values: [["role", "procurement lead"]], facts: [{ text: "Omar Haddad runs procurement at Mesa Storage.", chat: "Mesa Storage battery bid", on: "2026-10-08", kind: "attribute", key: "contact.role" }] },
    {
      label: "Battery bid",
      kind: "project",
      facts: [
        { text: "The bid covers service on a 60 megawatt hour battery.", chat: "Mesa Storage battery bid", on: "2026-10-08" },
        { text: "The Mesa Storage battery bid is due on November 20.", chat: "Mesa Storage battery bid", on: "2026-10-08", kind: "task", key: "due" },
      ],
    },
  ],
};

const PINE: T = {
  label: "Pine Ridge Wind",
  kind: "organization",
  client: "pine",
  aliases: ["Pine Ridge", "pineridgewind.com"],
  facts: [
    { text: "Pine Ridge Wind is a 22 turbine site in the Tehachapi hills.", chat: "Pine Ridge permit", on: "2026-10-01", kind: "attribute", key: "client.industry" },
    { text: "Pine Ridge Wind is an active site.", chat: "Pine Ridge permit", on: "2026-10-01", kind: "attribute", key: "client.status" },
    { text: "The Pine Ridge permit renewal goes to the county by December 4.", chat: "Pine Ridge permit", on: "2026-10-01", kind: "task", key: "due" },
    { text: "Pine Ridge asked for a bird survey before any spring work.", chat: "Bird survey findings", on: "2026-09-02", kind: "note", key: "request.what" },
  ],
};

const g = field.graph.hubs;
const companyName = (i: number) => g[0]!.children[i]!.label;

const COMPANY: T[] = [
  {
    label: companyName(0),
    kind: "folder",
    facts: [
      { text: "Every turbine is locked out at the base and in the nacelle before work starts.", chat: "Lockout tagout steps", on: "2026-08-12" },
      { text: "Two people sign the lockout sheet before anyone climbs.", chat: "Lockout tagout steps", on: "2026-08-12" },
      { text: "The person who locked a turbine out is the only one who unlocks it.", chat: "Lockout tagout steps", on: "2026-08-12" },
    ],
  },
  {
    label: companyName(1),
    kind: "folder",
    facts: [
      { text: "Cranes are booked through Hollis Lifting with two weeks' notice.", chat: "Crane booking for November", on: "2026-10-20" },
      { text: "A 90 tonne crane needs a level pad and a wind check before each lift.", chat: "Crane wind limits", on: "2026-10-02" },
    ],
  },
  {
    label: companyName(2),
    kind: "folder",
    facts: [
      { text: "No one climbs alone, and every climber carries a radio.", chat: "Safety stand down notes", on: "2026-10-06" },
      { text: "A dropped object stops work on the site for a stand down.", chat: "Safety stand down notes", on: "2026-10-06" },
    ],
  },
  {
    label: companyName(3),
    kind: "folder",
    facts: [
      { text: "Two spare gearbox bearings are kept at the Livermore yard.", chat: "Spare parts on site", on: "2026-09-21" },
      { text: "Main shaft seals take six weeks to order.", chat: "Spare parts on site", on: "2026-09-21" },
    ],
  },
  {
    label: companyName(4),
    kind: "folder",
    facts: [
      { text: "Hollis Lifting supplies the cranes for Altamont and Pine Ridge.", chat: "Vendor contacts", on: "2026-09-14" },
      { text: "Northgear rebuilds a gearbox in about ten weeks.", chat: "Vendor contacts", on: "2026-09-14" },
    ],
  },
  {
    label: companyName(5),
    kind: "folder",
    facts: [
      { text: "Every county permit renewal starts 90 days before the permit ends.", chat: "Permit renewals", on: "2026-09-28" },
      { text: "Bird surveys run in spring and fall at every wind site.", chat: "Bird survey findings", on: "2026-09-02" },
    ],
  },
  {
    label: "Crews",
    kind: "folder",
    kids: [
      { label: "Marcus Bell", kind: "person", key: "marcus", facts: [{ text: "Marcus Bell leads the crew on the turbine 14 gearbox job.", chat: "Crew rota for December", on: "2026-10-23" }] },
      { label: "Joel Tanaka", kind: "person", key: "joel", facts: [{ text: "Joel Tanaka holds the crane signal person card.", chat: "Crane booking for November", on: "2026-10-20" }] },
      { label: "Dana Whitfield", kind: "person", key: "dana", facts: [{ text: "Dana Whitfield approves every outage window before it goes to a grid operator.", chat: "Grid curtailment notice", on: "2026-10-20" }] },
    ],
  },
];

const TONE: T = {
  label: g[2]!.children[0]!.label,
  kind: "folder",
  facts: [
    { text: "Write plans by day, with the safety steps first.", chat: "Field plan style", on: "2026-08-28", kind: "style" },
    { text: "Keep each step to one line a crew can read out on the radio.", chat: "Field plan style", on: "2026-08-28", kind: "style" },
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

export function buildCompany(): Mem {
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
  const sections = { company: "sec_company", clients: "sec_clients", tone: "sec_tone" };
  node({ id: sections.company, kind: "section", label: "Company", section: sections.company });
  node({ id: sections.clients, kind: "section", label: "Clients", section: sections.clients });
  node({ id: sections.tone, kind: "section", label: "Tone and voice", section: sections.tone });

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
    // A contact works at its client, and a turbine or a job is for it, as the sheet's Related lists them.
    if (t.kind === "person" && parent.kind === "organization") {
      n.relations = [{ type: "works_at", label: "Works at", direction: "out", other: { id: parent.id, label: parent.label, kind: "organization" } }];
      parent.relations.push({ type: "works_at", label: `${t.label} works here`, direction: "in", other: { id: n.id, label: t.label, kind: "person" } });
    }
    if (t.kind === "project" && parent.kind === "organization")
      parent.relations.unshift({ type: "for", label: `${t.label} is for this`, direction: "in", other: { id: n.id, label: t.label, kind: "project" } });
    return n;
  };

  const company = nodes.get(sections.company)!;
  const clients = nodes.get(sections.clients)!;
  const tone = nodes.get(sections.tone)!;
  for (const t of COMPANY) place(t, company, sections.company, null);
  for (const t of [ALTAMONT, KERN, MESA, PINE]) place(t, clients, sections.clients, null);
  place(TONE, tone, sections.tone, null);

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
