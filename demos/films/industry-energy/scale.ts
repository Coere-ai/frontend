import type { PlatformId } from "@coere/core";
import type { FactView, GraphNode, IdentityValueView } from "@coere/memory";
import { Rng } from "@v2/tools/gen-corpus/rng";

/**
 * The seeded grower behind a team's memory at full size: the chats a team
 * has across its people and AIs over a year and a half, and every memory
 * those chats leave, filed as Coere for Teams files them (Company with its
 * own nested folders, Clients with a folder per client holding its
 * contacts, its work and its facts by slot, Tone and voice). The field's
 * words come from the film's corpus.ts; this file only knows how a chat
 * is placed, titled and dated, and how a client folder fills. Every
 * choice goes through coere-v2's corpus Rng (tools/gen-corpus/rng.ts), so
 * one seed always grows the same memory. Made up, as the field is.
 */

export type Kind = FactView["kind"];

/** One memory as a chat says it: its words, how it is filed, and a due day for a task. */
export type Line = { text: string; kind?: Kind; slot?: string; key?: string; due?: string; basis?: FactView["basis"] };

/** A memory with the chat it came from: the chat's title, its AI and the day it was said. */
export type GrownFact = Line & { chat: string; ai: PlatformId; on: string };

/** A thing in memory: a folder, a client, a person or a piece of work, with its memories and what it holds. */
export type Grown = {
  label: string;
  kind: GraphNode["kind"];
  facts: GrownFact[];
  kids: Grown[];
  client?: string;
  aliases?: string[];
  values?: Array<[IdentityValueView["field"], string]>;
  key?: string;
};

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY = 86_400_000;

/** The keys the client template files each slot under (packages/solution's client_account template). */
export const SLOT_KEY: Record<string, string> = {
  overview: "client.industry",
  relationship: "client.status",
  promises: "promise.what",
  deadlines: "due",
  meetings: "meeting.when",
  requests: "request.what",
  billing: "billing.terms",
  scope: "scope.item",
  preferences: "client_pref.what",
  decisions: "client_decision.what",
  issues: "issue.what",
  contacts: "contact.role",
};

export const SLOT_KIND: Record<string, Kind> = {
  overview: "attribute",
  relationship: "attribute",
  promises: "task",
  deadlines: "task",
  meetings: "event",
  requests: "note",
  billing: "attribute",
  scope: "attribute",
  preferences: "preference",
  decisions: "decision",
  issues: "note",
  documents: "note",
  contacts: "attribute",
};

/** A line in a client slot, with its key and kind. */
export const slotLine = (slot: string, text: string, due?: string): Line => ({ text, slot, key: SLOT_KEY[slot], kind: SLOT_KIND[slot] ?? "note", ...(due ? { due } : {}), ...(slot === "documents" ? { basis: "pasted" as const } : {}) });

export const node = (label: string, kind: GraphNode["kind"] = "folder", more: Partial<Grown> = {}): Grown => ({ label, kind, facts: [], kids: [], ...more });

export class Grower {
  readonly rng: Rng;
  /** Every chat grown, by title: its AI and its day. */
  readonly chats = new Map<string, { ai: PlatformId; on: string }>();
  private readonly taken: Set<string>;

  /** `taken` are the titles of the chats the film writes by hand, which a grown chat never reuses. */
  constructor(
    readonly seed: number,
    readonly now: number,
    taken: Iterable<string>,
    private readonly share: ReadonlyArray<readonly [PlatformId, number]> = [["chatgpt", 46], ["claude", 32], ["gemini", 22]],
    /** Months (0 to 11) the team is mostly away, such as July in a school, which a past chat falls in only rarely. */
    private readonly quiet: readonly number[] = [],
    /** Days nothing is planned for, as MM-DD ranges, such as a school's winter break. */
    private readonly breaks: ReadonlyArray<readonly [string, string]> = [],
  ) {
    this.rng = Rng.derive(seed, "industry-scale");
    this.taken = new Set([...taken].map((t) => t.toLowerCase()));
  }

  /** A stream of its own for one part of the memory, so growing one part never shifts another. */
  part(...labels: Array<string | number>): Rng {
    return Rng.derive(this.seed, "industry-scale", ...labels);
  }

