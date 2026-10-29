import type { Conversation, PlatformId } from "@coere/core";
import type { FactSource, FactView, GraphNode, IdentityValueView, MemoryNodeDetail, TreeItem } from "@coere/memory";
import type { ClientView, WorkerView } from "@coere/solution";
import { describeUrgency } from "@v2/packages/memory/src/time/labels";
import { CLIENTS, NEW_CLIENTS, VENDOR_NAMES, WORKERS, type PlantedItem, type SolutionCorpus } from "@v2/tools/gen-corpus/solution/index";
import { MORE_CLIENTS, teamCorpus } from "./corpus";

/**
 * Fernhill Creative's memory as Coere for Teams builds it from Maya's
 * chats: the agency corpus coere-v2's films and e2e specs use
 * (tools/gen-corpus/solution) with the agency's smaller clients
 * (corpus.ts), a library of LIBRARY chats across her AIs, and every item
 * those chats plant, filed as the engine files them: Company with its
 * catalog folders nested as the catalog nests them, coworkers in People
 * and each vendor and competitor in its own folder, Clients with a folder
 * per client holding its contacts, its engagement and facts by slot, and
 * her own Preferences, Writing style and Tone and voice, which the work
 * rows of the checklist keep. Amounts and credentials never reach memory,
 * so items that carry them are left out, as are the items memory does not
 * keep (her personal life, which the checklist leaves unticked, and one
 * off questions).
 */

/** How many chats Maya's AIs hold, which Extract all saves and the build reads. */
export const LIBRARY = 436;

export const ZONE = "America/Los_Angeles";
type UrgencyKind = Parameters<typeof describeUrgency>[0]["kind"];
const DAY = 86_400_000;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export type Node = GraphNode & {
  aliases: string[];
  summary: string | null;
  /** Child entity ids, in order. */
  kids: string[];
  /** Fact ids filed straight under it. */
  facts_: string[];
  /** A person's identity values, which the sheet shows and the graph leaves out. */
  values: IdentityValueView[];
  relations: MemoryNodeDetail["relations"];
  /** The client's key, on a client folder. */
  client?: string;
  /** The corpus key of the worker or contact. */
  key?: string;
};

export type Fact = FactView & { owner: string; client: string | null };

export type Chat = { id: string; platform: PlatformId; title: string; at: string; project: string | null; conv: Conversation };

export interface Mem {
  now: number;
  corpus: SolutionCorpus;
  chats: Chat[];
  nodes: Map<string, Node>;
  facts: Map<string, Fact>;
  self: string;
  sections: { company: string; clients: string; preferences: string; style: string; tone: string };
  /** Client key to its folder id. */
  clientIds: Map<string, string>;
  /** The client the chats found that waits in Review. */
  proposed: { key: string; name: string; id: string; chats: number };
  /**
   * While a build runs, how many of the memories it has written so far, in
   * the order it writes them; null once memory is built.
   */
  written: number | null;
}

/** Ids as the engine makes them: a prefix and a UUIDv7 from the record's time, with seeded bits after. */
function idMaker() {
  let n = 0;
  const hex = (v: number, w: number) => Math.floor(v).toString(16).padStart(w, "0").slice(-w);
  return (prefix: string, at: number): string => {
    n += 1;
    const ms = Math.max(0, Math.floor(at));
    const t = hex(ms, 12);
    const r = (n * 2654435761) % 4294967296;
    return `${prefix}_${t.slice(0, 8)}-${t.slice(8, 12)}-7${hex(n, 3)}-${(8 + (n % 4)).toString(16)}${hex(r, 3)}-${hex(r * 7, 6)}${hex(n * 977, 6)}`;
  };
}

/**
 * The library: the chats every story in the film stands on (the tricky,
 * confidential and identity families, the new clients, everything about
 * Kestrel Outdoor and the small client that is deleted), then the newest
 * of the rest up to LIBRARY, as tests/e2e/solution/helpers/agency-library.ts
 * cuts its slices.
 */
