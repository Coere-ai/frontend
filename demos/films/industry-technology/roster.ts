import type { IdentityValueView } from "@coere/memory";
import { Rng } from "@v2/tools/gen-corpus/rng";
import { dayName, type Line, type SectionSpec, type Thing } from "./grow";

/**
 * Northbeam Labs at its real size: three more clients the studio builds
 * for, each with its people, its projects (their stack and decisions in
 * folders of their own) and what the team's chats said about it, slot by
 * slot; the engineers; and the rest of the studio's memory, section by
 * section, each with a few folders in an engineering team's own words.
 * Client lines are written from templates filled by a seeded stream, so
 * the firm is the same every time it is built. Every company name is made
 * up; the languages and databases are the open source ones teams use. No
 * line outside a client's own folder names Halcyon or the Ledger API, or
 * the film's other featured clients, so the client sheet, the update's
 * context and Cori's answer on the stack stay as they are.
 */

const SEED = 0x7ec4;

type Project = { label: string; about: string; stack: [lang: string, db: string, infra: string]; step: string };
type ClientDef = { key: string; name: string; short: string; domain: string; what: string; city: string; since: number; contacts: Array<[string, string]>; projects: Project[] };

/** The studio's other clients: who they are, their people, and the projects the team builds for them, each with its stack and its next dated step. */
const CLIENTS: ClientDef[] = [
  { key: "marigold", name: "Marigold Learning", short: "Marigold", domain: "marigoldlearning.com", what: "makes reading apps for primary schools", city: "Portland", since: 2021, contacts: [["Hattie Brooks", "head of product"], ["Dev Mehta", "engineering manager"]], projects: [{ label: "Classroom app rewrite", about: "rewriting the teacher app for tablets", stack: ["Kotlin and Swift", "SQLite", "a small sync service"], step: "The classroom app goes to the app stores on {d}." }] },
  { key: "fernway", name: "Fernway Grocers", short: "Fernway", domain: "fernwaygrocers.com", what: "runs forty grocery stores in the Northwest", city: "Tacoma", since: 2019, contacts: [["Carl Jensen", "director of digital"], ["Mina Park", "ecommerce manager"]], projects: [{ label: "Click and collect", about: "online orders picked in store", stack: ["TypeScript and Node", "Postgres", "serverless functions"], step: "Click and collect opens in ten more stores on {d}." }] },
  { key: "quarrystone", name: "Quarrystone Bank", short: "Quarrystone", domain: "quarrystonebank.com", what: "is a community bank with twelve branches", city: "Boise", since: 2023, contacts: [["Elliot Varga", "CIO"]], projects: [{ label: "Mobile banking app", about: "a new app for checking, savings and transfers", stack: ["Kotlin and Swift", "Postgres", "the bank's private cloud"], step: "The security review of the mobile app is due {d}." }] },
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
    // The project's stack and its decisions are filed with the project itself, so a client's folder fans out once.
    kids.push({ label: p.label, kind: "project", lines: [...own, ...stack, ...decisions] });
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

/** A few more lines on the clients the film names, in their slots. */
const NAMED_MORE: Record<string, Line[]> = {
  brightline: [
    { text: "Brightline Freight moves loads for 300 trucking companies across the Midwest.", topic: ["Routing service load test", "Brightline kickoff"], slot: "overview", kind: "attribute", key: "client.industry" },
    { text: "Brightline is billed by the sprint, every two weeks.", topic: ["Brightline invoice", "Routing service load test"], slot: "billing", kind: "attribute", key: "billing.terms" },
    { text: "Leo Grant owns the Brightline relationship.", topic: ["Brightline kickoff"], slot: "relationship", kind: "attribute", key: "client.owner" },
  ],
  osprey: [
    { text: "Osprey Pay processes card payments for small shops.", topic: ["Fraud rules design", "Osprey kickoff"], slot: "overview", kind: "attribute", key: "client.industry" },
    { text: "Elena wants every new fraud rule shown to her team before it blocks a payment.", topic: ["Fraud rules design", "Osprey sync notes"], slot: "requests", key: "request.what" },
    { text: "Osprey pays a monthly retainer for the fraud work.", topic: ["Osprey retainer", "Fraud rules design"], slot: "billing", kind: "attribute", key: "billing.terms" },
  ],
};

/**
 * Northbeam's memory past Company and Clients, in the sections Coere for
 * Teams rings after them, each folder in an engineering studio's own words.
 */
function sections(): SectionSpec[] {
  return [
    {
      key: "company",
      label: "Company",
      folders: [
        {
          label: "How we work",
          chats: ["Sprint process notes", "Team agreements", "Studio handbook", "Client kickoff checklist"],
          lines: [
            "Sprints are two weeks and end with a demo to the client.",
            "Pairing is encouraged for anything touching payments.",
            "Every project has one tech lead and one delivery manager.",
            "Standups are written in the channel by 10 am Pacific.",
            "Client kickoffs cover goals, access, environments and who signs off.",
            "We estimate in days, never in story points.",
            "Fridays after 2 pm are kept free of meetings.",
            "Every project gets a retro at the end of each month.",
            "Engineers rotate projects at most once a year.",
            "Questions to a client go in the shared channel, not private messages.",
            "Every client has a weekly sync of 30 minutes at most.",
            "New projects start with a two day discovery workshop.",
            "We write down every decision a client makes in the project log.",
          ],
        },
        {
          label: "Policies",
          chats: ["Code review policy", "Incident response policy", "Security policy", "Remote work policy"],
          lines: [
            "Every change needs one review from outside the author's project.",
            "The first engineer on an incident is the lead until someone takes over.",
            "Laptops use full disk encryption and lock after five minutes.",
            "The team overlaps from 10 am to 2 pm Pacific.",
            "Reviews are answered within one working day.",
            "Clients hear about an incident within an hour.",
            "Client secrets live in the vault, never in chat or tickets.",
            "Access to client systems is removed the day a project ends.",
            "Every incident gets a blameless review within a week.",
            "Open source licenses are checked before a library is added.",
            "No client code goes on a personal machine.",
            "Client data is used only for the client's own project.",
            "Personal devices can open email and chat, never production.",
            "Every engineer reads the security policy each January.",
          ],
        },
        {
          label: "Tools and systems",
          chats: ["Tools and systems", "Tracewell setup", "Parcel CI setup", "Quillstack Docs setup"],
          lines: [
            "Design notes live in Quillstack Docs.",
            "CI runs on Parcel CI for every repo.",
            "Tracewell is the error tracker for every client project.",
            "Keystone Pager wakes the on call engineer for any page.",
            "Each client gets its own space in Quillstack Docs.",
            "Parcel CI keeps build logs for 30 days.",
            "Keystone escalates to a second engineer after 15 minutes.",
            "Tracewell alerts go to the shared on call channel.",
            "Every repo lives in the studio's GitHub organization.",
            "Linear holds tickets, one project per client.",
            "Figma holds every design, with one file per client app.",
            "Shared passwords live in the team vault, never in a doc.",
          ],
        },
      ],
      loose: {
        chats: ["Tech leads meeting", "Engineering all hands notes"],
        lines: [
          ["decision", "We decided to stop taking fixed bid projects over six months."],
          ["decision", "We decided to keep one on call rotation for all client projects."],
        ],
      },
    },
    {
      key: "engineering",
      label: "Engineering",
      folders: [
        {
          label: "Backend",
          chats: ["Backend guild notes", "Backend standards", "Go service template", "Postgres questions"],
          lines: [
            "New backend services start in Go unless the client's team uses something else.",
            "Every service exposes a health check and a metrics endpoint.",
            "Database migrations run before the deploy, never during it.",
            "Background jobs must be safe to run twice.",
            "Services log in JSON with a request id on every line.",
            "Every endpoint has a timeout, and none is longer than 30 seconds.",
            "We use pgx for Postgres and sqlc for queries in Go.",
            "Feature flags live in the database, not in config files.",
            "Every service has a load test before launch.",
            "Pagination uses cursors, never page numbers.",
            "Money is stored in cents as integers.",
            "Long running work goes to a queue, never a request.",
            "Every table has created and updated timestamps.",
            "Errors are wrapped with the call that failed.",
            "Health checks test the database, not just the process.",
            "We set connection pool sizes from load tests, not guesses.",
            "Every queue has a dead letter queue and an alert on its size.",
          ],
        },
        {
          label: "Frontend",
          chats: ["Frontend guild notes", "Design system notes", "Accessibility checks", "React questions"],
          lines: [
            "We build web apps in TypeScript with strict mode on.",
            "Every page must work with a keyboard alone.",
            "Pages must load in under two seconds on a slow phone.",
            "Components come from the shared design system first.",
            "Forms show errors next to the field, never only at the top.",
            "We test every page at 320 pixels wide.",
            "State lives in the server and the URL before any client store.",
            "Images are served in modern formats with a fallback.",
            "Every button has a visible focus ring.",
            "Copy on screens is reviewed by the client before launch.",
            "Charts use the design system's colors and work in dark mode.",
            "New pages ship behind a flag until the client signs off.",
            "We avoid client side routing for pages that should be indexed.",
            "Every form works without JavaScript for the first submit when we can.",
            "Bundle size is checked in CI and fails over the budget.",
            "Dates are shown in the user's own time zone.",
          ],
        },
        {
          label: "Mobile",
          chats: ["Mobile guild notes", "Mobile release checklist", "App store review notes", "Device lab"],
          lines: [
            "Mobile apps ship every two weeks unless a fix cannot wait.",
            "Crash free sessions must stay above 99.5 percent.",
            "We test on the oldest phone each client supports.",
            "Apps are native unless the client asks for Flutter.",
            "Every release goes to a beta group for two days first.",
            "App store notes are written in plain words for users.",
            "Push notifications need the client's sign off on wording.",
            "Offline mode is planned for any app used in the field.",
            "Apps store no secrets on the device.",
            "We keep the last two releases ready to roll back.",
            "Every app has a forced update path for a broken release.",
            "Deep links are tested on both platforms before launch.",
            "Apps ask for permissions only when a feature needs them.",
            "We use the platform's own date and number formats.",
            "Screens are tested with the largest text size.",
            "Every release has notes for the client's support team.",
          ],
        },
        {
          label: "Data",
          chats: ["Data platform notes", "Warehouse standards", "Pipeline reviews", "Data quality checks"],
          lines: [
            "Pipelines are written as code and reviewed like any other change.",
            "Client data never leaves the client's own cloud account.",
            "Every table in a warehouse has an owner.",
            "Pipelines run on a schedule and alert on a miss.",
            "Every pipeline has a data quality check before it loads.",
            "Personal data is masked in every non production copy.",
            "Dashboards name their source table and when it last loaded.",
            "We keep raw data for 90 days unless the client asks for longer.",
            "Warehouse costs are reviewed with the client each month.",
            "Schema changes in the warehouse go through a pull request.",
            "Every metric has one definition in the shared docs.",
            "Backfills run in staging before production.",
            "Data contracts are agreed with the client's teams before a pipeline goes live.",
            "We use dbt for transforms in client warehouses.",
            "Nora reviews every new pipeline before its first run.",
          ],
        },
      ],
      loose: {
        chats: ["Engineering notes"],
        lines: ["Code style is enforced by formatters, never in review comments.", "Every repo pins its tool versions.", "Every project has a README that gets a new engineer running in an hour.", "Tests run on every pull request, and a red build blocks the merge."],
      },
    },
    {
      key: "infrastructure",
      label: "Infrastructure",
      folders: [
        {
          label: "Tech stack",
          chats: ["Tech stack notes", "Fly.io setup", "Terraform modules", "Stack questions"],
          lines: [
            "Web frontends are TypeScript and React.",
            "Mobile apps are native unless the client asks for Flutter.",
            "Postgres 16 is the default database for new projects.",
            "Redis is used for caches and rate limits only.",
            "Events go over NATS JetStream in new client projects.",
            "All infrastructure is written in Terraform.",
            "Staging mirrors production at a smaller size.",
            "Backups are restored as a test once a month.",
            "Containers are built from the studio's base images.",
            "Object storage is S3 or the client's cloud equivalent.",
            "Node services use TypeScript and Fastify.",
            "Python services use FastAPI with type hints.",
            "Queues are SQS on AWS projects and NATS elsewhere.",
            "Search uses Postgres full text until it is not enough.",
          ],
        },
        {
          label: "Deploys",
          chats: ["Deploy process", "Release checklist", "Rollback steps", "Blue green deploys"],
          lines: [
            "Deploys go out from main through Parcel CI, never by hand.",
            "Production deploys stop at 3 pm Pacific on Fridays.",
            "Every deploy can be rolled back in under five minutes.",
            "Database changes ship a release before the code that needs them.",
            "Canary deploys run for 15 minutes before full traffic.",
            "Deploy freezes are set two weeks before any big client launch.",
            "Each deploy posts a note in the client's channel.",
            "Config changes go through a pull request like code.",
            "Hotfixes still need a review, even at night.",
            "We keep deploy logs for a year.",
            "Releases are tagged with the date and a short name.",
            "Mobile releases go out through the stores in stages, starting at 10 percent.",
            "Every service can deploy on its own without the others.",
            "Preview environments spin up for every pull request.",
            "A failed deploy rolls back on its own when health checks fail.",
          ],
        },
        {
          label: "Observability",
          chats: ["Observability standards", "Dashboards and alerts", "Tracing setup", "Alert tuning"],
          lines: [
            "Every service has a dashboard with traffic, errors and latency.",
            "Alerts page only for things a person must fix now.",
            "Traces follow a request across every service.",
            "Logs are kept for 30 days and metrics for a year.",
            "Every alert links to its runbook.",
            "Noisy alerts are fixed or removed within a week.",
            "Error budgets are set with the client for each service.",
            "Synthetic checks hit the main user flows every minute.",
            "Kofi reviews alert noise at the monthly ops review.",
            "Dashboards are reviewed with the client at each monthly ops review.",
            "Logs never hold passwords, tokens or card numbers.",
            "Latency is tracked at the 50th, 95th and 99th percentiles.",
            "Every background job reports how long it took and if it failed.",
            "Uptime is reported to clients each month.",
            "Alerts for a client project go to that project's channel too.",
          ],
        },
        {
          label: "Security",
          chats: ["Security checklist", "Pen test prep", "Secrets rotation", "Access reviews"],
          lines: [
            "Brightgate Security runs a penetration test for each client launch.",
            "Brightgate reports go to the client's security lead first.",
            "Secrets rotate every 90 days or when someone leaves.",
            "Access to production is reviewed each quarter.",
            "Dependencies are scanned on every build.",
            "Critical security fixes ship within two days.",
            "Every login uses single sign on and two step sign in.",
            "Production data is never copied to a laptop.",
            "Every client gets a security note at kickoff.",
            "Admin tools sit behind the VPN.",
            "Webhooks are checked for a valid signature before anything else.",
            "Security issues found by a client are fixed before new work.",
            "Brightgate retests every critical finding after we fix it.",
            "We keep a list of every third party script on each site.",
            "Password resets expire after 30 minutes.",
          ],
        },
      ],
      loose: {
        chats: ["Infrastructure notes"],
        lines: ["Cloud costs are tagged by client and reviewed each month.", "Every environment is named the same way across clients."],
      },
    },
    {
      key: "operations",
      label: "Operations",
      folders: [
        {
          label: "Runbooks and checklists",
          chats: ["Runbook template", "Release checklist", "Incident checklist", "Checklist updates"],
          lines: [
            "The release checklist asks for a rollback step on every deploy.",
            "The incident checklist starts with who is the lead.",
            "Every runbook starts with how to tell the service is healthy.",
            "Runbooks are tested in the quarterly game day.",
            "The database runbook covers failover and restore.",
            "Each client project has a runbook for its top three alerts.",
            "Runbooks name who to call at the client for each system.",
            "The launch checklist has 20 items and a sign off from the client.",
            "Runbooks are stored in Quillstack Docs next to the design notes.",
            "The data restore runbook was last tested in September.",
            "Every runbook names its owner and when it was last checked.",
            "The certificate renewal checklist runs a month before expiry.",
          ],
        },
        {
          label: "On call",
          chats: ["On call rotation", "On call handoff", "Paging rules", "On call pay"],
          lines: [
            "On call shifts are one week, Monday to Monday.",
            "The handoff note lists open incidents and noisy alerts.",
            "On call engineers get a day off after a night page.",
            "Each client has a named backup for after hours.",
            "Pages outside business hours are reviewed at the weekly ops meeting.",
            "New engineers shadow one on call week before taking one.",
            "The on call engineer does not take sprint work that week.",
            "Kofi keeps the rotation in Keystone Pager.",
            "Holiday shifts are picked by volunteers first.",
            "Pages that need no action are turned into tickets.",
            "The on call engineer writes a short note on every page.",
            "Each client's escalation list is pinned in its channel.",
            "Kofi reviews the rotation each quarter for fairness.",
            "Second line on call is a tech lead.",
          ],
        },
        {
          label: "Incidents",
          chats: ["Incident reviews", "Postmortem template", "Status page updates", "Incident notes"],
          lines: [
            "Every incident gets a written review with a timeline and actions.",
            "Reviews name what failed, never who failed.",
            "Actions from a review get an owner and a date.",
            "The status page is updated every 30 minutes during an incident.",
            "Clients get the written review within five working days.",
            "Severity one incidents get a call with the client the same day.",
            "We track time to detect and time to recover for each incident.",
            "The last severity one incident was a full disk on a queue server.",
            "Incident reviews are shared with the whole studio.",
            "Near misses are written up like incidents.",
            "Incident channels are named with the date and the service.",
            "We practice a severity one call once a quarter.",
            "Every action from a review is tracked in Linear.",
            "Customer support at the client gets a short note during any outage.",
          ],
        },
        {
          label: "Releases",
          chats: ["Release process", "Release calendar", "Launch checklist", "Release notes"],
          lines: [
            "Releases go out Tuesday to Thursday, never on a Friday afternoon.",
            "Every release has a named owner who watches it for an hour.",
            "Big launches get a go or no go call the day before.",
            "Release notes list user facing changes first.",
            "Each client sees the release calendar for the month ahead.",
            "Launches have a rollback plan written before the day.",
            "Mobile releases wait for store review, so we plan two days of slack.",
            "Feature flags let us turn a launch off without a deploy.",
            "Every launch gets a short review a week later.",
            "Ben signs off on the end to end tests before every release.",
            "Data migrations for a release are rehearsed on a staging copy.",
            "Launch dates are agreed with the client a month ahead.",
            "Release notes are reviewed by the client before they go to users.",
          ],
        },
      ],
      loose: {
        chats: ["Ops review notes"],
        lines: ["Every client has an agreed response time for incidents.", "Ops numbers go in the monthly client summary.", "The monthly ops review looks at incidents, alerts and costs.", "Game days run once a quarter on a staging copy."],
      },
    },
    {
      key: "architecture",
      label: "Architecture",
      folders: [
        {
          label: "Technical decisions",
          chats: ["Tech leads meeting", "Architecture decisions", "Tech radar review"],
          lines: [
            ["decision", "We decided every public API is versioned in the path."],
            ["decision", "We decided background jobs retry with backoff and a dead letter queue by default."],
            ["decision", "We decided to standardize on Postgres for new client projects."],
            ["decision", "We decided to use Terraform for every client's infrastructure."],
            ["decision", "We switched error tracking to Tracewell for all projects."],
            ["decision", "We decided every project gets a written architecture note in its first week."],
            ["decision", "We decided to drop GraphQL for new public APIs and use REST."],
            ["decision", "We decided on OpenTelemetry for all tracing."],
            ["decision", "We decided to keep one monorepo for each client."],
            ["decision", "We decided to run all new services in containers."],
            ["decision", "We decided to use feature flags for every launch."],
            ["decision", "We decided that every project keeps a staging environment."],
          ],
        },
        {
          label: "Design notes",
          chats: ["Design note template", "Architecture review checklist", "Design note reviews"],
          lines: [
            "Design notes fit on two pages: the problem, the options and the choice.",
            "Every design note lists what we chose not to do.",
            "Architecture reviews happen before the first line of code.",
            "Priya approves every design note that changes a public API.",
            "Design notes are kept for the life of the project.",
            "Diagrams in design notes show data flow, not boxes for every class.",
            "Each note names how we will know the design worked.",
            "Clients review design notes for anything that changes their data.",
            "A design note older than a year is checked before we rely on it.",
            "Each design note has a short section on cost.",
            "Design notes for data changes name the tables and owners.",
            "We review a design note again at launch to see what changed.",
            "Notes are written in plain words so the client can read them.",
            "A design note is required for any new service.",
          ],
        },
        {
          label: "API standards",
          chats: ["API style guide", "Webhook standards", "API errors", "API reviews"],
          lines: [
            "APIs use JSON with snake case field names.",
            "Errors return a code, a message and a request id.",
            "Webhooks are signed and carry an event id for idempotency.",
            "List endpoints return at most 100 items a page.",
            "Breaking changes go in a new version, with six months of overlap.",
            "Every API has an OpenAPI spec in its repo.",
            "Rate limits are documented and return a retry time.",
            "Timestamps are in UTC with the offset written out.",
            "IDs in APIs are strings, never numbers.",
            "Every write endpoint accepts an idempotency key.",
            "Webhook retries back off for up to three days.",
            "APIs return created resources in the response.",
            "We never remove a field without a deprecation notice.",
            "Sandbox keys are separate from live keys.",
            "Public APIs have a changelog page.",
          ],
        },
        {
          label: "Tech radar",
          chats: ["Tech radar review", "New tools to try", "Tech radar notes"],
          lines: [
            "The tech radar is reviewed each quarter by the tech leads.",
            "Rust is on trial for services that need low latency.",
            "ClickHouse is adopted for event analytics.",
            "We are holding off on new NoSQL databases.",
            "Bun is on watch for build tooling.",
            "Any new tool needs one project to try it before it is adopted.",
            "SQLite is adopted for small offline apps.",
            "Server side rendering is the default for content sites.",
            "We are trying Temporal for long running workflows.",
            "Kubernetes is used only when a client already runs it.",
            "We hold on serverless for anything with steady traffic.",
            "Playwright is adopted for end to end tests.",
            "Terraform modules are shared across clients from one repo.",
          ],
        },
      ],
      loose: {
        chats: ["Architecture notes"],
        lines: ["Simple beats clever in every design review.", "We prefer boring tools for anything a client must run after we leave."],
      },
    },
    {
      key: "writing",
      label: "Writing",
      folders: [
        {
          label: "Pull requests",
          chats: ["Pull request style", "PR template", "Review comments"],
          lines: [
            ["style", "Keep pull request descriptions to what changed and why."],
            "Pull requests stay under 400 lines unless they move files.",
            "Every pull request links its ticket.",
            "Screenshots go in any pull request that changes a screen.",
            "Review comments say what to change and why, and mark nits as nits.",
            "Draft pull requests are fine for early feedback.",
            "Merge commits are squashed with a clear title.",
            "The PR template asks how the change was tested.",
            "Pull requests that change an API note it in the title.",
            "Reviewers run the change locally for anything risky.",
            "A pull request open for a week gets a nudge in standup.",
            "Breaking changes need two approvals.",
            "Tests come in the same pull request as the code.",
            "Reverts are fine and need no long explanation.",
          ],
        },
        {
          label: "Client updates",
          chats: ["Weekly status note", "Client update template", "Writing for clients", "Release notes"],
          lines: [
            "Weekly status notes lead with risks, then what shipped.",
            "Client updates use dates, never sprint numbers.",
            "Release notes are written for the client's users, not for engineers.",
            "Every update ends with what we need from the client.",
            "Bad news goes to the client by call first, then in writing.",
            "Status notes go out on Friday by 3 pm Pacific.",
            "Updates name the engineer to ask about each item.",
            "We avoid acronyms in client updates.",
            "Monthly summaries fit on one page with a short list of next steps.",
            "Updates link to the demo or the staging build.",
            "We share a burn down of hours each month for retainer clients.",
            "Release notes go out within a day of a release.",
            "Every launch gets a short note with what changed for users.",
            "We send the client a summary after every architecture review.",
            "Updates to non technical clients skip the stack details.",
          ],
        },
        {
          label: "Docs",
          chats: ["Docs standards", "README template", "Handover docs"],
          lines: [
            "Every repo has a README with how to run, test and deploy.",
            "Handover docs are written in the last month of a project.",
            "Docs live next to the code they describe.",
            "Runbooks and design notes link to each other.",
            "We write docs for the engineer who joins next year.",
            "Docs are reviewed in the same pull request as the code.",
            "Every service has a page on how to run it in production.",
            "Docs name the owner and when they were last checked.",
            "API docs come from the OpenAPI spec.",
            "Onboarding docs are tested by each new hire.",
            "We keep a glossary for each client's own terms.",
            "Old docs are deleted, not left to rot.",
            "Diagrams are kept as code next to the docs.",
          ],
        },
        {
          label: "How you want to come across",
          chats: ["How I write updates", "Pull request style", "Writing style"],
          lines: [
            ["style", "Use plain words in client updates, no jargon."],
            ["style", "Say what is late and the new date in the first line."],
            ["style", "Write numbers with units, like 200 ms or 3 days."],
            ["style", "Keep messages to the channel short, with a link for details."],
            ["style", "Answer with code first, then one line on why."],
            ["style", "Say what I tried before I ask for help."],
            ["style", "Use bullet points only for lists of steps."],
            ["style", "Name the file and the line when I point at code."],
            ["style", "Keep a calm tone in incident updates."],
            ["style", "Thank reviewers by name when they catch a bug."],
          ],
        },
      ],
      loose: {
        chats: ["Writing notes"],
        lines: [["style", "Lead with the answer, then the detail."], "Every client email is read once by a second person on the project."],
      },
    },
    {
      key: "people",
      label: "People",
      folders: [
        {
          label: "Hiring",
          chats: ["Hiring plan", "Interview loop", "Onboarding checklist", "Job posts"],
          lines: [
            "We are hiring two backend engineers and one designer next quarter.",
            "The interview loop has a pairing session in Go and a system design round.",
            "Every candidate gets an answer within a week of the last interview.",
            "New hires ship a small change to production in their first week.",
            "Every new hire gets a buddy from another project.",
            "Take home tests are capped at two hours.",
            "Interviewers write their notes before they talk to each other.",
            ["task", "Offers for the backend roles go out by {d}.", 44],
            "References are called by the tech lead the hire will work with.",
            "Job posts list the salary range and the stack.",
            "Candidates meet two engineers and one client facing lead.",
            "We hire from bootcamps for junior roles each spring.",
            "Every interviewer has done a short training on fair interviews.",
            "Declined candidates get a short note on why when they ask.",
          ],
        },
        {
          label: "Onboarding",
          chats: ["Onboarding checklist", "First week plan", "Buddy program", "Laptop setup"],
          lines: [
            "Laptops are set up before a new hire's first day.",
            "The first week plan has a small ticket, a pairing session and a client intro.",
            "Every new hire reads the last three incident reviews.",
            "Access to client systems is granted only after the security training.",
            "New hires meet Priya in their first week.",
            "Buddies check in daily for the first two weeks.",
            "The onboarding doc is updated by each new hire.",
            "New engineers join the on call rotation after two months.",
            "Ruth walks each new hire through how we bill clients.",
            "We ask every new hire what was confusing after 30 days.",
            "Onboarding takes about a month before full project work.",
          ],
        },
        {
          label: "Career growth",
          chats: ["Career ladder", "Promotion process", "One on ones", "Feedback cycle"],
          lines: [
            "The career ladder has five levels, from engineer to principal.",
            "Promotions are decided twice a year by the tech leads.",
            "Every engineer has a one on one every two weeks.",
            "Feedback is written twice a year, with peers' notes.",
            "Engineers can move to a management track at senior level.",
            "Pay bands are shared with the whole studio.",
            "Each engineer sets two growth goals each half.",
            "Ana runs the promotion review for engineering.",
            "Staff engineers spend a fifth of their time across projects.",
            "Moving between projects is a way to grow, not a penalty.",
            "Engineers can ask for a project change at any one on one.",
            "Every level on the ladder has examples from real projects.",
          ],
        },
        {
          label: "Team life",
          chats: ["Team events", "Remote culture", "Team rituals", "Kudos channel"],
          lines: [
            "Kudos go in the shared channel on Fridays.",
            "The team has a remote coffee chat each week, picked at random.",
            "Birthdays are marked with a card from the whole studio.",
            "Every quarter the studio meets in person for two days.",
            "Teams pick a charity for the year end donation.",
            "Engineers get a home office budget when they join.",
            "Parental leave is 16 weeks for every parent.",
            "We keep meetings off calendars before 9 am Pacific.",
            "The studio's book shelf takes requests from anyone.",
            "Each project celebrates a launch with a team lunch.",
            "Remote engineers fly in for the winter offsite.",
          ],
        },
      ],
      loose: {
        chats: ["People notes"],
        lines: ["Every engineer takes at least three weeks off a year.", "Ana sends a short people update each month."],
      },
    },
    {
      key: "plans",
      label: "Plans and deadlines",
      folders: [
        {
          label: "Studio calendar",
          chats: ["Studio calendar", "Holiday schedule", "All hands dates", "Offsite planning"],
          lines: [
            ["event", "The studio all hands is on {d}.", 22],
            ["event", "The winter offsite in Sonoma starts {d}.", 48],
            "The studio is closed from December 24 through January 1.",
            ["task", "Next year's on call schedule is due {d}.", 30],
            "Tech leads meet every Tuesday at 11 am Pacific.",
            ["event", "The quarterly game day is on {d}.", 36],
            "Demo day for internal projects is the last Friday of each quarter.",
            ["task", "Holiday coverage for every client is set by {d}.", 26],
            "The studio's birthday lunch is in March.",
            "Sprint demos for clients are on Thursdays.",
            "The studio meets in person the first week of each quarter.",
            ["event", "The year end retro for every project is on {d}.", 50],
            "Ops reviews with clients are on the first Monday of each month.",
            "Hack week is the last week of June.",
          ],
        },
        {
          label: "Learning",
          chats: ["Learning budget", "Conference plans", "Book club", "Lunch and learn"],
          lines: [
            "Every engineer has a yearly learning budget.",
            "Two engineers go to KubeCon each year and share notes.",
            "The book club reads one engineering book a quarter.",
            "Lunch and learns run every other Thursday.",
            ["event", "Nora gives a lunch and learn on data quality on {d}.", 23],
            "Engineers get one day a month for learning.",
            "Conference talks by the team are rehearsed at a lunch and learn first.",
            "We pay for one certification a year for each engineer.",
            "Notes from every conference go in Quillstack Docs.",
            "Engineers can spend a sprint on an internal tool once a year.",
            "Senior engineers run a design review clinic each month.",
            "The team watches one recorded talk together each month.",
            "Each lunch and learn is recorded for those who miss it.",
          ],
        },
        {
          label: "Studio goals",
          chats: ["Studio goals for the year", "Tech leads planning", "Growth plan"],
          lines: [
            "We want every client project to have a runbook by spring.",
            "The studio aims to cut time to first deploy for new projects to one week.",
            "We plan to publish two open source tools next year.",
            "We want to grow to 30 engineers without adding layers of managers.",
            "Every project will have an error budget by the end of the year.",
            "We plan to move all projects to OpenTelemetry by summer.",
            "We want every client launch to go out without a severity one incident.",
            "We plan to hire our first staff data engineer.",
            "We aim to answer client questions within four working hours.",
            "We want every engineer to give one talk a year.",
            "We plan to bring two clients onto shared observability dashboards.",
            "We want our Terraform modules used by every new project.",
            "We plan to cut our cloud bill by a tenth through cleanup.",
          ],
        },
        {
          label: "Roadmap",
          chats: ["Studio roadmap", "Internal tools roadmap", "Quarter planning"],
          lines: [
            "The internal tools roadmap is set each quarter by the tech leads.",
            "Next quarter we build a shared service template for Go.",
            ["task", "The new project starter kit is due {d}.", 41],
            "We plan a shared login service for client apps by spring.",
            "A cost dashboard for all clients is on the roadmap for next year.",
            "We will move every project's CI to the new runners in the first quarter.",
            ["task", "The OpenTelemetry migration plan is due {d}.", 33],
            "Each roadmap item has an owner and a quarter, never a day.",
            "Roadmap reviews happen at the start of each quarter.",
          ],
        },
      ],
      loose: {
        chats: ["Plans notes"],
        lines: [["task", "The studio's security audit report is due {d}.", 52], "Every date a client depends on is in the shared calendar.", "Plans change in the open, with a note in the studio channel."],
      },
    },
  ];
}

export type Roster = {
  clients: Array<{ key: string; name: string; aliases: string[]; domains: string[] }>;
  people: Thing[];
  clientThings: Thing[];
  /** More lines on the clients the film names, by client key. */
  named: Record<string, Line[]>;
  /** The studio's memory by section, Company first, each with its folders. */
  sections: SectionSpec[];
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
  const people: Thing[] = MORE_WORKERS.map((w) => ({
    label: w.name,
    kind: "person",
    key: w.key,
    subject: true,
    values: [["email", `${w.name.split(" ")[0]!.toLowerCase()}@northbeamlabs.io`], ["role", w.role]] as Array<[IdentityValueView["field"], string]>,
    lines: w.lines.map((text) => ({ text, topic: [w.topic, `Notes on ${w.name.split(" ")[0]}`] })),
  }));
  return {
    clients: CLIENTS.map((c) => ({ key: c.key, name: c.name, aliases: [c.short], domains: [c.domain] })),
    people,
    clientThings: CLIENTS.map((c) => clientThing(c, x)),
    named: NAMED_MORE,
    sections: sections(),
  };
}