  /** A day `min` to `max` days before the film's day, more often a recent one, as YYYY-MM-DD. */
  past(min = 3, max = 540, rng: Rng = this.rng): string {
    for (let tries = 0; ; tries++) {
      const r = rng.next();
      const at = new Date(this.now - Math.round(min + (max - min) * r * r) * DAY);
      if (tries >= 4 || !this.quiet.includes(at.getUTCMonth())) return at.toISOString().slice(0, 10);
    }
  }

  /** A day `min` to `max` days after the film's day: as YYYY-MM-DD and in words ("December 4"). */
  ahead(min: number, max: number, rng: Rng = this.rng): { iso: string; words: string } {
    // A meeting or a deadline falls on a working day, and never in a break.
    let at = new Date(this.now + rng.int(min, max) * DAY);
    for (let tries = 0; tries < 8 && !this.open(at); tries++) at = new Date(this.now + rng.int(min, max) * DAY);
    return { iso: at.toISOString().slice(0, 10), words: `${MONTHS[at.getUTCMonth()]} ${at.getUTCDate()}` };
  }

  /** Whether a day is a working day outside every break. */
  private open(at: Date): boolean {
    const day = at.toISOString().slice(5, 10);
    return at.getUTCDay() !== 0 && at.getUTCDay() !== 6 && !this.breaks.some(([from, to]) => (from <= to ? day >= from && day <= to : day >= from || day <= to));
  }

  /** A day `min` to `max` days after `on`, in words ("September 12"). */
  after(on: string, min: number, max: number, rng: Rng = this.rng): string {
    const at = new Date(Date.parse(`${on}T12:00:00Z`) + rng.int(min, max) * DAY);
    return `${MONTHS[at.getUTCMonth()]} ${at.getUTCDate()}`;
  }

  /** The month and year of a day, in words ("March 2025"). */
  monthYear(on: string): string {
    const at = new Date(`${on}T12:00:00Z`);
    return `${MONTHS[at.getUTCMonth()]} ${at.getUTCFullYear()}`;
  }

  /** The month of a day, in words. */
  month(on: string): string {
    return MONTHS[new Date(`${on}T12:00:00Z`).getUTCMonth()]!;
  }

  ai(rng: Rng = this.rng): PlatformId {
    return rng.weighted(this.share);
  }

  /**
   * Says `lines` in one new chat, the first title not yet used of
   * `titles`, on `on`, and files each line under its owner. A chat whose
   * every title is taken says nothing, so no two chats share a title.
   */
  say(titles: string | string[], on: string, said: Array<[owner: Grown, line: Line]>, rng: Rng = this.rng): string | null {
    const named = (Array.isArray(titles) ? titles : [titles]).map(tidy).filter(Boolean);
    // A title the team used before comes back as a follow up, as people title a second chat on the same thing.
    const options = [...named, ...AGAIN.flatMap((more) => named.map((t) => `${t}${more}`))];
    const title = options.find((t) => !this.taken.has(t.toLowerCase()));
    if (!title || said.length === 0) return null;
    this.taken.add(title.toLowerCase());
    const ai = this.ai(rng);
    this.chats.set(title, { ai, on });
    for (const [owner, line] of said) owner.facts.push({ ...line, text: tidy(line.text), chat: title, ai, on });
    return title;
  }
}

const AGAIN = [" follow up", " questions", " next steps", " recap", " notes", " update"];

const SMALL = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
/** A small count in words, as people write it: "three", and 14 as 14. */
export const count = (n: number): string => SMALL[n] ?? String(n);

/** One space between words, a capital to start. */
function tidy(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/* ---------- clients ---------- */

export type Contact = { name: string; role: string; email?: string; phone?: string };
export type Seed = {
  key: string;
  name: string;
  /** The short name the chats call it by. */
  short: string;
  aliases: string[];
  domain?: string;
  /** What it is, as one sentence ("Bluestem Grocers runs 41 stores in Kansas."). */
  about: string;
  contacts: Contact[];
  /** Its pieces of work, each drawn as a folder of its own. */
  works: string[];
  /** How big a client it is, 1 to 3: how many chats the team had about it. */
  size: number;
};

/** What a template gets: the client, one contact and another, a piece of work, and the grower for dates. */
export type Ctx = {
  c: Seed;
  k: Contact;
  k2: Contact;
  w: string;
  g: Grower;
  rng: Rng;
  on: string;
  /** One of `list`, never the same one twice for this client until all were used. */
  one<V>(list: readonly V[]): V;
};
/** A template: the chat's possible titles and its words. */
export type T = (x: Ctx) => [titles: string[], text: string];
/** A template for a dated line: `due` is the day in words. */
export type TDue = (x: Ctx, due: string) => [titles: string[], text: string];

/** A field's ways of saying each slot of a client folder. */
export type Book = {
  /** The titles of the chat where the team first wrote about a client (default: its account notes). */
  account?: (c: Seed) => string[];
  status: T[];
  contact: T[];
  promise: TDue[];
  meetingAhead: TDue[];
  meetingPast: TDue[];
  deadline: TDue[];
  request: T[];
  preference: T[];
  billing: T[];
  document: T[];
  decision: T[];
  /** Chats about one piece of work, each with one to three lines filed in its folder. */
  work: Array<(x: Ctx) => [titles: string[], lines: string[]]>;
};

const first = (k: Contact) => k.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.) /, "").split(" ")[0]!;
export { first as firstName };

