import type { IdentityValueView } from "@coere/memory";
import { Rng } from "@v2/tools/gen-corpus/rng";
import { dayName, type Line, type SectionSpec, type Thing } from "./grow";

/**
 * Whitlock & Rhee at its real size: four more clients, each with its
 * people, its matters and what its chats said about it, slot by slot; the
 * firm's staff; and the rest of its memory, section by section, each
 * section with a few folders in a litigation practice's own words. Client
 * lines are written from templates filled by a seeded stream, so the firm
 * is the same every time it is built. Every name is made up. No line
 * outside a client's own folder names Hartwell, Briarstone or the firm's
 * other clients, so the film's own client and its answers stay as they are.
 */

const SEED = 0x1e6a1;

type MatterType = "dispute" | "employment" | "property" | "ip" | "regulatory" | "corporate";
type Matter = { label: string; type: MatterType; claim: string; other?: string; step?: string };
type ClientDef = { key: string; name: string; short: string; domain: string; what: string; city: string; since: number; status?: "active" | "paused"; contacts: Array<[string, string]>; matters: Matter[] };

/** The firm's other clients: who they are, their people and their matters, what each matter is about and its next dated step. */
const CLIENTS: ClientDef[] = [
  { key: "tessaly", name: "Tessaly Pharmacy Group", short: "Tessaly", domain: "tessalyrx.com", what: "runs four neighborhood pharmacies", city: "Evanston", since: 2022, contacts: [["Imani Brooks", "owner"]], matters: [{ label: "Tessaly licensing review", type: "regulatory", claim: "the state pharmacy board's review of two stores" }] },
  { key: "ashby", name: "Ashby Kitchens", short: "Ashby", domain: "ashbykitchens.com", what: "runs five restaurants and a catering kitchen", city: "Chicago", since: 2023, contacts: [["Nadia Ashby", "owner"], ["Luis Ferro", "operations manager"]], matters: [{ label: "Ashby tip pool claim", type: "employment", claim: "three servers who say managers shared in the tip pool", step: "The answer in {m} is due {d}." }, { label: "Ashby Fulton Street lease", type: "property", claim: "a ten year lease for a new restaurant on Fulton Street", step: "The landlord wants {m} signed by {d}." }] },
  { key: "northfield", name: "Northfield Montessori", short: "Northfield", domain: "northfieldmontessori.org", what: "is a Montessori school for children three to twelve", city: "Winnetka", since: 2021, contacts: [["Helen Marsh", "head of school"]], matters: [{ label: "Northfield enrollment contract", type: "corporate", claim: "a new contract parents sign each spring", step: "The board approves {m} on {d}." }, { label: "Northfield zoning appeal", type: "property", claim: "a variance to add two classrooms", step: "The zoning board hears {m} on {d}." }] },
  { key: "vireo", name: "Vireo Software", short: "Vireo", domain: "vireosoftware.io", what: "makes scheduling software for clinics", city: "Chicago", since: 2024, contacts: [["Priscilla Wong", "chief executive"], ["Jamal Pierce", "head of product"]], matters: [{ label: "Vireo trademark", type: "ip", claim: "registering the Vireo name and logo", step: "The office action reply in {m} is due {d}." }, { label: "Vireo seed round", type: "corporate", claim: "the company's first outside investment", step: "Closing for {m} is set for {d}." }] },
];

/** The judges the firm's matters come before, and the firms on the other side. */
const JUDGES = ["Judge Ellen Marchetti", "Judge Robert Szymanski", "Judge Alicia Grant", "Judge Howard Neel", "Judge Teresa Okonkwo", "Judge Paul Haverford"];
const COUNSEL = ["Brandt Keller LLP", "Morrow & Associates", "Haskins Pell", "Dorsey Lane Law", "Vantage Legal Group", "Carmody Fisk"];

type X = { rng: Rng; on: (days: number) => string; judge: () => string; counsel: () => string; year: (back: number) => number; month: (days: number) => string };

const first = (name: string) => name.replace(/^Dr\. /, "").split(" ")[0]!;
const pick = <T>(rng: Rng, items: readonly T[], n: number): T[] => rng.shuffle([...items]).slice(0, n);

/** Who leads each kind of matter at the firm. */
const LEADS: Record<MatterType, string[]> = {
  dispute: ["Grace Rhee", "Owen Pryce"],
  employment: ["Marcus Feld"],
  property: ["Lena Varga"],
  ip: ["Hana Kimura"],
  regulatory: ["Clara Benn"],
  corporate: ["Isaac Brandt"],
};

/** What a client's matter is about, by its kind: the facts filed in the matter's own folder, and the dated lines filed in the client's slots. */
function matterLines(c: ClientDef, m: Matter, x: X): { own: Line[]; slots: Line[]; discovery: Line[] } {
  const t = {
    strategy: [`${m.label} strategy`, `Thinking through ${m.label}`, `${m.label} research`, `${m.label} theory`],
    deadlines: [`${m.label} deadlines`, `${m.label} timeline`, `${m.label} calendar`],
    notes: [`${m.label} notes`, `${m.label} team`, `${m.label} status`],
    discovery: [`${m.label} discovery`, `${m.label} witnesses`, `${m.label} document review`],
  };
  const d1 = x.rng.int(20, 70);
  const d2 = d1 + x.rng.int(14, 60);
  const f1 = first(c.contacts[0]![0]);
  const lead = x.rng.pick(LEADS[m.type]);
  const about: Line = { text: m.type === "dispute" ? `The claim in ${m.label} is about ${m.claim}.` : `${m.label} is about ${m.claim}.`, topic: t.strategy };
  const leads: Line = { text: `${lead} leads ${m.label} for the firm.`, topic: t.notes };
  const step = (template: string, due: number): Line => ({ text: template.replace("{m}", m.label).replace("{d}", x.on(due)), topic: t.deadlines, slot: "deadlines", kind: "task", key: "due", due });
  const more: Record<MatterType, Line[]> = {
    dispute: [
      { text: `Our theory is that ${m.other} knew of the problem early and said nothing.`, topic: t.strategy },
      { text: `${c.short} decided not to bring a counterclaim for now.`, topic: t.strategy, kind: "decision" },
    ],
    employment: [
      { text: `Rosa Delgado gathers the policies and records for ${m.label}.`, topic: t.notes },
      { text: `Marcus reviews every draft in ${m.label} before it goes to ${f1}.`, topic: t.notes },
      { text: `${f1} wants managers trained once ${m.label} is settled.`, topic: t.strategy },
      { text: `${c.short} decided to update its handbook while ${m.label} goes on.`, topic: t.strategy, kind: "decision" },
    ],
    property: [
      { text: `${f1} wants ${m.label} wrapped up before ${x.month(x.rng.int(60, 160))}.`, topic: t.strategy },
      { text: `Theo keeps the hearing and closing dates for ${m.label} in Docketwise.`, topic: t.notes },
      { text: `${c.short} sends its rent rolls and lease files through the document system.`, topic: t.notes },
    ],
    ip: [
      ...(m.other ? [{ text: `We sent ${m.other} a cease and desist letter in ${x.month(-x.rng.int(20, 60))}.`, topic: t.strategy }] : [{ text: `The search for ${m.label} found ${x.rng.pick(["two", "three", "four"])} similar filings.`, topic: t.notes }]),
      { text: `${c.short} keeps its artwork files with dates, which helps ${m.label}.`, topic: t.notes },
      { text: `${c.short} decided to file in the United States first and abroad later.`, topic: t.strategy, kind: "decision" },
    ],
    regulatory: [
      { text: `The state asked ${c.short} for three years of records.`, topic: t.notes },
      { text: `The last review of ${c.short} found two paperwork gaps and no safety issues.`, topic: t.strategy },
      { text: `${c.short} decided to answer the state in writing before any meeting.`, topic: t.strategy, kind: "decision" },
    ],
    corporate: [
      { text: `Diligence for ${m.label} covers leases, staff contracts and permits.`, topic: t.notes },
      { text: `${c.short} wants its board to see a one page summary before it votes.`, topic: t.strategy },
      { text: `${c.short} decided to keep its current bank through ${m.label}.`, topic: t.strategy, kind: "decision" },
    ],
  };
  const own = [about, leads, ...pick(x.rng, more[m.type], x.rng.int(1, 2))];
  // A case keeps its discovery in a folder of its own: who is on the other side, the judge, the documents and the witnesses.
  const discovery: Line[] =
    m.type === "dispute"
      ? pick(x.rng, [
          { text: `${m.other} is represented by ${x.counsel()}.`, topic: t.discovery },
          { text: `${x.judge()} is assigned to ${m.label}.`, topic: t.discovery },
          { text: `${c.short} kept every email about the problem, and Sam is collecting them for production.`, topic: t.discovery },
          { text: `The key witness for ${c.short} is ${x.rng.pick(c.contacts)[0]}, who first raised the problem.`, topic: t.discovery },
          { text: `We asked ${m.other} for its internal emails from the first month of the problem.`, topic: t.discovery },
        ] as Line[], x.rng.int(2, 4))
      : [];
  const slots: Line[] =
    m.type === "dispute"
      ? pick(x.rng, [
          step("Written discovery in {m} is due {d}.", d1),
          { ...step("Mediation in {m} is set for {d}.", d2), slot: "meetings", kind: "event", key: "meeting.when" },
          step("The reply brief in {m} goes in by {d}.", d1 + 7),
        ], 2)
      : m.type === "regulatory"
        ? [step("The response in {m} is due {d}.", d1)]
        : [step(m.step ?? "The next filing in {m} is due {d}.", m.step?.includes("Closing") || m.step?.includes("sign") ? d2 : d1)];
  return { own, slots, discovery };
}

