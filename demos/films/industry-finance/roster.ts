import type { IdentityValueView } from "@coere/memory";
import { Rng } from "@v2/tools/gen-corpus/rng";
import { dayName, type Line, type SectionSpec, type Thing } from "./grow";

/**
 * Ashgrove Wealth Partners at its real size: three more households, each
 * with its people, its plans and what the team's chats said about it, slot
 * by slot; the team; and the rest of the firm's memory, section by
 * section, each with a few folders in an advice practice's own words.
 * Household lines are written from templates filled by a seeded stream,
 * so the firm is the same every time it is built. As memory.ts says,
 * Coere for Teams keeps no money amounts, so these lines carry
 * percentages, dates and counts, never dollars. Every name is made up,
 * and no line names the Lindqvists or the film's other featured
 * households outside their own folders, so their sheet, Cori's answer and
 * the note's context stay as they are.
 */

const SEED = 0xa5e6;

type PlanType = "retirement" | "college" | "tax" | "estate" | "rollover" | "business" | "giving" | "insurance" | "home";
type Plan = { label: string; type: PlanType; about: string; step: string };
type ClientDef = { key: string; name: string; short: string; plural: string; org?: boolean; what: string; city: string; since: number; contacts: Array<[string, string]>; plans: Plan[] };

/** The team's other households and clients: who they are, their people, and the plans the team runs for them, each with its next dated step. */
const CLIENTS: ClientDef[] = [
  { key: "moreau", name: "Moreau household", short: "Moreau", plural: "the Moreaus", what: "Claire Moreau retired from the county and paints full time", city: "Hood River", since: 2016, contacts: [["Claire Moreau", "client"], ["Paul Duret", "estate attorney"]], plans: [{ label: "Moreau income plan", type: "retirement", about: "a monthly paycheck from her IRA and pension", step: "Claire Moreau's next income review is on {d}." }, { label: "Moreau estate update", type: "estate", about: "moving her house into a living trust", step: "The Moreau trust signing is set for {d}." }] },
  { key: "castillo", name: "Castillo family", short: "Castillo", plural: "the Castillos", what: "Teresa Castillo is a nurse and a single mom of two", city: "Vancouver", since: 2022, contacts: [["Teresa Castillo", "client"]], plans: [{ label: "Castillo college plan", type: "college", about: "saving for two kids' college", step: "Teresa Castillo's 529 plan check in is on {d}." }, { label: "Castillo life insurance", type: "insurance", about: "a term policy to cover the kids", step: "Teresa Castillo's insurance medical exam is on {d}." }] },
  { key: "nakamura", name: "Nakamura household", short: "Nakamura", plural: "the Nakamuras", what: "Hiro and June Nakamura are both retired engineers", city: "Beaverton", since: 2015, contacts: [["June Nakamura", "client"], ["Hiro Nakamura", "client"]], plans: [{ label: "Nakamura RMD plan", type: "retirement", about: "required minimum distributions from three IRAs", step: "Hiro Nakamura's required distribution must be taken by {d}." }] },
];

const FIRST = (name: string) => name.split(" ")[0]!;
const pick = <T>(rng: Rng, items: readonly T[], n: number): T[] => rng.shuffle([...items]).slice(0, n);

type X = { rng: Rng; on: (days: number) => string; month: (days: number) => string; pct: () => number };

/** Who on the team covers each kind of plan. */
const LEADS: Record<PlanType, string[]> = {
  retirement: ["Daniel", "Tom Becker"],
  college: ["Tom Becker"],
  tax: ["Nadia Farouk"],
  estate: ["Daniel", "Nadia Farouk"],
  rollover: ["Lena Ortiz"],
  business: ["Daniel", "Owen Price"],
  giving: ["Nadia Farouk"],
  insurance: ["Owen Price"],
  home: ["Tom Becker"],
};

/** A plan's own folder lines, and the dated line its client's slots keep. */
function planLines(c: ClientDef, p: Plan, x: X, used: Set<string>): { own: Line[]; slots: Line[] } {
  const t = {
    plan: [`${p.label}`, `${p.label} numbers`, `Thinking through the ${p.label.replace(c.short + " ", "")}`, `${p.label} options`],
    dates: [`${p.label} timeline`, `${p.label} next steps`, `${p.label} checklist`],
  };
  const f1 = FIRST(c.contacts[0]![0]);
  const due = x.rng.int(20, 75);
  const lead = x.rng.pick(LEADS[p.type]);
  const more: Record<PlanType, Line[]> = {
    retirement: [
      { text: `${they(c, "want", "wants")} to keep spending within 4 percent of the portfolio a year.`, topic: t.plan },
      { text: `${f1} wants the first two years of spending held in cash and short bonds.`, topic: t.plan },
      { text: `Social Security for ${f1} starts at 70 in the current plan.`, topic: t.plan },
      { text: `We decided the ${c.short} plan draws from the taxable account first and leaves the Roth for last.`, topic: t.plan, kind: "decision" },
    ],
    college: [
      { text: `The ${c.short} 529 plans are in age based portfolios that get safer each year.`, topic: t.plan },
      { text: `${f1} wants to cover in state tuition and leave the rest to the kids.`, topic: t.plan },
      { text: `Grandparents add to the ${c.short} 529 plans each birthday.`, topic: t.plan },
    ],
    tax: [
      { text: `${c.contacts.find(([, r]) => r === "CPA")?.[0] ?? `The ${c.short} CPA`} gets a copy of every tax letter we send.`, topic: t.plan },
      { text: `We harvest losses in the ${c.short} taxable account each November.`, topic: t.plan },
      { text: `${f1} wants to stay under the next tax bracket each year.`, topic: t.plan },
      { text: `We decided to spread the ${c.short} gains over three tax years.`, topic: t.plan, kind: "decision" },
    ],
    estate: [
      { text: `${c.contacts.find(([, r]) => r === "estate attorney")?.[0] ?? `The ${c.short} estate attorney`} drafts the documents for the ${p.label}, and we check the account titles.`, topic: t.plan },
      { text: `Beneficiaries on every ${c.short} account were checked in ${x.month(-x.rng.int(30, 200))}.`, topic: t.plan },
      { text: `${f1} wants the plan explained to the family once a year.`, topic: t.plan },
    ],
    rollover: [
      { text: `The ${c.short} rollover goes straight to the IRA, with no check in the mail.`, topic: t.plan },
      { text: `The old ${c.short} plan has a ${x.rng.pick(["two", "three", "four"])} week wait after the forms arrive.`, topic: t.plan },
      { text: `${f1} wants the rollover in the same mix of funds for now.`, topic: t.plan },
    ],
    business: [
      { text: `${f1} wants the business to stay with the family or the staff, never a big buyer.`, topic: t.plan },
      { text: `The ${c.short} CPA sends the business tax return each spring before we plan.`, topic: t.plan },
      { text: `We decided to value the ${c.short} business every two years.`, topic: t.plan, kind: "decision" },
    ],
    giving: [
      { text: `${they(c, "give", "gives")} to the same ${x.rng.pick(["three", "four", "five", "six"])} charities every year.`, topic: t.plan },
      { text: `${they(c, "give", "gives")} appreciated shares instead of cash when ${c.org ? "it" : "they"} can.`, topic: t.plan },
      { text: `${f1} wants a one page summary of the year's giving each January.`, topic: t.plan },
    ],
    insurance: [
      { text: `Owen Price compares quotes from three insurers for ${c.plural}.`, topic: t.plan },
      { text: `${f1} wants coverage until the youngest finishes college.`, topic: t.plan },
      { text: `We decided against whole life for ${c.plural} and chose term coverage.`, topic: t.plan, kind: "decision" },
    ],
    home: [
      { text: `The ${c.short} down payment sits in a high yield savings account.`, topic: t.plan },
      { text: `${f1} wants the monthly payment under a quarter of take home pay.`, topic: t.plan },
      { text: `We decided not to sell investments for the ${c.short} down payment.`, topic: t.plan, kind: "decision" },
    ],
  };
  const own: Line[] = [
    { text: `The ${p.label} is about ${p.about}.`, topic: t.plan },
    { text: `${lead} leads the ${p.label} for the team.`, topic: t.dates },
    ...pick(x.rng, more[p.type].filter((l) => !used.has(l.text)), x.rng.int(1, 2)),
  ];
  for (const l of own) used.add(l.text);
  const slots: Line[] = [{ text: p.step.replace("{d}", x.on(due)), topic: t.dates, slot: "deadlines", kind: "task", key: "due", due }];
  return { own, slots };
}

