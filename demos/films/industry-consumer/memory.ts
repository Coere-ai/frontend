import type { PlatformId } from "@coere/core";
import type { FactSource, FactView, GraphNode, IdentityValueView, MemoryNodeDetail } from "@coere/memory";
import { describeUrgency } from "@v2/packages/memory/src/time/labels";
import { field } from "../../../demos/industries/fields/consumer.mjs";

/**
 * Fieldhouse Pantry's memory as Coere for Teams files it from Olivia
 * Brandt's chats: Company with what the brand knows (promo calendar,
 * trade spend rules, flavors and SKUs, packaging, sampling events, brand
 * voice), Clients with a folder per grocery partner holding its buyers,
 * its promotion and its facts by slot, and Tone and voice. Every fact
 * names the chat it came from. The people, partners and dates are the
 * consumer page's (demos/industries/fields/consumer.mjs), made up for
 * the demo.
 */

/** Olivia works from Chicago. */
export const ZONE = "America/Chicago";
/** The morning before the Green Valley holiday planning call: 08:40 in Chicago on October 28, 2026. */
export const NOW = Date.UTC(2026, 9, 28, 13, 40);
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

const RESET = "Green Valley Market reset";
const CALENDAR = "Holiday promo calendar";
const DEMOS = "Store demo schedule";

/** Green Valley Market, the partner the page follows: field.client, slot by slot. */
const GREEN_VALLEY: Said[] = [
  f("Green Valley Market runs 64 grocery stores across Ohio and Indiana.", "overview", "2025-03-12", "claude", "Green Valley account notes"),
  f("Active client.", "relationship", "2025-03-12", "chatgpt", "Green Valley kickoff"),
  f("Green Valley agreed to share October sales by store before October 25.", "promises", "2026-10-14", "claude", "Green Valley October sales", "2026-10-25"),
  f("We promised Rosa the holiday ad copy and images by November 5.", "promises", "2026-10-14", "chatgpt", CALENDAR, "2026-11-05"),
  f("I told Ben I would book store demos in the top 20 stores by November 10.", "promises", "2026-10-20", "claude", DEMOS, "2026-11-10"),
  f("Holiday planning call with Rosa Diaz on October 29 to agree the promotion and the ad slot.", "meetings", "2026-10-21", "chatgpt", RESET, "2026-10-29"),
  f("Rosa asked for maple to lead every holiday display.", "requests", "2026-10-14", "chatgpt", "Holiday display ideas"),
  f("Green Valley wants a weekly sell through report with three numbers per store group.", "requests", "2026-07-15", "gemini", "Retailer scorecard"),
  f("Ben prefers texts to email for store demo changes.", "requests", "2026-09-17", "chatgpt", "Ben store visits"),
  f("Rosa likes every plan on one page.", "preferences", "2026-06-18", "claude", "Rosa meeting notes"),
  f("The holiday ad copy is due to Green Valley by November 5.", "deadlines", "2026-10-14", "chatgpt", "Holiday ad copy draft", "2026-11-05"),
  f("The holiday ad runs from November 20.", "deadlines", "2026-10-14", "chatgpt", "Green Valley holiday ad", "2026-11-20"),
  f("The spring shelf reset plan is due in January.", "deadlines", "2026-10-02", "claude", "Spring shelf reset"),
  f("Green Valley deducts promotion costs from our invoices within 30 days.", "billing", "2026-04-07", "claude", "Trade spend by region"),
  f("Green Valley pays our invoices 30 days after delivery.", "billing", "2025-03-12", "claude", "Green Valley invoices"),
  f("Pasting the Green Valley scorecard: on shelf rate, sales growth and three notes from their buyer.", "documents", "2026-10-02", "gemini", "Green Valley scorecard"),
];

