import type { IdentityValueView } from "@coere/memory";
import { Rng } from "@v2/tools/gen-corpus/rng";
import { dayName, type Line, type Thing } from "./grow";

/**
 * Northbeam Labs at its real size: the other clients the studio builds
 * for, each with its people, its projects (their stack and decisions in
 * folders of their own) and what the team's chats said about it, slot by
 * slot, and the studio's own practices, policies, decisions, vendors and
 * engineers. The lines are written from templates in an engineering
 * team's own words and filled from the clients below by a seeded stream,
 * so the firm is the same every time it is built. Every company name is
 * made up; the languages and databases are the open source ones teams
 * use. No line names Halcyon or the Ledger API, or the film's other
 * featured clients, so the client sheet, the update's context and Cori's
 * answer on the stack stay as they are.
 */

const SEED = 0x7ec4;

type Project = { label: string; about: string; stack: [lang: string, db: string, infra: string]; step: string };
type ClientDef = { key: string; name: string; short: string; domain: string; what: string; city: string; since: number; contacts: Array<[string, string]>; projects: Project[] };

/** The studio's other clients: who they are, their people, and the projects the team builds for them, each with its stack and its next dated step. */
const CLIENTS: ClientDef[] = [
  { key: "tidepool", name: "Tidepool Robotics", short: "Tidepool", domain: "tidepoolrobotics.com", what: "builds robots that clean solar panels", city: "Oakland", since: 2022, contacts: [["Wren Castillo", "VP of engineering"], ["Arash Farahani", "firmware lead"]], projects: [{ label: "Fleet dashboard", about: "a dashboard that shows every robot's battery and route", stack: ["TypeScript and React", "Postgres", "Kubernetes"], step: "The fleet dashboard beta ships on {d}." }, { label: "Robot telemetry pipeline", about: "moving robot telemetry into one store", stack: ["Rust", "ClickHouse", "Kafka"], step: "The telemetry pipeline cutover is on {d}." }] },
  { key: "marigold", name: "Marigold Learning", short: "Marigold", domain: "marigoldlearning.com", what: "makes reading apps for primary schools", city: "Portland", since: 2021, contacts: [["Hattie Brooks", "head of product"], ["Dev Mehta", "engineering manager"]], projects: [{ label: "Classroom app rewrite", about: "rewriting the teacher app for tablets", stack: ["Kotlin and Swift", "SQLite", "a small sync service"], step: "The classroom app goes to the app stores on {d}." }] },
  { key: "kelpie", name: "Kelpie Insurance", short: "Kelpie", domain: "kelpieinsure.com", what: "sells pet insurance online", city: "Denver", since: 2020, contacts: [["Morgan Shah", "CTO"], ["Lucy Adair", "claims product owner"]], projects: [{ label: "Claims portal", about: "letting owners file a claim with a photo of the vet bill", stack: ["Python and Django", "Postgres", "Kubernetes"], step: "The claims portal launches on {d}." }, { label: "Quote engine", about: "pricing a policy in under a second", stack: ["Go", "Redis", "Kubernetes"], step: "The new quote engine takes full traffic on {d}." }] },
  { key: "fernway", name: "Fernway Grocers", short: "Fernway", domain: "fernwaygrocers.com", what: "runs forty grocery stores in the Northwest", city: "Tacoma", since: 2019, contacts: [["Carl Jensen", "director of digital"], ["Mina Park", "ecommerce manager"]], projects: [{ label: "Click and collect", about: "online orders picked in store", stack: ["TypeScript and Node", "Postgres", "serverless functions"], step: "Click and collect opens in ten more stores on {d}." }] },
  { key: "quarrystone", name: "Quarrystone Bank", short: "Quarrystone", domain: "quarrystonebank.com", what: "is a community bank with twelve branches", city: "Boise", since: 2023, contacts: [["Elliot Varga", "CIO"], ["Pam Okoye", "security officer"]], projects: [{ label: "Mobile banking app", about: "a new app for checking, savings and transfers", stack: ["Kotlin and Swift", "Postgres", "the bank's private cloud"], step: "The security review of the mobile app is due {d}." }] },
  { key: "brambleway", name: "Brambleway Clinics", short: "Brambleway", domain: "brambleway.health", what: "runs physical therapy clinics in three states", city: "Spokane", since: 2022, contacts: [["Dr. Joan Ferris", "medical director"], ["Tyler Ng", "IT manager"]], projects: [{ label: "Booking service", about: "letting patients book and move visits online", stack: ["Elixir and Phoenix", "Postgres", "two cloud regions"], step: "The booking service goes live on {d}." }] },
  { key: "cinderline", name: "Cinderline Games", short: "Cinderline", domain: "cinderline.gg", what: "makes a multiplayer farming game", city: "Seattle", since: 2024, contacts: [["Rory Blake", "studio head"], ["Yuki Sato", "backend lead"]], projects: [{ label: "Matchmaking service", about: "matching players into farms of four", stack: ["Go", "Redis", "Kubernetes"], step: "The matchmaking load test is due {d}." }, { label: "Player accounts", about: "one account across phone and PC", stack: ["TypeScript and Node", "Postgres", "Kubernetes"], step: "Account linking ships on {d}." }] },
  { key: "solvent", name: "Solvent Energy Co-op", short: "Solvent", domain: "solventenergy.coop", what: "is a community solar co-op with nine thousand members", city: "Eugene", since: 2021, contacts: [["Gail Hruska", "general manager"], ["Ivan Petrov", "data lead"]], projects: [{ label: "Member billing", about: "monthly credits for each member's share of the panels", stack: ["Python", "Postgres", "a single VM per region"], step: "The new billing run starts on {d}." }] },
  { key: "pennant", name: "Pennant Sports", short: "Pennant", domain: "pennantsports.com", what: "sells tickets for minor league baseball teams", city: "Sacramento", since: 2020, contacts: [["Josh Varner", "CTO"], ["Clara Diaz", "product manager"]], projects: [{ label: "Ticket checkout", about: "a faster checkout for game day", stack: ["TypeScript and React", "Postgres", "Kubernetes"], step: "The new checkout must be live for opening day prep on {d}." }] },
  { key: "atlasfold", name: "Atlasfold Maps", short: "Atlasfold", domain: "atlasfold.io", what: "makes trail maps for park services", city: "Bozeman", since: 2023, contacts: [["Nils Aho", "founder"], ["Bea Romero", "GIS lead"]], projects: [{ label: "Offline map tiles", about: "maps that work with no signal on the trail", stack: ["Rust", "SQLite", "a tile CDN"], step: "Offline tiles ship in the app on {d}." }] },
  { key: "harborline", name: "Harborline Shipping", short: "Harborline", domain: "harborlineshipping.com", what: "runs container barges up the river", city: "Longview", since: 2018, contacts: [["Dale Kerrigan", "COO"], ["Ama Boateng", "IT director"]], projects: [{ label: "Berth scheduler", about: "booking barge slots at four docks", stack: ["Java and Spring", "Postgres", "the client's own data center"], step: "The berth scheduler pilot starts on {d}." }] },
  { key: "lumenhive", name: "Lumenhive", short: "Lumenhive", domain: "lumenhive.app", what: "makes a budgeting app for freelancers", city: "Austin", since: 2024, contacts: [["Tasha Green", "CEO"], ["Pablo Ruiz", "lead engineer"]], projects: [{ label: "Bank sync", about: "pulling transactions from members' banks each night", stack: ["Go", "Postgres", "Kubernetes"], step: "Bank sync leaves beta on {d}." }, { label: "Tax estimate feature", about: "a quarterly tax estimate for each member", stack: ["Python", "Postgres", "serverless functions"], step: "The tax estimate feature ships on {d}." }] },
  { key: "greywater", name: "Greywater Utilities", short: "Greywater", domain: "greywaterutil.org", what: "runs water and sewer for three towns", city: "Olympia", since: 2019, contacts: [["Frances Lowe", "operations director"], ["Ken Iwata", "SCADA engineer"]], projects: [{ label: "Meter reading app", about: "reading smart meters into the billing system", stack: ["C# and .NET", "SQL Server", "the utility's own servers"], step: "Meter reading moves to the new app on {d}." }] },
  { key: "vellum", name: "Vellum Press", short: "Vellum", domain: "vellumpress.com", what: "publishes a news site and three podcasts", city: "Portland", since: 2020, contacts: [["Isaac Stern", "editor in chief"], ["Lena Hoff", "product lead"]], projects: [{ label: "Paywall rebuild", about: "a metered paywall with a free article a week", stack: ["TypeScript and Node", "Redis", "a CDN edge function"], step: "The new paywall goes live on {d}." }] },
  { key: "orchard", name: "Orchard Health Plans", short: "Orchard", domain: "orchardhealthplans.com", what: "runs Medicare plans in two states", city: "Salem", since: 2021, contacts: [["Dr. Ruth Amari", "chief medical officer"], ["Glen Foster", "data platform lead"]], projects: [{ label: "Claims data warehouse", about: "one warehouse for claims from every payer", stack: ["Python and dbt", "a cloud warehouse", "Airflow"], step: "The warehouse audit is due {d}." }] },
  { key: "kindling", name: "Kindling Childcare", short: "Kindling", domain: "kindlingcare.com", what: "runs twenty daycare centers", city: "Boise", since: 2022, contacts: [["Abby Tran", "COO"], ["Marco Silva", "IT lead"]], projects: [{ label: "Parent app", about: "photos, check in and bills for parents", stack: ["Flutter", "Postgres", "Kubernetes"], step: "The parent app update ships on {d}." }] },
  { key: "ridgeback", name: "Ridgeback Outfitters", short: "Ridgeback", domain: "ridgebackoutfitters.com", what: "sells camping gear online and in five stores", city: "Bend", since: 2019, contacts: [["Sean Murphy", "head of ecommerce"], ["Ines Moreno", "operations manager"]], projects: [{ label: "Inventory sync", about: "one stock count across the stores and the website", stack: ["Go", "Postgres", "Kafka"], step: "Inventory sync covers all five stores by {d}." }] },
  { key: "pacifica", name: "Pacifica Labs", short: "Pacifica", domain: "pacificalabs.bio", what: "runs genetic tests for clinics", city: "San Diego", since: 2023, contacts: [["Dr. Omar Qureshi", "lab director"], ["Erin Walsh", "software lead"]], projects: [{ label: "Lab results API", about: "sending results to clinics in a standard format", stack: ["Kotlin", "Postgres", "Kubernetes"], step: "The results API certification is due {d}." }] },
  { key: "foxglove", name: "Foxglove Hotels", short: "Foxglove", domain: "foxglovehotels.com", what: "owns six boutique hotels", city: "San Francisco", since: 2021, contacts: [["Celine Moreau", "VP of guest experience"], ["Raj Bhatia", "IT manager"]], projects: [{ label: "Room key app", about: "phone keys for every room", stack: ["Swift and Kotlin", "Postgres", "serverless functions"], step: "Phone keys go live in the last two hotels on {d}." }] },
  { key: "copperkettle", name: "Copper Kettle Coffee", short: "Copper Kettle", domain: "copperkettle.coffee", what: "roasts coffee and runs a subscription", city: "Seattle", since: 2022, contacts: [["Liam Walsh", "founder"], ["Nadia Haddon", "operations lead"]], projects: [{ label: "Subscription service", about: "pausing, skipping and gifting coffee subscriptions", stack: ["Ruby on Rails", "Postgres", "a single region cloud"], step: "The gift subscriptions launch on {d}." }] },
  { key: "nimbus", name: "Nimbus Air Charter", short: "Nimbus", domain: "nimbusair.com", what: "flies charter planes from four airports", city: "Reno", since: 2024, contacts: [["Grant Odell", "director of operations"], ["Faye Lin", "IT lead"]], projects: [{ label: "Crew scheduling", about: "crew rosters that respect rest rules", stack: ["Python", "Postgres", "Kubernetes"], step: "The crew scheduler runs in parallel from {d}." }] },
  { key: "wildrye", name: "Wildrye Bakeries", short: "Wildrye", domain: "wildrye.com", what: "bakes bread for cafes and grocery stores", city: "Portland", since: 2020, contacts: [["Josie Kim", "owner"], ["Hector Diaz", "operations manager"]], projects: [{ label: "Wholesale ordering", about: "cafes ordering the next day's bread by 8 pm", stack: ["TypeScript and Node", "Postgres", "serverless functions"], step: "Wholesale ordering opens to all cafes on {d}." }] },
];

