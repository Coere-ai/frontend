import type { PlatformId } from "@coere/core";
import type { FactSource, FactView, GraphNode, IdentityValueView, MemoryNodeDetail } from "@coere/memory";
import { describeUrgency } from "@v2/packages/memory/src/time/labels";
import { field } from "../../../demos/industries/fields/commerce.mjs";
import { addSections, grow, plantSections, sectionId } from "./grow";
import { roster } from "./roster";

/**
 * Harbourline Trading's memory as Coere for Teams files it from Grace
 * Leung's chats: Company with how the firm works, its policies, its
 * systems and its team; Clients with a folder for each of its seven
 * partners, holding the partner's contacts, its engagement and its facts
 * by slot; then the firm's other sections, each with a few folders
 * (sourcing, products, shipping, markets, money, sales, plans and
 * deadlines), as coere-v2's Teams graph rings them after Company and
 * Clients. Every fact names the chat it came from. The people, partners
 * and dates are the commerce page's (demos/industries/fields/commerce.mjs),
 * made up for the demo.
 */

/** Grace works from Hong Kong. */
export const ZONE = "Asia/Hong_Kong";
/** The morning before the Meridian renewal call: 08:46 in Hong Kong on October 27, 2026. */
export const NOW = Date.UTC(2026, 9, 27, 0, 46);
const DAY = 86_400_000;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const FIRM = field.firm as string;
export const PERSON = field.person as { name: string; initials: string };
export const CLIENT = field.client.name as string;
/** How many chats the team's AIs hold across its people, every one of them a source of its memory. */
export const LIBRARY = 426;

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
  sections: { company: string; clients: string };
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

const RENEWAL = "Meridian Foods contract renewal";

/** Meridian Foods, the partner the page follows: field.client, slot by slot. */
const MERIDIAN: Said[] = [
  f("Meridian Foods imports dry and frozen food into the Netherlands from Rotterdam.", "overview", "2025-11-04", "claude", "Meridian Foods account notes"),
  f("Active client.", "relationship", "2025-02-11", "chatgpt", "Meridian Foods account notes"),
  f("Meridian agreed to send its 2027 volume forecast before October 24.", "promises", "2026-10-12", "claude", "Meridian 2027 forecast", "2026-10-24"),
  f("We promised Ines a renewal proposal by October 31.", "promises", "2026-10-19", "chatgpt", RENEWAL, "2026-10-31"),
  f("I told Pieter I would confirm the Rotterdam freight rate by November 7.", "promises", "2026-10-21", "claude", "Freight quote comparison", "2026-11-07"),
  f("Renewal call with Ines Vogel on October 28 to agree terms for 2027 and 2028.", "meetings", "2026-10-22", "chatgpt", RENEWAL, "2026-10-28"),
  f("Ines asked for 60 day payment terms instead of 30.", "requests", "2026-10-19", "claude", "Payment terms negotiation"),
  f("Meridian wants a monthly shipping report with three numbers: on time rate, damage and cost.", "requests", "2026-07-08", "gemini", "Meridian shipping report"),
  f("Pieter prefers email before 10 am Amsterdam time.", "requests", "2026-09-02", "chatgpt", "Incoterms for Rotterdam route"),
  f("The renewal proposal goes to Ines by October 31.", "deadlines", "2026-10-19", "chatgpt", RENEWAL, "2026-10-31"),
  f("The current supply agreement ends on December 31.", "deadlines", "2026-09-25", "claude", "Meridian supply agreement", "2026-12-31"),
  f("The first 2027 shipment leaves Shenzhen in the second week of January.", "deadlines", "2026-10-03", "gemini", "Supplier audit in Shenzhen"),
  f("Meridian pays in euros by letter of credit.", "billing", "2026-02-11", "claude", "Letter of credit checklist"),
  f("Payment terms are 30 days from the bill of lading.", "billing", "2025-02-11", "chatgpt", "Meridian Foods account notes"),
  f("Pasting the 2025 supply agreement: price, volume and the three termination clauses.", "documents", "2026-09-25", "claude", "Meridian supply agreement"),
];

const SUPPLY: Said[] = [
  f("The Meridian supply agreement ends on December 31 and renews for two years.", undefined, "2026-09-25", "claude", "Meridian supply agreement", undefined, "attribute"),
  f("Meridian buys 40 containers a year through Rotterdam on FOB terms.", undefined, "2026-08-11", "chatgpt", "Incoterms for Rotterdam route", undefined, "attribute"),
  f("We held Meridian's price flat in 2026 after freight costs fell.", undefined, "2026-01-14", "gemini", "Q4 pricing review", undefined, "decision"),
  f("Our floor for 2027 is a 3 percent increase.", undefined, "2026-10-20", "chatgpt", "Margin by region", undefined, "decision"),
];