/** The holiday promotion, filed under Green Valley. */
const HOLIDAY: Said[] = [
  f("Buy two get one did better than 20 percent off at Green Valley last year.", undefined, "2026-01-09", "gemini", "Holiday promo results", undefined, "decision"),
  f("Their holiday ad goes out on November 20 and closes on November 5.", undefined, "2026-10-14", "chatgpt", CALENDAR, undefined, "attribute"),
  f("Green Valley shoppers buy our maple flavor most in December.", undefined, "2026-09-30", "chatgpt", "Shopper survey results", undefined, "attribute"),
  f("Green Valley moved our oat bars to eye level in 42 stores in October.", undefined, "2026-10-08", "claude", "Oat bar shelf placement", undefined, "attribute"),
  f("Their loyalty app has 310,000 members who get weekly coupons.", undefined, "2026-08-22", "claude", "Loyalty app coupon", undefined, "attribute"),
];

/** The other partners, each with a little of its own. */
const HARBOR: Said[] = [
  f("Harbor Foods runs 120 grocery stores along the East Coast.", "overview", "2025-06-03", "claude", "Harbor Foods shelf plan"),
  f("Active client.", "relationship", "2025-06-03", "claude", "Harbor Foods shelf plan"),
  f("We owe Harbor Foods the new shelf plan by November 12.", "promises", "2026-10-16", "chatgpt", "Harbor Foods shelf plan", "2026-11-12"),
  f("Shelf reset review with Harbor Foods on November 4.", "meetings", "2026-10-16", "chatgpt", "Harbor Foods shelf plan", "2026-11-04"),
];
const SHELF: Said[] = [
  f("Harbor Foods resets its snack aisle in the first week of January.", undefined, "2026-09-22", "gemini", "Harbor Foods shelf plan", undefined, "attribute"),
  f("Our oat bars move to the second shelf in the reset.", undefined, "2026-09-22", "gemini", "Harbor Foods shelf plan", undefined, "attribute"),
];
const PINE: Said[] = [
  f("Pine Street Co-op is a member owned grocer with 9 stores in Oregon.", "overview", "2026-05-12", "chatgpt", "Pine Street Co-op order"),
  f("Active client.", "relationship", "2026-05-12", "chatgpt", "Pine Street Co-op order"),
  f("We owe Pine Street a revised case price by November 3.", "promises", "2026-10-20", "claude", "Pine Street Co-op order", "2026-11-03"),
];
const COUPONS: Said[] = [
  f("Pine Street sends member coupons on the first Monday of each month.", undefined, "2026-06-02", "claude", "Loyalty app coupon", undefined, "attribute"),
  f("Pine Street members redeem about one coupon in eight.", undefined, "2026-06-02", "claude", "Loyalty app coupon", undefined, "attribute"),
];
const NORTHWAY: Said[] = [
  f("Northway Grocers runs 38 stores in Minnesota.", "overview", "2026-09-18", "gemini", "Northway Grocers pricing"),
  f("Active client.", "relationship", "2026-09-18", "gemini", "Northway Grocers pricing"),
  f("Northway asked for a 2 percent allowance off each invoice.", "billing", "2026-10-09", "chatgpt", "Northway Grocers pricing"),
  f("Northway signs the 2027 price list by November 20.", "deadlines", "2026-10-09", "chatgpt", "Northway Grocers pricing", "2026-11-20"),
];

/** Company: what the brand knows, by topic (field.graph's company). */
const COMPANY: Array<[string, Said[]]> = [
  ["Promo calendar", [
    f("Holiday promotions are set by the first week of November.", undefined, "2026-08-04", "chatgpt", CALENDAR, undefined, "note"),
    f("Every promotion runs for at least two weeks.", undefined, "2026-02-10", "claude", CALENDAR, undefined, "note"),
  ]],
  ["Trade spend rules", [
    f("Trade spend stays under 18 percent of gross sales.", undefined, "2026-01-20", "claude", "Trade spend by region", undefined, "decision"),
    f("Any offer past 25 percent off needs sign off from finance.", undefined, "2026-04-21", "chatgpt", "Trade spend by region", undefined, "note"),
  ]],
  ["Flavors and SKUs", [
    f("Our oat bars come in maple, cocoa and berry.", undefined, "2025-11-04", "gemini", "New flavor launch plan", undefined, "note"),
    f("Cinnamon launches in March 2027.", undefined, "2026-10-06", "claude", "New flavor launch plan", undefined, "note"),
  ]],
  ["Packaging", [
    f("The new boxes ship from January with a recyclable tray.", undefined, "2026-09-10", "chatgpt", "Packaging refresh feedback", undefined, "note"),
    f("Buyers asked for a shelf ready case of 12.", undefined, "2026-09-10", "chatgpt", "Packaging refresh feedback", undefined, "note"),
  ]],
  ["Sampling events", [
    f("Store demos run Friday to Sunday from 11 am to 3 pm.", undefined, "2026-07-14", "claude", "Sampling event checklist", undefined, "note"),
    f("Each store demo needs 300 samples and one table.", undefined, "2026-07-14", "claude", "Sampling event checklist", undefined, "note"),
  ]],
  ["Brand voice", [
    f("We say oat bars, never snack bars.", undefined, "2026-03-03", "gemini", "Packaging refresh feedback", undefined, "decision"),
    f("Our copy is warm and plain.", undefined, "2026-03-03", "gemini", "Packaging refresh feedback", undefined, "note"),
  ]],
];