/** "The Brennans have", or "The foundation has". */
const they = (c: ClientDef, plural: string, single: string) => `${c.plural.replace(/^the /, "The ")} ${c.org ? single : plural}`;
/** "the Brennans'", or "the foundation's". */
const theirs = (c: ClientDef) => (c.plural.endsWith("s") ? `${c.plural}'` : `${c.plural}'s`);

/** One household or client: its folder, its people, its plans, and its lines by slot. */
function clientThing(c: ClientDef, x: X): Thing {
  const f1 = FIRST(c.contacts[0]![0]);
  const f2 = FIRST((c.contacts[1] ?? c.contacts[0]!)[0]);
  const plan = c.plans[0]!;
  const topic = {
    intake: [`${c.short} onboarding notes`, `${c.short} intake`, `New client: ${c.short}`, `${c.short} profile`],
    call: [`${c.short} call notes`, `Prep for ${f1}`, `${c.short} check in`, `Email to ${f1}`, `${c.short} questions`],
    review: [`${c.short} annual review`, `${c.short} review prep`, `${c.short} review agenda`],
    money: [`${c.short} allocation`, `${c.short} drift check`, `${c.short} portfolio`],
    fees: [`${c.short} fees`, `${c.short} billing question`],
  };
  const d = x.rng.int(20, 70);
  const pct = x.pct();
  const lines: Line[] = [
    { text: `${c.what}.`, topic: topic.intake, slot: "overview", kind: "attribute", key: "client.industry" },
    { text: `${they(c, "have been clients", "has been a client")} since ${c.since}.`, topic: topic.intake, slot: "relationship", kind: "attribute", key: "client.owner" },
    ...pick(x.rng, [
      { text: `We promised ${f1} an updated plan for the ${plan.label} by ${x.on(d)}.`, topic: topic.call, slot: "promises", kind: "task", key: "promise.what", due: d },
      { text: `I told ${f2} I would send the year end tax summary by ${x.on(d + 6)}.`, topic: topic.call, slot: "promises", kind: "task", key: "promise.what", due: d + 6 },
      { text: `${f1} agreed to send last year's tax return before ${x.on(d + 3)}.`, topic: topic.call, slot: "promises", kind: "task", key: "promise.what", due: d + 3 },
    ] as Line[], x.rng.int(1, 2)),
    { text: `Annual review with ${c.plural} on ${x.on(d + x.rng.int(5, 40))}.`, topic: topic.review, slot: "meetings", kind: "event", key: "meeting.when", due: d + x.rng.int(5, 40) },
    ...pick(x.rng, [
      { text: `${f1} asked for statements by email only.`, topic: topic.call, slot: "requests", key: "request.what" },
      { text: `${f1} wants every trade explained in one line before it shows on a statement.`, topic: topic.call, slot: "requests", key: "request.what" },
      { text: `${they(c, "asked", "asked")} for one page summaries with a chart at most.`, topic: topic.review, slot: "requests", key: "request.what" },
      { text: `${f2} asked to be copied on anything about taxes.`, topic: topic.call, slot: "requests", key: "request.what" },
    ] as Line[], x.rng.int(1, 2)),
    { text: `The ${c.short} target is ${pct} percent stocks and ${100 - pct} percent bonds.`, topic: topic.money, slot: "decisions", kind: "decision", key: "client_decision.what" },
    x.rng.pick([
      { text: `${they(c, "are", "is")} billed quarterly in arrears.`, topic: topic.fees, slot: "billing", kind: "attribute", key: "billing.terms" },
      { text: `The advisory fee for ${c.plural} comes from ${c.org ? "its" : "their joint"} taxable account.`, topic: topic.fees, slot: "billing", kind: "attribute", key: "billing.terms" },
      { text: `${they(c, "pay", "pays")} a flat yearly planning fee on top of the advisory fee.`, topic: topic.fees, slot: "billing", kind: "attribute", key: "billing.terms" },
    ] as Line[]),
    ...(x.rng.chance(0.6) ? [{ text: `${f1} prefers ${x.rng.pick(["calls before 10 am", "video calls over the office", "texts for scheduling", "meetings at their home", "short emails"])}.`, topic: topic.call, slot: "preferences", kind: "preference", key: "client_pref.what" } as Line] : []),
    ...(x.rng.chance(0.4) ? [{ text: `Pasting the ${c.short} risk questionnaire: their answers on swings, time frame and income needs.`, topic: topic.review, slot: "documents", basis: "pasted" } as Line] : []),
  ];
  const roles = x.rng.shuffle(["makes the money decisions", "reads every statement", "handles the paperwork", "wants the big picture first"]);
  const kin = x.rng.shuffle(c.org ? ["signs off on the investment policy", "approves every grant", "reads every statement"] : ["may call on their behalf", "is named in the estate plan", "helps with paperwork"]);
  const kids: Thing[] = c.contacts.map(([name, role], i) => {
    const pro = role === "CPA" || role === "estate attorney";
    const domain = pro ? `${name.split(" ")[1]!.toLowerCase()}${role === "CPA" ? "cpa" : "law"}.com` : x.rng.pick(["gmail.com", "fastmail.com", "outlook.com", "icloud.com"]);
    return {
      label: name,
      kind: "person",
      key: `${c.key}-${i}`,
      values: [["email", `${name.split(" ")[0]!.toLowerCase()}.${name.split(" ").at(-1)!.toLowerCase()}@${domain}`], ...(x.rng.chance(0.4) ? [["phone", `+1 ${x.rng.pick(["503", "541", "360", "206", "971"])} 555 0${x.rng.int(100, 199)}`]] : []), ["role", role]] as Array<[IdentityValueView["field"], string]>,
      lines: [
        {
          text: pro
            ? `${name} is ${theirs(c)} ${role} and ${x.rng.pick(["gets a copy of the year end letter", "joins the annual review once a year", "files their returns each April"])}.`
            : role === "client"
              ? `${name} ${roles[i % roles.length]} in the household.`
              : `${name} is ${theirs(c)} ${role} and ${kin[i % kin.length]}.`,
          topic: topic.intake,
          slot: "contacts",
          kind: "attribute",
          key: "contact.role",
        },
      ],
    };
  });
  const used = new Set<string>();
  for (const p of c.plans) {
    const { own, slots } = planLines(c, p, x, used);
    lines.push(...slots);
    kids.push({ label: p.label, kind: "project", lines: own });
  }
  // Its accounts, in a folder of their own: what is held where, and how far it has drifted.
  const accounts: Line[] = [
    { text: `The ${c.short} portfolio is ${pct + x.rng.pick([-4, -3, 3, 4, 6])} percent stocks against its ${pct} percent target.`, topic: topic.money },
    ...pick(x.rng, [
      { text: `${c.org ? "The Whitcombe endowment sits" : `The ${c.short} accounts sit`} at Brightwater Custody.`, topic: topic.money },
      { text: c.org ? `The foundation keeps a year of grants in cash.` : `${they(c, "keep", "keeps")} six months of spending in cash at their bank.`, topic: topic.money },
      { text: c.org ? `The endowment holds the balanced model.` : `${they(c, "hold", "holds")} ${x.rng.pick(["two Roth IRAs", "a joint taxable account and two IRAs", "a trust account and an IRA", "a joint account and a 401k each"])}.`, topic: topic.money },
      { text: `The ${c.short} accounts follow the ${x.rng.pick(["balanced", "growth", "conservative", "income"])} model.`, topic: topic.money },
    ] as Line[], x.rng.int(1, 2)),
  ];
  kids.push({ label: `${c.short} accounts`, kind: "folder", lines: accounts });
  return { label: c.name, kind: "organization", client: c.key, aliases: [c.short, c.plural.replace(/^the /, "")], subject: true, lines, kids };
}