const DUTIES = ["signs off on every filing", "keeps the legal budget", "is our first call on anything urgent", "approves any settlement", "gathers the documents we ask for", "reads every draft before it goes out"];
const DOCS: Record<MatterType, Array<[string, string]>> = {
  dispute: [["supply contract", "the parties, the delivery terms and the notice clause"], ["settlement term sheet", "the release, the payment schedule and the deadline to sign"], ["litigation hold notice", "who must keep what, and from which date"]],
  employment: [["employee handbook", "leave, overtime and how a complaint is made"], ["separation agreement", "the release, the review period and the return of property"], ["arbitration policy", "who it covers and how a claim starts"]],
  property: [["lease", "the term, the rent steps and the exit clause"], ["purchase agreement", "the parties, the closing conditions and the closing date"], ["estoppel certificate", "what the tenant confirms about the lease"]],
  ip: [["license agreement", "the territory, the term and who may sublicense"], ["trademark filing", "the mark, the classes and the first use date"], ["brand guide", "the logo, the colors and how the name is written"]],
  regulatory: [["response to the state", "each finding and what was fixed"], ["policy binder", "the policies the state checks first"], ["inspection report", "the findings and the dates to fix them"]],
  corporate: [["purchase agreement", "the parties, the closing conditions and the closing date"], ["shareholder agreement", "voting, transfers and what happens if an owner leaves"], ["board minutes", "who attended, what was approved and what comes next"]],
};

/** One client: its folder, its people, its matters, and its lines by slot. */
function clientThing(c: ClientDef, x: X): Thing {
  const [k1, k2 = k1] = c.contacts;
  const f1 = first(k1![0]);
  const f2 = first(k2![0]);
  const m0 = c.matters[0]!;
  const doc = x.rng.pick(DOCS[m0.type]);
  const topic = {
    intake: [`${c.short} intake`, `${c.short} engagement letter`, `New matter for ${c.short}`, `${c.short} kickoff`],
    call: [`${c.short} call notes`, `Prep for call with ${f1}`, `${c.short} check in`, `Email to ${f1}`, `${c.short} weekly update`],
    billing: [`${c.short} billing`, `${c.short} invoice question`, `${c.short} budget`, `Fees for ${c.short}`],
    doc: [`${c.short} ${doc[0]}`, `Redline of the ${c.short} ${doc[0]}`, `${c.short} ${doc[0]} review`],
  };
  const p1 = x.rng.int(18, 60);
  const lines: Line[] = [
    { text: `${c.name} ${c.what} in ${c.city}.`, topic: topic.intake, slot: "overview", kind: "attribute", key: "client.industry" },
    { text: `${x.rng.pick(["Grace Rhee", "Daniel Whitlock", "Marcus Feld", "Lena Varga"])} brought ${c.short} to the firm in ${c.since}.`, topic: topic.intake, slot: "relationship", kind: "attribute", key: "client.owner" },
    ...pick(x.rng, [
      { text: `We promised ${f1} a draft of the ${doc[0]} by ${x.on(p1)}.`, topic: topic.doc, slot: "promises", kind: "task", key: "promise.what", due: p1 },
      { text: `I told ${f2} I would send the redline of the ${doc[0]} by ${x.on(p1 + 4)}.`, topic: topic.doc, slot: "promises", kind: "task", key: "promise.what", due: p1 + 4 },
      { text: `${c.short} agreed to send the signed ${doc[0]} before ${x.on(p1 + 9)}.`, topic: topic.doc, slot: "promises", kind: "task", key: "promise.what", due: p1 + 9 },
    ] as Line[], x.rng.int(1, 2)),
    { text: `Call with ${f1} on ${x.on(p1 + 2)} to go over ${m0.label}.`, topic: topic.call, slot: "meetings", kind: "event", key: "meeting.when", due: p1 + 2 },
    ...pick(x.rng, [
      { text: `${f1} wants a short written update every other Friday.`, topic: topic.call, slot: "requests", key: "request.what" },
      { text: `${c.short} asked us to copy ${f2} on anything about fees.`, topic: topic.billing, slot: "requests", key: "request.what" },
      { text: `${f1} asked for one page summaries, never long memos.`, topic: topic.call, slot: "requests", key: "request.what" },
      { text: `${c.short} wants a recommendation at the top of every email.`, topic: topic.call, slot: "requests", key: "request.what" },
    ] as Line[], x.rng.int(1, 2)),
    x.rng.pick([
      { text: `${c.short} pays monthly invoices within 30 days.`, topic: topic.billing, slot: "billing", kind: "attribute", key: "billing.terms" },
      { text: `${c.short} has a flat fee for ${m0.label}.`, topic: topic.billing, slot: "billing", kind: "attribute", key: "billing.terms" },
      { text: `${c.short} wants invoices split by matter.`, topic: topic.billing, slot: "billing", kind: "attribute", key: "billing.terms" },
      { text: `${c.short} asks for a budget before each phase of ${m0.label}.`, topic: topic.billing, slot: "billing", kind: "attribute", key: "billing.terms" },
    ] as Line[]),
    ...(x.rng.chance(0.5) ? [{ text: `${f1} prefers ${x.rng.pick(["calls before noon", "email over calls", "a text before any call", "meetings at their office"])}.`, topic: topic.call, slot: "preferences", kind: "preference", key: "client_pref.what" } as Line] : []),
    ...(x.rng.chance(0.5) ? [{ text: `Pasting the ${doc[0]} from ${c.short}: ${doc[1]}.`, topic: topic.doc, slot: "documents", basis: "pasted" } as Line] : []),
    ...(c.status === "paused" ? [{ text: `${c.name} paused new work with the firm until spring.`, topic: topic.billing, slot: "relationship", kind: "attribute", key: "client.status" } as Line] : x.rng.chance(0.4) ? [{ text: `${c.name} is an active client of the firm.`, topic: topic.intake, slot: "relationship", kind: "attribute", key: "client.status" } as Line] : []),
  ];
  const kids: Thing[] = c.contacts.map(([name, role], i) => ({
    label: name,
    kind: "person",
    key: `${c.key}-${i}`,
    values: [["email", `${first(name).toLowerCase()}.${name.split(" ").at(-1)!.toLowerCase()}@${c.domain}`], ...(x.rng.chance(0.4) ? [["phone", `+1 (${x.rng.pick(["312", "630", "847", "708", "815"])}) 555-0${x.rng.int(100, 199)}`]] : []), ["role", role]] as Array<[IdentityValueView["field"], string]>,
    lines: [{ text: `${name} is the ${role} at ${c.short} and ${x.rng.pick(DUTIES)}.`, topic: topic.intake, slot: "contacts", kind: "attribute", key: "contact.role" }],
  }));
  for (const m of c.matters) {
    const { own, slots, discovery } = matterLines(c, m, x);
    lines.push(...slots);
    kids.push({ label: m.label, kind: "project", lines: own, ...(discovery.length ? { kids: [{ label: `${c.short} discovery`, kind: "folder", lines: discovery }] } : {}) });
  }
  return { label: c.name, kind: "organization", client: c.key, aliases: [c.short, c.domain], subject: true, lines, kids };
}
/** The firm's own staff beyond the three the film names, as Settings lists them, and the one thing the team knows about each. */
export const MORE_WORKERS = [
  { key: "marcus", topic: "Employment group intake", name: "Marcus Feld", team: "Employment", role: "Partner", lines: ["Marcus Feld leads the employment group and reviews every handbook we send out."] },
  { key: "lena", topic: "Real estate closings", name: "Lena Varga", team: "Real estate", role: "Partner", lines: ["Lena Varga leads real estate and signs every closing letter."] },
  { key: "owen", topic: "Discovery staffing", name: "Owen Pryce", team: "Litigation", role: "Senior associate", lines: ["Owen Pryce runs discovery on the firm's larger cases."] },
  { key: "hana", topic: "Trademark filings", name: "Hana Kimura", team: "Intellectual property", role: "Associate", lines: ["Hana Kimura files every trademark application for the firm."] },
  { key: "isaac", topic: "Deal diligence list", name: "Isaac Brandt", team: "Corporate", role: "Associate", lines: ["Isaac Brandt runs diligence on deals and keeps the data rooms."] },
  { key: "clara", topic: "Health care clients", name: "Clara Benn", team: "Health care", role: "Associate", lines: ["Clara Benn handles state surveys and licensing for health clients."] },
  { key: "rosa", topic: "Agency filing checklist", name: "Rosa Delgado", team: "Employment", role: "Paralegal", lines: ["Rosa Delgado prepares the employment group's agency filings."] },
  { key: "theo", topic: "Court calendar", name: "Theo Mallory", team: "Litigation", role: "Legal assistant", lines: ["Theo Mallory keeps the firm's court calendar and books court reporters."] },
  { key: "joy", topic: "Time entry reminders", name: "Joy Adeyemi", team: "Operations", role: "Billing manager", lines: ["Joy Adeyemi sends the invoices and chases anything past 60 days."] },
  { key: "victor", topic: "Laptop and password help", name: "Victor Haines", team: "Operations", role: "IT manager", lines: ["Victor Haines runs the document system and the laptops."] },
];