const TONE: Said[] = [
  f("I write plans as short lists with dates.", undefined, "2026-05-06", "claude", "Team goals for Q4", undefined, "style"),
  f("I lead with what worked last year.", undefined, "2026-05-06", "claude", "Team goals for Q4", undefined, "style"),
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
    const at = Date.parse(`${said.on}T15:20:00Z`);
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
    const folder = node({ id: id("ent", Date.parse(`${own[0]!.on}T15:00:00Z`)), kind: "organization", label, section: sections.clients, parent: sections.clients, importance: 4, aliases, client: key, extra });
    clientIds.set(key, folder.id);
    for (const said of own) add(folder, said, key);
    if (work) {
      const project = node({ id: id("ent", Date.parse(`${work[1][0]!.on}T15:00:00Z`)), kind: "project", label: work[0], section: sections.clients, parent: folder.id, extra: Math.round(extra / 2) });
      for (const said of work[1]) add(project, said, key);
      folder.relations.unshift({ type: "for", label: `${work[0]} is for this`, direction: "in", other: { id: project.id, label: work[0], kind: "project" } });
    }
    return folder;
  };

  const greenValley = client("green-valley", CLIENT, ["Green Valley"], GREEN_VALLEY, [field.client.engagement as string, HOLIDAY], 22);
  const contact = (name: string, role: string, place: string, line: Said, on: string) => {
    const at = Date.parse(`${on}T15:00:00Z`);
    const person = node({ id: id("ent", at), kind: "person", label: name, section: sections.clients, parent: greenValley.id, extra: 4 });
    const chat = chatOf(line.chat, line.ai);
    const src = (vid: string): FactSource[] => [{ evidenceId: `${vid}#e0`, platform: line.ai, convId: chat.id, title: chat.title, msg: 1, role: "user", at: new Date(at).toISOString(), url: null, stale: false }];
    const value = (fieldName: IdentityValueView["field"], v: string): IdentityValueView => {
      const vid = id("fact", at);
      return { id: vid, field: fieldName, value: v, href: null, sources: src(vid), said: on };
    };
    person.values = [value("role", role), value("org", CLIENT), value("location", place)];
    person.relations = [{ type: "works_at", label: "Works at", direction: "out", other: { id: greenValley.id, label: CLIENT, kind: "organization" } }];
    greenValley.relations.push({ type: "works_at", label: `${name} works here`, direction: "in", other: { id: person.id, label: name, kind: "person" } });
    add(person, line, "green-valley");
  };
  const [rosa, ben] = field.client.contacts as [string, string];
  contact(rosa, "Snacks category buyer", "Columbus", f("Rosa approves every promotion in Green Valley's snack aisle.", undefined, "2026-03-10", "chatgpt", RESET, undefined, "attribute"), "2025-03-12");
  contact(ben, "Store operations manager", "Indianapolis", f("Ben runs store demos and displays for Green Valley.", undefined, "2026-09-17", "chatgpt", DEMOS, undefined, "attribute"), "2025-05-06");

  client("harbor", "Harbor Foods", ["Harbor"], HARBOR, ["Shelf reset", SHELF], 6);
  client("pine-street", "Pine Street Co-op", ["Pine Street"], PINE, ["Loyalty coupons", COUPONS], 5);
  client("northway", "Northway Grocers", ["Northway"], NORTHWAY, null, 5);

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
