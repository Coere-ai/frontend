import type { PlatformId } from "@coere/core";
import type { FactSource, FactView, GraphNode, IdentityValueView, MemoryNodeDetail } from "@coere/memory";
import { describeUrgency } from "@v2/packages/memory/src/time/labels";
import { field } from "../../../scripts/industries/fields/manufacturing.mjs";
import { FILM_NOW, ZONE as CLOCK_ZONE } from "./clock";

/**
 * Brightwater Components' memory as Coere for Teams files it from Luis
 * Moreno's chats: Company with what the plant knows (preventive
 * maintenance, safety rules, shift handover notes, suppliers, the quality
 * system, spare parts), Clients with a folder per customer holding its
 * contacts, its line or program and its facts by slot, and Tone and
 * voice. Every fact names the chat it came from. The people, customers
 * and dates are the manufacturing page's
 * (scripts/industries/fields/manufacturing.mjs), made up for the demo.
 */

/** Luis works at the plant in Monterrey; the film's day is clock.ts's. */
export const ZONE = CLOCK_ZONE;
/** Three days before the root cause report is due: 08:40 in Monterrey on October 28, 2026. */
export const NOW = FILM_NOW;
const DAY = 86_400_000;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const FIRM = field.firm as string;
export const PERSON = field.person as { name: string; initials: string };
export const CLIENT = field.client.name as string;

type UrgencyKind = Parameters<typeof describeUrgency>[0]["kind"];

export type Node = GraphNode & {
  aliases: string[];
  summary: string | null;
  kids: string[];
  facts_: string[];
  values: IdentityValueView[];
  relations: MemoryNodeDetail["relations"];
  /** How many memories the graph draws for it, past the ones listed here. */
  extra: number;
  client?: string;
};

export type Fact = FactView & { owner: string; client: string | null };

export type Chat = { id: string; platform: PlatformId; title: string };

export interface Mem {
  nodes: Map<string, Node>;
  facts: Map<string, Fact>;
  chats: Map<string, Chat>;
  self: string;
  sections: { company: string; clients: string; tone: string };
  /** Client key to its folder id. */
  clientIds: Map<string, string>;
}

/** One fact as written below: its words, where it sits, when and where it was said. */
type Said = {
  text: string;
  /** The client slot it is filed in, or the kind of a company fact. */
  slot?: string;
  kind?: FactView["kind"];
  /** YYYY-MM-DD it was said. */
  on: string;
  ai: PlatformId;
  chat: string;
  /** A due day, YYYY-MM-DD, when it has one. */
  due?: string;
};

/** The key each client slot files a fact under (packages/solution's client_account template). */
const SLOT_KEY: Record<string, string> = {
  promises: "promise.what",
  deadlines: "due",
  meetings: "meeting.when",
  requests: "request.what",
  billing: "billing.terms",
  scope: "scope.item",
  preferences: "client_pref.what",
  overview: "client.industry",
  relationship: "client.status",
};

const SLOT_KIND: Record<string, FactView["kind"]> = {
  promises: "task",
  deadlines: "task",
  meetings: "event",
  requests: "note",
  billing: "attribute",
  scope: "attribute",
  preferences: "preference",
  overview: "attribute",
  relationship: "attribute",
  documents: "note",
};

const f = (text: string, slot: string | undefined, on: string, ai: PlatformId, chat: string, due?: string, kind?: FactView["kind"]): Said => ({ text, slot, on, ai, chat, due, kind });

const FAULT_CHAT = "Line 3 torque fault";