/** A contact's email at the client's domain, as their signature gives it. */
const emailOf = (k: Contact, c: Seed): string | undefined => {
  if (k.email) return k.email;
  if (!c.domain) return undefined;
  const parts = k.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.) /, "").toLowerCase().split(" ");
  return `${parts[0]}.${parts.at(-1)}@${c.domain}`;
};

/**
 * One client's folder: what it is and how the team stands with it, its
 * contacts (each a person with their details), its pieces of work, and the
 * promises, meetings, deadlines, requests, preferences, billing and
 * documents the team's chats left about it, each in its own chat.
 */
export function growClient(g: Grower, c: Seed, book: Book, o: { account?: boolean } = {}): Grown {
  const rng = g.part("client", c.key);
  const folder = node(c.name, "organization", { client: c.key, aliases: [...c.aliases, ...(c.domain ? [c.domain] : [])] });
  const people = c.contacts.map((k) =>
    node(k.name, "person", {
      key: first(k).toLowerCase(),
      values: [
        ...(emailOf(k, c) ? ([["email", emailOf(k, c)!]] as Array<[IdentityValueView["field"], string]>) : []),
        ...(k.phone ? ([["phone", k.phone]] as Array<[IdentityValueView["field"], string]>) : []),
        ["role", k.role] as [IdentityValueView["field"], string],
      ],
    }),
  );
  const works = c.works.map((w) => node(w, "project"));
  folder.kids.push(...people, ...works);
  const started = g.past(200, 540, rng);
  // Each template and phrase is used once before any comes round again, so one client never hears the same line twice.
  const decks = new Map<unknown, unknown[]>();
  const one = <V>(list: readonly V[]): V => {
    let deck = decks.get(list) as V[] | undefined;
    if (!deck?.length) decks.set(list, (deck = rng.shuffle([...list])));
    return deck.pop()!;
  };
  // The first contact is the main one, whom most promises and meetings are with.
  const ctx = (k = rng.chance(0.65) ? 0 : rng.int(0, c.contacts.length - 1), w = rng.int(0, c.works.length - 1), on = g.past(4, 420, rng)): Ctx => ({
    c,
    k: c.contacts[k]!,
    k2: c.contacts[(k + 1) % c.contacts.length]!,
    w: c.works[w]!,
    g,
    rng,
    on,
    one,
  });
  const pick = <F>(list: readonly F[]): F => one(list);
  const say = (titles: string[], on: string, said: Array<[Grown, Line]>) => g.say(titles, on, said, rng);

  // The account itself: what it is and how the team stands with it (a client the film writes by hand has its own).
  if (o.account !== false) {
    const x = ctx(0, 0, started);
    const [titles, text] = pick(book.status)(x);
    say([...(book.account?.(c) ?? [`${c.short} account notes`, `${c.name} background`]), ...titles], started, [
      [folder, slotLine("overview", c.about)],
      [folder, slotLine("relationship", text)],
    ]);
  }
  // Each contact, in the chat where the team first wrote about them.
  c.contacts.forEach((k, i) => {
    const x = ctx(i);
    const [titles, text] = pick(book.contact)(x);
    say(titles, x.on, [[people[i]!, { text, kind: "attribute", key: "contact.role" }]]);
  });
  // The work: a few chats about each piece, its lines in its own folder.
  c.works.forEach((_, wi) => {
    const chats = Math.max(1, c.size + rng.int(0, 1) - (wi > 0 ? 1 : 0));
    const recipes = rng.shuffle([...book.work]);
    for (let n = 0; n < chats && n < recipes.length; n++) {
      const x = ctx(undefined, wi);
      const [titles, lines] = recipes[n]!(x);
      say(titles, x.on, lines.map((text) => [works[wi]!, { text, kind: "note" }]));
    }
  });
  // The slots the sheet lists, each line in a chat of its own.
  const dated = (list: TDue[], slot: string, min: number, max: number, count: number) => {
    for (let n = 0; n < Math.min(count, list.length); n++) {
      const x = ctx(undefined, undefined, g.past(4, 60, rng));
      const due = g.ahead(min, max, rng);
      const [titles, text] = pick(list)(x, due.words);
      say(titles, x.on, [[folder, slotLine(slot, text, due.iso)]]);
    }
  };
  const plain = (list: T[], slot: string, count: number) => {
    for (let n = 0; n < Math.min(count, list.length); n++) {
      const x = ctx();
      const [titles, text] = pick(list)(x);
      say(titles, x.on, [[folder, slotLine(slot, text)]]);
    }
  };
  dated(book.promise, "promises", 18, 120, rng.int(1, c.size));
  dated(book.deadline, "deadlines", 20, 150, rng.int(1, Math.max(1, c.size - 1)));
  dated(book.meetingAhead, "meetings", 18, 70, 1);
  for (let n = Math.min(rng.int(0, c.size), book.meetingPast.length); n > 0; n--) {
    // A meeting that already took place keeps its day in its words and nothing about it is due.
    const x = ctx(undefined, undefined, g.past(20, 300, rng));
    const [titles, text] = pick(book.meetingPast)(x, g.after(x.on, 2, 9, rng));
    say(titles, x.on, [[folder, { text, slot: "meetings", key: SLOT_KEY.meetings, kind: "note" }]]);
  }
  // A request and how the contact likes to work often come up in one chat.
  for (let n = rng.int(1, c.size); n > 0; n--) {
    const x = ctx(undefined, undefined, g.past(4, 120, rng));
    const [titles, text] = pick(book.request)(x);
    const said: Array<[Grown, Line]> = [[folder, slotLine("requests", text)]];
    if (rng.chance(0.35)) said.push([folder, slotLine("preferences", pick(book.preference)(x)[1])]);
    say(titles, x.on, said);
  }
  plain(book.preference, "preferences", rng.int(0, 1));
  plain(book.decision, "decisions", rng.int(0, c.size - 1));
  plain(book.billing, "billing", rng.int(1, 2));
  plain(book.document, "documents", rng.int(0, 1));
  return folder;
}