/** The team beyond the three the film names, as Settings lists them. */
export const MORE_WORKERS = [
  { key: "nadia", topic: "Tax desk notes", name: "Nadia Farouk", team: "Planning", role: "Tax and estate planner", lines: ["Nadia Farouk runs the tax and estate desk and checks every Roth conversion.", "Nadia holds the CPA license on the team."] },
  { key: "owen", topic: "Insurance reviews", name: "Owen Price", team: "Planning", role: "Insurance specialist", lines: ["Owen Price reviews every client's insurance once a year.", "Owen never sells a policy himself, he compares quotes."] },
  { key: "maya", topic: "Trading desk", name: "Maya Lin", team: "Investments", role: "Portfolio manager", lines: ["Maya Lin places the trades and runs the model portfolios.", "Maya sends the trade list for review by noon each day."] },
  { key: "sam", topic: "Research notes", name: "Sam Whitfield", team: "Investments", role: "Research analyst", lines: ["Sam Whitfield writes the quarterly market notes.", "Sam keeps the fund watch list."] },
  { key: "joy", topic: "Client service desk", name: "Joy Mensah", team: "Operations", role: "Client service associate", lines: ["Joy Mensah opens new accounts and handles transfers.", "Joy books every annual review."] },
  { key: "carl", topic: "Office systems", name: "Carl Brandt", team: "Operations", role: "Operations manager", lines: ["Carl Brandt runs the CRM and the office systems.", "Carl approves any new software before we use it."] },
];

/** The three coworkers the film names, with what the team knows about each. */
const NAMED_WORKERS = [
  { key: "priya", topic: "Compliance review notes", name: "Priya Shah", role: "Chief compliance officer", lines: ["Priya Shah is the chief compliance officer and reads every client letter.", "Priya runs the yearly compliance review with Hollis."] },
  { key: "tom", topic: "Coverage plan", name: "Tom Becker", role: "Associate advisor", lines: ["Tom Becker covers Daniel's clients when he is away.", "Tom runs the college planning desk."] },
  { key: "lena", topic: "Client service desk", name: "Lena Ortiz", role: "Client service", lines: ["Lena Ortiz handles rollovers and account paperwork.", "Lena keeps the review calendar for the whole team."] },
];

/** A few more lines on the households the film names, in their slots. */
const NAMED_MORE: Record<string, Line[]> = {
  haddad: [
    { text: "Lena Ortiz handles the Haddad rollover paperwork.", topic: ["Haddad rollover steps", "Haddad 401k rollover"], slot: "relationship", kind: "attribute", key: "client.owner" },
    { text: "The Haddads pay the advisory fee quarterly from their joint account.", topic: ["Haddad fees", "Haddad rollover steps"], slot: "billing", kind: "attribute", key: "billing.terms" },
  ],
  park: [{ text: "Tom Becker covers the Parks when Daniel is away.", topic: ["Coverage plan", "Park retirement income"], slot: "relationship", kind: "attribute", key: "client.owner" }],
};

/**
 * Ashgrove's memory past Company and Clients, in the sections Coere for
 * Teams rings after them, each folder in an advice practice's own words.
 * No dollar amounts, as everywhere in this memory.
 */
