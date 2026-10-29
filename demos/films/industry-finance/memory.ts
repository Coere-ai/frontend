import type { PlatformId } from "@coere/core";
import type { FactSource, FactView, GraphNode, IdentityValueView, MemoryNodeDetail } from "@coere/memory";
import { describeUrgency } from "@v2/packages/memory/src/time/labels";
import { field } from "../../../scripts/industries/fields/finance.mjs";

/**
 * Ashgrove Wealth Partners' memory as Coere for Teams files it from the
 * team's chats (the shapes of demos/films/teams/memory.ts, written by hand
 * here instead of from coere-v2's agency corpus): Company with the firm's
 * own folders, Clients with a folder per household holding its contacts,
 * its engagement and its facts by slot, and Tone and voice. Coere for
 * Teams keeps no money amounts, so the households' facts carry
 * percentages and dates, never dollars. Made up.
 */

export const ZONE = "America/Los_Angeles";
/** The film's day: Wednesday, October 28, 2026, two days before the Lindqvist review. */
export const NOW = Date.parse("2026-10-28T17:00:00Z");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

export interface Mem {
  now: number;
  nodes: Map<string, Node>;
  facts: Map<string, Fact>;
  self: string;
  sections: { company: string; clients: string; tone: string };
  /** Client key to its folder id. */
  clientIds: Map<string, string>;
  clients: ClientDef[];
}

type Said = [PlatformId, string, string];
type Kind = "task" | "event" | "decision" | "preference" | "attribute" | "note" | "style";
type FactDef = { text: string; said: Said; slot?: string; kind?: Kind; due?: string; start?: string; basis?: "pasted" | "user_stated" };
type Contact = { name: string; key: string; role: string; email?: string; phone?: string; said: Said };
type ClientDef = { key: string; name: string; aliases: string[]; work: string; contacts: Contact[]; facts: FactDef[] };

/** The kind each slot's facts are, unless a fact says otherwise. */
const SLOT_KIND: Record<string, Kind> = {
  promises: "task",
  deadlines: "task",
  meetings: "event",
  decisions: "decision",
  preferences: "preference",
  requests: "note",
  overview: "attribute",
  relationship: "attribute",
  billing: "attribute",
  documents: "note",
  notes: "note",
};

/** The key each client slot files a fact under (packages/solution's client_account template), so every reader finds its slot. */
const SLOT_KEY: Record<string, string> = {
  promises: "promise.what",
  deadlines: "due",
  meetings: "meeting.when",
  requests: "request.what",
  decisions: "client_decision.what",
  billing: "billing.terms",
  preferences: "client_pref.what",
  overview: "client.industry",
  relationship: "client.owner",
};

const C = field.client;
const LQ = (said: string, p: PlatformId, title: string): Said => [p, title, said];