/* ---------- the company ---------- */

/**
 * Lines about one thing, spread over a few chats as a team says them: one
 * to three lines a chat, each chat titled from `titles` (a function of the
 * chat's first line, so a title fits what was said).
 */
export function spread(g: Grower, owner: Grown, lines: Array<string | Line>, titles: (line: string, n: number) => string[], o: { rng?: Rng; recent?: boolean; most?: number } = {}): void {
  const rng = o.rng ?? g.part("spread", owner.label);
  const queue = lines.map((l) => (typeof l === "string" ? ({ text: l, kind: "note" } as Line) : l));
  let n = 0;
  while (queue.length) {
    const size = Math.min(queue.length, rng.weighted([[1, 52], [2, 34], [3, 14]] as const), o.most ?? 3);
    const batch = queue.splice(0, size);
    const on = o.recent ? g.past(3, 160, rng) : g.past(6, 540, rng);
    g.say(titles(batch[0]!.text, n++), on, batch.map((l) => [owner, l]), rng);
  }
}

/* ---------- a whole team ---------- */

/** A coworker: name, team, role, what they own, what to ask them about. */
export type Mate = [name: string, team: string, role: string, owns: string, ask: string];
/** A vendor or partner: name, what it does for the company, the notice it needs, how it bills, the contact there. */
export type Vendor = [name: string, does: string, notice: string, bills: string, contact: string];

