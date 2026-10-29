import type { PlatformId } from "@coere/core";
import type { FactSource, FactView, GraphNode, IdentityValueView, MemoryNodeDetail } from "@coere/memory";
import { describeUrgency } from "@v2/packages/memory/src/time/labels";
import { field } from "../../../demos/industries/fields/manufacturing.mjs";
import { FILM_NOW, ZONE as CLOCK_ZONE } from "./clock";
import { FIELD } from "./corpus";
import { growTeam, type Grown } from "./scale";

/**
 * Brightwater Components' memory as Coere for Teams files it from Luis
 * Moreno's chats: Company with the plant team, the shift handover notes,
 * preventive maintenance and the rules; Clients with a folder per
 * customer holding its contacts, its line or program and its facts by
 * slot; then Production, Quality, Equipment, Safety, Supply chain,
 * Writing, and Plans and deadlines, each with a few folders (corpus.ts).
 * Every fact names the chat it came from. The people, customers
 * and dates are the manufacturing page's
 * (demos/industries/fields/manufacturing.mjs), made up for the demo. The
 * lines below are the ones the film shows; the rest of the plant's year
 * and a half of chats grows from a seed in corpus.ts and scale.ts and is
 * filed beside them, to the 507 memories from 406 chats the film has
 * always shown, so every count the dashboard gives is real.
 */

/** Luis works at the plant in Monterrey; the film's day is clock.ts's. */
export const ZONE = CLOCK_ZONE;
/** Three days before the root cause report is due: 08:40 in Monterrey on October 28, 2026. */
export const NOW = FILM_NOW;

/** What the whole memory holds: the totals the dashboard, Settings and the Library give. */
const SIZE = { memories: 507, chats: 406 };
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
  client?: string;
};

export type Fact = FactView & { owner: string; client: string | null };

export type Chat = { id: string; platform: PlatformId; title: string };