/** The households Daniel's team advises. The Lindqvists are the field's own client; the others are written in the same spirit. */
export const CLIENT_DEFS: ClientDef[] = [
  {
    key: "lindqvist",
    name: C.name,
    aliases: ["Lindqvist", "Lindqvists", "the Lindqvists", "Lindqvist family", "Elena Lindqvist", "Jonas Lindqvist", "Elena"],
    work: C.engagement,
    contacts: [
      { name: C.contacts[0], key: "elena", role: "client", email: "elena.lindqvist@fastmail.com", phone: "+1 503 555 0142", said: LQ("2026-03-04", "claude", "Lindqvist onboarding notes") },
      { name: C.contacts[1], key: "jonas", role: "client", email: "jonas.lindqvist@fastmail.com", said: LQ("2026-03-04", "claude", "Lindqvist onboarding notes") },
    ],
    facts: [
      { slot: "promises", text: `${C.promises[0][0]} ${C.promises[0][1]}.`, said: LQ("2026-10-10", "claude", "Lindqvist pension rollover"), due: "2026-10-24" },
      { slot: "promises", text: `${C.promises[1][0]} ${C.promises[1][1]}.`, said: LQ("2026-10-20", "chatgpt", "Lindqvist rebalancing plan"), due: "2026-10-30" },
      { slot: "promises", text: `${C.promises[2][0]} ${C.promises[2][1]}.`, said: LQ("2026-10-18", "claude", "Roth conversion math"), due: "2026-11-14" },
      { slot: "meetings", text: `${C.meeting[0]} ${C.meeting[1]} ${C.meeting[2]}`, said: LQ("2026-10-22", "chatgpt", "Lindqvist annual review prep"), start: "2026-10-30" },
      { slot: "requests", text: C.requests[0][0], said: LQ("2026-10-15", "claude", "Lindqvist call notes") },
      { slot: "requests", text: `${C.requests[1][0]} ${C.requests[1][1]} ${C.requests[1][2]}`, said: LQ("2026-07-02", "gemini", "Client letter template") },
      { slot: "requests", text: C.requests[2][0], said: LQ("2026-09-09", "chatgpt", "Lindqvist scheduling") },
      { slot: "deadlines", text: `${C.deadlines[0][0]} ${C.deadlines[0][1]}.`, said: LQ("2026-10-20", "chatgpt", "Lindqvist rebalancing plan"), due: "2026-10-30" },
      { slot: "deadlines", text: `${C.deadlines[1][0]} ${C.deadlines[1][1]}.`, said: LQ("2026-10-18", "claude", "Roth conversion math"), due: "2026-12-31" },
      { slot: "deadlines", kind: "note", text: C.deadlines[2][0], said: LQ("2026-10-03", "chatgpt", "529 plan options") },
      { slot: "billing", text: C.billing[0], said: LQ("2026-03-04", "claude", "Lindqvist onboarding notes") },
      { slot: "documents", basis: "pasted", text: `${C.document[0]} ${C.document[1]} ${C.document[2]}`, said: LQ("2026-10-15", "claude", "Lindqvist risk questionnaire") },
      { slot: "overview", text: "The Lindqvists live in Portland with their daughter Freya, who starts college in fall 2027.", said: LQ("2026-10-03", "chatgpt", "529 plan options") },
      { slot: "relationship", text: "Daniel has been the Lindqvists' lead advisor since 2019.", said: LQ("2026-03-04", "claude", "Lindqvist onboarding notes") },
      { slot: "preferences", text: "Elena is uneasy about stocks after the spring drop and wants less swing.", said: LQ("2026-10-15", "claude", "Lindqvist risk questionnaire") },
      { slot: "decisions", text: "We set the Lindqvist target at 60 percent stocks and 40 percent bonds in March.", said: LQ("2026-03-11", "gemini", "Lindqvist allocation") },
      { slot: "notes", text: "The Lindqvist portfolio is 68 percent stocks against a 60 percent target.", said: LQ("2026-10-20", "chatgpt", "Lindqvist drift check") },
      { slot: "notes", text: "Elena plans to retire in June 2029.", said: LQ("2026-09-12", "claude", "Lindqvist retirement income") },
    ],
  },
  {
    key: "okoro",
    name: "Okoro family trust",
    aliases: ["Okoro", "Okoros", "the Okoros", "Okoro trust", "Marcus Okoro", "Ada Okoro"],
    work: "Estate plan",
    contacts: [
      { name: "Marcus Okoro", key: "marcus", role: "trustee", email: "marcus@okorofamily.org", said: ["gemini", "Okoro estate plan questions", "2026-06-18"] },
      { name: "Ada Okoro", key: "ada", role: "beneficiary", said: ["gemini", "Okoro estate plan questions", "2026-06-18"] },
    ],
    facts: [
      { slot: "promises", text: "We promised Marcus a summary of the trust's bond holdings by November 6.", said: ["claude", "Okoro trust review", "2026-10-21"], due: "2026-11-06" },
      { slot: "deadlines", text: "The Okoro trust tax return is due April 15.", said: ["chatgpt", "Okoro trust taxes", "2026-09-30"], due: "2027-04-15" },
      { slot: "meetings", text: "Estate plan call with Marcus and his attorney on November 12.", said: ["gemini", "Okoro estate plan questions", "2026-10-19"], start: "2026-11-12" },
      { slot: "requests", text: "Marcus asked for the trust statements as PDFs, never paper.", said: ["claude", "Okoro trust review", "2026-08-14"] },
      { slot: "preferences", text: "Marcus wants every change explained by phone before it shows on a statement.", said: ["gemini", "Okoro estate plan questions", "2026-06-18"] },
      { slot: "decisions", text: "The trust keeps its muni bonds to maturity.", said: ["chatgpt", "Muni bond ladder for the Parks", "2026-05-02"] },
      { slot: "overview", text: "The Okoro family trust was set up by Marcus's parents for their four grandchildren.", said: ["gemini", "Okoro estate plan questions", "2026-06-18"] },
      { slot: "billing", text: "The Okoro trust is billed quarterly in arrears.", said: ["claude", "Fee schedule wording", "2026-02-20"] },
      { slot: "documents", basis: "pasted", text: "Pasting the Okoro trust deed summary: trustees, beneficiaries and when the trust pays out.", said: ["gemini", "Okoro trust deed", "2026-06-20"] },
      { slot: "relationship", text: "Tom Becker covers the Okoro trust when Daniel is away.", said: ["chatgpt", "Coverage plan", "2026-08-03"] },
      { slot: "notes", text: "Ada Okoro turns 25 in May, when her share of the trust opens.", said: ["gemini", "Okoro estate plan questions", "2026-10-19"] },
    ],
  },
  {
    key: "park",
    name: "Park household",
    aliases: ["Park", "Parks", "the Parks", "Grace Park", "Henry Park"],
    work: "Muni ladder",
    contacts: [
      { name: "Grace Park", key: "grace", role: "client", email: "grace.park@gmail.com", said: ["chatgpt", "Muni bond ladder for the Parks", "2026-05-02"] },
      { name: "Henry Park", key: "henry", role: "client", said: ["chatgpt", "Muni bond ladder for the Parks", "2026-05-02"] },
    ],
    facts: [
      { slot: "promises", text: "I told Grace I would send the next rung of the muni ladder by November 20.", said: ["chatgpt", "Park retirement income", "2026-10-26"], due: "2026-11-20" },
      { slot: "deadlines", text: "Henry's first required minimum distribution is due by December 31.", said: ["claude", "Required minimum distributions", "2026-09-04"], due: "2026-12-31" },
      { slot: "meetings", text: "Park retirement check in on December 3.", said: ["gemini", "Park retirement income", "2026-10-26"], start: "2026-12-03" },
      { slot: "preferences", text: "The Parks want income they can count on more than growth.", said: ["chatgpt", "Muni bond ladder for the Parks", "2026-05-02"] },
      { slot: "decisions", text: "We built the Park muni ladder in five yearly rungs.", said: ["chatgpt", "Muni bond ladder for the Parks", "2026-05-02"] },
      { slot: "overview", text: "Grace and Henry Park retired from teaching in 2025.", said: ["gemini", "Park retirement income", "2026-04-10"] },
      { slot: "requests", text: "Grace asked to see the ladder as a simple table, one row per year.", said: ["chatgpt", "Park retirement income", "2026-10-26"] },
      { slot: "billing", text: "The Parks pay the advisory fee from Henry's IRA.", said: ["claude", "Park fee setup", "2025-12-09"] },
      { slot: "notes", text: "Henry's pension pays monthly and covers about half of their spending.", said: ["gemini", "Park retirement income", "2026-04-10"] },
    ],
  },
  {
    key: "haddad",
    name: "Haddad family",
    aliases: ["Haddad", "Haddads", "the Haddads", "Samir Haddad"],
    work: "401k rollover",
    contacts: [{ name: "Samir Haddad", key: "samir", role: "client", email: "samir.haddad@outlook.com", said: ["claude", "Haddad 401k rollover", "2026-09-22"] }],
    facts: [
      { slot: "promises", text: "We promised Samir the rollover paperwork by November 4.", said: ["claude", "Haddad 401k rollover", "2026-10-23"], due: "2026-11-04" },
      { slot: "deadlines", text: "The old 401k plan closes Samir's account on December 15.", said: ["claude", "Haddad 401k rollover", "2026-09-22"], due: "2026-12-15" },
      { slot: "requests", text: "Samir asked that the rollover go straight to the IRA, with no check in the mail.", said: ["chatgpt", "Haddad rollover steps", "2026-10-02"] },
      { slot: "overview", text: "Samir Haddad left his engineering job at Corvane in August.", said: ["claude", "Haddad 401k rollover", "2026-09-22"] },
      { slot: "preferences", text: "Samir reads everything by email and answers on weekends.", said: ["chatgpt", "Haddad rollover steps", "2026-10-02"] },
      { slot: "meetings", text: "Rollover check in call with Samir on November 9.", said: ["claude", "Haddad 401k rollover", "2026-10-23"], start: "2026-11-09" },
      { slot: "notes", text: "Samir wants the rollover in the same target date fund for now.", said: ["chatgpt", "Haddad rollover steps", "2026-10-02"] },
    ],
  },
];