/** Everything a field says about its team, its clients and how it works, which `growTeam` grows into memory. */
export type Field = {
  seed: number;
  book: Book;
  /** Months the team is mostly away (Grower's `quiet`). */
  quiet?: number[];
  /** Days nothing is planned for, as MM-DD ranges (Grower's `breaks`). */
  breaks?: Array<[string, string]>;
  /** Name pools for contacts, the main contact's roles and the others' roles. */
  firsts: string[];
  lasts: string[];
  leads: string[];
  roles: string[];
  /** How a contact is called: "Ms." and "Mr." in a school, nothing elsewhere. */
  honorific?: (rng: Rng) => string;
  /** The new clients: key, name, short name, what it is, its pieces of work, its size (1 to 3). */
  clients: Array<[key: string, name: string, short: string, about: string, works: string[], size: number]>;
  domainOf?: (key: string) => string | undefined;
  /** Clients the film names already: key, name, short name, more pieces of work. */
  extend: Array<[key: string, name: string, short: string, works: string[]]>;
  /** The person whose memory it is, by first name. */
  self: string;
  team: Mate[];
  /** The folder the team sits in, by team ("Teams and org chart"; a school says "Staff and departments"). */
  teamsLabel?: string;
  emailDomain: string;
  vendors: Vendor[];
  vendorsLabel?: string;
  /** The vendor's chats: what was said about it, in which chats. */
  vendorLines?: (v: Vendor) => Array<[titles: string[], lines: string[]]>;
  procedures: Array<[string, string[]]>;
  policies: Array<[string, string[]]>;
  decisions: Array<[folder: string, title: string, text: string]>;
  tools: Array<[tool: string, holds: string, owner: string]>;
  rituals: string[];
  goals: string[];
  /** More lines for the folders the film writes by hand, by their label. */
  topics: Record<string, string[]>;
  tone: { label: string; lines: string[]; titles: string[] };
};

export interface Team {
  g: Grower;
  /** Folders to file under Company. */
  company: Grown[];
  /** Lines to add to the Company folders the film writes by hand, by label. */
  more: Map<string, Grown>;
  /** New clients, each a whole folder. */
  clients: Grown[];
  /** More for the clients the film already names, by key. */
  grown: Map<string, Grown>;
  /** More on how the person writes, for the Tone and voice folder the film names. */
  tone: Grown;
}

const VENDOR_LINES = ([name, does, notice, bills, contact]: Vendor): Array<[string[], string[]]> => {
  const short = name.split(" ")[0]!;
  return [
    [[`${name} intro`, `Call with ${short}`], [`${name} ${does}.`, `Our contact at ${short} is ${contact}.`]],
    [[`${short} lead times`, `${short} order timing`], [`${short} needs ${notice} of notice for a new order.`]],
    [[`${short} invoice question`, `${short} payment terms`], [`${short} invoices ${bills}.`]],
  ];
};

/**
 * Grows a team's memory from its field. `now` is the film's day; `taken`
 * the titles of the chats the film writes by hand; `reserved` the first
 * names the film's people use, which a grown contact never takes, so a
 * draft that names one of them still names the client the film follows.
 */