export interface Mem {
  nodes: Map<string, Node>;
  facts: Map<string, Fact>;
  chats: Map<string, Chat>;
  self: string;
  /** Company and Clients, then the field's own sections in ring order. */
  sections: { company: string; clients: string; more: string[] };
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
  /** The slot's key, when the line says it (a grown line does). */
  key?: string;
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

/** What the plant knows, by folder (field.graph's company); each sits in the section corpus.ts files it under. */
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
    const n: Node = { parent: null, importance: 3, pinned: false, urgency: "none", facts: 0, history: false, aliases: [], summary: null, kids: [], facts_: [], values: [], relations: [], ...o };
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
      key: said.key ?? ((slot && SLOT_KEY[slot]) || ""),
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
  // Company and Clients first, then the field's sections, each with its own id as memory makes one from a name.
  const slug = (label: string) => `sec_${label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;
  const sections = { company: "sec_company", clients: "sec_clients", more: FIELD.sections.map((x) => slug(x.label)) };
  node({ id: sections.company, kind: "section", label: "Company", section: sections.company });
  node({ id: sections.clients, kind: "section", label: "Clients", section: sections.clients });
  FIELD.sections.forEach((x, i) => node({ id: sections.more[i]!, kind: "section", label: x.label, section: sections.more[i]! }));
  /** The section a folder of that name is filed in. */
  const home = (label: string): string => {
    if (FIELD.company.some((x) => x.label === label)) return sections.company;
    const i = FIELD.sections.findIndex((x) => x.folders.some((y) => y.label === label));
    if (i < 0) throw new Error(`No section files ${label}`);
    return sections.more[i]!;
  };

  // What the plant knows, a folder each in its section, with the memories behind it the graph draws.
  for (const [label, list] of COMPANY) {
    const topic = node({ id: id("ent", start + DAY), kind: "topic", label, section: home(label), parent: home(label) });
    for (const said of list) add(topic, said, null);
  }

  // Clients: a folder each, its contacts and its engagement inside.
  const clientIds = new Map<string, string>();
  const client = (key: string, label: string, aliases: string[], own: Said[], work: [string, Said[]] | null) => {
    const folder = node({ id: id("ent", Date.parse(`${own[0]!.on}T00:00:00Z`)), kind: "organization", label, section: sections.clients, parent: sections.clients, importance: 4, aliases, client: key });
    clientIds.set(key, folder.id);
    for (const said of own) add(folder, said, key);
    if (work) {
      const project = node({ id: id("ent", Date.parse(`${work[1][0]!.on}T00:00:00Z`)), kind: "project", label: work[0], section: sections.clients, parent: folder.id });
      for (const said of work[1]) add(project, said, key);
      folder.relations.unshift({ type: "for", label: `${work[0]} is for this`, direction: "in", other: { id: project.id, label: work[0], kind: "project" } });
    }
    return folder;
  };

  const corvane = client("corvane", CLIENT, ["Corvane"], CORVANE, [field.client.engagement as string, LINE3]);
  const contact = (name: string, role: string, place: string, line: Said, on: string) => {
    const at = Date.parse(`${on}T00:00:00Z`);
    const person = node({ id: id("ent", at), kind: "person", label: name, section: sections.clients, parent: corvane.id });
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

  client("ostrava", "Ostrava Rail", ["Ostrava"], OSTRAVA, ["Brake housings", HOUSINGS]);
  client("pell", "Pell Agritech", ["Pell"], PELL, ["PPAP approval", PPAP]);
  client("kessler", "Kessler Pumps", ["Kessler"], KESSLER, null);

  const toneLabel = field.graph.hubs[2]!.children[0]!.label as string;
  const tone = node({ id: id("ent", start + 2 * DAY), kind: "folder", label: toneLabel, section: home(toneLabel), parent: home(toneLabel) });
  for (const said of TONE) add(tone, said, null);

  // The rest of the plant's chats, grown from a seed (corpus.ts): its folders in every section, two more customers and
  // more on the three the film names, each line in the chat that said it, to the totals above. Corvane Motors stays as
  // written above.
  const handTitles = [...chats.values()].map((c) => c.title);
  const grown = growTeam(FIELD, NOW, handTitles, ["Luis", "Hannah", "Nils", "Weiss", "Berg"], { memories: SIZE.memories - facts.size, chats: SIZE.chats - chats.size });
  const firstOn = (t: Grown): number => Math.min(...[t, ...t.kids].flatMap((x) => x.facts.map((f) => Date.parse(`${f.on}T15:00:00Z`))), NOW - 30 * DAY);
  const place = (t: Grown, parent: Node, section: string, client: string | null): Node => {
    const n = node({ id: id("ent", firstOn(t)), kind: t.kind, label: t.label, section, parent: parent.id, importance: t.kind === "organization" && t.client ? 4 : 3, aliases: t.aliases ?? [], ...(t.client ? { client: t.client } : {}) });
    if (t.client) clientIds.set(t.client, n.id);
    fill(n, t, section, t.client ?? client);
    return n;
  };
  /** Files what `t` holds into `n`: its lines, its people and their details, and what hangs under it. */
  const fill = (n: Node, t: Grown, section: string, client: string | null) => {
    for (const said of t.facts) add(n, said, client);
    for (const kid of t.kids) {
      const k = place(kid, n, section, client);
      if (kid.values) {
        const said = kid.facts[0];
        k.values = [...kid.values, ...(n.kind === "organization" ? ([["org", n.label]] as const) : [])].map(([fieldName, v]) => {
          const vid = id("fact", firstOn(kid));
          const chat = said ? chatOf(said.chat, said.ai) : null;
          return {
            id: vid,
            field: fieldName,
            value: v,
            href: fieldName === "email" ? `mailto:${v}` : fieldName === "phone" ? `tel:${v.replace(/[^\d+]/g, "")}` : null,
            sources: chat && fieldName !== "org" ? [{ evidenceId: `${vid}#e0`, platform: chat.platform, convId: chat.id, title: chat.title, msg: 1, role: "user" as const, at: `${said!.on}T15:20:00.000Z`, url: null, stale: false }] : [],
            said: fieldName !== "org" ? (said?.on ?? null) : null,
          };
        });
      }
      // A contact works at its client, and a piece of work is for it, as the sheet's Related lists them.
      if (kid.kind === "person" && n.kind === "organization") {
        k.relations = [{ type: "works_at", label: "Works at", direction: "out", other: { id: n.id, label: n.label, kind: "organization" } }];
        n.relations.push({ type: "works_at", label: `${k.label} works here`, direction: "in", other: { id: k.id, label: k.label, kind: "person" } });
      }
      if (kid.kind === "project" && n.kind === "organization") n.relations.unshift({ type: "for", label: `${k.label} is for this`, direction: "in", other: { id: k.id, label: k.label, kind: "project" } });
    }
  };
  // Each grown folder joins the one the film writes by hand of the same name, or is placed in its section.
  const folder = (t: Grown, section: string) => {
    const known = nodes.get(section)!.kids.map((k) => nodes.get(k)!).find((n) => n.label === t.label);
    if (known) fill(known, t, section, null);
    else place(t, nodes.get(section)!, section, null);
  };
  for (const t of grown.company) folder(t, sections.company);
  grown.sections.forEach((x, i) => {
    const section = nodes.get(sections.more[i]!)!;
    for (const t of x.folders) folder(t, section.id);
    for (const said of x.loose.facts) add(section, said, null);
  });
  for (const t of grown.clients) place(t, nodes.get(sections.clients)!, sections.clients, null);
  for (const [key, more] of grown.grown) fill(nodes.get(clientIds.get(key)!)!, more, sections.clients, key);

  // Counts and urgency roll up the tree, as the overview's node stats do.
  const rank = ["none", "later", "upcoming", "soon", "today", "overdue"];
  const roll = (n: Node): GraphNode["urgency"] => {
    let urgency: GraphNode["urgency"] = "none";
    for (const x of n.facts_.map((k) => facts.get(k)!)) if (rank.indexOf(x.urgency) > rank.indexOf(urgency)) urgency = x.urgency;
    for (const k of n.kids) {
      const u = roll(nodes.get(k)!);
      if (rank.indexOf(u) > rank.indexOf(urgency)) urgency = u;
    }
    n.facts = n.facts_.length + n.values.length;
    if (n.values.length) n.identity = n.values.length;
    n.urgency = urgency;
    return urgency;
  };
  for (const n of [...nodes.values()].filter((x) => x.kind === "section")) for (const k of n.kids) roll(nodes.get(k)!);

  return { nodes, facts, chats, self: self.id, sections, clientIds };
}