function sections(): SectionSpec[] {
  return [
    {
      key: "company",
      label: "Company",
      folders: [
        {
          label: "How we work",
          chats: ["New client checklist", "Client onboarding policy", "Review season planning", "Team meeting notes"],
          lines: [
            "New clients sign the advisory agreement before accounts open.",
            "Every new client gets a risk questionnaire and a plan within 60 days.",
            "Annual reviews run from September through December.",
            "The team meets Monday at 8:30 to walk the week's reviews.",
            "Transfers in are tracked on the onboarding board until they land.",
            "Each household has one lead advisor and one backup.",
            "Client calls are returned the same business day.",
            "Every meeting ends with the next date set.",
            "Meeting notes go into Tallyhouse the day of the meeting.",
            "Joy sends an agenda to the client two days before a review.",
            "New clients meet the whole team in their first 90 days.",
            "Every household gets a short check in call in the spring.",
            "We send a welcome packet with the team's photos and direct lines.",
            "Clients who move out of state are checked against our registrations.",
            "We decided that every client gets an annual review, even small accounts.",
            "Any client request that needs a trade is logged before the trade.",
          ],
        },
        {
          label: "Fee schedule",
          chats: ["Fee schedule wording", "Fee debit rules", "Fee questions from clients"],
          lines: [
            "Fee changes are sent to clients 60 days before they start.",
            "Accounts for family members are added together for the fee tier.",
            "The fee is a percentage of assets, with three tiers.",
            "Fees are billed in arrears at the end of each quarter.",
            "The fee shows as its own line on every custodian statement.",
            "Clients who leave mid quarter pay only for the days they stayed.",
            "We do not charge a fee on cash held for a short term goal.",
            "Planning only clients pay a flat yearly fee, set in writing.",
            "We never take commissions on funds or insurance.",
            "Fee questions go to Joy, and fee changes go to Daniel.",
          ],
        },
        {
          label: "Policies",
          chats: ["Data security policy", "Remote work policy", "Gift policy", "Office policies"],
          lines: [
            "Client documents are shared through the portal, never by email.",
            "Account numbers are never typed into a chat.",
            "Two step sign in is on for the CRM and the custodian.",
            "Advisors work from the office Tuesday through Thursday.",
            "Client meetings from home use the firm's video account.",
            "Laptops lock after five minutes and are encrypted.",
            "Lost phones are reported to Carl within an hour.",
            "Visitors sign in at the front desk and never wait in the back office.",
            "Personal trading by staff is reported to Priya each quarter.",
            "Paper with client details goes in the locked shred bin.",
            "No one posts about a client, even without a name.",
            "Staff may not serve as a client's trustee or executor.",
            "Client gifts to staff over a small thank you are reported to Priya.",
            "Staff may not borrow from or lend to a client.",
            "The office alarm code changes when anyone leaves the firm.",
          ],
        },
      ],
      loose: {
        chats: ["Partner meeting notes", "Firm priorities for the year"],
        lines: [["decision", "We decided that every client gets the same fee schedule, with no side deals."], 
          ["decision", "We decided to move every client to the new model portfolios by March."],
          ["decision", "We decided to stop opening new annuity contracts."],
          ["decision", "We decided to send market notes four times a year instead of monthly."],
        ],
      },
    },
    {
      key: "investments",
      label: "Investments",
      folders: [
        {
          label: "Investment policy",
          chats: ["Investment policy notes", "Investment committee notes", "Fund selection rules"],
          lines: [
            "Cash in a portfolio stays under 5 percent unless a client needs it soon.",
            "We do not use leveraged or inverse funds.",
            "Funds are replaced only when a cheaper fund tracks the same index.",
            "The investment committee meets on the second Tuesday of each month.",
            "Any new fund needs a vote of the investment committee.",
            "We hold no fund with a fee above half a percent.",
            "Client portfolios hold between eight and fourteen funds.",
            "Alternatives are capped at 5 percent of a portfolio.",
            "Every portfolio change is written up in the committee minutes.",
            "We rebalance and trade only in whole fund shares.",
            "Every client's policy statement names the model and the reason for it.",
          ],
        },
        {
          label: "Model portfolios",
          chats: ["Model portfolio review", "Model changes", "Model portfolio notes", "Glide path notes"],
          lines: [
            "The conservative model is 30 percent stocks and 70 percent bonds.",
            "The balanced model is 60 percent stocks and 40 percent bonds.",
            "The growth model is 85 percent stocks and 15 percent bonds.",
            "The income model holds a bond ladder and dividend funds.",
            "Conservative suits clients who draw income in the next five years.",
            "Most retired clients start in the balanced model.",
            "Clients under 45 usually sit in the growth model.",
            "Income model bonds are held to maturity.",
            "Each model is reviewed in full every January.",
            "Models use the same funds so trades can go out together.",
            "A client can move models only after a review meeting.",
            "International stocks are a quarter of the stock side in every model.",
            "The balanced model added short Treasury bonds in the spring.",
            "Models are tested against 2008 and 2022 before any change.",
            "Every model has a one page sheet for clients.",
            "Small accounts under the minimum use a single balanced fund.",
            "The growth model has no bonds longer than ten years.",
            "Trust accounts use the model named in the trust's policy statement.",
          ],
        },
        {
          label: "Rebalancing rules",
          chats: ["Rebalancing rules", "Rebalancing exceptions", "Quarterly drift review"],
          lines: [
            "Rebalancing checks skip accounts with a trade in the last 30 days.",
            "Clients in retirement are rebalanced from their income draws first.",
            "Keelson flags any account more than 5 points off its target each morning.",
            "Rebalancing trades are reviewed by Maya before they go out.",
            "We avoid short term gains when we rebalance a taxable account.",
            "Dividends are swept to cash and used in the next rebalance.",
            "Accounts with a pending transfer are not rebalanced.",
            "New cash goes to the asset class furthest under its target.",
            "Clients who ask for fewer trades get one rebalance a year unless drift passes 8 points.",
            "Rebalancing in IRAs comes first, since trades there are not taxed.",
            "A rebalance is skipped in a month when the client draws a large sum.",
            "Every rebalance is logged with the drift that set it off.",
          ],
        },
        {
          label: "Fund research",
          chats: ["Fund watch list", "Bond fund review", "Index fund comparison", "Research notes"],
          lines: [
            "Sam keeps the fund watch list and reviews it each quarter.",
            "A fund goes on the watch list if it trails its index by more than half a point a year.",
            "We compare funds on cost, tracking and how easily they trade.",
            "Bond funds are checked for credit quality and duration each quarter.",
            "Muni funds are used only for clients in the top tax brackets.",
            "Short Treasury funds stand in for cash in larger accounts.",
            "We read each fund's annual report before adding it.",
            "Funds with a manager change are reviewed within a month.",
            "International bond funds must hedge the currency.",
            "Target date funds are used only inside 401k plans with no better choice.",
            "Sam writes a one page note on any fund we add or drop.",
            "Fund research is filed in the shared drive by year.",
            "ESG funds are offered on request, with the same cost limits.",
            "We do not use funds less than three years old.",
            "We check each index fund's securities lending terms.",
            "Funds that close to new money are replaced within a quarter.",
            "Real estate funds are held only in IRAs.",
            "Sam presents one fund review at each committee meeting.",
          ],
        },
      ],
      loose: {
        chats: ["Investment notes", "Market questions"],
        lines: ["Clients see their model and target on every statement.", "Concentrated stock positions are sold down on a written schedule.", "Gold and crypto are not part of any model.", "We never time the market for a client.", "Market drops are answered with the plan, not a trade.", "Big market days get a short note to clients only when they ask."],
      },
    },
    {
      key: "planning",
      label: "Planning",
      folders: [
        {
          label: "Retirement income",
          chats: ["Retirement planning notes", "Income plan checklist", "Social Security timing", "Retirement income questions"],
          lines: [
            "Every retirement plan shows three cases: early, on time and late.",
            "We plan to age 95 for every client.",
            "Income plans are checked against a bad first five years.",
            "Social Security timing is modeled for both spouses.",
            "Retired clients keep two years of spending in cash and short bonds.",
            "Monthly income draws go out on the first business day.",
            "Pension choices are modeled as a lump sum and as a lifetime payment.",
            "Spending above 4 percent a year triggers a review call.",
            "Required distributions are set up in October so they finish by year end.",
            "Medicare enrollment is on the checklist the year a client turns 64.",
            "Part time work in the first years is shown as its own case.",
            "We review each retiree's spending against the plan each spring.",
            "Survivor income is checked for every married couple.",
            "Home equity is left out of the income plan unless the client asks.",
            "Annuities are compared only when a client asks for a pension like income.",
            "Retirement dates are set with a range, never a single day.",
            "Healthcare before Medicare is planned at 8 percent of spending.",
            "Retirees get a one page income map each January.",
            "Reverse mortgages are explained but never sold by us.",
          ],
        },
        {
          label: "Tax planning",
          chats: ["Tax planning notes", "Roth conversion checklist", "Tax letter to CPAs", "Year end tax moves"],
          lines: [
            "Roth conversions are sized to fill the current bracket and no more.",
            "We send tax letters to clients' CPAs by February 15.",
            "Losses are harvested in November and March.",
            "Charity gifts over the standard deduction are bunched into one year.",
            "Nadia checks every Roth conversion before it goes in.",
            "Qualified charity distributions start the year a client turns 70 and a half.",
            "Bonds sit in IRAs and stocks in taxable accounts when we can.",
            "Estimated tax payments are set up for retirees with large draws.",
            "We never sell a fund at a short term gain without asking the client.",
            "Tax projections run in Ledgerly each fall.",
            "Backdoor Roths are done in January for clients who qualify.",
            "Year end tax moves are done by December 15 so trades settle.",
            "Every tax letter lists the forms the client should expect.",
            "State tax rules are checked for clients who split the year between states.",
            "We share tax lot details with the CPA, never the full statement.",
            "Clients with large gains are told before year end, not in April.",
            "Muni bonds are weighed against Treasuries after tax for each client.",
            "We track every client's carryover losses in Ledgerly.",
          ],
        },
        {
          label: "Estate planning",
          chats: ["Estate planning notes", "Beneficiary review", "Trust account setup", "Estate attorney list"],
          lines: [
            "We check beneficiaries on every account each year.",
            "Every client with kids under 18 gets asked about guardians.",
            "Trust accounts are titled before any money moves in.",
            "Nadia keeps the list of estate attorneys we work with.",
            "We read every new trust before we open its accounts.",
            "Transfer on death is added to taxable accounts when there is no trust.",
            "Powers of attorney are on file for every client over 70.",
            "We ask about digital accounts and passwords in the estate review.",
            "Clients get a one page map of who inherits each account.",
            "Inherited IRAs follow the ten year rule, and we plan the draws.",
            "Estate reviews happen every three years or after a big life change.",
            "We never act as a witness on a client's will.",
            "Family meetings on the estate plan are offered once a year.",
            "Gifts to grandchildren are tracked against the yearly limit.",
            "We keep a copy of every client's trust summary, not the full trust.",
            "Second marriages get a separate review of who inherits what.",
            "Pets named in a will get a line in the estate map.",
          ],
        },
        {
          label: "Insurance and college",
          chats: ["Insurance review checklist", "College planning notes", "529 plan questions", "Term life quotes"],
          lines: [
            "Term life is our default for families with young kids.",
            "Disability coverage is checked for every client under 55.",
            "Long term care is discussed at the first review after 60.",
            "529 plans use the state plan unless a client asks otherwise.",
            "College plans assume in state tuition as the base case.",
            "Owen compares three quotes for every policy.",
            "Umbrella coverage is suggested for clients with rental property.",
            "529 plans move to the age based option after the first deposit.",
            "We check FAFSA timing for clients with kids in high school.",
            "Life insurance needs are worked out from income, debts and kids' ages.",
            "Old whole life policies are reviewed before any is cancelled.",
            "Disability policies are checked for own occupation terms.",
            "We never suggest cashing a life policy without a full review.",
            "College savings stop the year a child enrolls, unless a younger child needs them.",
            "Grandparent 529 accounts are checked against the new aid rules.",
            "Renters and car policies are listed in each client's file.",
            "We suggest term coverage until the mortgage is paid off.",
          ],
        },
      ],
      loose: {
        chats: ["Planning notes"],
        lines: ["Big decisions get a second meeting before anything moves.", "Clients get a short plan update after every major life change.", "Every plan has a page on what would make us change it.", "Every plan is updated after a marriage, a birth, a death or a move.", "Plans are built in Plotline and shared as PDFs."],
      },
    },
    {
      key: "compliance",
      label: "Compliance",
      folders: [
        {
          label: "Rules and reviews",
          chats: ["Compliance review notes", "Gift policy", "Outside work disclosures", "Complaint log"],
          lines: [
            "Every complaint goes to Priya the same day.",
            "Advisors log outside work with compliance once a year.",
            "The firm's disclosure brochure is updated each March.",
            "Clients get the updated brochure or a summary of changes each year.",
            "Every advisor signs the code of ethics each January.",
            "Hollis Compliance Group runs the firm's yearly compliance audit.",
            "Political gifts by staff are checked against the pay to play rules.",
            "Conflicts of interest are listed in the brochure and explained at onboarding.",
            "Every new advisor passes a compliance check before meeting clients.",
            "Client complaints are logged even when they are resolved on the call.",
            "Priya reviews a sample of client emails each month.",
          ],
        },
        {
          label: "Trading rules",
          chats: ["Trading policy", "Trade error log", "Trading cutoffs", "Block trades"],
          lines: [
            "Trades for all clients in one model go out together.",
            "No trades go out in the last hour of the market day.",
            "Any trade over the review limit needs a second advisor.",
            "Trade errors are fixed at the firm's cost and logged the same day.",
            "Block trades are split across accounts at the same average price.",
            "Staff trade only after client trades in the same fund are done.",
            "Trade tickets record who asked for the trade and why.",
            "Mutual fund trades go in before 1 pm Pacific.",
            "Maya reviews the daily trade report before the close.",
            "Client directed trades are marked unsolicited.",
            "We never trade in an account without written discretion.",
            "Cash raised for a client draw is sent within two business days.",
            "Trades in a trust account follow the trust's own investment rules.",
            "Trades are never placed from a personal phone.",
            "Client cash requests over the review limit need a call back.",
            "Any trade we place by mistake is reversed the same day.",
          ],
        },
        {
          label: "Records and audits",
          chats: ["Records retention", "Exam prep checklist", "Audit binder", "Email archive questions"],
          lines: [
            "Client records are kept for six years after the account closes.",
            "The custodian's system archives every client email.",
            "Texts with clients go through the firm's archived text app only.",
            "The exam binder is updated each quarter.",
            "Hollis tests a sample of client files each year.",
            "Every advisory agreement is scanned into the client's file.",
            "Signed forms are saved in the CRM within a day.",
            "We keep a log of every request from a regulator.",
            "Policies and procedures are reviewed in full each year.",
            "The yearly review report goes to the partners in December.",
            "Deleted files are kept in a backup for a full year.",
            "Audit findings get an owner and a date to fix them.",
            "Old paper files are kept offsite and listed in the records log.",
            "Client meeting notes are kept for six years.",
            "Every policy change is dated and signed by Priya.",
            "We test our backup restore twice a year.",
            "Hollis's audit report is kept with our answers to each finding.",
          ],
        },
        {
          label: "Marketing rules",
          chats: ["Marketing review", "Website copy review", "Testimonials rule", "Social posts"],
          lines: [
            "Hollis reviews the marketing pages before they go live.",
            "Market commentary may not promise returns or name a target price.",
            "Testimonials need a disclosure and Priya's approval.",
            "Performance numbers in marketing are always net of fees.",
            "Social posts by advisors are approved by compliance first.",
            "The website lists every advisor's registrations.",
            "Seminar slides are reviewed a week before the event.",
            "We never call ourselves a fiduciary without saying what it means.",
            "Ratings and awards are shown only with how they were chosen.",
            "Old marketing pieces are kept in the records log for six years.",
            "Seminar invites say who is speaking and that there is no sales pitch.",
            "Newsletter content is approved by Priya before it goes out.",
            "Client names never appear in marketing.",
            "Advisor bios list only degrees and licenses they hold today.",
            "Event photos are posted only with written consent.",
          ],
        },
      ],
      loose: {
        chats: ["Compliance questions"],
        lines: ["Priya's door is open for any question, and no question is too small.", "Hollis sends a summary of new rules each quarter.", "Every staff member reads the compliance manual each January.", ["task", "The firm's registration renewal is due {d}.", 56], "Any question we cannot answer goes to Hollis in writing."],
      },
    },
    {
      key: "writing",
      label: "Writing",
      folders: [
        {
          label: "Client letters",
          chats: ["Client letter template", "Year end letter", "Letter drafts", "Client care list"],
          lines: [
            "Year end letters go out by January 20.",
            "Letters never mention another client, even by first name.",
            "Every rebalance is followed by a plain note to the client.",
            "Letters to new clients explain the first 90 days step by step.",
            "Bad news goes by phone first, then in a letter.",
            "We thank clients by letter after every referral.",
            "Letters about a plan change say what changed, why and what happens next.",
            "Every letter is read by Priya before it goes out.",
            "Condolence letters are handwritten by the lead advisor.",
            "Letters use the client's first name and our first names.",
            "Every letter has a direct line to the client's advisor.",
            "Letters about fees show the percentage, never a total.",
            "Letters to trustees go to every trustee, not just one.",
          ],
        },
        {
          label: "How you explain numbers",
          chats: ["How I write for clients", "Plain numbers", "Explaining returns", "Review deck style"],
          lines: [
            ["style", "I compare a number to the plan, never to the market."],
            ["style", "I say percent, never basis points."],
            ["style", "I give one number per sentence."],
            ["style", "I say what a drop means for the plan before I give the drop."],
            ["style", "I write returns for the year and since we started, never for a day."],
            ["style", "I use whole years for time frames."],
            ["style", "I explain any tax word the first time it comes up."],
            ["style", "I end every summary with the one thing the client should do."],
            ["style", "I never use the words guaranteed or safe about an investment."],
            ["style", "I keep charts to one line and one label."],
            ["style", "I use the client's own goals to frame any number."],
            ["style", "I round to whole percents."],
            ["style", "I say what a number means for the plan in the next sentence."],
          ],
        },
        {
          label: "Market notes",
          chats: ["Q3 market notes", "Market note outline", "Market note draft", "Q4 market notes plan"],
          lines: [
            "Market notes go out the week after each quarter ends.",
            "Sam drafts the market notes and Daniel edits them.",
            "Market notes fit on one page.",
            "Each note opens with what happened and what we did.",
            "We do not forecast the market in any note.",
            "Notes end with a reminder of the client's plan and the next review.",
            "The Q3 note covered bond yields and the drop in tech stocks.",
            ["task", "The Q4 market note goes out by {d}.", 70],
            "Notes are read by Hollis before they go out.",
            "Charts in the notes come from the custodian's data.",
            "Clients can ask for a call after any note.",
            "We keep every note in the shared drive by quarter.",
            "Market notes avoid jargon and name no single stock.",
            "Each note has one chart at most.",
            "Market notes go to every client, not just the large ones.",
            "Notes mention a fund only when we changed it in the models.",
          ],
        },
        {
          label: "Review decks",
          chats: ["Review deck template", "Annual review agenda", "Review deck style", "Review prep checklist"],
          lines: [
            "Annual review decks have five pages at most.",
            "The first page is the client's goals in their own words.",
            "Each deck shows the plan's chance of success as a range.",
            "Account details go in an appendix, not the main pages.",
            "Decks are sent the day before the review, never after.",
            "Joy prints a copy of the deck for clients who ask.",
            "The last page lists who does what before the next review.",
            "Review decks use the firm's colors and a large font.",
            "Review decks show the plan's progress since the last review.",
            "Each deck has a page on taxes for the coming year.",
            "We bring two printed copies to every in person review.",
            "The deck shows each account's model and drift.",
            "Decks for couples show both people's goals side by side.",
            "Every deck is checked by Tom before Daniel sends it.",
            "Decks for trusts show the trust's rules on the first page.",
          ],
        },
      ],
      loose: {
        chats: ["Writing notes"],
        lines: [["style", "I write the way I would say it across the table."], "Templates for letters live in Tallyhouse.", ["style", "I write short notes, warm and free of jargon."], "Every email to a client is read once out loud before it goes."],
      },
    },
    {
      key: "partners",
      label: "Partners and tools",
      folders: [
        {
          label: "Software",
          chats: ["Tallyhouse setup", "Plotline questions", "Keelson setup", "Ledgerly projections", "Software review"],
          lines: [
            "Tallyhouse is the firm's CRM, with every client meeting logged in it.",
            "Tallyhouse sends a reminder a month before each annual review.",
            "Plotline Planning is the software we build plans in.",
            "Plotline reports go to clients as PDFs, never as links.",
            "Keelson Rebalancer flags drift across every account each morning.",
            "Ledgerly Tax runs the tax projections for Roth conversions.",
            "Ledgerly projections are saved in the client's folder in the CRM.",
            "We switched the CRM to Tallyhouse in the spring.",
            "Carl approves any new software before we use it.",
            "New software gets a security review from Hollis first.",
            "The client portal is run by Brightwater and shows every statement.",
            "Software logins are removed the day someone leaves the firm.",
            "Each tool has an owner on the team who knows it best.",
            "We review every software contract each fall before it renews.",
            "Tallyhouse holds every client's documents and notes in one place.",
            "Plotline plans are updated before each annual review.",
          ],
        },
        {
          label: "Custodians",
          chats: ["Custodian questions", "Account opening steps", "Wire safety rules", "Transfer tracking"],
          lines: [
            "Account transfers in are checked daily until they land.",
            "Address changes need a call back to the number on file.",
            "Trust accounts may go to a second custodian next year.",
            "Brightwater's service desk answers advisors within an hour.",
            "Brightwater statements go out by the tenth of each month.",
            "Tax forms from Brightwater arrive by February 15, with corrections in March.",
            "Standing instructions for monthly draws are set up once and reviewed each year.",
            "Brightwater needs a medallion stamp for some transfers out.",
            "Joy has the login for the custodian's paperwork queue.",
            "New accounts open online and need two forms of ID.",
            "Wire requests over the phone are confirmed by a call back to the number on file.",
            "Brightwater holds every client account except old annuities.",
          ],
        },
        {
          label: "CPAs and attorneys",
          chats: ["CPA list", "Estate attorney list", "Working with outside CPAs", "Referral partners"],
          lines: [
            "We work with about a dozen CPAs who share clients with us.",
            "Greta Holm is the CPA we refer to most for business owners.",
            "Will Sato is the estate attorney we use for trusts with land.",
            "Paul Duret drafts most of our clients' living trusts.",
            "CPAs get our tax letter by February 15 each year.",
            "We ask clients before we talk to their CPA or attorney.",
            "Attorneys get a list of account titles before a trust is signed.",
            "Each spring we have lunch with the CPAs who send us clients.",
            "We never pay or take a fee for a referral to a CPA or attorney.",
            "Divorce cases go to one of three family law attorneys we trust.",
            "Elder law questions go to Rosa Lind at Lind Elder Law.",
            "CPAs can see client tax documents in the portal when the client agrees.",
            "We keep a shared list of CPAs who know trusts well.",
            "An attorney's fee is never paid from a client account without written approval.",
            "CPAs who share clients get the market notes each quarter.",
            "Business owners are sent to a CPA who knows small business returns.",
          ],
        },
        {
          label: "Insurance brokers",
          chats: ["Northgate quotes", "Insurance broker list", "Long term care quotes", "Policy reviews"],
          lines: [
            "Northgate Insurance Brokers quotes term life and disability for our clients.",
            "Northgate sends quotes within a week.",
            "Long term care quotes come from two brokers so clients can compare.",
            "Owen checks every quote against the client's plan.",
            "Northgate handles the medical exam scheduling.",
            "Policy changes are copied to the client's file in Tallyhouse.",
            "We review a client's policies every two years.",
            "Claims help goes through Northgate's claims desk.",
            "Umbrella policies are quoted through the client's home insurer.",
            "Northgate checks every quote against the client's health history first.",
            "We tell clients which broker gets paid and how.",
            "Disability quotes come in two waiting periods so clients can compare.",
            "Owen keeps a list of insurers with good claims records.",
            "Old policies are reviewed with Northgate before any change.",
            "Brokers never call our clients without our introduction.",
          ],
        },
      ],
      loose: {
        chats: ["Vendor notes"],
        lines: ["We never share a client's data with a vendor without a contract.", "Every outside partner has one contact on our team.", "Every vendor with client data signs a privacy agreement.", "Vendor reviews happen each October."],
      },
    },
    {
      key: "growth",
      label: "Growth",
      folders: [
        {
          label: "Referrals",
          chats: ["Referral tracking", "Thank you notes", "Referral sources", "Who sends us clients"],
          lines: [
            "Most new clients come from current clients and their CPAs.",
            "Every referral gets a handwritten thank you within a week.",
            "We track where each new client came from in Tallyhouse.",
            "We never pay for referrals.",
            "Referrals we cannot serve go to two firms we trust.",
            "A new referral gets a call from Daniel within a day.",
            "Clients who refer get an invite to the spring dinner.",
            "Referral partners hear how it went, if the client agrees.",
            "Attorneys send us most of our trust clients.",
            "We ask for referrals only at the end of a good review.",
            "Teachers and nurses refer their coworkers more than any other group.",
            "A referral is never discussed with the person who sent it without consent.",
            "The spring dinner thanks everyone who referred a client that year.",
            "Doctors in the Pearl District send us a steady stream of clients.",
            "We send referral sources the market notes each quarter.",
            "Referrals from the teachers' union get a free first plan review.",
          ],
        },
        {
          label: "Seminars",
          chats: ["Seminar planning", "Retirement seminar slides", "Library talk", "Seminar follow up"],
          lines: [
            "We hold a retirement seminar at the Multnomah library each spring.",
            "Seminars are teaching only, with no sales pitch.",
            "Slides are reviewed by Hollis before the event.",
            "Guests get the slides the next day by email.",
            "Each seminar has one advisor and one guest speaker.",
            "Seminars cap at 40 guests.",
            "We run a Social Security talk for the teachers' union each fall.",
            "Every seminar ends with a short survey.",
            "Guests who want a meeting book through Joy.",
            "A Medicare basics talk runs each October.",
            "We record each seminar for guests who could not come.",
            "Seminar topics are chosen from the questions clients ask most.",
            "Nadia gives the estate planning talk each winter.",
            "Guests get a handout with the plan steps and no product names.",
            "Each seminar costs are logged against the marketing budget.",
          ],
        },
        {
          label: "Prospects",
          chats: ["Prospect pipeline", "First meeting checklist", "Prospect follow up", "New client fit"],
          lines: [
            "First meetings are free and last an hour.",
            "We send a one page summary after every first meeting.",
            "Prospects get our brochure before the first meeting.",
            "We follow up once after a first meeting and then wait.",
            "The team reviews the prospect list each Monday.",
            "We say no when a client wants stock picks or market timing.",
            "Prospects who need only a 401k review get a flat fee option.",
            "Each prospect is checked against our registrations by state.",
            "We aim for twelve new households a year.",
            "A prospect becomes a client only after the agreement is signed.",
            "Prospects who do not fit get a list of other firms.",
            "First meetings can be in person or by video.",
            "Prospects sign the agreement only after a second meeting.",
            "We ask every prospect what made them look for an advisor.",
            "Daniel reviews every prospect summary before it goes out.",
          ],
        },
        {
          label: "Website and newsletter",
          chats: ["Website updates", "Newsletter planning", "Team bios", "Newsletter topics"],
          lines: [
            "The website lists every advisor with a short plain bio.",
            "The newsletter goes out four times a year.",
            "Every newsletter has one planning tip and one team update.",
            "The website's contact form goes to Joy.",
            "Team photos are updated each spring.",
            "Newsletter readers can reply with questions.",
            "We post the market notes on the website a week after clients get them.",
            "The website has no performance numbers.",
            "The newsletter is sent on a Tuesday morning.",
            "The website shows our fee schedule in plain words.",
            "Every article on the site is reviewed by Priya.",
            "We answer newsletter replies within two days.",
            "The website lists the seminar dates for the year.",
            "New team members are added to the website in their first month.",
            "The newsletter has a short note from a different advisor each time.",
          ],
        },
      ],
      loose: {
        chats: ["Growth notes"],
        lines: ["We never buy lists of prospects.", "Each new client is asked how they heard of us.", "Growth is reviewed at the partner meeting each quarter.", "Marketing spend is reviewed by the partners each quarter.", "Growth goals are set at the January partner meeting."],
      },
    },
    {
      key: "plans",
      label: "Plans and deadlines",
      folders: [
        {
          label: "Firm calendar",
          chats: ["Firm calendar", "Holiday schedule", "Partner meeting dates", "Team events"],
          lines: [
            ["event", "The partners' planning day is on {d}.", 23],
            ["event", "The team holiday lunch is on {d}.", 50],
            ["task", "Fee schedule letters for next year go out by {d}.", 34],
            ["event", "The office closes early on {d} for the holiday.", 57],
            ["task", "Year end distribution requests are due from clients by {d}.", 38],
            "Partner meetings are on the first Monday of each month.",
            "The investment committee meets on the second Tuesday.",
            ["event", "The first team meeting of the new year is on {d}.", 68],
            "Review season ends on December 19.",
            "The office is closed between Christmas and New Year's Day.",
            "The spring client dinner is in April.",
            "Quarterly drift reviews are on the first Monday of each quarter.",
            "The yearly compliance review is in December.",
            ["event", "The CPA lunch for our referral partners is on {d}.", 41],
            "The office runs on reduced hours the Friday after Thanksgiving.",
            "The investment committee's yearly model review is in January.",
          ],
        },
        {
          label: "Year end checklist",
          chats: ["Year end checklist", "Year end tax moves", "RMD tracking", "December deadlines"],
          lines: [
            "Every required distribution is confirmed done by December 15.",
            "Loss harvesting is finished by December 10.",
            "Charity gifts of shares must start by December 1 to land in time.",
            "Roth conversions for the year are done by December 20.",
            "529 contributions for the state deduction go in by December 31.",
            "Year end letters are drafted in the first week of January.",
            "Cost basis is checked for every taxable account before the new year.",
            "Clients who turned 73 this year get a call about their first distribution.",
            "The year end checklist is kept in Tallyhouse with a box for each client.",
            "Joy sends year end reminders to clients on December 1.",
            "Every client with a business gets a reminder about their retirement plan deadline.",
            "Gifts to grandchildren must clear by December 31.",
            "Clients who need a check before the holidays ask by December 5.",
            "The custodian's holiday trading hours are posted for the team.",
            "We confirm every standing draw for January before the year ends.",
          ],
        },
        {
          label: "Hiring and training",
          chats: ["Hiring plan", "Associate advisor search", "Training calendar", "CE credits"],
          lines: [
            "We are hiring a second associate advisor next year.",
            "Advisors need continuing education credits each year for their license.",
            ["task", "Ethics credits for the year must be done by {d}.", 45],
            "New hires shadow ten reviews before leading one.",
            "Every new hire gets a mentor outside their own desk.",
            "Interviews include a mock client meeting.",
            "We pay for one planning course a year for each advisor.",
            "Tom is studying for the CFP exam in March.",
            "Joy trains every new hire on the CRM in their first week.",
            "Job posts go up on the firm's website first.",
            "New hires read the compliance manual in their first week.",
            "Each advisor presents one planning topic at a team meeting each quarter.",
            "We hire for client care first and technical skill second.",
            "Interns join for the summer from Portland State.",
            "Training budgets are set at the January partner meeting.",
          ],
        },
        {
          label: "Firm goals",
          chats: ["Firm priorities for the year", "Partner retreat notes", "Growth plan", "Service goals"],
          lines: [
            ["decision", "We decided to add a second custodian for trust accounts."],
            "We want every client reviewed before December 19.",
            "We aim to answer every client email within one business day.",
            "The firm plans to add a tax return service next year.",
            "We want to cut paper mail to clients in half.",
            "Every advisor will hold the CFP mark within three years.",
            "We plan a client survey every two years.",
            "We will move the office's files to the new portal by spring.",
            "The partners agreed to cap each advisor at 90 households.",
            "We want every household to have a written plan by next summer.",
            "The team aims to cut onboarding to 30 days.",
            "We plan to update every client's estate map next year.",
            "We want half of all reviews to be by video by next fall.",
            "Each advisor will lead one seminar a year.",
          ],
        },
      ],
      loose: {
        chats: ["Plans notes"],
        lines: ["The team calendar is shared with every advisor and Joy.", "Dates that affect a client are entered the day we learn them.", ["task", "The firm's insurance renewal is due {d}.", 61], "Every deadline is in Tallyhouse with an owner."],
      },
    },
  ];
}