export function growTeam(f: Field, now: number, taken: Iterable<string>, reserved: Iterable<string>): Team {
  const g = new Grower(f.seed, now, taken, undefined, f.quiet, f.breaks);
  const used = new Set([...reserved, ...f.team.map((t) => t[0].split(" ")[0]!)]);
  const contactsFor = (key: string, n: number): Contact[] => {
    const rng = g.part("contacts", key);
    const out: Contact[] = [];
    const roles = [rng.pick(f.leads), ...rng.shuffle([...f.roles])];
    for (let tries = 0; out.length < n && tries < 500; tries++) {
      const firstName = rng.pick(f.firsts);
      const last = rng.pick(f.lasts);
      // A school calls its staff by title and last name, so there the last name is the one that must not repeat.
      const said = f.honorific ? last : firstName;
      if (used.has(said) || used.has(last)) continue;
      used.add(said);
      const name = f.honorific ? `${f.honorific(rng)} ${last}` : `${firstName} ${last}`;
      out.push({ name, role: roles[out.length % roles.length]!, ...(rng.chance(0.5) ? { phone: `+1 (${rng.int(212, 989)}) 555-0${rng.int(100, 199)}` } : {}) });
    }
    return out;
  };
  const domainOf = f.domainOf ?? ((key: string) => `${key.replace(/-/g, "")}.com`);

  const clients = f.clients.map(([key, name, short, about, works, size]) => {
    const rng = g.part("seed", key);
    const domain = domainOf(key);
    return growClient(g, { key, name, short, aliases: [short], ...(domain ? { domain } : {}), about, contacts: contactsFor(key, rng.int(2, 3)), works, size }, f.book);
  });
  // The clients the film names already get the rest of their history: more people, more work, more lines in each slot.
  const grown = new Map<string, Grown>();
  for (const [key, name, short, works] of f.extend) {
    const domain = domainOf(key);
    grown.set(key, growClient(g, { key, name, short, aliases: [short], ...(domain ? { domain } : {}), about: "", contacts: contactsFor(key, 2), works, size: 2 }, f.book, { account: false }));
  }

  // Company: the team by team, the vendors, how things are done, the rules, the decisions, the tools and the goals.
  const company: Grown[] = [];
  const teams = node(f.teamsLabel ?? "Teams and org chart");
  for (const team of [...new Set(f.team.map((t) => t[1]))]) {
    const folder = node(team);
    teams.kids.push(folder);
    for (const [name, , role, owns, ask] of f.team.filter((t) => t[1] === team)) {
      const person = node(name, "person", { key: name.split(" ")[0]!.toLowerCase(), values: [["role", role], ["email", `${name.toLowerCase().replace(/[^a-z ]/g, "").replace(" ", ".")}@${f.emailDomain}`]] });
      folder.kids.push(person);
      const who = name.split(" ")[0]!;
      const rng = g.part("person", name);
      const area = owns.replace(/^the /, "");
      spread(g, person, [`${name} is our ${role.toLowerCase()} and owns ${owns}.`, `${who} is the person to ask about ${ask}.`, ...(rng.chance(0.5) ? [`${who} covers for ${f.self} on ${area} when ${f.self} is away.`] : [])], () => [`${who}'s role`, `Handover with ${who}`, `Who owns ${area}`], { rng });
    }
  }
  company.push(teams);

  const vendors = node(f.vendorsLabel ?? "Partners and vendors");
  for (const v of f.vendors) {
    const org = node(v[0], "organization", { aliases: [v[0].split(" ")[0]!] });
    vendors.kids.push(org);
    const rng = g.part("vendor", v[0]);
    (f.vendorLines ?? VENDOR_LINES)(v).forEach(([titles, lines], i) => g.say(titles, i === 0 ? g.past(200, 540, rng) : g.past(10, 400, rng), lines.map((text) => [org, { text }]), rng));
  }
  company.push(vendors);

  const runbooks = node("Runbooks and checklists");
  for (const [label, steps] of f.procedures) {
    const p = node(label);
    runbooks.kids.push(p);
    spread(g, p, steps, () => [`${label} checklist`, `${label} steps`, `How we do ${label.toLowerCase()}`]);
  }
  company.push(runbooks);

  const policies = node("Policies");
  for (const [label, rules] of f.policies) {
    const p = node(label);
    policies.kids.push(p);
    spread(g, p, rules, () => [`${label} policy`, `${label} question`, `Rules on ${label.toLowerCase()}`]);
  }
  company.push(policies);

  const decisions = node("Decisions");
  for (const label of [...new Set(f.decisions.map((d) => d[0]))]) {
    const d = node(label);
    decisions.kids.push(d);
    for (const [, title, text] of f.decisions.filter((x) => x[0] === label)) g.say([title, `${label} log`], g.past(20, 500, g.part("decision", title)), [[d, { text, kind: "decision" }]]);
  }
  company.push(decisions);

  const tools = node("Tools and systems");
  for (const [tool, holds, owner] of f.tools) {
    const t = node(tool.charAt(0).toUpperCase() + tool.slice(1));
    tools.kids.push(t);
    spread(g, t, [`We keep ${holds} in the ${tool}.`, `${owner} runs the ${tool}.`], () => [`${t.label} setup`, `Where is the ${tool}`, `${t.label} access`]);
  }
  company.push(tools);

  const rituals = node("Meetings and rituals");
  spread(g, rituals, f.rituals, () => ["Team rhythm", "Meeting schedule", "Weekly meetings", "Month end routine", "Quarterly reviews", "Team calendar", "Standing meetings"]);
  company.push(rituals);
  const goals = node("Goals and strategy");
  spread(g, goals, f.goals, () => ["2027 goals", "Strategy offsite notes", "Yearly plan", "Growth plan", "Planning for next year", "Goals review"]);
  company.push(goals);

  const more = new Map<string, Grown>();
  for (const [label, lines] of Object.entries(f.topics)) {
    const t = node(label, "topic");
    spread(g, t, lines, () => [`${label} notes`, `${label} questions`, `${label} review`, `More on ${label.toLowerCase()}`]);
    more.set(label, t);
  }

  const tone = node(f.tone.label);
  spread(g, tone, f.tone.lines.map((text) => ({ text, kind: "style" as Kind })), () => f.tone.titles);

  return { g, company, more, clients, grown, tone };
}