/** The other partners, each with a little of its own. */
const KANTO: Said[] = [
  f("Kanto Housewares sells kitchenware in 60 stores across Japan.", "overview", "2025-06-03", "claude", "Kanto Housewares launch"),
  f("Active client.", "relationship", "2025-06-03", "claude", "Kanto Housewares launch"),
  f("We promised Kanto samples of the enamel range by November 14.", "promises", "2026-10-15", "chatgpt", "Kanto Housewares launch", "2026-11-14"),
  f("Busan launch review with Kanto on November 5.", "meetings", "2026-10-15", "chatgpt", "Kanto Housewares launch", "2026-11-05"),
];
const BUSAN: Said[] = [
  f("Kanto opens its first Busan shelf space in March with Rhee Distribution.", undefined, "2026-09-18", "gemini", "New distributor in Busan", undefined, "attribute"),
  f("Every box for the Busan launch needs a Korean label.", undefined, "2026-09-18", "gemini", "New distributor in Busan", undefined, "attribute"),
];
const SOLANO: Said[] = [
  f("Solano Imports buys kitchenware for shops across Spain.", "overview", "2026-05-12", "chatgpt", "Solano Imports quote"),
  f("Active client.", "relationship", "2026-05-12", "chatgpt", "Solano Imports quote"),
  f("We owe Solano a revised quote by November 3.", "promises", "2026-10-20", "claude", "Solano Imports quote", "2026-11-03"),
];
const CREDIT: Said[] = [
  f("Solano opens a letter of credit for each order.", undefined, "2026-06-02", "claude", "Letter of credit checklist", undefined, "attribute"),
  f("The letter of credit names Valencia as the port of discharge.", undefined, "2026-06-02", "claude", "Letter of credit checklist", undefined, "attribute"),
];
const RHEE: Said[] = [
  f("Rhee Distribution is our new distributor in Busan.", "overview", "2026-09-18", "gemini", "New distributor in Busan"),
  f("Active client.", "relationship", "2026-09-18", "gemini", "New distributor in Busan"),
  f("Rhee asked for 45 day payment terms.", "billing", "2026-10-09", "chatgpt", "Rhee Distribution terms"),
  f("Rhee signs the distribution terms by November 20.", "deadlines", "2026-10-09", "chatgpt", "Rhee Distribution terms", "2026-11-20"),
];

/** The section each of the firm's own topics sits in (roster.ts holds the rest of each section). */
const HOME: Record<string, string> = { "Payment terms": "money", "Freight partners": "shipping", "Customs codes": "shipping", "Pricing rules": "money", Markets: "markets", "Trade shows": "sales" };

/** What the firm knows, by topic (field.graph's company). */
const COMPANY: Array<[string, Said[]]> = [
  ["Payment terms", [
    f("Our standard terms are 30 days from the bill of lading.", undefined, "2025-03-04", "chatgpt", "Payment terms negotiation", undefined, "note"),
    f("Terms past 45 days need sign off from finance.", undefined, "2026-04-21", "claude", "Payment terms negotiation", undefined, "note"),
  ]],
  ["Freight partners", [
    f("We compare quotes from two forwarders for each Rotterdam booking.", undefined, "2026-08-11", "chatgpt", "Freight quote comparison", undefined, "note"),
    f("Freight rates are reviewed each June.", undefined, "2026-06-08", "gemini", "Freight quote comparison", undefined, "note"),
  ]],
  ["Customs codes", [
    f("Enamel cookware ships under HS code 7323.94.", undefined, "2026-03-17", "claude", "Customs codes for kitchenware", undefined, "note"),
    f("Every kitchenware invoice carries its HS code.", undefined, "2026-03-17", "claude", "Customs codes for kitchenware", undefined, "note"),
  ]],
  ["Pricing rules", [
    f("No discount past 5 percent without the sales lead.", undefined, "2026-02-02", "chatgpt", "Margin by region", undefined, "decision"),
    f("Price changes start at the top of a quarter.", undefined, "2026-02-02", "chatgpt", "Q4 pricing to Singapore", undefined, "note"),
  ]],
  ["Markets", [
    f("Our main markets are the Netherlands, Spain, Japan and Korea.", undefined, "2025-12-01", "gemini", "Margin by region", undefined, "note"),
    f("Singapore prices are set each quarter.", undefined, "2026-09-29", "chatgpt", "Q4 pricing to Singapore", undefined, "note"),
  ]],
  ["Trade shows", [
    f("We meet buyers at the Canton Fair each April and October.", undefined, "2026-04-14", "gemini", "Trade show follow ups", undefined, "note"),
    f("Every trade show lead gets a follow up within a week.", undefined, "2026-10-23", "chatgpt", "Trade show follow ups", undefined, "note"),
  ]],
];