/** Corvane Motors, the customer the page follows: field.client, slot by slot. */
const CORVANE: Said[] = [
  f("Corvane Motors builds light trucks in Germany and buys steering brackets from Line 3.", "overview", "2025-11-04", "claude", "Corvane Motors account notes"),
  f("Active client.", "relationship", "2025-02-11", "chatgpt", "Corvane Motors account notes"),
  f("Corvane agreed to send the updated bracket drawing before October 24.", "promises", "2026-10-11", "claude", "Bracket drawing revision", "2026-10-24"),
  f("We promised Hannah a root cause report on the torque faults by October 31.", "promises", "2026-10-22", "chatgpt", FAULT_CHAT, "2026-10-31"),
  f("I told Nils I would confirm the December shipment volume by November 6.", "promises", "2026-10-20", "claude", "December shipment plan", "2026-11-06"),
  f("Quality review with Hannah Weiss on November 3 to walk through the Line 3 faults.", "meetings", "2026-10-22", "chatgpt", FAULT_CHAT, "2026-11-03"),
  f("Hannah asked to be told of any fault that stops the line for more than an hour.", "requests", "2026-09-14", "claude", "Corvane quality agreement"),
  f("Corvane wants a weekly quality report with three numbers: scrap, rework and on time delivery.", "requests", "2026-06-05", "gemini", "Scrap rate by shift"),
  f("Nils prefers calls before 9 am Central European time.", "requests", "2026-08-30", "chatgpt", "December shipment plan"),
  f("The root cause report goes to Hannah by October 31.", "deadlines", "2026-10-22", "chatgpt", FAULT_CHAT, "2026-10-31"),
  f("The December shipment of 4,800 brackets leaves on December 4.", "deadlines", "2026-10-02", "claude", "December shipment plan", "2026-12-04"),
  f("The yearly supplier audit by Corvane is in February.", "deadlines", "2026-09-20", "gemini", "Corvane quality agreement"),
  f("Corvane pays net 60 and wants the part number on every invoice line.", "billing", "2026-03-18", "claude", "Corvane Motors account notes"),
  f("Pasting the Corvane quality agreement: limits, inspection and the three defects that stop a shipment.", "documents", "2026-09-20", "claude", "Corvane quality agreement"),
];

/** Line 3, the bracket line Corvane's work runs on: its faults and its equipment (field.context.sections). */
const LINE3: Said[] = [
  f("Line 3 builds the steering brackets for Corvane on five stations.", undefined, "2025-11-04", "claude", "Corvane Motors account notes", undefined, "attribute"),
  f("In August the torque faults on Line 3 came from a worn spindle on station 4.", undefined, "2026-08-19", "claude", "Station 4 spindle wear", undefined, "attribute"),
  f("Replacing the spindle cleared the faults for nine weeks.", undefined, "2026-08-26", "claude", "Station 4 spindle wear", undefined, "attribute"),
  f("Night shift found the faults rise when the hall drops below 15 degrees.", undefined, "2026-10-09", "chatgpt", "Shift handover notes", undefined, "attribute"),
  f("Station 4 runs an Atlas Copco nutrunner, last calibrated on September 2.", undefined, "2026-09-02", "gemini", "Calibration schedule", undefined, "attribute"),
  f("Spare spindles are in cage B, two on hand.", undefined, "2026-10-01", "chatgpt", "Spare parts list", undefined, "attribute"),
];