const FIRST = (name: string) => name.replace(/^Dr\. /, "").split(" ")[0]!;
const pick = <T>(rng: Rng, items: readonly T[], n: number): T[] => rng.shuffle([...items]).slice(0, n);

type X = { rng: Rng; on: (days: number) => string; month: (days: number) => string };

const ENGINEERS = ["Leo Grant", "Ana Ruiz", "Tess Morgan", "Diego Alvarez", "Nora Lind", "Kofi Mensah", "Sam"];

/** A project's own lines, its stack and decisions in folders of their own, and the dated line its client's slots keep. */
function projectLines(c: ClientDef, p: Project, x: X): { own: Line[]; stack: Line[]; decisions: Line[]; slots: Line[] } {
  const t = {
    plan: [`${c.short} ${p.label.toLowerCase()}`, `${p.label} design doc`, `${p.label} questions`, `${p.label} kickoff`],
    stack: [`${p.label} stack`, `${p.label} setup`, `${p.label} deploy`],
    decide: [`${p.label} decisions`, `${p.label} architecture review`, `${p.label} tradeoffs`],
    dates: [`${p.label} timeline`, `${p.label} release plan`],
  };
  const [lang, db, infra] = p.stack;
  const due = x.rng.int(20, 80);
  const own: Line[] = [
    { text: `The ${p.label.toLowerCase()} for ${c.short} is about ${p.about}.`, topic: t.plan },
    { text: `${x.rng.pick(ENGINEERS)} is the lead engineer on the ${c.short} ${p.label.toLowerCase()}.`, topic: t.plan },
    ...pick(x.rng, [
      { text: `The ${p.label.toLowerCase()} has ${x.rng.pick(["two", "three", "four"])} engineers from Northbeam and one from ${c.short}.`, topic: t.plan },
      { text: `${c.short} wants the ${p.label.toLowerCase()} demoed every second Friday.`, topic: t.plan },
      { text: `The ${p.label.toLowerCase()} tickets live in its own Linear project.`, topic: t.plan },
    ] as Line[], x.rng.int(0, 2)),
  ];
  const stack: Line[] = [
    { text: `The ${c.short} ${p.label.toLowerCase()} is ${lang} on ${db}.`, topic: t.stack },
    { text: `The ${p.label.toLowerCase()} runs on ${infra}, with staging and production kept apart.`, topic: t.stack },
    ...pick(x.rng, [
      { text: `Deploys for the ${p.label.toLowerCase()} go out from the main branch after review.`, topic: t.stack },
      { text: `Errors from the ${p.label.toLowerCase()} go to Tracewell with the release tag.`, topic: t.stack },
      { text: `Secrets for the ${p.label.toLowerCase()} live in the vault, never in the repo.`, topic: t.stack },
    ] as Line[], x.rng.int(0, 2)),
  ];
  const decisions: Line[] = pick(x.rng, [
    { text: `We decided the ${p.label.toLowerCase()} keeps one database and no read replicas for now.`, topic: t.decide, kind: "decision" },
    { text: `We decided every change to the ${p.label.toLowerCase()} ships behind a flag.`, topic: t.decide, kind: "decision" },
    { text: `We chose ${lang.split(" and ")[0]} for the ${p.label.toLowerCase()} because ${c.short}'s own team knows it.`, topic: t.decide, kind: "decision" },
    { text: `We decided the ${p.label.toLowerCase()} gets a load test before every big release.`, topic: t.decide, kind: "decision" },
  ] as Line[], x.rng.int(1, 2));
  const slots: Line[] = [{ text: p.step.replace("{d}", x.on(due)), topic: t.dates, slot: "deadlines", kind: "task", key: "due", due }];
  return { own, stack, decisions, slots };
}