const TONE: Said[] = [
  f("I open with volume, then trade terms for price.", undefined, "2026-05-06", "claude", "Payment terms negotiation", undefined, "style"),
  f("I never give a discount without getting something back.", undefined, "2026-05-06", "claude", "Payment terms negotiation", undefined, "style"),
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
  const sections = { company: "sec_company", clients: "sec_clients" };
  node({ id: sections.company, kind: "section", label: "Company", section: sections.company });
  node({ id: sections.clients, kind: "section", label: "Clients", section: sections.clients });
  // The firm's other sections, after Company and Clients as Coere for Teams rings them (roster.ts).
  const r = roster(NOW);
  addSections(nodes as never, r.sections.filter((x) => x.key !== "company"));

  // What the firm knows, a topic each in its section, with the memories behind it the graph draws. Markets' own
  // memories sit straight on its section, beside its folders by region.
  for (const [label, list] of COMPANY) {
    const home = sectionId(HOME[label]!);
    const topic = label === "Markets" ? nodes.get(home)! : node({ id: id("ent", start + DAY), kind: "topic", label, section: home, parent: home, extra: 9 });
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

  const meridian = client("meridian", CLIENT, ["Meridian"], MERIDIAN, ["Supply agreement", SUPPLY], 24);
  const contact = (name: string, role: string, place: string, line: Said, on: string) => {
    const at = Date.parse(`${on}T00:00:00Z`);
    const person = node({ id: id("ent", at), kind: "person", label: name, section: sections.clients, parent: meridian.id, extra: 4 });
    const chat = chatOf(line.chat, line.ai);
    const src = (vid: string): FactSource[] => [{ evidenceId: `${vid}#e0`, platform: line.ai, convId: chat.id, title: chat.title, msg: 1, role: "user", at: new Date(at).toISOString(), url: null, stale: false }];
    const value = (fieldName: IdentityValueView["field"], v: string): IdentityValueView => {
      const vid = id("fact", at);
      return { id: vid, field: fieldName, value: v, href: null, sources: src(vid), said: on };
    };
    person.values = [value("role", role), value("org", CLIENT), value("location", place)];
    person.relations = [{ type: "works_at", label: "Works at", direction: "out", other: { id: meridian.id, label: CLIENT, kind: "organization" } }];
    meridian.relations.push({ type: "works_at", label: `${name} works here`, direction: "in", other: { id: person.id, label: name, kind: "person" } });
    add(person, line, "meridian");
  };
  const [ines, pieter] = field.client.contacts as [string, string];
  contact(ines, "Head of purchasing", "Rotterdam", f("Ines signs off on every price change at Meridian.", undefined, "2026-03-10", "claude", RENEWAL, undefined, "attribute"), "2025-02-11");
  contact(pieter, "Logistics manager", "Amsterdam", f("Pieter books Meridian's Rotterdam freight.", undefined, "2026-08-11", "chatgpt", "Incoterms for Rotterdam route", undefined, "attribute"), "2025-04-02");

  client("kanto", "Kanto Housewares", ["Kanto"], KANTO, ["Busan launch", BUSAN], 6);
  client("solano", "Solano Imports", ["Solano"], SOLANO, ["Letter of credit", CREDIT], 5);
  client("rhee", "Rhee Distribution", ["Rhee"], RHEE, null, 5);

  const tone = node({ id: id("ent", start + 2 * DAY), kind: "folder", label: field.graph.hubs[2].children[0].label, section: sectionId("sales"), parent: sectionId("sales"), extra: 3 });
  for (const said of TONE) add(tone, said, null);
  const team = node({ id: id("ent", start + 3 * DAY), kind: "folder", label: "Team", section: sections.company, parent: sections.company });

  // The rest of the firm, grown from its roster to its real size (grow.ts, roster.ts): three more partners and their
  // contracts, the team, and every other section's folders, from as many chats as the team's AIs hold. Memory now
  // holds every memory the graph draws, so nothing is drawn past what is listed.
  const grown = grow({
    seed: 0xc0a3,
    now: NOW,
    zone: ZONE,
    nodes: nodes as never,
    facts,
    chats: LIBRARY,
    existing: [...chats.values()].map((c) => ({ platform: c.platform, title: c.title })),
    plant: [
      { parent: team.id, section: sections.company, things: r.people },
      { parent: sections.clients, section: sections.clients, things: r.clientThings },
      ...Object.entries(r.named).map(([key, lines]) => ({ parent: clientIds.get(key)!, section: sections.clients, lines, client: key })),
      ...plantSections(nodes as never, r.sections, NOW),
    ],
  });
  for (const c of grown.chats) chats.set(`${c.platform}:${c.title}`, { id: c.id, platform: c.platform, title: c.title });
  for (const t of r.clientThings) {
    const x = [...nodes.values()].find((y) => y.kind === "organization" && y.client === t.client);
    if (x && t.client) clientIds.set(t.client, x.id);
  }
  for (const n of nodes.values()) n.extra = 0;

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
