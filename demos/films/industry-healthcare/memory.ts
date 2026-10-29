import type { PlatformId } from "@coere/core";
import type { FactSource, FactView, GraphNode, IdentityValueView, MemoryNodeDetail } from "@coere/memory";
import type { ClientStatus } from "@coere/solution";
import { describeUrgency } from "@v2/packages/memory/src/time/labels";
import { field } from "../../../demos/industries/fields/healthcare.mjs";

/**
 * Lakeshore Clinical Research's memory as Coere for Teams files it from
 * the team's chats, in the shapes the engine's memory views take (as the
 * teams film builds Fernhill's, demos/films/teams/memory.ts): Company with
 * the trial team's own procedures, Clients with a folder per partner site,
 * each holding its contacts, its study and its facts by slot, and Tone and
 * voice. Dunmore Cardiology is filled from the field's data
 * (demos/industries/fields/healthcare.mjs); the rest is made up in the
 * same spirit. Operations and research only: no participant's details,
 * no amounts and no logins are ever in memory.
 */

export const ZONE = "America/Chicago";
/** The film's day: Wednesday, October 28, 2026, at 8:46 in the morning in Chicago, a week before the Dunmore visit. */
export const FILM_NOW = Date.parse("2026-10-28T13:46:00Z");

type UrgencyKind = Parameters<typeof describeUrgency>[0]["kind"];
type Platform = Extract<PlatformId, "chatgpt" | "claude" | "gemini">;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT = MONTHS.map((m) => m.slice(0, 3));

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

export type ClientMeta = { key: string; name: string; aliases: string[]; domains: string[]; status: ClientStatus };

export interface Mem {
  now: number;
  chats: Array<{ id: string; platform: Platform; title: string; at: string }>;
  nodes: Map<string, Node>;
  facts: Map<string, Fact>;
  self: string;
  sections: { company: string; clients: string; tone: string };
  clientIds: Map<string, string>;
  clients: ClientMeta[];
}

/** Where a memory was said: the AI, the chat's title, and the day ("Oct 19, 2026", "Oct 19", or ISO). */
type Said = [Platform, string, string];
type Slot = "promises" | "meetings" | "requests" | "deadlines" | "billing" | "documents" | "overview" | "relationship" | "issues" | "access";
type Line = { text: string; said: Said; slot?: Slot; kind?: FactView["kind"] };

const line = (text: string, said: Said, slot?: Slot, kind?: FactView["kind"]): Line => ({ text, said, slot, kind });

const SLOT_KIND: Partial<Record<Slot, FactView["kind"]>> = { promises: "task", deadlines: "task", meetings: "event", overview: "attribute", relationship: "attribute", access: "attribute" };
const SLOT_KEY: Record<Slot, string> = {
  promises: "promise.what",
  deadlines: "due",
  meetings: "meeting.when",
  requests: "request.what",
  billing: "billing.terms",
  documents: "",
  overview: "client.industry",
  relationship: "",
  issues: "issue.what",
  access: "access.system",
};

const DUN = field.client;
const join3 = (a: readonly string[]) => `${a[0]} ${a[1]}${/^[A-Za-z]/.test(a[2] ?? "") ? " " : ""}${a[2]}`.trim();
const withDate = (a: readonly string[]) => `${a[0]} ${a[1]}.`;