/** One client: its folder, its people, its projects, and its lines by slot. */
function clientThing(c: ClientDef, x: X): Thing {
  const [k1, k2 = k1] = c.contacts;
  const f1 = FIRST(k1![0]);
  const f2 = FIRST(k2![0]);
  const p0 = c.projects[0]!;
  const topic = {
    intake: [`${c.short} kickoff`, `${c.short} discovery call`, `New client: ${c.short}`, `${c.short} statement of work`],
    call: [`${c.short} sync notes`, `Prep for ${f1} sync`, `Email to ${f1}`, `${c.short} weekly update`, `${c.short} standup notes`],
    money: [`${c.short} invoice`, `${c.short} retainer`, `${c.short} hours this month`],
    doc: [`${c.short} spec review`, `${c.short} RFC`, `${c.short} requirements`],
  };
  const d = x.rng.int(20, 70);
  const lines: Line[] = [
    { text: `${c.name} ${c.what}, based in ${c.city}.`, topic: topic.intake, slot: "overview", kind: "attribute", key: "client.industry" },
    { text: `${c.short} has been a Northbeam client since ${c.since}, and ${x.rng.pick(["Priya", "Ana", "Leo"])} owns the relationship.`, topic: topic.intake, slot: "relationship", kind: "attribute", key: "client.owner" },
    ...pick(x.rng, [
      { text: `We promised ${f1} a written plan for the next phase of the ${p0.label.toLowerCase()} by ${x.on(d)}.`, topic: topic.call, slot: "promises", kind: "task", key: "promise.what", due: d },
      { text: `I told ${f2} I would send the performance report by ${x.on(d + 5)}.`, topic: topic.call, slot: "promises", kind: "task", key: "promise.what", due: d + 5 },
      { text: `${c.short} agreed to give us access to their staging logs before ${x.on(d + 2)}.`, topic: topic.call, slot: "promises", kind: "task", key: "promise.what", due: d + 2 },
    ] as Line[], x.rng.int(1, 2)),
    { text: `${x.rng.pick(["Sprint review", "Architecture review", "Quarterly planning"])} with ${c.short} on ${x.on(d + 4)}.`, topic: topic.call, slot: "meetings", kind: "event", key: "meeting.when", due: d + 4 },
    ...pick(x.rng, [
      { text: `${f1} wants a short written update every Friday with any risk at the top.`, topic: topic.call, slot: "requests", key: "request.what" },
      { text: `${f2} asked that every schema change come with a rollback plan.`, topic: topic.doc, slot: "requests", key: "request.what" },
      { text: `${c.short} wants pull requests from Northbeam reviewed by one of their engineers.`, topic: topic.doc, slot: "requests", key: "request.what" },
      { text: `${f1} asked for a demo before anything goes to production.`, topic: topic.call, slot: "requests", key: "request.what" },
    ] as Line[], x.rng.int(1, 2)),
    x.rng.pick([
      { text: `${c.short} pays a monthly retainer, with extra hours billed at the end of the month.`, topic: topic.money, slot: "billing", kind: "attribute", key: "billing.terms" },
      { text: `${c.short} is billed by the sprint, every two weeks.`, topic: topic.money, slot: "billing", kind: "attribute", key: "billing.terms" },
      { text: `The ${p0.label.toLowerCase()} is a fixed bid, paid at each milestone.`, topic: topic.money, slot: "billing", kind: "attribute", key: "billing.terms" },
    ] as Line[]),
    ...(x.rng.chance(0.5) ? [{ text: `${f1} prefers ${x.rng.pick(["async updates in the shared channel", "calls before noon", "a written agenda before any meeting", "short emails with links"])}.`, topic: topic.call, slot: "preferences", kind: "preference", key: "client_pref.what" } as Line] : []),
    ...(x.rng.chance(0.5) ? [{ text: `Pasting the ${c.short} spec for the ${p0.label.toLowerCase()}: the users, the screens and what is out of scope.`, topic: topic.doc, slot: "documents", key: "document.what", basis: "pasted" } as Line] : []),
  ];
  const kids: Thing[] = c.contacts.map(([name, role], i) => ({
    label: name,
    kind: "person",
    key: `${c.key}-${i}`,
    values: [["email", `${FIRST(name).toLowerCase()}@${c.domain}`], ["role", role]] as Array<[IdentityValueView["field"], string]>,
    lines: [{ text: `${name} is the ${role} at ${c.short} and ${x.rng.pick(["signs off on releases", "runs their side of the sprint", "approves the invoices", "is our first call when something breaks", "reviews our pull requests"])}.`, topic: topic.intake, slot: "contacts", kind: "attribute", key: "contact.role" }],
  }));
  for (const p of c.projects) {
    const { own, stack, decisions, slots } = projectLines(c, p, x);
    lines.push(...slots);
    kids.push({
      label: p.label,
      kind: "project",
      lines: own,
      kids: [
        { label: `${p.label} stack`, kind: "folder", lines: stack },
        { label: `${p.label} decisions`, kind: "folder", lines: decisions },
      ],
    });
  }
  return { label: c.name, kind: "organization", client: c.key, aliases: [c.short, c.domain], subject: true, lines, kids };
}