function libraryChats(c: SolutionCorpus): Conversation[] {
  const kept = (i: PlantedItem) =>
    i.family === "tricky" || i.family === "confidential" || i.family === "identity" || Boolean(i.newClient) || i.client === "kestrel" || i.client === "lantern";
  const must = new Set(c.items.filter(kept).map((i) => i.convId));
  const id = (x: Conversation) => `${x.platform}:${x.platformConvId}`;
  const rest = c.conversations.filter((x) => !must.has(id(x))).reverse();
  const keep = new Set([...must, ...rest.slice(0, Math.max(0, LIBRARY - must.size)).map(id)]);
  return c.conversations.filter((x) => keep.has(id(x)));
}

/** Chat titles for the corpus's stock titles, as agency-library.ts gives them. */
const TITLES: ReadonlyArray<[string, string]> = [
  ["Halvorsen asked whether we could do the full livery job", "Halvorsen livery quote"],
  ["Osprey IT gave us an API key", "Osprey booking widget key"],
  ["The Granite Peak staging database", "Granite Peak staging access"],
  ["Our day rate for Copperline", "Copperline rates"],
  ["Pasted SOW for Granite Peak", "Granite Peak SOW phases"],
  ["Bramble and Finch approved", "Bramble and Finch website budget"],
  ["Tidewater set the app launch budget", "Tidewater launch budget"],
  ["Setup notes for the Tidewater CMS", "Tidewater CMS setup"],
  ["Juniper Lane has a print budget", "Juniper Lane print budget"],
  ["Basic auth for the Kestrel preview", "Kestrel preview login"],
  ["Quillfeather pays", "Quillfeather catalog pricing"],
  ["The Kestrel statement of work is", "Kestrel phase one billing"],
  ["Ruth set a 10% discount cap", "Proposal discount cap"],
  ["The Marlow renewal is worth", "Marlow renewal"],
  ["The one time code Paul from Osprey", "Osprey sign in code"],
  ["Saffron Street agreed to a 15% agency fee", "Saffron Street agency fee"],
  ["The guest wifi password", "Studio guest wifi"],
  ["Our blended hourly rate", "Studio hourly rate"],
  ["Lena has been off", "Copy review delays"],
  ["Images on client sites go through", "Image pipeline"],
  ["Jonah mentioned", "Checking in on Jonah"],
  ["Any purchase over the small spend limit", "Spend approvals"],
  ["Saffron Street Foods agreed to send us their brand files", "Saffron Street brand files"],
  ["Background on Saffron Street", "Saffron Street background"],
  ["Nora Baptiste from Larkspur is our day to day", "Larkspur day to day contact"],
  ["We have a business review with Marlow", "Marlow business review"],
  ["Bramble and Finch Law gave us editor access", "Bramble and Finch CMS access"],
  ["Oliver at Bramble and Finch turned down", "Bramble and Finch palette"],
  ["The Bramble and Finch statement of work covers", "Bramble and Finch scope"],
  ["Pasting the creative brief Kestrel sent", "Kestrel creative brief"],
  ["Maya owns the Halvorsen Freight account", "Halvorsen account owners"],
  ["Media plans are the client buying team", "Who buys media"],
  ["Tickets for the web team live in Linear", "Where web tickets live"],
  ["Theo covers the day to day on", "Theo's client sites"],
];

const titled = (c: Conversation): Conversation => {
  const first = c.messages.find((m) => m.role === "user")?.text ?? "";
  const hit = TITLES.find(([start]) => first.startsWith(start));
  return hit ? { ...c, title: hit[1] } : c;
};

