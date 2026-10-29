import type { IdentityValueView } from "@coere/memory";
import { Rng } from "@v2/tools/gen-corpus/rng";
import { dayName, type Line, type Thing } from "./grow";

/**
 * Ashgrove Wealth Partners at its real size: the other households and
 * clients the team advises, each with its people, its plans and what the
 * team's chats said about it, slot by slot, and the firm's own desks,
 * model portfolios, policies, decisions, vendors and staff. The lines are
 * written from templates in an advice practice's own words and filled
 * from the clients below by a seeded stream, so the firm is the same
 * every time it is built. As memory.ts says, Coere for Teams keeps no
 * money amounts, so these lines carry percentages, dates and counts,
 * never dollars. Every name is made up, and no line names the Lindqvists
 * or the film's other featured households, so their sheet, Cori's answer
 * and the note's context stay as they are.
 */

const SEED = 0xa5e6;

type PlanType = "retirement" | "college" | "tax" | "estate" | "rollover" | "business" | "giving" | "insurance" | "home";
type Plan = { label: string; type: PlanType; about: string; step: string };
type ClientDef = { key: string; name: string; short: string; plural: string; org?: boolean; what: string; city: string; since: number; contacts: Array<[string, string]>; plans: Plan[] };

/** The team's other households and clients: who they are, their people, and the plans the team runs for them, each with its next dated step. */
const CLIENTS: ClientDef[] = [
  { key: "brennan", name: "Brennan household", short: "Brennan", plural: "the Brennans", what: "Mark and Alice Brennan run a veterinary practice and have three kids", city: "Bend", since: 2018, contacts: [["Alice Brennan", "client"], ["Mark Brennan", "client"]], plans: [{ label: "Brennan practice sale", type: "business", about: "selling the practice to two younger vets over five years", step: "The buyers' letter of intent for the Brennan practice is due {d}." }, { label: "Brennan college plan", type: "college", about: "529 plans for three kids", step: "The Brennans' year end 529 contribution goes in by {d}." }] },
  { key: "achebe", name: "Achebe family", short: "Achebe", plural: "the Achebes", what: "Ngozi Achebe is a surgeon and her husband Femi teaches high school", city: "Portland", since: 2020, contacts: [["Ngozi Achebe", "client"], ["Femi Achebe", "client"]], plans: [{ label: "Achebe backdoor Roth", type: "tax", about: "a yearly backdoor Roth for both spouses", step: "The Achebes' Roth contributions for this year go in by {d}." }] },
  { key: "moreau", name: "Moreau household", short: "Moreau", plural: "the Moreaus", what: "Claire Moreau retired from the county and paints full time", city: "Hood River", since: 2016, contacts: [["Claire Moreau", "client"], ["Paul Duret", "estate attorney"]], plans: [{ label: "Moreau income plan", type: "retirement", about: "a monthly paycheck from her IRA and pension", step: "Claire Moreau's next income review is on {d}." }, { label: "Moreau estate update", type: "estate", about: "moving her house into a living trust", step: "The Moreau trust signing is set for {d}." }] },
  { key: "tanaka", name: "Tanaka family trust", short: "Tanaka", plural: "the Tanakas", what: "The Tanaka family trust was set up by Ken Tanaka for his four grandchildren", city: "Seattle", since: 2017, contacts: [["Emi Tanaka", "trustee"], ["Ken Tanaka", "grantor"]], plans: [{ label: "Tanaka trust distributions", type: "estate", about: "yearly distributions to four grandchildren", step: "The next Tanaka trust distribution goes out by {d}." }] },
  { key: "delgado", name: "Delgado household", short: "Delgado", plural: "the Delgados", what: "Marisol and Miguel Delgado own two bakeries and plan to retire at 60", city: "Salem", since: 2021, contacts: [["Marisol Delgado", "client"], ["Miguel Delgado", "client"]], plans: [{ label: "Delgado solo 401k", type: "business", about: "a solo 401k for each of them through the bakeries", step: "The Delgado 401k paperwork is due {d}." }, { label: "Delgado retirement plan", type: "retirement", about: "retiring at 60 with the bakeries sold", step: "The Delgados' retirement plan update is due {d}." }] },
  { key: "whitcombe", name: "Whitcombe Arts Foundation", short: "Whitcombe", plural: "the foundation", org: true, what: "The Whitcombe Arts Foundation funds music programs in rural schools", city: "Eugene", since: 2019, contacts: [["Diane Whitcombe", "board chair"], ["Leo Fry", "treasurer"]], plans: [{ label: "Whitcombe spending policy", type: "giving", about: "a spending rule of 5 percent a year", step: "The Whitcombe board votes on the spending policy on {d}." }] },
  { key: "novak", name: "Novak household", short: "Novak", plural: "the Novaks", what: "Pavel Novak sold his software company last year and his wife Ana runs a design studio", city: "Bellevue", since: 2025, contacts: [["Pavel Novak", "client"], ["Ana Novak", "client"], ["Greta Holm", "CPA"]], plans: [{ label: "Novak sale proceeds plan", type: "tax", about: "investing the sale proceeds over twelve months", step: "The next tranche of the Novak sale proceeds goes in on {d}." }, { label: "Novak donor advised fund", type: "giving", about: "a donor advised fund for their giving", step: "The Novak donor advised fund must be funded by {d}." }] },
  { key: "castillo", name: "Castillo family", short: "Castillo", plural: "the Castillos", what: "Teresa Castillo is a nurse and a single mom of two", city: "Vancouver", since: 2022, contacts: [["Teresa Castillo", "client"]], plans: [{ label: "Castillo college plan", type: "college", about: "saving for two kids' college", step: "Teresa Castillo's 529 plan check in is on {d}." }, { label: "Castillo life insurance", type: "insurance", about: "a term policy to cover the kids", step: "Teresa Castillo's insurance medical exam is on {d}." }] },
  { key: "nakamura", name: "Nakamura household", short: "Nakamura", plural: "the Nakamuras", what: "Hiro and June Nakamura are both retired engineers", city: "Beaverton", since: 2015, contacts: [["June Nakamura", "client"], ["Hiro Nakamura", "client"]], plans: [{ label: "Nakamura RMD plan", type: "retirement", about: "required minimum distributions from three IRAs", step: "Hiro Nakamura's required distribution must be taken by {d}." }] },
  { key: "feldman", name: "Feldman household", short: "Feldman", plural: "the Feldmans", what: "Ruth Feldman is a law partner and her husband Sam stays home with their twins", city: "Portland", since: 2019, contacts: [["Ruth Feldman", "client"], ["Sam Feldman", "client"]], plans: [{ label: "Feldman stock options", type: "tax", about: "selling vested firm shares over three years", step: "The next sale window for Ruth Feldman's shares opens on {d}." }, { label: "Feldman home purchase", type: "home", about: "buying a larger house next summer", step: "The Feldmans' down payment plan is due {d}." }] },
  { key: "kowalczyk", name: "Kowalczyk household", short: "Kowalczyk", plural: "the Kowalczyks", what: "Adam Kowalczyk drives for a freight line and his wife Eva is a dental hygienist", city: "Gresham", since: 2023, contacts: [["Eva Kowalczyk", "client"], ["Adam Kowalczyk", "client"]], plans: [{ label: "Kowalczyk 401k rollover", type: "rollover", about: "rolling Adam's old union plan into an IRA", step: "The Kowalczyk rollover forms are due {d}." }] },
  { key: "iyer", name: "Iyer family", short: "Iyer", plural: "the Iyers", what: "Arjun Iyer is a professor and Meera Iyer runs a clinic", city: "Corvallis", since: 2020, contacts: [["Meera Iyer", "client"], ["Arjun Iyer", "client"]], plans: [{ label: "Iyer sabbatical plan", type: "retirement", about: "a year of reduced income during Arjun's sabbatical", step: "The cash plan for Arjun Iyer's sabbatical is due {d}." }, { label: "Iyer estate plan", type: "estate", about: "wills and guardians for their two kids", step: "The Iyer wills are signed on {d}." }] },
  { key: "beaumont", name: "Beaumont household", short: "Beaumont", plural: "the Beaumonts", what: "Louis and Kate Beaumont own a vineyard and a tasting room", city: "McMinnville", since: 2017, contacts: [["Kate Beaumont", "client"], ["Louis Beaumont", "client"]], plans: [{ label: "Beaumont succession plan", type: "business", about: "handing the vineyard to their daughter", step: "The Beaumont family meeting on the succession plan is on {d}." }] },
  { key: "ferreira", name: "Ferreira household", short: "Ferreira", plural: "the Ferreiras", what: "Joao and Lucia Ferreira moved from Lisbon and both work in tech", city: "Hillsboro", since: 2024, contacts: [["Lucia Ferreira", "client"], ["Joao Ferreira", "client"]], plans: [{ label: "Ferreira cross border plan", type: "tax", about: "accounts in two countries and the tax forms they need", step: "The Ferreiras' foreign account report is due {d}." }] },
  { key: "quintero", name: "Quintero household", short: "Quintero", plural: "the Quinteros", what: "Luis Quintero is a firefighter close to his pension date", city: "Tacoma", since: 2021, contacts: [["Luis Quintero", "client"], ["Ana Quintero", "client"]], plans: [{ label: "Quintero pension choice", type: "retirement", about: "choosing between a lump sum and a monthly pension", step: "Luis Quintero must choose his pension option by {d}." }] },
  { key: "abernathy", name: "Abernathy family trust", short: "Abernathy", plural: "the Abernathys", what: "The Abernathy family trust holds the family's timber land and a stock portfolio", city: "Roseburg", since: 2014, contacts: [["Grant Abernathy", "trustee"], ["Helen Abernathy", "beneficiary"], ["Will Sato", "estate attorney"]], plans: [{ label: "Abernathy timber sale", type: "estate", about: "selling one tract of timber land", step: "The Abernathy timber appraisal is due {d}." }, { label: "Abernathy trust review", type: "estate", about: "the trust's yearly review with the family", step: "The Abernathy trust review is on {d}." }] },
  { key: "ostrowski", name: "Ostrowski household", short: "Ostrowski", plural: "the Ostrowskis", what: "Maria Ostrowski is widowed and lives near her son", city: "Lake Oswego", since: 2016, contacts: [["Maria Ostrowski", "client"], ["Peter Ostrowski", "son"]], plans: [{ label: "Ostrowski care plan", type: "insurance", about: "paying for care at home as she ages", step: "Maria Ostrowski's long term care claim is filed by {d}." }] },
  { key: "petrakis", name: "Petrakis household", short: "Petrakis", plural: "the Petrakises", what: "Nick and Sophia Petrakis run a restaurant and own the building", city: "Portland", since: 2019, contacts: [["Sophia Petrakis", "client"], ["Nick Petrakis", "client"]], plans: [{ label: "Petrakis building plan", type: "business", about: "whether to keep or sell the restaurant building", step: "The Petrakis building appraisal is due {d}." }] },
  { key: "duval", name: "Duval household", short: "Duval", plural: "the Duvals", what: "Marc Duval is a pilot and his wife Irene is a pharmacist", city: "Vancouver", since: 2022, contacts: [["Irene Duval", "client"], ["Marc Duval", "client"]], plans: [{ label: "Duval early retirement", type: "retirement", about: "Marc retiring at 58 when the airline allows", step: "The Duvals' retirement check in is on {d}." }] },
  { key: "rasmussen", name: "Rasmussen household", short: "Rasmussen", plural: "the Rasmussens", what: "Erik and Ingrid Rasmussen are retired teachers with six grandchildren", city: "Astoria", since: 2015, contacts: [["Ingrid Rasmussen", "client"], ["Erik Rasmussen", "client"]], plans: [{ label: "Rasmussen gifting plan", type: "giving", about: "yearly gifts to the grandchildren's 529 plans", step: "The Rasmussens' gifts to the grandchildren go out by {d}." }, { label: "Rasmussen RMD plan", type: "retirement", about: "required minimum distributions sent to charity", step: "Erik Rasmussen's charity distribution must go out by {d}." }] },
  { key: "bhatt", name: "Bhatt family", short: "Bhatt", plural: "the Bhatts", what: "Kiran Bhatt is a startup founder and his wife Priti is a pediatrician", city: "Seattle", since: 2023, contacts: [["Kiran Bhatt", "client"], ["Priti Bhatt", "client"]], plans: [{ label: "Bhatt equity plan", type: "tax", about: "startup shares and when to exercise options", step: "Kiran Bhatt's option exercise window closes on {d}." }] },
  { key: "holloway", name: "Holloway household", short: "Holloway", plural: "the Holloways", what: "Margaret Holloway retired from a utility and moved to the coast", city: "Newport", since: 2018, contacts: [["Margaret Holloway", "client"]], plans: [{ label: "Holloway income plan", type: "retirement", about: "a bond ladder to cover her first ten years", step: "The next rung of Margaret Holloway's bond ladder is bought by {d}." }] },
  { key: "eriksen", name: "Eriksen household", short: "Eriksen", plural: "the Eriksens", what: "Nils and Lise Eriksen run a fishing boat out of Ilwaco", city: "Ilwaco", since: 2020, contacts: [["Lise Eriksen", "client"], ["Nils Eriksen", "client"]], plans: [{ label: "Eriksen SEP IRA", type: "business", about: "a SEP IRA funded from the boat's income", step: "The Eriksens' SEP contribution is due {d}." }] },
  { key: "marlowe", name: "Marlowe household", short: "Marlowe", plural: "the Marlowes", what: "Ben Marlowe and his partner Chris are expecting their first child", city: "Portland", since: 2024, contacts: [["Ben Marlowe", "client"], ["Chris Adair", "partner"]], plans: [{ label: "Marlowe new baby plan", type: "insurance", about: "life insurance, a will and a 529 for the baby", step: "The Marlowe term policy application is due {d}." }, { label: "Marlowe home purchase", type: "home", about: "buying their first house", step: "The Marlowe mortgage preapproval is due {d}." }] },
  { key: "sorensen", name: "Sorensen household", short: "Sorensen", plural: "the Sorensens", what: "Karin Sorensen inherited her parents' farm and an IRA", city: "Walla Walla", since: 2025, contacts: [["Karin Sorensen", "client"], ["Ole Sorensen", "brother"]], plans: [{ label: "Sorensen inherited IRA", type: "rollover", about: "the ten year rule for her inherited IRA", step: "Karin Sorensen's inherited IRA withdrawal must be taken by {d}." }] },
  { key: "vance", name: "Vance household", short: "Vance", plural: "the Vances", what: "Ella and Wes Vance both work for the state and have state pensions", city: "Olympia", since: 2021, contacts: [["Ella Vance", "client"], ["Wes Vance", "client"]], plans: [{ label: "Vance deferred comp", type: "retirement", about: "how much to put in the state's deferred comp plan", step: "Open enrollment for the Vances' deferred comp ends on {d}." }] },
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

/** The firm's desks, each with how the team works there. */
const DESKS: Array<[string, string[]]> = [
  ["Retirement planning", ["Every retirement plan shows three cases: early, on time and late.", "We plan to age 95 for every client.", "Income plans are checked against a bad first five years.", "Social Security timing is modeled for both spouses."]],
  ["Tax planning", ["Roth conversions are sized to fill the current bracket and no more.", "We send tax letters to clients' CPAs by February 15.", "Losses are harvested in November and March.", "Charity gifts over the standard deduction are bunched into one year."]],
  ["Estate planning", ["We check beneficiaries on every account each year.", "Every client with kids under 18 gets asked about guardians.", "Trust accounts are titled before any money moves in."]],
  ["College planning", ["529 plans use the state plan unless a client asks otherwise.", "College plans assume in state tuition as the base case."]],
  ["Insurance reviews", ["Term life is our default for families with young kids.", "Disability coverage is checked for every client under 55.", "Long term care is discussed at the first review after 60."]],
];

/** The model portfolios the investment committee runs. */
const MODELS: Array<[string, string[]]> = [
  ["Conservative model", ["The conservative model is 30 percent stocks and 70 percent bonds.", "It suits clients who draw income in the next five years."]],
  ["Balanced model", ["The balanced model is 60 percent stocks and 40 percent bonds.", "Most retired clients start in the balanced model."]],
  ["Growth model", ["The growth model is 85 percent stocks and 15 percent bonds.", "Clients under 45 usually sit in the growth model."]],
  ["Income model", ["The income model holds a bond ladder and dividend funds.", "Income model bonds are held to maturity."]],
];

const POLICIES: Array<[string, string[]]> = [
  ["Trading", ["Trades for all clients in one model go out together.", "No trades go out in the last hour of the market day.", "Any trade over the review limit needs a second advisor."]],
  ["Client onboarding", ["New clients sign the advisory agreement before accounts open.", "Every new client gets a risk questionnaire and a plan within 60 days.", "Transfers in are tracked on the onboarding board until they land."]],
  ["Data security", ["Client documents are shared through the portal, never by email.", "Account numbers are never typed into a chat.", "Two step sign in is on for the CRM and the custodian."]],
  ["Remote work", ["Advisors work from the office Tuesday through Thursday.", "Client meetings from home use the firm's video account."]],
];

const DECISIONS = [
  "We decided to move every client to the new model portfolios by March.",
  "We decided to stop opening new annuity contracts.",
  "We switched the CRM to Tallyhouse in the spring.",
  "We decided that every client gets an annual review, even small accounts.",
  "We decided to send market notes four times a year instead of monthly.",
  "We decided to add a second custodian for trust accounts.",
];

const VENDORS: Array<[string, string[]]> = [
  ["Tallyhouse CRM", ["Tallyhouse is the firm's CRM, with every client meeting logged in it.", "Tallyhouse sends a reminder a month before each annual review."]],
  ["Plotline Planning", ["Plotline Planning is the software we build plans in.", "Plotline reports go to clients as PDFs, never as links."]],
  ["Keelson Rebalancer", ["Keelson Rebalancer flags drift across every account each morning.", "Keelson trades are reviewed by Maya before they go out."]],
  ["Ledgerly Tax", ["Ledgerly Tax runs the tax projections for Roth conversions.", "Ledgerly projections are saved in the client's folder in the CRM."]],
  ["Northgate Insurance Brokers", ["Northgate Insurance Brokers quotes term life and disability for our clients.", "Northgate sends quotes within a week."]],
  ["Hollis Compliance Group", ["Hollis Compliance Group runs the firm's yearly compliance audit.", "Hollis reviews the marketing pages before they go live."]],
];

/** The firm's lines added to folders the film already has, by their labels. */
const MORE_IN: Record<string, string[]> = {
  "Investment policy": ["Cash in a portfolio stays under 5 percent unless a client needs it soon.", "We do not use leveraged or inverse funds.", "Funds are replaced only when a cheaper fund tracks the same index."],
  "Rebalancing rules": ["Rebalancing checks skip accounts with a trade in the last 30 days.", "Clients in retirement are rebalanced from their income draws first."],
  "Fee schedule": ["Fee changes are sent to clients 60 days before they start.", "Accounts for family members are added together for the fee tier."],
  Compliance: ["Every complaint goes to Priya the same day.", "Advisors log outside work with compliance once a year."],
  Custodians: ["Account transfers in are checked daily until they land.", "Address changes need a call back to the number on file."],
  "Client letters": ["Year end letters go out by January 20.", "Letters never mention another client, even by first name."],
  "How you explain numbers": ["I compare a number to the plan, never to the market.", "I say percent, never basis points.", "I give one number per sentence."],
};

export type Roster = {
  clients: Array<{ key: string; name: string; aliases: string[]; work: string; contacts: never[]; facts: never[] }>;
  company: Thing[];
  clientThings: Thing[];
  more: Record<string, Line[]>;
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
  const lower = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
  const folder = (label: string, lines: string[], topic: string[], kind?: Line["kind"]): Thing => ({ label, kind: "folder", lines: lines.map((text) => ({ text, topic, ...(kind ? { kind } : {}) })) });
  const company: Thing[] = [
    { label: "Planning desks", kind: "folder", kids: DESKS.map(([label, lines]) => folder(label, lines, [`${label} notes`, `${label} checklist`, `${label} questions`])) },
    { label: "Model portfolios", kind: "folder", kids: MODELS.map(([label, lines]) => folder(label, lines, [`${label} review`, `${label} changes`])) },
    { label: "Policies", kind: "folder", kids: POLICIES.map(([label, lines]) => folder(label, lines, [`${label} policy`, `Updating the ${lower(label)} policy`])) },
    folder("Decisions", DECISIONS, ["Partner meeting notes", "Investment committee notes", "Firm priorities for the year"], "decision"),
    { label: "Partners and vendors", kind: "folder", kids: VENDORS.map(([label, lines]) => ({ label, kind: "organization", subject: true, lines: lines.map((text) => ({ text, topic: [`${label.split(" ")[0]} setup`, `${label} questions`, `Working with ${label.split(" ")[0]}`] })) })) },
    {
      label: "People",
      kind: "folder",
      kids: MORE_WORKERS.map((w) => ({
        label: w.name,
        kind: "person",
        key: w.key,
        subject: true,
        values: [["email", `${w.name.split(" ")[0]!.toLowerCase()}@ashgrovewealth.com`], ["role", w.role]] as Array<[IdentityValueView["field"], string]>,
        lines: w.lines.map((text) => ({ text, topic: [w.topic, `Notes on ${w.name.split(" ")[0]}`] })),
      })),
    },
  ];
  const more = Object.fromEntries(
    Object.entries(MORE_IN).map(([label, lines]) => [
      label,
      lines.map((text) => ({ text, topic: label === "How you explain numbers" ? ["How I write for clients", "Plain numbers"] : [`${label} notes`, `${label} questions`], ...(label === "How you explain numbers" ? { kind: "style" as const } : {}) })),
    ]),
  );
  return {
    clients: CLIENTS.map((c) => ({ key: c.key, name: c.name, aliases: [c.short, c.plural.replace(/^the /, "")], work: c.plans[0]!.label, contacts: [], facts: [] })),
    company,
    clientThings: CLIENTS.map((c) => clientThing(c, x)),
    more,
  };
}