/** A few more lines on the clients the film names, in their slots, so each folder holds its own small fan. */
const NAMED_MORE: Record<string, Array<Omit<Line, "topic"> & { topic: string[] }>> = {
  osei: [
    { text: "Ama Osei prefers calls after the shops close at 4.", topic: ["Osei Bakery intake", "Osei lease call notes"], slot: "preferences", kind: "preference", key: "client_pref.what" },
    { text: "Osei Bakery pays a flat fee for the lease work.", topic: ["Osei lease call notes", "Osei Bakery intake"], slot: "billing", kind: "attribute", key: "billing.terms" },
    { text: "Grace Rhee brought Osei Bakery to the firm through a referral from its accountant.", topic: ["Osei Bakery intake"], slot: "relationship", kind: "attribute", key: "client.owner" },
  ],
  calder: [
    { text: "Calder Foods wants every trademark update in one email a week.", topic: ["Calder trademark search", "Calder weekly update"], slot: "requests", key: "request.what" },
    { text: "Calder Foods pays monthly invoices within 30 days.", topic: ["Calder Foods lease review", "Calder billing"], slot: "billing", kind: "attribute", key: "billing.terms" },
    { text: "Hana Kimura runs the Calder trademark work with Grace.", topic: ["Calder trademark search"], slot: "relationship", kind: "attribute", key: "client.owner" },
  ],
  dunmore: [
    { text: "Clara Benn leads the Dunmore records request for the firm.", topic: ["Dunmore Clinic records request"], slot: "relationship", kind: "attribute", key: "client.owner" },
    { text: "Dunmore Clinic asked that patient names never appear in an email subject line.", topic: ["Dunmore Clinic records request", "Dunmore privacy questions"], slot: "requests", key: "request.what" },
    { text: "Dunmore Clinic is billed by the hour with a cap for the records work.", topic: ["Dunmore billing", "Dunmore Clinic records request"], slot: "billing", kind: "attribute", key: "billing.terms" },
  ],
};

const JUDGE_LINES = ["wants courtesy copies of every motion", "holds status calls by phone at 9 am", "rarely grants extensions on discovery", "asks for joint status reports before hearings", "reads every brief closely and asks pointed questions", "sends most discovery fights to the magistrate judge", "starts hearings on time and does not wait", "likes a short proposed order with every motion"];
const COUNSEL_LINES = ["answers letters slowly and asks for extensions", "settles most cases before depositions", "is careful and polite in depositions", "files a motion on almost every discovery dispute", "asks for mediation early", "sends long letters before every meet and confer", "agrees to reasonable extensions when asked by phone"];

/**
 * The firm's memory past Company and Clients, in the sections Coere for
 * Teams rings after them, each folder in a litigation practice's own words.
 */