/** The company's own folders, as the field names them. */
const COMPANY: Array<{ label: string; lines: Line[] }> = [
  { label: "Monitoring procedures", lines: [
    line("Monitoring visits run over two days, with source document review on day one.", ["claude", "Monitoring visit notes", "Sep 30, 2026"]),
    line("Every monitoring visit ends with one findings email within five working days.", ["claude", "Monitoring visit notes", "Sep 30, 2026"]),
    line("We check consent forms, the delegation log and training records at every visit.", ["chatgpt", "Site visit checklist", "Aug 14, 2026"]),
    line("Data queries older than 30 days go on the visit agenda.", ["gemini", "Data query backlog", "Oct 2, 2026"]),
    line("A remote check comes halfway between two site visits.", ["chatgpt", "Remote monitoring", "Jul 21, 2026"]),
  ] },
  { label: "Protocol amendment 3", lines: [
    line("Protocol amendment 3 widens the visit window from 7 to 10 days.", ["claude", "Protocol amendment 3", "Sep 25, 2026"]),
    line("Every site retrains its staff on protocol amendment 3 before its next visit.", ["claude", "Protocol amendment 3", "Sep 25, 2026"]),
    line("The IRB approved protocol amendment 3 on September 22.", ["chatgpt", "IRB renewal checklist", "Sep 23, 2026"], undefined, "note"),
    line("Sites move to the new consent form version with amendment 3.", ["chatgpt", "Consent form wording", "Sep 26, 2026"]),
  ] },
  { label: "IRB contacts", lines: [
    line("Nadia Brooks is our contact at the central IRB.", ["chatgpt", "IRB renewal checklist", "Jun 10, 2026"]),
    line("IRB renewals need the enrollment report and the deviation log.", ["chatgpt", "IRB renewal checklist", "Jun 10, 2026"]),
    line("The central IRB meets on the second Tuesday of each month.", ["gemini", "IRB meeting dates", "May 4, 2026"]),
  ] },
  { label: "Lab kits", lines: [
    line("Lab kits ship from the central lab on Mondays and take two days.", ["gemini", "Lab kit shipping", "Aug 3, 2026"]),
    line("Each site keeps at least four spare lab kits.", ["gemini", "Lab kit shipping", "Aug 3, 2026"]),
    line("Expired lab kits go back to the central lab.", ["claude", "Lab kit returns", "Sep 2, 2026"]),
  ] },
  { label: "Training", lines: [
    line("Every coordinator renews GCP training every two years.", ["chatgpt", "GCP refresher", "Apr 15, 2026"]),
    line("New site staff finish protocol training before they run a study visit.", ["claude", "Site training plan", "Jul 8, 2026"]),
    line("Training sign off goes in the site's training log, one line per person.", ["claude", "Site training plan", "Jul 8, 2026"]),
  ] },
  { label: "Budget rules", lines: [
    line("Sites are paid per completed visit, not per enrolled participant.", ["chatgpt", "Budget per patient visit", "Mar 12, 2026"]),
    line("Screen failures are paid at half the visit rate.", ["chatgpt", "Budget per patient visit", "Mar 12, 2026"]),
    line("Site invoices go out at the end of each month.", ["chatgpt", "Budget per patient visit", "Mar 12, 2026"]),
  ] },
];

type Contact = { name: string; role: string; email?: string; phone?: string; said: Said };
type ClientSpec = ClientMeta & {
  contacts: Contact[];
  work: { label: string; lines: Line[] };
  topics: Array<{ label: string; lines: Line[] }>;
  lines: Line[];
};

const promise = (p: readonly string[], ai: Platform, title: string): Line => line(withDate(p), [ai, title, p[2]!], "promises");