type FolderDef = { label: string; facts: FactDef[] };

/** Company: the firm's own knowledge, in the folders the team's chats filled. */
const COMPANY: FolderDef[] = [
  {
    label: "Investment policy",
    facts: [
      { text: "Every client gets a written investment policy statement before we trade.", said: ["claude", "Investment policy template", "2026-01-14"] },
      { text: "Our core portfolios use low cost index funds for at least 80 percent of stocks.", said: ["chatgpt", "Q3 market commentary", "2026-07-08"] },
      { text: "We never buy single stocks for a client unless they ask in writing.", said: ["claude", "Investment policy template", "2026-01-14"] },
      { text: "Bond holdings stay at high grade, with no junk bonds.", said: ["gemini", "Muni bond ladder for the Parks", "2026-05-02"] },
      { kind: "decision", text: "We decided to hold three months of spending in cash for retired clients.", said: ["chatgpt", "Cash reserve rule", "2026-02-03"] },
      { text: "Clients under ten years from retirement hold at least 30 percent in bonds.", said: ["claude", "Glide path notes", "2026-02-11"] },
      { text: "International stocks make up a quarter of the stock side.", said: ["gemini", "Q2 allocation review", "2026-04-22"] },
      { text: "We review the investment policy with the partners every January.", said: ["chatgpt", "Partner meeting agenda", "2026-01-06"] },
    ],
  },
  {
    label: "Rebalancing rules",
    facts: [
      { text: "We rebalance when an asset class drifts more than 5 points from its target.", said: ["claude", "Rebalancing rules", "2026-03-19"] },
      { text: "Rebalancing trades go in taxable accounts last, to keep taxes down.", said: ["claude", "Rebalancing rules", "2026-03-19"] },
      { text: "New cash goes to the asset class that is furthest under its target.", said: ["chatgpt", "Tax loss harvesting list", "2026-08-21"] },
      { kind: "decision", text: "We check every household for drift on the first Monday of each quarter.", said: ["gemini", "Quarterly drift review", "2026-04-06"] },
      { text: "Tax loss harvesting runs in November and again in March.", said: ["chatgpt", "Tax loss harvesting list", "2026-08-21"] },
      { text: "Clients who ask for fewer trades get one rebalance a year unless drift passes 8 points.", said: ["claude", "Rebalancing exceptions", "2026-05-14"] },
      { text: "Every rebalance is followed by a plain note to the client.", said: ["gemini", "Client letter template", "2026-07-02"] },
    ],
  },
  {
    label: "Fee schedule",
    facts: [
      { text: "The advisory fee is charged quarterly and shown on every statement.", said: ["claude", "Fee schedule wording", "2026-02-20"] },
      { text: "Fees are cut for households above the second tier.", said: ["claude", "Fee schedule wording", "2026-02-20"] },
      { text: "Financial plans for new clients are billed once, before the first meeting.", said: ["chatgpt", "New client checklist", "2026-01-28"] },
      { text: "Fees come from a taxable account first, never from a Roth.", said: ["claude", "Fee debit rules", "2026-03-02"] },
      { text: "Hourly planning work is quoted in writing before it starts.", said: ["gemini", "Planning engagement letter", "2026-02-25"] },
    ],
  },
  {
    label: "Compliance",
    facts: [
      { text: "Every client letter is reviewed by Priya in compliance before it goes out.", said: ["gemini", "Compliance review notes", "2026-06-02"] },
      { text: "We keep notes from every client meeting for six years.", said: ["gemini", "Compliance review notes", "2026-06-02"] },
      { text: "Market commentary may not promise returns or name a target price.", said: ["claude", "Q3 market commentary", "2026-07-08"] },
      { kind: "task", text: "The annual compliance review is due December 10.", said: ["gemini", "Compliance review notes", "2026-10-05"], due: "2026-12-10" },
      { text: "Advisors may not accept gifts worth more than a small thank you.", said: ["claude", "Gift policy", "2026-01-19"] },
      { text: "Client emails are archived by the custodian's system, not by hand.", said: ["chatgpt", "Email archive setup", "2026-03-23"] },
      { text: "Performance numbers in letters are always net of fees.", said: ["gemini", "Q3 market commentary", "2026-07-08"] },
    ],
  },
  {
    label: "Custodians",
    facts: [
      { text: "Client accounts are held at Brightwater Custody.", said: ["chatgpt", "New client checklist", "2026-01-28"] },
      { text: "Transfers between custodians take about two weeks.", said: ["claude", "Haddad rollover steps", "2026-10-02"] },
      { text: "Trades placed before 1 pm Pacific settle the next business day.", said: ["chatgpt", "Trading cutoffs", "2026-03-30"] },
      { text: "New accounts open online and need two forms of ID.", said: ["gemini", "Account opening steps", "2026-02-17"] },
      { text: "Wire requests over the phone are confirmed by a call back to the number on file.", said: ["claude", "Wire safety rules", "2026-04-28"] },
    ],
  },
  {
    label: "Client letters",
    facts: [
      { text: "Quarterly letters lead with what changed, then what we did about it.", said: ["gemini", "Client letter template", "2026-07-02"] },
      { text: "Letters stay under one page and use the client's first name.", said: ["gemini", "Client letter template", "2026-07-02"] },
      { text: "Every letter ends with the next meeting date.", said: ["chatgpt", "Client letter template", "2026-07-02"] },
      { text: "Market notes go out the week after each quarter ends.", said: ["claude", "Q3 market commentary", "2026-07-08"] },
      { text: "We send a birthday card to every client, signed by their advisor.", said: ["gemini", "Client care list", "2026-05-30"] },
    ],
  },
];