/** The other customers, each with a little of its own. */
const OSTRAVA: Said[] = [
  f("Ostrava Rail builds brake systems for rail cars.", "overview", "2025-06-03", "claude", "Ostrava Rail brake housings"),
  f("Active client.", "relationship", "2025-06-03", "claude", "Ostrava Rail brake housings"),
  f("We promised Ostrava first articles of revision D by November 12.", "promises", "2026-10-15", "chatgpt", "Ostrava Rail brake housings", "2026-11-12"),
  f("Plant visit from Ostrava Rail on November 18.", "meetings", "2026-10-15", "chatgpt", "Ostrava Rail brake housings", "2026-11-18"),
];
const HOUSINGS: Said[] = [
  f("We machine 1,200 brake housings a month for Ostrava Rail.", undefined, "2026-04-08", "gemini", "Ostrava Rail brake housings", undefined, "attribute"),
  f("The housing drawing moved to revision D in September.", undefined, "2026-09-18", "gemini", "Ostrava Rail brake housings", undefined, "attribute"),
];
const PELL: Said[] = [
  f("Pell Agritech makes tractor parts and buys our hitch brackets.", "overview", "2026-05-12", "chatgpt", "Pell Agritech PPAP"),
  f("Active client.", "relationship", "2026-05-12", "chatgpt", "Pell Agritech PPAP"),
  f("We owe Pell the control plan by November 10.", "promises", "2026-10-20", "claude", "Pell Agritech PPAP", "2026-11-10"),
];
const PPAP: Said[] = [
  f("Pell needs a level 3 PPAP for the new hitch bracket.", undefined, "2026-06-02", "claude", "Supplier PPAP checklist", undefined, "attribute"),
  f("The PPAP package goes to Pell by November 20.", undefined, "2026-10-02", "claude", "Pell Agritech PPAP", undefined, "attribute"),
];
const KESSLER: Said[] = [
  f("Kessler Pumps buys cast pump housings for industrial pumps.", "overview", "2026-09-18", "gemini", "Kessler Pumps quote"),
  f("Active client.", "relationship", "2026-09-18", "gemini", "Kessler Pumps quote"),
  f("Kessler asked for a price on 3,000 housings a year.", "requests", "2026-10-09", "chatgpt", "Kessler Pumps quote"),
  f("The Kessler quote goes out by November 9.", "deadlines", "2026-10-09", "chatgpt", "Kessler Pumps quote", "2026-11-09"),
];

/** Company: what the plant knows, by topic (field.graph's company). */
const COMPANY: Array<[string, Said[]]> = [
  ["Preventive maintenance", [
    f("Nutrunner spindles on Line 3 are checked for wear every 500 hours.", undefined, "2026-06-12", "gemini", "Preventive maintenance plan", undefined, "note"),
    f("Torque tools are recalibrated every 90 days.", undefined, "2026-07-03", "claude", "Calibration schedule", undefined, "note"),
  ]],
  ["Safety rules", [
    f("Every tool change on a line starts with lockout and tagout.", undefined, "2026-03-04", "chatgpt", "Safety audit findings", undefined, "note"),
    f("The safety audit found two guards missing on Line 2, both fixed in April.", undefined, "2026-04-21", "chatgpt", "Safety audit findings", undefined, "note"),
  ]],
  ["Shift handover notes", [
    f("Night shift logs every line stop over ten minutes in the handover notes.", undefined, "2026-09-08", "chatgpt", "Shift handover notes", undefined, "note"),
    f("Ana leads the night shift on Line 3.", undefined, "2026-10-09", "chatgpt", "Shift handover notes", undefined, "note"),
  ]],
  ["Suppliers", [
    f("Every new supplier part needs an approved PPAP before first use.", undefined, "2026-02-17", "claude", "Supplier PPAP checklist", undefined, "note"),
    f("Our bracket steel comes from two mills, so one late coil never stops a line.", undefined, "2026-02-17", "claude", "Supplier PPAP checklist", undefined, "decision"),
  ]],
  ["Quality system", [
    f("Scrap is reported by shift every Monday morning.", undefined, "2026-02-02", "chatgpt", "Scrap rate by shift", undefined, "note"),
    f("The weld cell target is a 48 second cycle.", undefined, "2026-05-20", "gemini", "Weld cell cycle time", undefined, "note"),
  ]],
  ["Spare parts", [
    f("Critical spares for each line are counted every Friday.", undefined, "2026-10-01", "chatgpt", "Spare parts list", undefined, "note"),
    f("We keep two of every spindle and socket Line 3 uses.", undefined, "2026-10-01", "chatgpt", "Spare parts list", undefined, "decision"),
  ]],
];

const TONE: Said[] = [
  f("I write steps in the order a technician would do them.", undefined, "2026-05-06", "claude", "Changeover checklist", undefined, "style"),
  f("One action per step, with the tool named.", undefined, "2026-05-06", "claude", "Changeover checklist", undefined, "style"),
];

/** Ids as the engine makes them: a prefix and a UUIDv7 from the record's time, with seeded bits after. */
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