/** The partner sites, Dunmore Cardiology first, with the field's sheet. */
const CLIENTS: ClientSpec[] = [
  {
    key: "dunmore-cardiology",
    name: DUN.name,
    aliases: ["Dunmore"],
    domains: ["dunmorecardiology.com"],
    status: "active",
    contacts: [
      { name: DUN.contacts[0]!, role: "Principal investigator", email: "lena.park@dunmorecardiology.com", said: ["claude", "Dunmore enrollment", "May 12, 2026"] },
      { name: DUN.contacts[1]!, role: "Study coordinator", email: "joel.kim@dunmorecardiology.com", phone: "+1 312 555 0148", said: ["chatgpt", "Calls with Joel", "Aug 12, 2026"] },
    ],
    work: { label: DUN.engagement, lines: [
      line("Dunmore has enrolled 18 of its 24 participants in HEART-2.", ["claude", "Dunmore enrollment", "Oct 16, 2026"]),
      line("Dunmore still has to retrain staff on protocol amendment 3.", ["claude", "Dunmore training logs", "Oct 19, 2026"]),
      line("HEART-2 sees each participant at Dunmore every three months.", ["claude", "HEART-2 site agreement", "Aug 3, 2026"]),
    ] },
    topics: [
      { label: "Open queries", lines: [
        line("Dunmore has 11 open data queries, 4 older than 30 days.", ["gemini", "Dunmore query backlog", "Oct 18, 2026"]),
        line("Two consent forms at Dunmore use the old version.", ["chatgpt", "Consent form versions", "Oct 17, 2026"]),
      ] },
    ],
    lines: [
      line("Dunmore Cardiology is a cardiology practice in Chicago and a HEART-2 site.", ["chatgpt", "Dunmore site visit prep", "Oct 21, 2026"], "overview"),
      line("Dunmore joined HEART-2 as a site in February.", ["claude", "Dunmore site start", "Feb 2, 2026"], "relationship"),
      line("Dunmore logged two protocol deviations in September, both missed visit windows.", ["gemini", "Dunmore deviations", "Oct 1, 2026"], "issues"),
      line("Joel gave us read access to Dunmore's study binder.", ["chatgpt", "Dunmore binder access", "Jun 3, 2026"], "access"),
      promise(DUN.promises[0]!, "claude", "Dunmore training logs"),
      promise(DUN.promises[1]!, "chatgpt", "Visit agenda for Joel"),
      promise(DUN.promises[2]!, "claude", "Lab kits for Dunmore"),
      line(`${join3(DUN.meeting)}`, ["chatgpt", "Monitoring visit dates", `${DUN.meeting[3]}, 2026`], "meetings"),
      line(DUN.requests[0]![0]!, ["claude", "Dunmore findings email", `${DUN.requests[0]![1]}, 2026`], "requests"),
      line(join3(DUN.requests[1]!), ["chatgpt", "Dunmore site report format", DUN.requests[1]![3]!], "requests"),
      line(DUN.requests[2]![0]!, ["chatgpt", "Calls with Joel", `${DUN.requests[2]![1]}, 2026`], "requests"),
      line(withDate(DUN.deadlines[0]!), ["chatgpt", "Visit agenda for Joel", `${DUN.deadlines[0]![2]}, 2026`], "deadlines"),
      line(withDate(DUN.deadlines[1]!), ["gemini", "Enrollment by site", `${DUN.deadlines[1]![2]}, 2026`], "deadlines"),
      line(DUN.deadlines[2]![0]!, ["claude", "Dunmore IRB renewal", DUN.deadlines[2]![1]!], "deadlines"),
      line(DUN.billing[0]!, ["claude", "Site payments", DUN.billing[1]!], "billing"),
      line(join3(DUN.document), ["claude", "HEART-2 site agreement", `${DUN.document[3]}, 2026`], "documents"),
    ],
  },
  {
    key: "riverbend-hospital",
    name: "Riverbend Hospital",
    aliases: ["Riverbend"],
    domains: ["riverbendhospital.org"],
    status: "active",
    contacts: [{ name: "Priya Shah", role: "Research nurse manager", email: "pshah@riverbendhospital.org", said: ["gemini", "Riverbend enrollment", "Jun 18, 2026"] }],
    work: { label: "Riverbend enrollment", lines: [
      line("Riverbend has enrolled 22 of its 30 participants in HEART-2.", ["gemini", "Riverbend enrollment", "Oct 14, 2026"]),
    ] },
    topics: [],
    lines: [
      line("We promised Priya the amendment 3 training slides by November 6.", ["chatgpt", "Riverbend training", "Oct 22, 2026"], "promises"),
      line("Monitoring visit at Riverbend on November 18.", ["gemini", "Riverbend visit dates", "Oct 9, 2026"], "meetings"),
      line("Riverbend wants query reports as a spreadsheet.", ["chatgpt", "Riverbend query report", "Sep 3, 2026"], "requests"),
    ],
  },
  {
    key: "northgate-clinic",
    name: "Northgate Clinic",
    aliases: ["Northgate"],
    domains: ["northgateclinic.com"],
    status: "active",
    contacts: [{ name: "Dr. Ruth Mensah", role: "Principal investigator", said: ["claude", "Northgate IRB renewal", "Sep 15, 2026"] }],
    work: { label: "IRB renewal", lines: [
      line("Northgate's IRB renewal goes in by November 20.", ["claude", "Northgate IRB renewal", "Oct 6, 2026"], undefined, "task"),
    ] },
    topics: [],
    lines: [
      line("I told Dr. Mensah I would send the renewal template by October 30.", ["claude", "Northgate IRB renewal", "Oct 23, 2026"], "promises"),
      line("Northgate has paused new enrollment until the renewal is approved.", ["gemini", "Northgate status", "Oct 6, 2026"], "relationship"),
    ],
  },
  {
    key: "alder-health",
    name: "Alder Health",
    aliases: ["Alder"],
    domains: ["alderhealth.org"],
    status: "prospect",
    contacts: [{ name: "Mei Tanaka", role: "Research operations lead", said: ["chatgpt", "Alder Health contract", "Sep 29, 2026"] }],
    work: { label: "Site budget", lines: [
      line("The Alder Health site budget is with their legal team since October 9.", ["chatgpt", "Alder Health contract", "Oct 9, 2026"]),
    ] },
    topics: [],
    lines: [
      line("Alder Health wants to join HEART-2 as a site in January.", ["chatgpt", "Alder Health contract", "Sep 29, 2026"], "overview"),
      line("We promised Mei the site budget draft by November 10.", ["gemini", "Alder Health budget", "Oct 20, 2026"], "promises"),
    ],
  },
];

