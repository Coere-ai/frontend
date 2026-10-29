import type { Fact, Node } from "./memory";

/**
 * The shape of Fernhill's memory on the graph (the owner, 2026-10-29: a
 * full company memory, many clean folders with a small fan each, never 500
 * memories on one point). Coere for Teams draws Company and Clients first
 * and Coere's own catalog sections after them, so the agency's memory is
 * Company in four folders, Clients with seven clients, and the rest filed
 * in Plans and deadlines, Writing and creative work, Work, People,
 * Information, Money and Projects under folders in the agency's own words.
 * Nine sections, as the graph has nine colours before they come round
 * again; Maya's own few lines sit with how the team likes to work.
 * The corpus names more clients than Clients keeps; the work for the
 * others is filed by what it is about, so every memory and chat stays.
 */

/** The sections in the order the graph draws them, the heavier first, with the catalog's names (packages/solution taxonomy). */
export const SECTIONS: ReadonlyArray<[key: string, label: string]> = [
  ["company", "Company"],
  ["clients", "Clients"],
  ["plans", "Plans and deadlines"],
  ["creative", "Writing and creative work"],
  ["work", "Work"],
  ["people", "People"],
  ["knowledge", "Information"],
  ["money", "Money"],
  ["projects", "Projects"],
];

/** The corpus's top level keys that are Maya's own: how she wants answers and how she writes. */
export const OWN_TOPS = new Set(["preferences", "style", "tone"]);

/** The clients that keep a folder in Clients: the one the film follows, five steady accounts and the small one it deletes. */
export const KEPT_CLIENTS = new Set(["kestrel", "tidewater", "osprey", "bramble", "saffron", "larkspur", "lantern"]);

/** Clients whose folder holds everything the chats say about them. */
const WHOLE = new Set(["kestrel", "lantern"]);

/** What a kept client's folder holds: its contacts, the work, promises, deadlines, decisions and billing. */
const CLIENT_SLOTS = new Set(["contacts", "promises", "deadlines", "decisions", "billing"]);
const WORK_SLOTS = new Set(["scope", "engagements"]);

/** Engagements for clients without a folder, which Projects keeps as projects of their own. */
export const PROJECT_CLIENTS = new Set(["halvorsen", "copperline", "juniper", "marlow"]);

/** Each section's folders, in the order they are drawn: the heavier first, as a library leans. */
export const FOLDERS: Record<string, readonly string[]> = {
  company: ["People", "How we work", "Tools and systems", "Policies"],
  creative: ["Briefs and requests", "Design decisions", "Style rules", "Copy feedback"],
  plans: ["Client meetings", "Promised deliverables", "Launches and handovers", "Time off"],
  money: ["Invoicing and retainers", "Proposals and pricing"],
  work: ["Engagements and scope", "Account owners", "Client updates", "Client access"],
  people: ["How we like to work", "Client contacts", "Referrals", "Vendors"],
  knowledge: ["About Fernhill", "Client backgrounds", "Studio know-how", "Competitors"],
};

/** Where a catalog folder of Company files: its own four folders, or the section the rest belongs in. */
const COMPANY: Record<string, [string, string]> = {
  "How we work": ["company", "How we work"],
  "How we communicate": ["company", "How we work"],
  "Meetings and rituals": ["company", "How we work"],
  "Roles and responsibilities": ["company", "How we work"],
  "Teams and org chart": ["company", "How we work"],
  "Tools and systems": ["company", "Tools and systems"],
  "Tech stack": ["company", "Tools and systems"],
  "Technical decisions": ["company", "Tools and systems"],
  "Internal projects": ["company", "Tools and systems"],
  "Security and IT": ["company", "Tools and systems"],
  "Runbooks and checklists": ["company", "Tools and systems"],
  Policies: ["company", "Policies"],
  "Remote work": ["company", "Policies"],
  "Legal and compliance": ["company", "Policies"],
  Onboarding: ["company", "Policies"],
  Hiring: ["company", "Policies"],
  "Operations and admin": ["company", "Policies"],
  "Finance processes": ["company", "Policies"],
  "Products and services": ["money", "Proposals and pricing"],
  "Sales and proposals": ["money", "Proposals and pricing"],
  "About the company": ["knowledge", "About Fernhill"],
  "Goals and strategy": ["knowledge", "About Fernhill"],
  Decisions: ["knowledge", "About Fernhill"],
  "Marketing and brand": ["knowledge", "About Fernhill"],
  "Glossary and lessons": ["knowledge", "Studio know-how"],
  "How our industry works": ["knowledge", "Studio know-how"],
  "Customers in general": ["knowledge", "Studio know-how"],
  Competitors: ["knowledge", "Competitors"],
  "Partners and vendors": ["people", "Vendors"],
};