/** The catalog names of the folders the agency's items file under (packages/solution taxonomy). */
const FOLDERS: Record<string, string> = {
  "company.about": "About the company",
  "company.competitors": "Competitors",
  "company.hiring": "Hiring",
  "company.legal": "Legal and compliance",
  "company.onboarding": "Onboarding",
  "company.policies.remote_work": "Remote work",
  "company.communication": "How we communicate",
  "company.customers": "Customers in general",
  "company.decisions": "Decisions",
  "company.decisions.technical": "Technical decisions",
  "company.finance": "Finance processes",
  "company.goals": "Goals and strategy",
  "company.knowledge": "Glossary and lessons",
  "company.marketing": "Marketing and brand",
  "company.meetings": "Meetings and rituals",
  "company.offerings": "Products and services",
  "company.operations": "Operations and admin",
  "company.partners": "Partners and vendors",
  "company.people": "People",
  "company.policies": "Policies",
  "company.practice": "How our industry works",
  "company.processes": "How we work",
  "company.projects": "Internal projects",
  "company.roles": "Roles and responsibilities",
  "company.runbooks": "Runbooks and checklists",
  "company.sales": "Sales and proposals",
  "company.security": "Security and IT",
  "company.stack": "Tech stack",
  "company.teams": "Teams and org chart",
  "company.tools": "Tools and systems",
  "tone.desired": "How you want to come across",
  "preferences.answers": "How you want answers",
  "preferences.answers.format": "Answer format",
  "preferences.answers.length": "Answer length",
  "preferences.answers.language": "Answer language",
  "preferences.writing_rules": "Writing rules for AIs",
  "preferences.ai_tone": "Tone of answers",
  "preferences.formats": "Units and formats",
  "preferences.tools": "Tools and apps you prefer",
  "preferences.working": "How you like to work",
  "style.habits": "Habits",
};

/** The sections memory files Maya's chats under, by the corpus's top level keys, in the order the graph draws them. */
const SECTIONS: ReadonlyArray<[top: string, label: string]> = [
  ["company", "Company"],
  ["clients", "Clients"],
  ["preferences", "Preferences"],
  ["style", "Writing style"],
  ["tone", "Tone and voice"],
];

/** The fact kind each client slot holds, as the client template files them. */
const SLOT_KIND: Record<string, FactView["kind"]> = {
  promises: "task",
  deadlines: "task",
  meetings: "event",
  decisions: "decision",
  preferences: "preference",
  contacts: "attribute",
  overview: "attribute",
};

/** The client slots whose facts about the engagement live in the engagement's own folder. */
const ENGAGEMENT_SLOTS = new Set(["engagements", "scope", "issues", "requests", "documents", "pipeline", "decisions"]);

/** The key each client slot files a fact under (packages/solution's client_account template), so every reader finds its slot. */
const SLOT_KEY: Record<string, string> = {
  promises: "promise.what",
  deadlines: "due",
  meetings: "meeting.when",
  requests: "request.what",
  issues: "issue.what",
  decisions: "client_decision.what",
  scope: "scope.item",
  billing: "billing.terms",
  pipeline: "deal.stage",
  preferences: "client_pref.what",
  access: "access.system",
  overview: "client.industry",
  relationship: "client.owner",
};

/** "May 9" in a text, read forward from the day it was said, as memory reads a deadline. */
function dueOf(text: string, saidMs: number): { at: string; tz: string | null } | null {
  const m = new RegExp(`\\b(${MONTHS.join("|")}) (\\d{1,2})\\b`).exec(text);
  if (!m) return null;
  const month = MONTHS.indexOf(m[1]!);
  const said = new Date(saidMs);
  for (let year = said.getUTCFullYear() - 1; year <= said.getUTCFullYear() + 1; year++) {
    const at = Date.UTC(year, month, Number(m[2]));
    if (at >= saidMs - 2 * DAY) return { at: new Date(at).toISOString().slice(0, 10), tz: null };
  }
  return null;
}

/** The dates, emails, phones and links in a text, as the ranges the sheet sets in mono. */
function specificsOf(text: string): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const re = new RegExp(`\\b(?:${MONTHS.join("|")}) \\d{1,2}\\b|[\\w.]+@[\\w.-]+\\.[a-z]+|\\+\\d[\\d ()-]{7,}\\d`, "g");
  for (let m = re.exec(text); m; m = re.exec(text)) out.push([m.index, m.index + m[0].length]);
  return out;
}