const TONE = { label: field.graph.hubs[2]!.children[0]!.label, lines: [
  line("Write checklists, not paragraphs.", ["chatgpt", "Site visit checklist", "Aug 14, 2026"], undefined, "style"),
  line("Keep a checklist to three items when it can be.", ["claude", "Monitoring visit notes", "Sep 30, 2026"], undefined, "style"),
  line("Lead each item with a verb.", ["claude", "Site training plan", "Jul 8, 2026"], undefined, "style"),
] };

/** "Oct 19, 2026", "Oct 19" (this year) or "Feb 9, 2026" as an ISO time in the morning. */
function dayOf(text: string): string {
  const m = /^([A-Z][a-z]{2}) (\d{1,2})(?:, (\d{4}))?$/.exec(text.trim());
  if (!m) throw new Error(`a day: ${text}`);
  const month = SHORT.indexOf(m[1]!);
  return new Date(Date.UTC(Number(m[3] ?? 2026), month, Number(m[2]), 15, 20)).toISOString();
}

/** "November 4" in a text, read forward from the day it was said, as memory reads a deadline. */
function dueOf(text: string, saidMs: number): { at: string; tz: string | null } | null {
  const m = new RegExp(`\\b(${MONTHS.join("|")}) (\\d{1,2})\\b`).exec(text);
  if (!m) return null;
  const month = MONTHS.indexOf(m[1]!);
  const said = new Date(saidMs);
  for (let year = said.getUTCFullYear(); year <= said.getUTCFullYear() + 1; year++) {
    const at = Date.UTC(year, month, Number(m[2]));
    if (at >= saidMs - 2 * 86_400_000) return { at: new Date(at).toISOString().slice(0, 10), tz: null };
  }
  return null;
}

/** The dates, emails and phones in a text, as the ranges the sheet sets in mono. */
function specificsOf(text: string): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const re = new RegExp(`\\b(?:${MONTHS.join("|")}) \\d{1,2}\\b|[\\w.]+@[\\w.-]+\\.[a-z]+|\\+\\d[\\d ()-]{7,}\\d`, "g");
  for (let m = re.exec(text); m; m = re.exec(text)) out.push([m.index, m.index + m[0].length]);
  return out;
}