/** The studio's engineers beyond the three the film names, as Settings lists them. */
export const MORE_WORKERS = [
  { key: "tess", topic: "Frontend guild notes", name: "Tess Morgan", team: "Engineering", role: "Frontend lead", lines: ["Tess Morgan leads frontend work and owns the design system.", "Tess reviews every new React component library before we use it."] },
  { key: "diego", topic: "Mobile release checklist", name: "Diego Alvarez", team: "Engineering", role: "Mobile lead", lines: ["Diego Alvarez leads mobile and handles app store reviews.", "Diego keeps the release checklist for iOS and Android."] },
  { key: "nora", topic: "Data platform notes", name: "Nora Lind", team: "Data", role: "Data engineer", lines: ["Nora Lind builds the data pipelines for client warehouses.", "Nora wants every pipeline to have a data quality check."] },
  { key: "kofi", topic: "SRE rotation", name: "Kofi Mensah", team: "Platform", role: "Site reliability engineer", lines: ["Kofi Mensah runs the on call rotation and the incident reviews.", "Kofi set the paging rules for every client project."] },
  { key: "hana", topic: "Design reviews", name: "Hana Ito", team: "Design", role: "Product designer", lines: ["Hana Ito designs the screens for client apps.", "Hana runs a design review before each sprint."] },
  { key: "ben", topic: "QA plan", name: "Ben Carter", team: "Engineering", role: "QA engineer", lines: ["Ben Carter writes the end to end tests for client apps.", "Ben keeps a device lab of six phones."] },
  { key: "ruth", topic: "Delivery management", name: "Ruth Abara", team: "Delivery", role: "Delivery manager", lines: ["Ruth Abara runs sprint planning for client teams.", "Ruth sends the weekly status notes to clients."] },
];