export type Roster = {
  clients: Array<{ key: string; name: string; aliases: string[]; work: string; contacts: never[]; facts: never[] }>;
  clientThings: Thing[];
  /** The team as persons in Company's team folder. */
  people: Thing[];
  /** More lines on the households the film names, by client key. */
  named: Record<string, Line[]>;
  /** The firm's memory by section, Company first, each with its folders. */
  sections: SectionSpec[];
};

export function roster(now: number): Roster {
  const rng = Rng.derive(SEED, "finance-roster");
  const x: X = {
    rng,
    on: (days) => dayName(now, days),
    month: (days) => {
      const d = new Date(now + days * 86_400_000);
      return `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    },
    pct: () => rng.pick([40, 50, 55, 60, 65, 70, 75, 80]),
  };
  const people: Thing[] = [...NAMED_WORKERS, ...MORE_WORKERS].map((w) => ({
    label: w.name,
    kind: "person",
    key: w.key,
    subject: true,
    values: [["email", `${w.name.split(" ")[0]!.toLowerCase()}@ashgrovewealth.com`], ["role", w.role]] as Array<[IdentityValueView["field"], string]>,
    lines: w.lines.map((text) => ({ text, topic: [w.topic, `Notes on ${w.name.split(" ")[0]}`] })),
  }));
  return {
    clients: CLIENTS.map((c) => ({ key: c.key, name: c.name, aliases: [c.short, c.plural.replace(/^the /, "")], work: c.plans[0]!.label, contacts: [], facts: [] })),
    clientThings: CLIENTS.map((c) => clientThing(c, x)),
    people,
    named: NAMED_MORE,
    sections: sections(),
  };
}