function sections(rng: Rng): SectionSpec[] {
  const judgeLines = JUDGES.flatMap((j) => pick(rng, JUDGE_LINES, 3).map((l) => `${j} ${l}.`));
  const counselLines = COUNSEL.flatMap((f) => pick(rng, COUNSEL_LINES, 3).map((l) => `${f} ${l}.`));
  return [
    {
      key: "company",
      label: "Company",
      folders: [
        {
          label: "How we work",
          chats: ["Deposition practice notes", "Conflicts check steps", "New matter intake", "Litigation team meeting"],
          lines: [
            "Deposition outlines go to the partner two days ahead.",
            "Conflicts are run on every party and every affiliate.",
            "New clients sign an engagement letter before any work starts.",
            "The litigation team walks the week's deadlines on Monday at 9.",
            "Each deposition gets a one page summary within a week.",
            "A new hire's former clients are added to the conflicts list.",
            "Intake calls are booked only after conflicts clear.",
            "Every matter has one partner who owns it and one associate who runs it.",
            "We order the rough transcript for every deposition.",
            "Conflicts results are saved in the matter folder.",
            "Each new matter gets a number from billing on day one.",
            "Associates send the partner a short note at the end of each day of trial.",
            "Every matter gets a kickoff call with the client in its first week.",
          ],
        },
        {
          label: "Billing",
          chats: ["Billing narratives", "Time entry rules", "Rate letter for January", "Collections follow up"],
          lines: [
            "Block billing is not allowed.",
            "Joy wants time entered by Friday at noon.",
            "Rates go up on January 1, and clients hear about it in November.",
            "Invoices past 60 days get a call from Joy, then a letter from the partner.",
            "Travel time is billed at half rate.",
            "Research time is billed only when the client has approved it.",
            "Court reporter and expert invoices are passed through at cost.",
            "A matter budget is updated when a phase runs ten percent over.",
            "Write offs over an hour need a partner's approval.",
            "Flat fee matters still keep time, so we know what they cost.",
            "Every invoice is read by the partner on the matter before it goes out.",
            "Billing questions from a client get an answer within one business day.",
            "Associates never round a short call up to half an hour.",
          ],
        },
        {
          label: "Policies",
          chats: ["Records retention policy", "Information security policy", "Remote work policy", "Press and social media"],
          lines: [
            "Closed matter files are kept for seven years.",
            "Client documents are shared through the document system, never by personal email.",
            "Lawyers work from the office Tuesday through Thursday.",
            "No one posts about a client or a case.",
            "Original signed documents go back to the client at closing.",
            "Laptops lock after five minutes.",
            "Client calls from home use the firm's video account.",
            "Any call from the press goes to Daniel.",
            "Paper files are scanned and shredded after a year.",
            "Two step sign in is on for every account.",
            "Lost phones are reported to Victor within an hour.",
            "Vaultline Records keeps the firm's paper files offsite and returns them the next business day.",
            "Lawyers report a possible conflict the day they learn of it.",
            "Visitors sign in at the front desk and are walked to meetings.",
            "Client gifts over a small amount are reported to Daniel.",
            "Personal devices may open firm email only through the firm's app.",
          ],
        },
      ],
      loose: {
        chats: ["Partner meeting notes", "Partner retreat notes", "Firm priorities for the year"],
        lines: [
          ["decision", "We decided to move all matters into the new document system by January."],
          ["decision", "We decided to stop taking new personal injury cases."],
          ["decision", "We decided that every client gets a budget with its engagement letter."],
          ["decision", "We decided to hold firm wide training on the last Friday of each month."],
          ["decision", "We decided to keep the office in the Loop when the lease renews."],
        ],
      },
    },
    {
      key: "practice",
      label: "Practice areas",
      folders: [
        {
          label: "Commercial litigation",
          chats: ["Litigation practice notes", "Case intake checklist", "Litigation hold letters", "Early case assessment", "Commercial cases group meeting"],
          lines: [
            "Every new case gets a litigation hold letter within two days.",
            "Case budgets go to the client before written discovery starts.",
            "We use a three column chronology for every dispute.",
            "Grace reviews every complaint before it is filed.",
            "Motions over ten pages get a second associate's read.",
            "Early case assessments fit on two pages: facts, risks, cost and a range.",
            "We send a demand letter before suing unless a deadline is close.",
            "Every case file has a cast of characters with each person's role.",
            "Supply contract cases start with the notice clause and the cure period.",
            "We ask clients for every text message about the dispute, not just email.",
            "Counterclaims are weighed with the client before the answer is due.",
            "Owen keeps a list of the firm's past cases by judge and result.",
            "A case that may go to trial gets a trial budget at the close of discovery.",
            "Mediation briefs go to the partner a week before they go to the mediator.",
            "We prefer federal court for contract cases over a large amount.",
            "Insurance policies are checked for coverage at the start of every case.",
            "Every case closes with a short memo on what we would do again.",
            "Settlement authority is confirmed with the client in writing before mediation.",
            "Jury cases get a focus group only when the client agrees to the cost.",
            "Every complaint we file is checked against the statute of limitations twice.",
            "Partners approve any case we take on a contingency fee.",
          ],
        },
        {
          label: "Employment",
          chats: ["Employment practice notes", "Wage claim checklist", "Handbook review steps", "Agency charge response"],
          lines: [
            "Agency charges get a position statement, never a bare denial.",
            "Handbooks are reviewed every two years or when a law changes.",
            "Separation agreements for workers over 40 give 21 days to review.",
            "We ask for time records before we answer any wage claim.",
            "Marcus wants position statements to lead with the timeline.",
            "A noncompete is checked against the state's pay threshold first.",
            "Tip pool claims start with who shared the tips and who set the rules.",
            "Every termination letter is read by Marcus before it goes out.",
            "Overtime claims need the payroll records for the last three years.",
            "Managers get a short training after any claim is resolved.",
            "Illinois requires paid leave, so every handbook names the policy.",
            "Rosa keeps the agency deadlines in Docketwise the day a charge arrives.",
            "Severance is offered only with a signed release.",
            "We suggest an outside investigator when a complaint names a senior manager.",
            "Arbitration policies are checked for who they cover and how a claim starts.",
            "Final pay in Illinois is due by the next regular payday.",
            "Every employment client gets a yearly call to ask what changed.",
            "Remote workers are checked against the wage rules of the state they live in.",
          ],
        },
        {
          label: "Real estate",
          chats: ["Real estate practice notes", "Lease review checklist", "Closing checklist", "Zoning questions"],
          lines: [
            "Every lease review starts with the term, the rent and the exit.",
            "Closing checklists live in the matter folder, one per deal.",
            "Title work goes to the same title company unless the client asks.",
            "Estoppel letters go out at least three weeks before a closing.",
            "Lena wants a one page lease abstract for every commercial lease.",
            "Renewal options are checked for notice dates the day a lease arrives.",
            "Zoning appeals start with a call to the village planner.",
            "Personal guarantees in a lease are flagged to the client on page one.",
            "We check the survey against the legal description before every closing.",
            "A landlord's consent is needed before most assignments, so we ask early.",
            "Commercial leases are read for who pays for the roof and the parking lot.",
            "Lena signs every closing letter.",
            "Holdover rent is checked in every lease, since it is often double.",
            "Every purchase gets an environmental report before the deposit goes hard.",
            "Eviction filings in Cook County need the five day notice attached.",
            "We keep a list of the inspectors the firm trusts for older buildings.",
            "Tenant improvement allowances are tied to dates in the lease, so we flag them.",
            "Lena wants every lease amendment to restate the rent table in full.",
          ],
        },
        {
          label: "Trademarks",
          chats: ["Trademark practice notes", "Trademark search steps", "Brand watch report", "Office action replies"],
          lines: [
            "A trademark search comes before any new name is used.",
            "We watch each client's marks for new filings once a quarter.",
            "Cease and desist letters are signed by a partner.",
            "Hana checks each new mark against state filings too.",
            "Office action replies are due six months from the action, and we aim for two.",
            "Logos are filed separately from the name when the client can afford both.",
            "We file in the classes the client sells in now, then add more later.",
            "A first use date needs proof, so we ask for the first invoice or ad.",
            "Clients get a renewal reminder six months before a mark's deadline.",
            "Trade dress claims need photos of the product as sold in stores.",
            "Domain names are checked with every trademark search.",
            "Copyright filings for designs are batched to keep fees down.",
            "We never promise a client that a mark will register.",
            "Hana keeps a list of the examiners we have worked with and how they read.",
            "Opposition deadlines at the trademark board are 30 days and can be extended once.",
            "We advise clients to use the registered symbol only after a mark registers.",
            "Licenses of a mark need quality control terms, or the mark can be lost.",
          ],
        },
      ],
      loose: {
        chats: ["Corporate group notes", "Health care group notes"],
        lines: [
          "Diligence lists follow the firm's standard checklist.",
          "Survey responses are written as a plan of correction.",
          "Every deal gets a closing binder in the document system.",
          "Any breach of patient data goes to Clara the same day.",
        ],
      },
    },
    {
      key: "research",
      label: "Research",
      folders: [
        {
          label: "Contract law",
          chats: ["Notice clause research", "Consequential damages waiver", "Contract formation questions", "Illinois contract law notes", "Implied warranty research"],
          lines: [
            "Illinois enforces notice and cure clauses as written when the language is clear.",
            "A waiver of consequential damages does not bar direct damages for late delivery.",
            "Course of dealing can fill a gap in a supply contract but cannot change its terms.",
            "Illinois reads a contract as a whole and gives every clause a meaning.",
            "An email can form a contract when the terms are clear and both sides act on it.",
            "Time is of the essence only when the contract says so or the facts show it.",
            "The implied warranty of merchantability can be waived only in clear words.",
            "A limitation of liability clause is read narrowly against the party that wrote it.",
            "Force majeure clauses in Illinois cover only the events they name.",
            "The statute of limitations for a written contract in Illinois is ten years.",
            "For the sale of goods, the UCC sets four years from the breach.",
            "A party must mitigate its losses after a breach, and the burden is on the breaching side.",
            "Oral changes to a written contract can stand if both sides acted on them.",
            "Liquidated damages must be a fair estimate of loss, not a penalty.",
            "A merger clause keeps out earlier promises not written in the contract.",
            "Good faith and fair dealing cannot add a duty the contract does not have.",
            "Delaware law applies when a contract says so and the parties have a tie to the state.",
            "A course of performance over months can show what an unclear term meant.",
            "Statute Research is the firm's legal research service, and every associate has a login.",
            "An assignment clause that bars transfer without consent is enforced in Illinois.",
          ],
        },
        {
          label: "Evidence and discovery",
          chats: ["Discovery research", "Privilege questions", "Spoliation research", "ESI protocol notes"],
          lines: [
            "Rule 26 limits discovery to what is relevant and in proportion to the case.",
            "Text messages are discoverable when they are about the dispute, even on a personal phone.",
            "A party that loses evidence after a duty to keep it can face an adverse inference.",
            "The duty to preserve starts when a lawsuit is reasonably expected, not when it is filed.",
            "Privilege logs must say enough for the other side to judge each claim.",
            "Business records need a custodian or a certification to come in at trial.",
            "Emails between a client and its lawyer stay privileged only if no outsider is copied.",
            "An ESI protocol should name the custodians, the date range and the search terms.",
            "Clearview Discovery hosts the firm's document reviews and bills storage by the month.",
            "Rule 30(b)(6) notices must name the topics with reasonable care.",
            "A clawback order protects privileged documents produced by mistake.",
            "Expert reports must state every opinion and the basis for each.",
            "Courts in the Northern District expect parties to meet and confer before any discovery motion.",
            "Metadata is produced for email and spreadsheets unless the parties agree otherwise.",
            "A subpoena to a nonparty must allow a reasonable time to comply.",
            "Hearsay rules do not bar a party's own statements offered against it.",
            "Spoliation of text messages can lead to sanctions when the phone was in the party's control.",
            "Discovery of a party's finances usually waits until punitive damages are in play.",
            "Search terms are tested on a sample before both sides agree to them.",
          ],
        },
        {
          label: "Damages",
          chats: ["Damages research", "Lost profits questions", "Prejudgment interest", "Damages model notes"],
          lines: [
            "Lost profits must be proved with reasonable certainty, not exact numbers.",
            "A new business has a harder time proving lost profits.",
            "Prejudgment interest in Illinois is five percent a year on a fixed amount.",
            "Attorney fees are recoverable only when a contract or a statute allows them.",
            "Lost contracts need proof that the customer left because of the breach.",
            "Cover damages are the cost of buying replacement goods, less the contract price.",
            "Incidental damages include the cost of storing and inspecting rejected goods.",
            "Punitive damages are not available for a plain breach of contract.",
            "A damages expert should use the client's own records first.",
            "Mitigation costs are part of damages when they were reasonable at the time.",
            "Overbilling claims are measured by what was charged against what was delivered.",
            "Interest on a judgment runs at the statutory rate from the day it is entered.",
            "A cap on damages in a contract is read as written unless it is unconscionable.",
            "Damages for delay need proof of what the delay cost each month.",
            "A lost customer's past orders are the best guide to the profits lost.",
            "Damages are cut for any loss the client could have avoided at a fair cost.",
            "Experts should tie every damages number to a document the jury can see.",
          ],
        },
        {
          label: "Statutes and regulations",
          chats: ["Statute research", "Regulatory research", "Illinois statutes notes", "Federal rules updates"],
          lines: [
            "The Illinois Wage Payment and Collection Act lets a worker recover fees.",
            "The Illinois Freedom to Work Act sets pay floors for noncompetes.",
            "Patient records requests in Illinois must be answered within 30 days.",
            "The federal WARN Act needs 60 days notice for a plant closing.",
            "Illinois has its own WARN Act that applies to smaller employers.",
            "The state pharmacy board can inspect a store without notice.",
            "Mechanics lien claims in Illinois must be recorded within four months to bind a buyer.",
            "The Illinois Biometric Information Privacy Act needs written consent for fingerprints.",
            "Federal trucking rules require drivers to keep hours of service logs.",
            "The Lanham Act covers trademark and trade dress claims.",
            "Federal rule changes take effect on December 1 each year.",
            "Illinois eviction rules give tenants five days to pay before a filing.",
            "Statute Research flags when a statute we cite has been amended.",
            "The Illinois Consumer Fraud Act can add fees and punitive damages to a claim.",
            "Federal rules give 21 days to answer a complaint after service.",
            "Illinois gives five years for most claims on an oral contract.",
            "The Illinois Day and Temporary Labor Services Act covers staffing agencies.",
          ],
        },
      ],
      loose: {
        chats: ["Research questions", "Research notes"],
        lines: ["Research memos lead with the answer, then the cases.", "Every case we cite is checked for later history before filing.", "Research older than a year is checked again before we rely on it."],
      },
    },
    {
      key: "court",
      label: "Court and filings",
      folders: [
        {
          label: "Northern District",
          chats: ["Court rules for the Northern District", "Northern District standing orders", "Federal filing questions", "Status report format"],
          lines: [
            "Federal filings in the Northern District go in by midnight Central time.",
            "Judges in the Northern District post standing orders that change often.",
            "Local Rule 37.2 requires a statement that the parties met and conferred.",
            "Courtesy copies go to chambers by noon the next business day when a judge asks.",
            "Briefs in the Northern District use 12 point type and double spacing.",
            "A motion needs a notice of presentment unless the judge says otherwise.",
            "Exhibits over 500 pages go in on a drive delivered to the clerk.",
            "Magistrate judges in the district handle most discovery disputes.",
            "Status reports are joint unless the parties cannot agree.",
            "The district's mediation program is free for cases referred by the judge.",
            "Proposed orders are emailed to the judge's proposed order address in Word.",
            "Sealed filings need a motion to seal filed the same day.",
            "Appearances must be filed before a lawyer speaks at a hearing.",
            "Remote hearings in the district use the court's own video link.",
            "Judges in the district want a single combined brief, not separate exhibits briefs.",
            "Pro hac vice lawyers need local counsel on every filing in the district.",
            "The district's judges list their courtroom deputies on the court website.",
          ],
        },
        {
          label: "Cook County",
          chats: ["Cook County filing questions", "Cook County motion call", "Cook County e-filing", "Daley Center notes"],
          lines: [
            "Cook County motions need a notice of motion with the hearing date.",
            "Cook County cases are filed through the state's e-filing system.",
            "The Law Division sets motion calls on fixed days for each judge.",
            "Cook County judges expect a copy of the motion at the hearing.",
            "Commercial calendar cases move faster than the general calendar.",
            "The Daley Center opens at 8:30, and lines are long before 9.",
            "Subpoenas in Cook County need the clerk's seal or a lawyer's signature.",
            "Jury demands in Cook County must be filed with the first pleading.",
            "Eviction cases in Cook County go to mediation before trial.",
            "Case management orders in Cook County set every deadline at the first status.",
            "Fee waivers are filed on the state's standard form.",
            "Cook County court reporters are booked by the parties, not the court.",
            "The court's zoom hearings need the case number as the display name.",
            "Arbitration cases under a set amount go to the mandatory arbitration program.",
            "Orders in Cook County are drafted by the winning side and given to the judge the same day.",
            "Cook County judges rotate calendars each December, so we check who has each case.",
            "Courtroom 2005 at the Daley Center hears the commercial calendar.",
          ],
        },
        {
          label: "Judges",
          chats: ["Notes on our judges", "Hearing prep notes", "Judge preferences", "Courtroom notes"],
          lines: [...judgeLines, "We keep notes on each judge after every hearing.", "Theo checks each judge's standing order before every filing."],
        },
        {
          label: "Filing checklists",
          chats: ["Filing checklist", "Docketwise setup", "Service of process", "Filing deadlines"],
          lines: [
            "Every filing is proofread by someone who did not write it.",
            "Deadlines are entered in Docketwise the day they are set.",
            "Docketwise Practice holds the firm's calendar, time and billing.",
            "Ferris Process Service serves papers in Cook and the collar counties.",
            "Ferris sends proof of service within two days.",
            "Exhibits are labeled and bookmarked before a brief is filed.",
            "We file by 5 pm when we can, never at the last minute.",
            "Each filing is saved to the matter folder with the court's stamp.",
            "Two people check every deadline that ends a right, such as an appeal.",
            "Certificates of service list every lawyer on the service list.",
            "Theo confirms every hearing date with the court the week before.",
            "Filing fees are paid from the firm's court account and billed to the matter.",
            "Every exhibit over ten pages gets a cover page with its number.",
            "Filings in more than one court are tracked on one sheet per matter.",
            "A filing goes out only after the partner on the matter has read the final version.",
            "Redactions are checked by a second person before any public filing.",
            "Docketwise sends a reminder seven days and two days before each deadline.",
          ],
        },
      ],
      loose: {
        chats: ["Court notes", "Hearing notes"],
        lines: ["Lawyers arrive at court 30 minutes before any hearing.", "We bring three copies of every exhibit to a hearing.", "Appeals are calendared the day a final order is entered."],
      },
    },
    {
      key: "writing",
      label: "Writing",
      folders: [
        {
          label: "Briefs",
          chats: ["Brief writing notes", "Editing my brief", "Style for the reply brief", "Firm style guide"],
          lines: [
            ["style", "Cite the record for every fact in a brief."],
            ["style", "Keep headings as full sentences that argue the point."],
            ["style", "Use the client's name, never the word plaintiff, in our own briefs."],
            ["style", "Put the standard of review in one short paragraph."],
            ["style", "Open with the answer the court should give, then the reasons."],
            ["style", "Keep paragraphs to four sentences or fewer."],
            ["style", "Quote the contract's own words when the case turns on them."],
            ["style", "Use active verbs and name who did what."],
            ["style", "End every brief with exactly what we ask the court to order."],
            ["style", "Cut any sentence that does not move the argument."],
            ["style", "Tables of authorities are built last, after the cites are checked."],
            ["style", "Reply briefs answer the other side's best point first."],
            ["style", "Use short quotes and put the key words in the sentence itself."],
            ["style", "Name the exhibit and the page for every quote from the record."],
            ["style", "Write dates as month and day, with the year only when it matters."],
          ],
        },
        {
          label: "Client letters",
          chats: ["Client letter template", "Case update email", "Writing to clients", "Monthly report format"],
          lines: [
            "Client letters lead with what happened and what it means for them.",
            "Updates to clients stay under one page.",
            "Every client update ends with the next date and what we need from them.",
            "We explain legal terms the first time they appear.",
            "Bad news goes to the client by phone first, then in writing.",
            "Monthly case reports use three points and the next deadline.",
            "Letters to clients never guess at a result.",
            "Settlement offers are sent to the client the same day we get them.",
            "Engagement letters name who may approve a settlement.",
            "Closing letters list what we did and what the client should keep.",
            "We copy only the people the client has named on each matter.",
            "Emails to clients put the decision we need in the subject line.",
            "Letters to opposing counsel are short, polite and on the record.",
            "Every letter is read by the partner on the matter before it goes out.",
            "We avoid Latin in letters to clients.",
            "Fee estimates in letters give a range and say what would change it.",
            "Letters that close a matter thank the client and name the next step, if any.",
          ],
        },
        {
          label: "Templates",
          chats: ["Template library", "Updating templates", "Engagement letter template", "Litigation hold template"],
          lines: [
            "The engagement letter template has a section for who may approve a settlement.",
            "The litigation hold template lists phones and text messages.",
            "Our motion template puts the relief asked for on the first page.",
            "The deposition notice template has a line for remote attendance.",
            "The NDA template is mutual unless the client asks for one way.",
            "Templates live in the document system, never on a desktop.",
            "The demand letter template gives the other side 14 days to answer.",
            "Every template has an owner who updates it once a year.",
            "The privilege log template has columns for date, author, recipients and basis.",
            "The settlement agreement template includes a mutual release and no admission.",
            "The lease abstract template fits on one page.",
            "The case budget template splits fees by phase of the case.",
            "The closing checklist template has a line for every signature and its signer.",
            "The cease and desist template names the mark, the use and a date to stop.",
            "The engagement letter template is updated each January with the new rates.",
            "The client update template has three parts: what happened, what is next, what we need.",
          ],
        },
        {
          label: "Motions",
          chats: ["Motion practice notes", "Motion to compel steps", "Summary judgment notes", "Motion drafting"],
          lines: [
            "A motion to compel starts with a meet and confer letter that lists each request.",
            "Summary judgment motions need a statement of facts with record cites.",
            "Motions to dismiss lead with the strongest ground, not every ground.",
            "Every motion has a proposed order attached.",
            "Motions for extension say how many times one was asked before.",
            "We file a motion only after the partner agrees it is worth the cost.",
            "Motions in limine are filed together, one issue to each.",
            "A motion for fees needs time records and a statement of the rates.",
            "Protective orders follow the court's model order when it has one.",
            "Emergency motions need a call to chambers first.",
            "Motion deadlines are counted from the day of service, not the day of filing.",
            "A reply in support of a motion stays under half the length of the motion.",
            "Motions to seal explain why each page must stay private.",
            "Every motion cites the local rule that allows it.",
            "Motions to reconsider are rare and need a new fact or a clear error.",
            "Briefing schedules are agreed with the other side before we ask the court.",
          ],
        },
      ],
      loose: {
        chats: ["Writing notes"],
        lines: [["style", "Say the date and the day of the week for anything due."], ["style", "Spell out a number under ten unless it is a date or an amount."]],
      },
    },
    {
      key: "people",
      label: "People",
      folders: [
        {
          label: "Opposing counsel",
          chats: ["Notes on opposing counsel", "Meet and confer notes", "Letters from the other side", "Working with other firms"],
          lines: [...counselLines, "We keep a short note on each firm after every case.", "Any threat from the other side goes to the partner the same day."],
        },
        {
          label: "Expert witnesses",
          chats: ["Expert witness list", "Expert retention steps", "Expert report review", "Finding an expert"],
          lines: [
            "Owen keeps the master list of expert witnesses.",
            "Meridian Expert Network finds experts for trucking and construction cases.",
            "Meridian sends three names within a week of a request.",
            "Dr. Lena Moravec is our usual expert on freight and dispatch systems.",
            "Paul Sandoval is a forensic accountant who has testified for us four times.",
            "Dr. Irene Castile reviews building defects and water damage.",
            "Experts sign a retention letter that names the firm, not the client, as the one who hires them.",
            "Every expert is checked for past testimony against our clients.",
            "Draft expert reports are shared by phone, not by email.",
            "Experts get the protective order before they see any documents.",
            "We ask each expert for a budget before work starts.",
            "Rebuttal experts are lined up before the other side's reports are due.",
            "Experts are prepared for deposition in two sessions.",
            "Marta Quill is our usual expert on wage and hour records.",
            "Kevin Ostrander reviews pharmacy compliance for health clients.",
            "Experts are paid only for hours they bill, never for a result.",
            "Each expert's CV is checked for gaps before we name them.",
          ],
        },
        {
          label: "Mediators",
          chats: ["Mediator notes", "Choosing a mediator", "Mediation prep", "Mediation scheduling"],
          lines: [
            "Judge Carol Ames, retired, mediates our larger commercial cases.",
            "Peter Lindgren mediates employment cases and moves fast.",
            "Rita Navarro is the mediator we use for real estate disputes.",
            "Judge Ames books three months out, so we ask early.",
            "Mediators get a confidential brief a week before the session.",
            "We split the mediator's fee with the other side unless the client agrees otherwise.",
            "Lindgren likes both sides in one room for the first hour.",
            "Navarro wants a short list of the deal points before the day.",
            "A mediation day needs the client's decision maker there in person.",
            "We bring a draft term sheet to every mediation.",
            "Half day sessions work for cases with one issue.",
            "We keep notes on what each mediator asked for and what settled.",
            "Lindgren sends a mediator's proposal when the day ends without a deal.",
            "Navarro works from her office in Evanston and asks for parking details for clients.",
            "Mediation statements are marked confidential and kept out of the court file.",
            "We send the client a one page summary of the case the day before mediation.",
          ],
        },
        {
          label: "Court reporters",
          chats: ["Lakeline setup", "Court reporting contract", "Interpreter booking", "Translation requests"],
          lines: [
            "Lakeline Court Reporting covers every deposition in the Chicago area.",
            "Lakeline needs exhibits two days before a deposition.",
            "Rough transcripts from Lakeline arrive the same evening.",
            "We switched court reporting to one vendor for the whole firm.",
            "Northshore Translation handles Spanish and Polish documents.",
            "Certified translations from Northshore take a week.",
            "Interpreters for depositions are booked through Northshore two weeks ahead.",
            "Video depositions need the videographer booked with the reporter.",
            "Lakeline bills the firm, and we pass the cost to the matter.",
            "Remote depositions use Lakeline's video room and an exhibit share.",
            "Final transcripts from Lakeline take ten business days.",
            "Errata sheets go back to Lakeline within 30 days.",
            "Ferris Process Service also serves subpoenas on banks and phone companies.",
            "Lakeline sends a reporter who knows trucking terms when we ask.",
            "Exhibit stickers come from Lakeline in each deposition kit.",
            "Northshore needs the documents in Word or a searchable PDF.",
          ],
        },
      ],
      loose: {
        chats: ["People notes"],
        lines: ["Thank you notes go to every outside expert after a case closes.", "We ask clients before we share their documents with any outside person."],
      },
    },
    {
      key: "growth",
      label: "Business development",
      folders: [
        {
          label: "Referral sources",
          chats: ["Referral sources", "Thank you notes for referrals", "Referral lunch planning", "Who sends us work"],
          lines: [
            "Most new litigation clients come from accountants and other lawyers.",
            "Each referral gets a thank you note from the partner within a week.",
            "Daniel has lunch with the firm's top ten referral sources each year.",
            "Tom Brady at Brady & Kuhn CPA has sent us six clients in two years.",
            "We never pay for referrals, and we say so when asked.",
            "Banks in the western suburbs send us small business disputes.",
            "Lena gets most of her closings from two title officers in Naperville.",
            "Marcus speaks at the Illinois Restaurant Association each spring.",
            "Referrals we cannot take go to firms we trust, with a call first.",
            "We track where each new matter came from in Docketwise.",
            "Insurance brokers refer employment claims when coverage is unclear.",
            "Former associates now in house send us overflow work.",
            "Bar association committees are where Grace meets most referral sources.",
            "Every referral source hears how the matter ended, if the client agrees.",
            "Health care referrals mostly come from Clara's former colleagues at the state.",
            "We send a holiday card to every referral source, signed by hand.",
            "Owen keeps in touch with the in house lawyers he trained with.",
            "A new referral source gets a call from the partner within a day.",
          ],
        },
        {
          label: "Pitches",
          chats: ["Pitch deck for a new client", "Proposal for panel counsel", "Pitch follow up", "Fee proposal"],
          lines: [
            "Pitches lead with the client's problem, not the firm's history.",
            "Every proposal names who will do the work and their rates.",
            "We bring one partner and the associate who would run the matter.",
            "Fee proposals offer a budget by phase and a cap when it makes sense.",
            "Panel counsel applications for insurers take about two months.",
            "We keep three short case stories for each practice area to use in pitches.",
            "Proposals stay under five pages.",
            "We follow up on every pitch within a week, win or lose.",
            "A lost pitch gets a call to ask what would have changed the answer.",
            "Daniel approves any discount over a tenth before it is offered.",
            "Requests for proposals from companies need a conflicts check first.",
            "Pitch decks use the firm's colors and no stock photos.",
            "We send a short thank you after every pitch meeting.",
            "Alternative fees are offered for matters with a clear scope.",
            "Grace has the final say on litigation pitches.",
          ],
        },
        {
          label: "Client alerts",
          chats: ["Client alert drafts", "Newsletter planning", "Alert on the new noncompete law", "Website articles"],
          lines: [
            "Client alerts go out within a week of a big change in the law.",
            "Alerts fit on one page and end with what a client should do.",
            "The quarterly newsletter goes to every client and referral source.",
            "Marcus writes the employment alerts, and Lena writes the real estate ones.",
            "Every alert is read by a partner before it goes out.",
            "We post each alert on the website and on the firm's page.",
            "Alerts never discuss a client's case.",
            "The noncompete alert drew more calls than any other this year.",
            "We send alerts on Tuesday mornings, when they get read most.",
            "Our mailing list is kept in the firm's email tool, not a spreadsheet.",
            "A short alert on the new paid leave law went out in January.",
            "Hana writes a trademark alert each spring on new filing fees.",
            "Readers can reply to an alert, and Joy routes the replies.",
            "Each alert lists the lawyer to call with questions.",
          ],
        },
        {
          label: "Events",
          chats: ["Client seminar planning", "Bar events calendar", "Speaking requests", "Sponsorships"],
          lines: [
            "The firm hosts a client seminar on employment law each spring.",
            "Grace chairs a committee of the Chicago Bar Association.",
            "We sponsor the Oak Park small business awards each year.",
            "Speaking requests go to the partner who leads that practice.",
            "Seminars are held in the firm's large conference room for up to 40 guests.",
            "Every event ends with a short survey for guests.",
            "Lawyers may attend two bar dinners a year on the firm.",
            "The real estate breakfast for brokers is in May.",
            "Event slides go to guests the next day.",
            "We sponsor one law school event each year.",
            "Joy keeps the list of who came to each event.",
            "Nina speaks to the young lawyers section on depositions this winter.",
          ],
        },
      ],
      loose: {
        chats: ["Marketing notes"],
        lines: ["The firm's website lists every lawyer with a short plain bio.", "Marketing spend is reviewed by the partners each quarter.", "Client wins are posted only with the client's written consent."],
      },
    },
    {
      key: "plans",
      label: "Plans and deadlines",
      folders: [
        {
          label: "Firm calendar",
          chats: ["Firm calendar", "Holiday schedule", "Partner meeting dates", "Office events"],
          lines: [
            ["event", "The partners' budget meeting is on {d}.", 22],
            ["event", "The firm holiday party is on {d} at the Chicago Athletic Club.", 45],
            ["event", "The annual partner retreat in Lake Geneva starts {d}.", 60],
            ["task", "Rate letters for next year go to every client by {d}.", 24],
            ["event", "The office is closed from {d} through New Year's Day.", 57],
            ["task", "Year end time must be entered by {d}.", 63],
            "Partner meetings are on the first Tuesday of each month.",
            "The litigation team lunch is the third Thursday of each month.",
            ["event", "The first all hands of the new year is on {d}.", 68],
            "Associate reviews happen in December, with raises in January.",
            ["task", "Conflicts list cleanup for the year is due {d}.", 35],
            "Summer associates start the second week of June.",
            "The office runs on reduced hours the Friday after Thanksgiving.",
            ["event", "The litigation team planning day for next year is on {d}.", 47],
            "Daniel sends the firm calendar for the next year in early December.",
            ["task", "Malpractice insurance forms go to the broker by {d}.", 33],
            "Partners close the books on the last business day of each month.",
            "The firm photo for the website is taken each spring.",
          ],
        },
        {
          label: "Training",
          chats: ["CLE planning", "Associate training", "Training calendar", "Lunch and learn topics"],
          lines: [
            "Illinois lawyers need 30 hours of CLE every two years.",
            ["task", "Associates must finish their CLE hours by {d}.", 40],
            "Each associate takes one deposition skills course in their first two years.",
            "Lunch and learn sessions run on the last Friday of each month.",
            ["event", "The next lunch and learn on e-discovery is on {d}.", 30],
            "Every new lawyer shadows two depositions before taking one.",
            "Grace runs a brief writing workshop for first year associates.",
            "The firm pays for one outside course a year for each paralegal.",
            "Diversity and sexual harassment CLE hours are required for every lawyer.",
            "Trial skills training uses a mock trial with a real judge as the bench.",
            "Victor runs security training for every new hire in the first week.",
            ["event", "Marcus gives the handbook update talk on {d}.", 51],
            "Associates present one case each quarter at the litigation lunch.",
            "New partners get a week of training on billing and client care.",
            "Every lawyer reads the firm's ethics refresher each January.",
            "Paralegals train on Docketwise in their first month.",
          ],
        },
        {
          label: "Hiring",
          chats: ["Hiring plan", "Lateral associate search", "Paralegal hiring", "Interview loop"],
          lines: [
            "We are hiring two litigation associates with three to five years in practice.",
            "We decided to hire a second paralegal for employment work.",
            "Interviews have a writing sample and a meeting with two partners.",
            ["task", "Offers for the summer program go out by {d}.", 38],
            "Lateral hires go through the conflicts check before an offer.",
            "Every candidate meets one associate without a partner in the room.",
            "Recruiting fees for laterals are capped by agreement with the recruiter.",
            "New hires get a mentor outside their own practice group.",
            "References are called by the partner who will supervise the hire.",
            "The paralegal job posting goes up on the state bar's job board.",
            "Start dates avoid the last two weeks of December.",
            "Each hire's first week is planned before they start.",
            "We post every open job on the firm's website first.",
            "Hiring partners meet on Wednesdays during recruiting season.",
            "Every new associate gets a written plan for the first 90 days.",
            "Law school career offices get our summer program dates in September.",
          ],
        },
        {
          label: "Firm priorities",
          chats: ["Firm priorities for the year", "Partner retreat notes", "Growth plan", "Practice group goals"],
          lines: [
            ["decision", "We decided to bill research time only when the client approves it."],
            "Growing the employment group is the firm's first goal for next year.",
            "We want every client to hear from us at least once a month.",
            "The firm aims to cut the time from invoice to payment to 45 days.",
            ["decision", "We decided to open a second conference room for remote depositions."],
            "Real estate wants one more partner within two years.",
            "We plan to publish a short client alert each quarter.",
            "The intellectual property group will add brand watch services for every client.",
            ["decision", "We decided to renew the office lease for five more years."],
            "Partners agreed to review every matter budget each quarter.",
            "We want more work from referrals by other firms in the suburbs.",
            "We plan to move to a paperless office by the end of next year.",
            "Partners want associates on their feet in court within two years.",
            "The firm aims to answer every new client inquiry within one day.",
            "We will review each practice group's rates against the market next spring.",
          ],
        },
      ],
      loose: {
        chats: ["Plans notes"],
        lines: [["task", "The firm's malpractice insurance renewal is due {d}.", 54], "Every deadline that ends a right is checked by two people."],
      },
    },
  ];
}