/** The studio's practices, each with how the team works there. */
const PRACTICES: Array<[string, string[]]> = [
  ["Backend", ["New backend services start in Go unless the client's team uses something else.", "Every service exposes a health check and a metrics endpoint.", "Database migrations run before the deploy, never during it.", "Background jobs must be safe to run twice."]],
  ["Frontend", ["We build web apps in TypeScript with strict mode on.", "Every page must work with a keyboard alone.", "Pages must load in under two seconds on a slow phone."]],
  ["Mobile", ["Mobile apps ship every two weeks unless a fix cannot wait.", "Crash free sessions must stay above 99.5 percent.", "We test on the oldest phone each client supports."]],
  ["Data", ["Pipelines are written as code and reviewed like any other change.", "Client data never leaves the client's own cloud account.", "Every table in a warehouse has an owner."]],
  ["Infrastructure", ["All infrastructure is written in Terraform.", "Staging mirrors production at a smaller size.", "Backups are restored as a test once a month."]],
];

const POLICIES: Array<[string, string[]]> = [
  ["Code review", ["Every change needs one review from outside the author's project.", "Reviews are answered within one working day.", "Large changes come with a short design note."]],
  ["Incident response", ["The first engineer on an incident is the lead until someone takes over.", "Clients hear about an incident within an hour.", "Every incident gets a blameless review within a week."]],
  ["Security", ["Laptops use full disk encryption and lock after five minutes.", "Client secrets live in the vault, never in chat or tickets.", "Access to client systems is removed the day a project ends."]],
  ["Remote work", ["The team overlaps from 10 am to 2 pm Pacific.", "Standups are written in the channel, not held as calls."]],
];