export function buildMemory(now = FILM_NOW): Mem {
  let n = 0;
  const id = (prefix: string) => `${prefix}_${(++n).toString(36).padStart(4, "0")}${"lakeshore".slice(0, 4)}`;
  const nodes = new Map<string, Node>();
  const facts = new Map<string, Fact>();
  const chats = new Map<string, Mem["chats"][number]>();

  const node = (o: Partial<Node> & Pick<Node, "id" | "kind" | "label" | "section">): Node => {
    const made: Node = { parent: null, importance: 3, pinned: false, urgency: "none", facts: 0, history: false, aliases: [], summary: null, kids: [], facts_: [], values: [], relations: [], ...o };
    nodes.set(made.id, made);
    if (made.parent) nodes.get(made.parent)?.kids.push(made.id);
    return made;
  };

  const chatOf = ([platform, title, day]: Said) => {
    const key = `${platform}:${title}`;
    let chat = chats.get(key);
    if (!chat) {
      chat = { id: `${platform}:hc${chats.size + 1}`, platform, title, at: dayOf(day) };
      chats.set(key, chat);
    } else if (dayOf(day) > chat.at) chat.at = dayOf(day);
    return chat;
  };

  const sourceOf = (said: Said, fid: string, msg = 0): FactSource => {
    const chat = chatOf(said);
    return { evidenceId: `${fid}#e0`, platform: said[0], convId: chat.id, title: said[1], msg, role: "user", at: dayOf(said[2]), url: null, stale: false };
  };

  const fact = (owner: Node, l: Line, client: string | null) => {
    const fid = id("fact");
    const source = sourceOf(l.said, fid, owner.facts_.length);
    const at = Date.parse(source.at);
    const kind: FactView["kind"] = l.kind ?? (l.slot && SLOT_KIND[l.slot]) ?? (owner.section === "sec_tone" ? "style" : "note");
    const dated = kind === "task" || kind === "event";
    const due = dated ? dueOf(l.text, at) : null;
    const urgency = describeUrgency(
      { status: "active", kind: kind as UrgencyKind, progress: kind === "task" ? "needs-action" : undefined, urgency: due ? { due: { at: due.at } } : undefined, evidence: [{ at: source.at }] },
      now,
      ZONE,
    );
    const f: Fact = {
      id: fid,
      kind,
      key: (l.slot && SLOT_KEY[l.slot]) || "",
      text: l.text,
      specifics: specificsOf(l.text),
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
      slot: l.slot ?? null,
      owner: owner.id,
      client,
    } as Fact;
    facts.set(fid, f);
    owner.facts_.push(fid);
  };

  const self = node({ id: id("ent"), kind: "self", label: "You", section: "", importance: 5 });
  const sections = { company: "sec_company", clients: "sec_clients", tone: "sec_tone" };
  node({ id: sections.company, kind: "section", label: "Company", section: sections.company });
  node({ id: sections.clients, kind: "section", label: "Clients", section: sections.clients });
  node({ id: sections.tone, kind: "section", label: "Tone and voice", section: sections.tone });

  for (const folder of COMPANY) {
    const f = node({ id: id("ent"), kind: "folder", label: folder.label, section: sections.company, parent: sections.company });
    for (const l of folder.lines) fact(f, l, null);
  }

  const clientIds = new Map<string, string>();
  for (const c of CLIENTS) {
    const org = node({ id: id("ent"), kind: "organization", label: c.name, section: sections.clients, parent: sections.clients, importance: c.key === CLIENTS[0]!.key ? 5 : 4, aliases: [...c.aliases, ...c.domains], client: c.key });
    clientIds.set(c.key, org.id);
    for (const k of c.contacts) {
      const person = node({ id: id("ent"), kind: "person", label: k.name, section: sections.clients, parent: org.id });
      const said = dayOf(k.said[2]).slice(0, 10);
      const value = (field: IdentityValueView["field"], v: string, href: string | null): IdentityValueView => ({ id: id("fact"), field, value: v, href, sources: [sourceOf(k.said, `${person.id}-${field}`)], said });
      person.values = [
        value("role", k.role, null),
        ...(k.email ? [value("email", k.email, `mailto:${k.email}`)] : []),
        ...(k.phone ? [value("phone", k.phone, `tel:${k.phone.replace(/[^\d+]/g, "")}`)] : []),
        { id: id("fact"), field: "org", value: c.name, href: null, sources: [], said: null },
      ];
      person.relations = [{ type: "works_at", label: "Works at", direction: "out", other: { id: org.id, label: c.name, kind: "organization" } }];
      org.relations.push({ type: "works_at", label: `${k.name} works here`, direction: "in", other: { id: person.id, label: k.name, kind: "person" } });
    }
    const work = node({ id: id("ent"), kind: "project", label: c.work.label, section: sections.clients, parent: org.id });
    org.relations.unshift({ type: "for", label: `${c.work.label} is for this`, direction: "in", other: { id: work.id, label: c.work.label, kind: "project" } });
    for (const l of c.work.lines) fact(work, l, c.key);
    for (const t of c.topics) {
      const topic = node({ id: id("ent"), kind: "topic", label: t.label, section: sections.clients, parent: org.id });
      for (const l of t.lines) fact(topic, l, c.key);
    }
    for (const l of c.lines) fact(org, l, c.key);
  }

  const tone = node({ id: id("ent"), kind: "folder", label: TONE.label, section: sections.tone, parent: sections.tone });
  for (const l of TONE.lines) fact(tone, l, null);

  // Counts and urgency roll up the tree, as the overview's node stats do.
  const rank = ["none", "later", "upcoming", "soon", "today", "overdue"];
  const roll = (x: Node): void => {
    let urgency: GraphNode["urgency"] = "none";
    for (const f of x.facts_.map((i) => facts.get(i)!)) if (rank.indexOf(f.urgency) > rank.indexOf(urgency)) urgency = f.urgency;
    for (const k of x.kids) roll(nodes.get(k)!);
    x.facts = x.facts_.length + x.values.length;
    if (x.values.length) x.identity = x.values.length;
    x.urgency = urgency;
  };
  for (const s of Object.values(sections)) for (const k of nodes.get(s)!.kids) roll(nodes.get(k)!);

  return { now, chats: [...chats.values()], nodes, facts, self: self.id, sections, clientIds, clients: CLIENTS.map(({ key, name, aliases, domains, status }) => ({ key, name, aliases, domains, status })) };
}

/** The org record the first run writes (packages/solution record), as the dashboard and the strip read it. */
export function orgRecord(mem: Mem) {
  return {
    v: 1,
    company: { name: field.firm, aliases: ["Lakeshore"], domains: ["lakeshoreresearch.org"], industry: "healthcare_admin" },
    self: { name: field.person.name, role: "Clinical research coordinator", team: "Study operations" },
    clients: mem.clients.map((c) => ({ key: c.key, name: c.name, aliases: c.aliases, domains: c.domains, status: c.status })),
    workers: [],
    switches: { findClients: true, learnCoworkers: true },
    notClients: [],
    setupAt: mem.now - 60 * 86_400_000,
  };
}