const TONE: FactDef[] = [
  { kind: "style", text: "I explain numbers in plain words and lead with what changed.", said: ["claude", "Client letter template", "2026-07-02"] },
  { kind: "style", text: "I round to whole percents and say what a number means for the client's plan.", said: ["chatgpt", "Q3 market commentary", "2026-07-08"] },
  { kind: "style", text: "I keep notes to clients short, warm and free of jargon.", said: ["gemini", "Client letter template", "2026-07-02"] },
  { kind: "style", text: "I show one chart at most and say in a sentence what it means.", said: ["claude", "Review deck style", "2026-06-11"] },
];

/** The coworkers on the firm's team, as Settings lists them. */
export const WORKERS = [
  { key: "priya", name: "Priya Shah", team: "Compliance", role: "Chief compliance officer" },
  { key: "tom", name: "Tom Becker", team: "Advice", role: "Associate advisor" },
  { key: "lena", name: "Lena Ortiz", team: "Operations", role: "Client service" },
];

/** "May 9" and the like, emails and phones, as the ranges the sheet sets in mono. */
function specificsOf(text: string): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const re = new RegExp(`\\b(?:${MONTHS.join("|")}) \\d{1,2}\\b|[\\w.]+@[\\w.-]+\\.[a-z]+|\\+\\d[\\d ()-]{7,}\\d`, "g");
  for (let m = re.exec(text); m; m = re.exec(text)) out.push([m.index, m.index + m[0].length]);
  return out;
}