/** A client fact filed by its slot, for a client without a folder or a slot its folder does not keep. */
function bySlot(f: Fact): [string, string] {
  const t = f.text;
  switch (f.slot) {
    case "contacts":
      return ["people", "Client contacts"];
    case "promises":
      return ["plans", "Promised deliverables"];
    case "deadlines":
      return ["plans", "Launches and handovers"];
    case "meetings":
      return ["plans", "Client meetings"];
    case "billing":
      return ["money", "Invoicing and retainers"];
    case "pipeline":
      return ["money", "Proposals and pricing"];
    case "decisions":
      return ["creative", "Design decisions"];
    case "documents":
      return ["creative", "Briefs and requests"];
    case "engagements":
    case "scope":
    case "issues":
      return ["work", "Engagements and scope"];
    case "access":
      return ["work", "Client access"];
    case "overview":
      return ["knowledge", "Client backgrounds"];
    case "relationship":
      return /steady client/.test(t) ? ["people", "Referrals"] : ["work", "Account owners"];
    case "preferences":
      return /weekly email summary/.test(t) ? ["work", "Client updates"] : ["creative", "Style rules"];
    case "requests":
      if (/warmer tone/.test(t)) return ["creative", "Copy feedback"];
      if (/monthly results report/.test(t)) return ["work", "Client updates"];
      if (/move the packaging shoot/.test(t)) return ["plans", "Promised deliverables"];
      return ["creative", "Briefs and requests"];
    default:
      return ["work", "Engagements and scope"];
  }
}

/** A coworker's line: the person keeps who they are; time off, cover and how to work with them file by what they are. */
function byCoworker(f: Fact): [string, string] | null {
  const t = f.text;
  if (/being away from/.test(t)) return ["plans", "Time off"];
  if (/covers the day to day/.test(t)) return ["work", "Account owners"];
  if (/two line summary|fastest way to reach|feedback as comments/.test(t)) return ["people", "How we like to work"];
  return null;
}

/**
 * Where a fact belongs: a section and folder, or "stay" for a fact whose
 * place is already right (a kept client's own slots, a coworker, an
 * engagement Projects keeps whole).
 */
export function placeOf(f: Fact, owner: Node, parent: Node | undefined): [string, string] | "stay" {
  if (f.client) {
    if (WHOLE.has(f.client)) return "stay";
    if (KEPT_CLIENTS.has(f.client)) {
      if (CLIENT_SLOTS.has(f.slot ?? "")) return "stay";
      if (owner.kind === "project" && WORK_SLOTS.has(f.slot ?? "")) return "stay";
      return bySlot(f);
    }
    if (PROJECT_CLIENTS.has(f.client) && owner.kind === "project") return "stay";
    return bySlot(f);
  }
  if (owner.kind === "person" && owner.key) return byCoworker(f) ?? "stay";
  if (owner.section === "sec_own") return ["people", "How we like to work"];
  if (/^Invoices go out/.test(f.text)) return ["money", "Invoicing and retainers"];
  const at = COMPANY[owner.label] ?? (owner.kind === "organization" && parent ? COMPANY[parent.label] : undefined);
  return at ?? ["company", "How we work"];
}

/** "fleet livery rebrand" as a folder names it. */
export const titleCase = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