const DECISIONS = [
  "We decided to standardize on Postgres for new client projects.",
  "We decided to use Terraform for every client's infrastructure.",
  "We switched error tracking to Tracewell for all projects.",
  "We decided to stop taking fixed bid projects over six months.",
  "We decided every project gets a written architecture note in its first week.",
  "We decided to keep one on call rotation for all client projects.",
];

const VENDORS: Array<[string, string[]]> = [
  ["Tracewell", ["Tracewell is the error tracker for every client project.", "Tracewell alerts go to the shared on call channel."]],
  ["Keystone Pager", ["Keystone Pager wakes the on call engineer for any page.", "Keystone escalates to a second engineer after 15 minutes."]],
  ["Parcel CI", ["Parcel CI runs the tests and builds for every repo.", "Parcel CI keeps build logs for 30 days."]],
  ["Quillstack Docs", ["Quillstack Docs holds the design notes and runbooks.", "Each client gets its own space in Quillstack Docs."]],
  ["Brightgate Security", ["Brightgate Security runs a penetration test for each client launch.", "Brightgate reports go to the client's security lead first."]],
];

/** The studio's lines added to folders the film already has, by their labels. */
const MORE_IN: Record<string, string[]> = {
  "Runbooks and checklists": ["The release checklist asks for a rollback step on every deploy.", "The incident checklist starts with who is the lead."],
  "Tech stack": ["Web frontends are TypeScript and React.", "Mobile apps are native unless the client asks for Flutter."],
  "Technical decisions": ["We decided every public API is versioned in the path.", "We decided background jobs retry with backoff and a dead letter queue by default."],
  "How we work": ["Sprints are two weeks and end with a demo to the client.", "Pairing is encouraged for anything touching payments."],
  "Tools and systems": ["Design notes live in Quillstack Docs.", "CI runs on Parcel CI for every repo."],
  "How you want to come across": ["Keep pull request descriptions to what changed and why.", "Use plain words in client updates, no jargon."],
};