const PLATFORM_NAMES: Record<string, string> = { chatgpt: "ChatGPT", claude: "Claude", gemini: "Gemini" };
export const platformName = (p: string) => PLATFORM_NAMES[p] ?? p;

/** A chat's id from its AI and title, so the same title on the same AI is one chat. */
const chatId = (p: string, title: string) => `${p}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export function buildMemory(): Mem {
  const now = NOW;
  const nodes = new Map<string, Node>();
  const facts = new Map<string, Fact>();
  let n = 0;

  const node = (o: Partial<Node> & Pick<Node, "id" | "kind" | "label" | "section">): Node => {
    const made: Node = { parent: null, importance: 3, pinned: false, urgency: "none", facts: 0, history: false, aliases: [], summary: null, kids: [], facts_: [], values: [], relations: [], ...o };
    nodes.set(made.id, made);
    if (made.parent) nodes.get(made.parent)?.kids.push(made.id);
    return made;
  };

  const self = node({ id: "ent_self", kind: "self", label: "You", section: "", importance: 5 });
  const sections = { company: "sec_company", clients: "sec_clients", tone: "sec_tone" };
  node({ id: sections.company, kind: "section", label: "Company", section: sections.company });
  node({ id: sections.clients, kind: "section", label: "Clients", section: sections.clients });
  node({ id: sections.tone, kind: "section", label: "Tone and voice", section: sections.tone });

  const sourceOf = (id: string, [platform, title, day]: Said, msg = 0): FactSource => ({
    evidenceId: `${id}#e0`,
    platform,
    convId: chatId(platform, title),
    title,
    msg,
    role: "user",
    at: `${day}T${String(15 + (n % 6)).padStart(2, "0")}:${String((n * 7) % 60).padStart(2, "0")}:00Z`,
    url: null,
    stale: false,
  });

  const addFact = (owner: string, client: string | null, def: FactDef, key = ""): void => {
    n += 1;
    const id = `fact_${String(n).padStart(4, "0")}`;
    const kind: Kind = def.kind ?? (def.slot ? SLOT_KIND[def.slot] : undefined) ?? "note";
    const source = sourceOf(id, def.said, n % 5);
    const urgency = describeUrgency(
      {
        status: "active",
        kind: kind as never,
        progress: kind === "task" ? "needs-action" : undefined,
        urgency: def.due ? { due: { at: def.due } } : undefined,
        start: def.start ? { at: def.start } : undefined,
        evidence: [{ at: source.at }],
      } as never,
      now,
      ZONE,
    );
    facts.set(id, {
      id,
      kind,
      key,
      text: def.text,
      specifics: specificsOf(def.text),
      importance: kind === "task" ? 4 : 3,
      urgency: urgency.level,
      urgencyLabel: urgency.label,
      due: def.due ? { at: def.due, tz: null } : null,
      progress: kind === "task" ? "needs-action" : null,
      status: "active",
      disagree: false,
      held: false,
      pinned: false,
      origin: "extracted",
      basis: def.basis ?? "user_stated",
      sensitivity: null,
      sources: [source],
      supersededBy: null,
      replacedOn: null,
      changedBy: null,
      slot: def.slot ?? null,
      owner,
      client,
    });
    nodes.get(owner)!.facts_.push(id);
  };

  // Company: one folder each.
  COMPANY.forEach((f, i) => {
    const folder = node({ id: `ent_company_${i}`, kind: "folder", label: f.label, section: sections.company, parent: sections.company });
    for (const def of f.facts) addFact(folder.id, null, def);
  });

  // Clients: a folder per household, its contacts and its engagement inside it.
  const clientIds = new Map<string, string>();
  for (const c of CLIENT_DEFS) {
    const folder = node({ id: `ent_client_${c.key}`, kind: "organization", label: c.name, section: sections.clients, parent: sections.clients, importance: 4, aliases: c.aliases, client: c.key });
    clientIds.set(c.key, folder.id);
    for (const k of c.contacts) {
      const person = node({ id: `ent_contact_${c.key}_${k.key}`, kind: "person", label: k.name, section: sections.clients, parent: folder.id });
      const said = new Date(Date.parse(`${k.said[2]}T12:00:00Z`)).toISOString().slice(0, 10);
      const value = (field: IdentityValueView["field"], v: string, href: string | null): IdentityValueView => {
        n += 1;
        const id = `fact_${String(n).padStart(4, "0")}`;
        return { id, field, value: v, href, sources: [sourceOf(id, k.said)], said };
      };
      person.values = [
        ...(k.email ? [value("email", k.email, `mailto:${k.email}`)] : []),
        ...(k.phone ? [value("phone", k.phone, `tel:${k.phone.replace(/[^\d+]/g, "")}`)] : []),
        value("role", k.role, null),
        value("org", c.name, null),
      ];
      person.relations = [{ type: "works_at", label: "Belongs to", direction: "out", other: { id: folder.id, label: c.name, kind: "organization" } }];
      folder.relations.push({ type: "works_at", label: `${k.name} is part of this`, direction: "in", other: { id: person.id, label: k.name, kind: "person" } });
    }
    const work = node({ id: `ent_work_${c.key}`, kind: "project", label: c.work, section: sections.clients, parent: folder.id });
    folder.relations.unshift({ type: "for", label: `${c.work} is for this`, direction: "in", other: { id: work.id, label: c.work, kind: "project" } });
    for (const def of c.facts) addFact(folder.id, c.key, def, (def.slot && SLOT_KEY[def.slot]) || "");
  }

  const tone = node({ id: "ent_tone", kind: "folder", label: field.graph.hubs[2].children[0].label, section: sections.tone, parent: sections.tone });
  for (const def of TONE) addFact(tone.id, null, def);

  // Counts and urgency roll up the tree, as the overview's node stats do.
  const rank = ["none", "later", "upcoming", "soon", "today", "overdue"];
  const roll = (x: Node): void => {
    let urgency: GraphNode["urgency"] = "none";
    for (const f of x.facts_.map((id) => facts.get(id)!)) if (rank.indexOf(f.urgency) > rank.indexOf(urgency)) urgency = f.urgency;
    for (const k of x.kids) {
      const kid = nodes.get(k)!;
      roll(kid);
      if (rank.indexOf(kid.urgency) > rank.indexOf(urgency)) urgency = kid.urgency;
    }
    x.facts = x.facts_.length + x.values.length;
    if (x.values.length) x.identity = x.values.length;
    x.urgency = urgency;
  };
  for (const s of Object.values(sections)) for (const k of nodes.get(s)!.kids) roll(nodes.get(k)!);

  return { now, nodes, facts, self: self.id, sections, clientIds, clients: CLIENT_DEFS };
}