export function buildMemory(now: number): Mem {
  const corpus = teamCorpus(now);
  const served = libraryChats(corpus).map(titled);
  const byConv = new Map(served.map((c) => [`${c.platform}:${c.platformConvId}`, c]));
  const chats: Chat[] = served.map((c) => ({
    id: `${c.platform}:${c.platformConvId}`,
    platform: c.platform,
    title: c.title,
    at: c.updatedAt ?? c.createdAt ?? new Date(now).toISOString(),
    project: c.project?.name ?? null,
    conv: c,
  }));
  const id = idMaker();
  const start = now - 548 * DAY;
  const nodes = new Map<string, Node>();
  const facts = new Map<string, Fact>();

  const node = (o: Partial<Node> & Pick<Node, "id" | "kind" | "label" | "section">): Node => {
    const n: Node = {
      parent: null,
      importance: 3,
      pinned: false,
      urgency: "none",
      facts: 0,
      history: false,
      aliases: [],
      summary: null,
      kids: [],
      facts_: [],
      values: [],
      relations: [],
      ...o,
    };
    nodes.set(n.id, n);
    if (n.parent) nodes.get(n.parent)?.kids.push(n.id);
    return n;
  };

  const self = node({ id: id("ent", start), kind: "self", label: "You", section: "", importance: 5 });
  // Company and Clients take the ids the Solution page knows them by (solution/memory/org-points.ts).
  const sections = { company: "sec_company", clients: "sec_clients", preferences: "sec_preferences", style: "sec_style", tone: "sec_tone" };
  const sectionOf = new Map(SECTIONS.map(([top, label]) => [top, node({ id: `sec_${top}`, kind: "section", label, section: `sec_${top}` }).id]));

  const items = corpus.items.filter((i) => byConv.has(i.convId) && i.kept && !i.amounts?.length && !i.credentials?.length && sectionOf.has(i.top));
  const saidAt = (i: PlantedItem) => Date.parse(byConv.get(i.convId)?.messages[i.msgIndex]?.createdAt ?? "") || now - DAY;

  // A folder per catalog part, nested as the catalog nests them: Decisions holds Technical decisions.
  const folders = new Map<string, string>();
  const folder = (section: string, key: string, at: number): string => {
    let parent = section;
    const parts = key.split(".");
    for (let n = 2; n <= parts.length; n++) {
      const part = parts.slice(0, n).join(".");
      const known = folders.get(part);
      parent = known ?? node({ id: id("ent", at), kind: "folder", label: FOLDERS[part] ?? part, section, parent, importance: 3 }).id;
      folders.set(part, parent);
    }
    return parent;
  };
  // Each vendor and competitor is its own folder in Partners and vendors or Competitors.
  const vendorIds = new Map<string, string>();
  const vendor = (name: string, key: string, at: number): string => {
    const known = vendorIds.get(name);
    if (known) return known;
    const made = node({ id: id("ent", at), kind: "organization", label: name, section: sections.company, parent: folder(sections.company, key, at), importance: 3 });
    vendorIds.set(name, made.id);
    return made.id;
  };

  // Clients: every client the served chats are about, with its contacts and its engagement.
  const clientIds = new Map<string, string>();
  const contactIds = new Map<string, string>();
  const workerIds = new Map<string, string>();
  const all = [...[...CLIENTS, ...MORE_CLIENTS].map((c) => ({ key: c.key, name: c.name, aliases: c.aliases, work: c.work, contacts: c.contacts, domain: c.domain })), ...NEW_CLIENTS.map((c) => ({ key: c.key, name: c.name, aliases: c.aliases, work: c.work, contacts: [] as typeof CLIENTS[number]["contacts"], domain: "" }))];
  const proposedKey = "pebblebrook";
  const projectIds = new Map<string, string>();
  for (const c of all) {
    const mine = items.filter((i) => i.client === c.key);
    if (mine.length === 0 || c.key === proposedKey) continue;
    const first = Math.min(...mine.map(saidAt));
    const folderNode = node({ id: id("ent", first), kind: "organization", label: c.name, section: sections.clients, parent: sections.clients, importance: 4, aliases: [...c.aliases, ...(c.domain ? [c.domain] : [])], client: c.key });
    clientIds.set(c.key, folderNode.id);
    for (const k of c.contacts) {
      const said = mine.filter((i) => i.text.includes(k.name) || (i.identity ?? []).some((v) => v.owner === `contact:${c.key}:${k.key}`));
      if (said.length === 0) continue;
      const person = node({ id: id("ent", Math.min(...said.map(saidAt))), kind: "person", label: k.name, section: sections.clients, parent: folderNode.id, importance: 3, key: k.key });
      contactIds.set(`${c.key}:${k.key}`, person.id);
      const role = said.find((i) => i.text.includes(`is the ${k.role}`));
      const values: IdentityValueView[] = [];
      for (const i of said)
        for (const v of i.identity ?? [])
          if (v.owner === `contact:${c.key}:${k.key}`)
            values.push({
              id: id("fact", saidAt(i)),
              field: v.field,
              ...(v.field === "link" ? { kind: v.value.startsWith("@") ? ("x" as const) : ("linkedin" as const) } : {}),
              value: v.value,
              href: v.field === "email" ? `mailto:${v.value}` : v.field === "phone" ? `tel:${v.value.replace(/[^\d+]/g, "")}` : v.field === "link" ? (v.value.startsWith("@") ? `https://x.com/${v.value.slice(1)}` : `https://${v.value}`) : null,
              sources: [],
              said: new Date(saidAt(i)).toISOString().slice(0, 10),
            });
      if (role) values.push({ id: id("fact", saidAt(role)), field: "role", value: k.role, href: null, sources: [], said: new Date(saidAt(role)).toISOString().slice(0, 10) });
      values.push({ id: id("fact", first), field: "org", value: c.name, href: null, sources: [], said: null });
      person.values = values;
      person.relations = [{ type: "works_at", label: "Works at", direction: "out", other: { id: folderNode.id, label: c.name, kind: "organization" } }];
      folderNode.relations.push({ type: "works_at", label: `${k.name} works here`, direction: "in", other: { id: person.id, label: k.name, kind: "person" } });
    }
    if (mine.some((i) => i.text.includes(c.work))) {
      const work = node({ id: id("ent", first + 1000), kind: "project", label: c.work, section: sections.clients, parent: folderNode.id, importance: 3 });
      folderNode.relations.unshift({ type: "for", label: `${c.work} is for this`, direction: "in", other: { id: work.id, label: c.work, kind: "project" } });
      work.relations = [{ type: "for", label: "For", direction: "out", other: { id: folderNode.id, label: c.name, kind: "organization" } }];
      projectIds.set(c.key, work.id);
    }
  }
  const pb = NEW_CLIENTS.find((c) => c.key === proposedKey)!;
  const proposed = { key: pb.key, name: pb.name, id: id("ent", now - 60 * DAY), chats: new Set(items.filter((i) => i.client === proposedKey).map((i) => i.convId)).size };

  for (const i of items) {
    if (i.client === proposedKey) continue;
    const at = saidAt(i);
    const conv = byConv.get(i.convId)!;
    let owner: string | undefined;
    if (i.top !== "company" && i.top !== "clients") {
      // Her own: Preferences, Writing style, Tone and voice, each part in its catalog folder.
      owner = folder(sectionOf.get(i.top)!, i.section, at);
    } else if (i.top === "clients" && i.client) {
      const client = all.find((c) => c.key === i.client)!;
      const named = client.contacts.find((k) => i.text.startsWith(k.name) && i.slot === "contacts");
      if (i.identity?.length) continue;
      // What is about the engagement itself (its scope, requests, issues, brief, decisions and next step) goes in the
      // engagement's folder; promises, deadlines and meetings stay in the client's own slots.
      const work = ENGAGEMENT_SLOTS.has(i.slot ?? "") && i.text.includes(client.work) ? projectIds.get(client.key) : undefined;
      owner = (named && contactIds.get(`${client.key}:${named.key}`)) ?? work ?? clientIds.get(i.client);
    } else if (i.section === "company.partners" || i.section === "company.competitors") {
      const name = VENDOR_NAMES.find((v) => i.text.startsWith(v)) ?? VENDOR_NAMES.find((v) => i.text.includes(v));
      owner = name ? vendor(name, i.section, at) : folder(sections.company, i.section, at);
    } else if (i.top === "company") {
      // A coworker by full name, or by first name in a line about people at work, as the chats name them.
      const worker = i.section === "company.people" ? (WORKERS.find((w) => i.text.includes(w.name)) ?? WORKERS.find((w) => new RegExp(`\\b${w.first}\\b`).test(i.text))) : undefined;
      if (worker) {
        const people = folder(sections.company, "company.people", at);
        owner =
          workerIds.get(worker.key) ??
          (() => {
            const w = node({ id: id("ent", at), kind: "person", label: worker.name, section: sections.company, parent: people, importance: 3, key: worker.key });
            workerIds.set(worker.key, w.id);
            return w.id;
          })();
        if (i.identity?.length) {
          const w = nodes.get(owner)!;
          for (const v of i.identity) w.values.push({ id: id("fact", at), field: v.field, ...(v.field === "link" ? { kind: "github" as const } : {}), value: v.value, href: v.field === "email" ? `mailto:${v.value}` : `https://github.com/${v.value}`, sources: [], said: new Date(at).toISOString().slice(0, 10) });
          continue;
        }
      } else owner = folder(sections.company, i.section, at);
    }
    if (!owner) continue;
    const kind: FactView["kind"] = (i.slot && SLOT_KIND[i.slot]) || (i.top === "tone" || i.top === "style" ? "style" : i.top === "preferences" ? "preference" : i.text.startsWith("We decided") || i.text.startsWith("We switched") ? "decision" : "note");
    const due = kind === "task" ? dueOf(i.text, at) : null;
    const source: FactSource = { evidenceId: "", platform: conv.platform, convId: i.convId, title: conv.title, msg: i.msgIndex, role: "user", at: new Date(at).toISOString(), url: null, stale: false };
    const fid = id("fact", at);
    source.evidenceId = `${fid}#e0`;
    const urgency = describeUrgency(
      { status: "active", kind: kind as UrgencyKind, progress: kind === "task" ? "needs-action" : undefined, urgency: due ? { due: { at: due.at } } : undefined, evidence: [{ at: source.at }] },
      now,
      ZONE,
    );
    const changeable = i.lifetime === "changeable" && now - at > 365 * DAY;
    const fact: Fact = {
      id: fid,
      kind,
      key: (i.top === "clients" && i.slot && SLOT_KEY[i.slot]) || "",
      text: i.text.split("\n")[0]!,
      specifics: specificsOf(i.text.split("\n")[0]!),
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
      basis: i.slot === "documents" ? "pasted" : "user_stated",
      sensitivity: null,
      sources: [source],
      supersededBy: null,
      replacedOn: null,
      changedBy: null,
      ...(changeable ? { freshness: "may_be_out_of_date" as const } : {}),
      ...(i.text.includes("handover report") ? { mentions: 2 } : {}),
      slot: i.slot,
      owner,
      client: i.client,
    };
    facts.set(fid, fact);
    nodes.get(owner)!.facts_.push(fid);
  }

  // Identity values cite the chats that said them.
  for (const n of nodes.values())
    for (const v of n.values) {
      const said = items.find((i) => i.text.includes(v.value) || (v.field === "role" && i.text.includes(`${n.label} is the ${v.value}`)));
      if (said) {
        const conv = byConv.get(said.convId)!;
        v.sources = [{ evidenceId: `${v.id}#e0`, platform: conv.platform, convId: said.convId, title: conv.title, msg: said.msgIndex, role: "user", at: new Date(saidAt(said)).toISOString(), url: null, stale: false }];
      }
    }

  // Each thing's own count, as the overview's node stats give it, and the most urgent fact at or under it.
  const rank = ["none", "later", "upcoming", "soon", "today", "overdue"];
  const roll = (n: Node): GraphNode["urgency"] => {
    let urgency: GraphNode["urgency"] = "none";
    const raise = (u: GraphNode["urgency"]) => {
      if (rank.indexOf(u) > rank.indexOf(urgency)) urgency = u;
    };
    for (const f of n.facts_) raise(facts.get(f)!.urgency);
    for (const k of n.kids) raise(roll(nodes.get(k)!));
    n.facts = n.facts_.length + n.values.length;
    if (n.values.length) n.identity = n.values.length;
    n.urgency = urgency;
    return urgency;
  };
  for (const n of [...nodes.values()].filter((x) => x.kind === "section")) for (const k of n.kids) roll(nodes.get(k)!);

  return { now, corpus, chats, nodes, facts, self: self.id, sections, clientIds, proposed, written: null };
}