export type Roster = {
  clients: Array<{ key: string; name: string; aliases: string[]; domains: string[] }>;
  company: Thing[];
  people: Thing[];
  clientThings: Thing[];
  more: Record<string, Line[]>;
};

export function roster(now: number): Roster {
  const rng = Rng.derive(SEED, "technology-roster");
  const x: X = {
    rng,
    on: (days) => dayName(now, days),
    month: (days) => {
      const d = new Date(now + days * 86_400_000);
      return `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    },
  };
  const lower = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
  const folder = (label: string, lines: string[], topic: string[], kind?: Line["kind"]): Thing => ({ label, kind: "folder", lines: lines.map((text) => ({ text, topic, ...(kind ? { kind } : {}) })) });
  const company: Thing[] = [
    { label: "Practices", kind: "folder", kids: PRACTICES.map(([label, lines]) => folder(label, lines, [`${label} guild notes`, `${label} standards`, `${label} questions`])) },
    { label: "Policies", kind: "folder", kids: POLICIES.map(([label, lines]) => folder(label, lines, [`${label} policy`, `Updating the ${lower(label)} policy`])) },
    folder("Decisions", DECISIONS, ["Tech leads meeting", "Engineering all hands notes", "Tech radar review"], "decision"),
    { label: "Partners and vendors", kind: "folder", kids: VENDORS.map(([label, lines]) => ({ label, kind: "organization", subject: true, lines: lines.map((text) => ({ text, topic: [`${label.split(" ")[0]} setup`, `${label} questions`] })) })) },
  ];
  const people: Thing[] = MORE_WORKERS.map((w) => ({
    label: w.name,
    kind: "person",
    key: w.key,
    subject: true,
    values: [["email", `${w.name.split(" ")[0]!.toLowerCase()}@northbeamlabs.io`], ["role", w.role]] as Array<[IdentityValueView["field"], string]>,
    lines: w.lines.map((text) => ({ text, topic: [w.topic, `Notes on ${w.name.split(" ")[0]}`] })),
  }));
  const more = Object.fromEntries(
    Object.entries(MORE_IN).map(([label, lines]) => [
      label,
      lines.map((text) => ({ text, topic: label === "How you want to come across" ? ["How I write updates", "Pull request style"] : [`${label} notes`, `${label} questions`], ...(label === "How you want to come across" ? { kind: "style" as const } : {}) })),
    ]),
  );
  return {
    clients: CLIENTS.map((c) => ({ key: c.key, name: c.name, aliases: [c.short], domains: [c.domain] })),
    company,
    people,
    clientThings: CLIENTS.map((c) => clientThing(c, x)),
    more,
  };
}