export type Roster = {
  /** The firm's other clients, as Settings and Cori list them. */
  clients: Array<{ key: string; name: string; aliases: string[]; domains: string[]; status: "active" | "paused" }>;
  clientThings: Thing[];
  /** Coworkers to plant in the firm's team folder. */
  people: Thing[];
  /** More lines on the clients the film names, by client key. */
  named: Record<string, Line[]>;
  /** The firm's memory by section, Company first, each with its folders. */
  sections: SectionSpec[];
};

export function roster(now: number): Roster {
  const rng = Rng.derive(SEED, "legal-roster");
  const x: X = {
    rng,
    on: (days) => dayName(now, days),
    judge: () => rng.pick(JUDGES),
    counsel: () => rng.pick(COUNSEL),
    year: (back) => new Date(now).getUTCFullYear() - back,
    month: (days) => {
      const d = new Date(now + days * 86_400_000);
      return `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    },
  };
  const people: Thing[] = MORE_WORKERS.map((w) => ({
    label: w.name,
    kind: "person",
    key: w.key,
    subject: true,
    values: [["email", `${w.name.split(" ")[0]!.toLowerCase()}.${w.name.split(" ")[1]!.toLowerCase()}@whitlockrhee.com`], ["role", w.role]],
    lines: w.lines.map((text) => ({ text, topic: [w.topic, `Notes on ${w.name.split(" ")[0]}`] })),
  }));
  const clientThings = CLIENTS.map((c) => clientThing(c, x));
  return {
    clients: CLIENTS.map((c) => ({ key: c.key, name: c.name, aliases: [c.short], domains: [c.domain], status: c.status ?? "active" })),
    clientThings,
    people,
    named: NAMED_MORE as Record<string, Line[]>,
    sections: sections(Rng.derive(SEED, "legal-sections")),
  };
}