/** The dates in a text, as the ranges the sheet sets in mono. */
function specificsOf(text: string): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const re = new RegExp(`\\b(?:${MONTHS.join("|")}) \\d{1,2}\\b`, "g");
  for (let m = re.exec(text); m; m = re.exec(text)) out.push([m.index, m.index + m[0].length]);
  return out;
}

export function buildMemory(): Mem {
  const id = idMaker();
  const nodes = new Map<string, Node>();
  const facts = new Map<string, Fact>();
  const chats = new Map<string, Chat>();
  const start = Date.UTC(2025, 1, 1);

  const node = (o: Partial<Node> & Pick<Node, "id" | "kind" | "label" | "section">): Node => {
    const n: Node = { parent: null, importance: 3, pinned: false, urgency: "none", facts: 0, history: false, aliases: [], summary: null, kids: [], facts_: [], values: [], relations: [], extra: 0, ...o };
    nodes.set(n.id, n);
    if (n.parent) nodes.get(n.parent)?.kids.push(n.id);
    return n;
  };

  const chatOf = (title: string, ai: PlatformId): Chat => {
    const key = `${ai}:${title}`;
    const known = chats.get(key);
    if (known) return known;
    const made = { id: `${ai}:c${(chats.size + 1).toString(36)}${title.length.toString(36)}`, platform: ai, title };
    chats.set(key, made);
    return made;
  };

  const add = (owner: Node, said: Said, client: string | null) => {
    const at = Date.parse(`${said.on}T03:20:00Z`);
    const slot = said.slot ?? null;
    const kind = said.kind ?? (slot ? SLOT_KIND[slot] : undefined) ?? "note";
    const chat = chatOf(said.chat, said.ai);
    const fid = id("fact", at);
    const source: FactSource = { evidenceId: `${fid}#e0`, platform: said.ai, convId: chat.id, title: chat.title, msg: 1, role: "user", at: new Date(at).toISOString(), url: null, stale: false };
    const due = said.due ? { at: said.due, tz: null } : null;
    const task = kind === "task";
    const urgency = describeUrgency(
      { status: "active", kind: kind as UrgencyKind, progress: task ? "needs-action" : undefined, urgency: due ? { due: { at: due.at } } : undefined, evidence: [{ at: source.at }] },
      NOW,
      ZONE,
    );
    const fact: Fact = {
      id: fid,
      kind,
      key: (slot && SLOT_KEY[slot]) || "",
      text: said.text,
      specifics: specificsOf(said.text),
      importance: task ? 4 : 3,
      urgency: urgency.level,
      urgencyLabel: urgency.label,
      due,
      progress: task ? "needs-action" : null,
      status: "active",
      disagree: false,
      held: false,
      pinned: false,
      origin: "extracted",
      basis: slot === "documents" ? "pasted" : "user_stated",
      sensitivity: null,
      sources: [source],
      supersededBy: null,
      replacedOn: null,
      changedBy: null,
      slot,
      owner: owner.id,
      client,
    };
    facts.set(fid, fact);
    owner.facts_.push(fid);
  };

  const self = node({ id: id("ent", start), kind: "self", label: "You", section: "", importance: 5 });
  const sections = { company: "sec_company", clients: "sec_clients", tone: "sec_tone" };
  node({ id: sections.company, kind: "section", label: "Company", section: sections.company });
  node({ id: sections.clients, kind: "section", label: "Clients", section: sections.clients });
  node({ id: sections.tone, kind: "section", label: "Tone and voice", section: sections.tone });

  // Company, a topic each, with the memories behind it the graph draws.
  for (const [label, list] of COMPANY) {
    const topic = node({ id: id("ent", start + DAY), kind: "topic", label, section: sections.company, parent: sections.company, extra: 9 });
    for (const said of list) add(topic, said, null);
  }

  // Clients: a folder each, its contacts and its engagement inside.
  const clientIds = new Map<string, string>();
  const client = (key: string, label: string, aliases: string[], own: Said[], work: [string, Said[]] | null, extra: number) => {
    const folder = node({ id: id("ent", Date.parse(`${own[0]!.on}T00:00:00Z`)), kind: "organization", label, section: sections.clients, parent: sections.clients, importance: 4, aliases, client: key, extra });
    clientIds.set(key, folder.id);
    for (const said of own) add(folder, said, key);
    if (work) {
      const project = node({ id: id("ent", Date.parse(`${work[1][0]!.on}T00:00:00Z`)), kind: "project", label: work[0], section: sections.clients, parent: folder.id, extra: Math.round(extra / 2) });
      for (const said of work[1]) add(project, said, key);
      folder.relations.unshift({ type: "for", label: `${work[0]} is for this`, direction: "in", other: { id: project.id, label: work[0], kind: "project" } });
    }
    return folder;
  };

  const corvane = client("corvane", CLIENT, ["Corvane"], CORVANE, [field.client.engagement as string, LINE3], 24);
  const contact = (name: string, role: string, place: string, line: Said, on: string) => {
    const at = Date.parse(`${on}T00:00:00Z`);
    const person = node({ id: id("ent", at), kind: "person", label: name, section: sections.clients, parent: corvane.id, extra: 4 });
    const chat = chatOf(line.chat, line.ai);
    const src = (vid: string): FactSource[] => [{ evidenceId: `${vid}#e0`, platform: line.ai, convId: chat.id, title: chat.title, msg: 1, role: "user", at: new Date(at).toISOString(), url: null, stale: false }];
    const value = (fieldName: IdentityValueView["field"], v: string): IdentityValueView => {
      const vid = id("fact", at);
      return { id: vid, field: fieldName, value: v, href: null, sources: src(vid), said: on };
    };
    person.values = [value("role", role), value("org", CLIENT), value("location", place)];
    person.relations = [{ type: "works_at", label: "Works at", direction: "out", other: { id: corvane.id, label: CLIENT, kind: "organization" } }];
    corvane.relations.push({ type: "works_at", label: `${name} works here`, direction: "in", other: { id: person.id, label: name, kind: "person" } });
    add(person, line, "corvane");
  };
  const [hannah, nils] = field.client.contacts as [string, string];
  contact(hannah, "Supplier quality engineer", "Stuttgart", f("Hannah signs off on every quality report from Line 3.", undefined, "2026-03-10", "claude", "Corvane quality agreement", undefined, "attribute"), "2025-02-11");
  contact(nils, "Purchasing manager", "Stuttgart", f("Nils plans Corvane's bracket volumes each quarter.", undefined, "2026-08-11", "chatgpt", "December shipment plan", undefined, "attribute"), "2025-04-02");

  client("ostrava", "Ostrava Rail", ["Ostrava"], OSTRAVA, ["Brake housings", HOUSINGS], 6);
  client("pell", "Pell Agritech", ["Pell"], PELL, ["PPAP approval", PPAP], 5);
  client("kessler", "Kessler Pumps", ["Kessler"], KESSLER, null, 5);

  const tone = node({ id: id("ent", start + 2 * DAY), kind: "folder", label: field.graph.hubs[2].children[0].label, section: sections.tone, parent: sections.tone, extra: 3 });
  for (const said of TONE) add(tone, said, null);

  // Counts and urgency roll up the tree, as the overview's node stats do.
  const rank = ["none", "later", "upcoming", "soon", "today", "overdue"];
  const roll = (n: Node): GraphNode["urgency"] => {
    let urgency: GraphNode["urgency"] = "none";
    for (const x of n.facts_.map((k) => facts.get(k)!)) if (rank.indexOf(x.urgency) > rank.indexOf(urgency)) urgency = x.urgency;
    for (const k of n.kids) {
      const u = roll(nodes.get(k)!);
      if (rank.indexOf(u) > rank.indexOf(urgency)) urgency = u;
    }
    n.facts = n.facts_.length + n.values.length + n.extra;
    if (n.values.length) n.identity = n.values.length;
    n.urgency = urgency;
    return urgency;
  };
  for (const n of [...nodes.values()].filter((x) => x.kind === "section")) for (const k of n.kids) roll(nodes.get(k)!);

  return { nodes, facts, chats, self: self.id, sections, clientIds };
}
