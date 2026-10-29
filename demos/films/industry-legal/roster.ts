import type { IdentityValueView } from "@coere/memory";
import { Rng } from "@v2/tools/gen-corpus/rng";
import { dayName, type Line, type Thing } from "./grow";

/**
 * Whitlock & Rhee at its real size: the firm's other clients, each with
 * its people, its matters and what its chats said about it, slot by slot,
 * and the firm's own practice (its practice areas, policies, decisions,
 * vendors, the judges and the opposing firms it meets, and its staff).
 * The lines are written from templates in a litigation and general
 * counsel practice's own words, filled from the clients below by a seeded
 * stream, so the firm is the same every time it is built. Every name is
 * made up. No line names Hartwell, Briarstone or the firm's other featured
 * clients, so the film's own client and its answers stay as they are.
 */

const SEED = 0x1e6a1;

type MatterType = "dispute" | "employment" | "property" | "ip" | "regulatory" | "corporate";
type Matter = { label: string; type: MatterType; claim: string; other?: string; step?: string };
type ClientDef = { key: string; name: string; short: string; domain: string; what: string; city: string; since: number; status?: "active" | "paused"; contacts: Array<[string, string]>; matters: Matter[] };

/** The firm's other clients: who they are, their people and their matters, what each matter is about and its next dated step. */
const CLIENTS: ClientDef[] = [
  { key: "pellham", name: "Pellham Dairy Cooperative", short: "Pellham", domain: "pellhamdairy.coop", what: "is a dairy cooperative of forty farms", city: "Elgin", since: 2019, contacts: [["Ruth Anders", "general manager"], ["Wes Tobin", "finance director"]], matters: [{ label: "Pellham v. Kessling Packaging", type: "dispute", other: "Kessling Packaging", claim: "cracked milk crates sold under a supply contract" }, { label: "Pellham bylaws update", type: "corporate", claim: "new voting rules for member farms", step: "The members vote on {m} on {d}." }] },
  { key: "marrowgate", name: "Marrowgate Builders", short: "Marrowgate", domain: "marrowgatebuilders.com", what: "builds townhomes in the western suburbs", city: "Naperville", since: 2021, contacts: [["Frank Delacorte", "owner"], ["Joanne Pike", "project director"]], matters: [{ label: "Elm Court defect claims", type: "dispute", other: "the Elm Court owners association", claim: "water damage in twelve townhomes" }, { label: "Marrowgate lien claims", type: "property", claim: "liens on four lots from an unpaid subcontractor", step: "The lien hearing in {m} is on {d}." }] },
  { key: "tessaly", name: "Tessaly Pharmacy Group", short: "Tessaly", domain: "tessalyrx.com", what: "runs four neighborhood pharmacies", city: "Evanston", since: 2022, contacts: [["Imani Brooks", "owner"], ["Kevin Strand", "compliance lead"]], matters: [{ label: "Tessaly licensing review", type: "regulatory", claim: "the state pharmacy board's review of two stores" }] },
  { key: "corbinvale", name: "Corbin Vale Architects", short: "Corbin Vale", domain: "corbinvale.design", what: "designs schools and libraries", city: "Chicago", since: 2020, contacts: [["Lucia Corbin", "managing principal"], ["Abe Vale", "principal"]], matters: [{ label: "Corbin Vale fee dispute", type: "dispute", other: "Westbrook School District", claim: "unpaid design fees for a library wing" }, { label: "Corbin Vale partner buyout", type: "corporate", claim: "buying out a retiring partner's share", step: "The partners sign {m} on {d}." }] },
  { key: "quillon", name: "Quillon Steelworks", short: "Quillon", domain: "quillonsteel.com", what: "fabricates structural steel", city: "Gary", since: 2017, contacts: [["Stan Mirek", "chief executive"], ["Dolores Hatch", "HR director"], ["Pete Lasko", "plant manager"]], matters: [{ label: "Quillon v. Ardent Cranes", type: "dispute", other: "Ardent Cranes", claim: "a crane that failed its load test" }, { label: "Mireles overtime claim", type: "employment", claim: "a welder who says weekend shifts went unpaid", step: "The position statement in {m} is due {d}." }] },
  { key: "ashby", name: "Ashby Kitchens", short: "Ashby", domain: "ashbykitchens.com", what: "runs five restaurants and a catering kitchen", city: "Chicago", since: 2023, contacts: [["Nadia Ashby", "owner"], ["Luis Ferro", "operations manager"]], matters: [{ label: "Ashby tip pool claim", type: "employment", claim: "three servers who say managers shared in the tip pool", step: "The answer in {m} is due {d}." }, { label: "Ashby Fulton Street lease", type: "property", claim: "a ten year lease for a new restaurant on Fulton Street", step: "The landlord wants {m} signed by {d}." }] },
  { key: "northfield", name: "Northfield Montessori", short: "Northfield", domain: "northfieldmontessori.org", what: "is a Montessori school for children three to twelve", city: "Winnetka", since: 2021, contacts: [["Helen Marsh", "head of school"], ["Gary Oduya", "board chair"]], matters: [{ label: "Northfield enrollment contract", type: "corporate", claim: "a new contract parents sign each spring", step: "The board approves {m} on {d}." }, { label: "Northfield zoning appeal", type: "property", claim: "a variance to add two classrooms", step: "The zoning board hears {m} on {d}." }] },
  { key: "quarrylane", name: "Quarry Lane Apartments", short: "Quarry Lane", domain: "quarrylaneliving.com", what: "owns six apartment buildings", city: "Oak Park", since: 2018, contacts: [["Martin Szabo", "owner"], ["Erin Tull", "property manager"]], matters: [{ label: "Quarry Lane eviction cases", type: "property", claim: "three tenants who stopped paying rent", step: "The first hearing in {m} is on {d}." }, { label: "Quarry Lane v. Brightway Boilers", type: "dispute", other: "Brightway Boilers", claim: "a boiler that failed in January" }] },
  { key: "vireo", name: "Vireo Software", short: "Vireo", domain: "vireosoftware.io", what: "makes scheduling software for clinics", city: "Chicago", since: 2024, contacts: [["Priscilla Wong", "chief executive"], ["Jamal Pierce", "head of product"]], matters: [{ label: "Vireo trademark", type: "ip", claim: "registering the Vireo name and logo", step: "The office action reply in {m} is due {d}." }, { label: "Vireo seed round", type: "corporate", claim: "the company's first outside investment", step: "Closing for {m} is set for {d}." }] },
  { key: "halsey", name: "Halsey Auto Group", short: "Halsey", domain: "halseyauto.com", what: "runs three car dealerships", city: "Schaumburg", since: 2016, contacts: [["Doug Halsey", "president"], ["Rita Coyle", "controller"]], matters: [{ label: "Halsey v. Prairie Auto Finance", type: "dispute", other: "Prairie Auto Finance", claim: "chargebacks on financed cars" }, { label: "Halsey handbook update", type: "employment", claim: "a new handbook for all three dealerships", step: "The new handbook for {m} is due {d}." }] },
  { key: "gantry", name: "Gantry Freight Brokers", short: "Gantry", domain: "gantryfreight.com", what: "books truckloads for food makers", city: "Joliet", since: 2022, contacts: [["Celeste Rourke", "general counsel"], ["Ben Ashworth", "chief operating officer"]], matters: [{ label: "Gantry carrier contract", type: "corporate", claim: "a standard contract for the carriers it books", step: "Gantry wants {m} final by {d}." }] },
  { key: "ellery", name: "Ellery Home Health", short: "Ellery", domain: "elleryhomehealth.com", what: "sends nurses to patients at home", city: "Skokie", since: 2020, contacts: [["Monica Ellery", "executive director"], ["Sean Fairley", "compliance officer"]], matters: [{ label: "Ellery state survey", type: "regulatory", claim: "the state's yearly survey of patient files" }, { label: "Ellery nurse noncompete", type: "employment", claim: "a nurse who says her noncompete is too broad", step: "The reply in {m} is due {d}." }] },
  { key: "silvermint", name: "Silvermint Candy Works", short: "Silvermint", domain: "silvermintcandy.com", what: "makes hard candy in a hundred year old factory", city: "Rockford", since: 2015, contacts: [["Oscar Lindell", "owner"], ["Faye Romero", "plant controller"]], matters: [{ label: "Silvermint trade dress", type: "ip", other: "Crestway Confections", claim: "a rival tin that copies the Silvermint stripes", step: "Crestway must answer the letter in {m} by {d}." }] },
  { key: "ridgeline", name: "Ridgeline Roofing", short: "Ridgeline", domain: "ridgelineroofing.com", what: "roofs homes and small commercial buildings", city: "Aurora", since: 2023, contacts: [["Tony Carrasco", "owner"], ["Beth Lowe", "office manager"]], matters: [{ label: "Ridgeline v. Summit Shingle Supply", type: "dispute", other: "Summit Shingle Supply", claim: "shingles that curled within a year" }] },
  { key: "mapleton", name: "Mapleton Credit Union", short: "Mapleton", domain: "mapletoncu.org", what: "serves teachers and their families", city: "Downers Grove", since: 2019, contacts: [["Grant Ojukwu", "president"], ["Lydia Kemp", "general counsel"]], matters: [{ label: "Mapleton branch purchase", type: "property", claim: "buying a former bank branch on Main Street", step: "Closing for {m} is set for {d}." }, { label: "Mapleton vendor contract review", type: "corporate", claim: "renewing the contract for its online banking system", step: "Mapleton must give notice in {m} by {d}." }] },
  { key: "fairbanks", name: "Fairbanks Printing", short: "Fairbanks", domain: "fairbanksprint.com", what: "prints catalogs and packaging", city: "Cicero", since: 2018, contacts: [["Harold Fairbanks", "chief executive"], ["Nora Quist", "HR manager"]], matters: [{ label: "Fairbanks layoff notices", type: "employment", claim: "closing the second shift with the notice the law requires", step: "The notices for {m} go out by {d}." }, { label: "Fairbanks v. Lumen Inks", type: "dispute", other: "Lumen Inks", claim: "ink that smeared on a holiday catalog run" }] },
  { key: "orchardhill", name: "Orchard Hill Senior Living", short: "Orchard Hill", domain: "orchardhillliving.com", what: "runs two assisted living homes", city: "Wheaton", since: 2021, contacts: [["Diane Ross", "executive director"], ["Marco Bell", "facilities director"]], matters: [{ label: "Orchard Hill licensing", type: "regulatory", claim: "renewing the license for the Wheaton home" }] },
  { key: "kettleriver", name: "Kettle River Brewing", short: "Kettle River", domain: "kettleriverbrew.com", what: "brews beer and runs a taproom", city: "Batavia", since: 2022, contacts: [["Ivy Sorensen", "founder"], ["Cal Duffy", "head brewer"]], matters: [{ label: "Kettle River label trademark", type: "ip", claim: "registering the heron label", step: "The filing in {m} goes in by {d}." }, { label: "Kettle River distributor deal", type: "corporate", other: "Lakeshore Beverage Supply", claim: "a first distribution deal with Lakeshore Beverage Supply", step: "Signing for {m} is set for {d}." }] },
  { key: "prairiewind", name: "Prairie Wind Partners", short: "Prairie Wind", domain: "prairiewindpartners.com", what: "develops wind farms on leased farmland", city: "Champaign", since: 2020, contacts: [["Graham Ellis", "managing director"], ["Sofia Navarro", "land manager"]], matters: [{ label: "Prairie Wind land leases", type: "property", claim: "wind leases with eleven farm families", step: "The last of {m} should be signed by {d}." }, { label: "Prairie Wind v. Tolland County", type: "dispute", other: "Tolland County", claim: "a permit the county pulled after it was granted" }] },
  { key: "sablepoint", name: "Sable Point Marina", short: "Sable Point", domain: "sablepointmarina.com", what: "runs a marina and boat storage yard", city: "Waukegan", since: 2017, status: "paused", contacts: [["Russ Calloway", "owner"]], matters: [{ label: "Sable Point slip leases", type: "property", claim: "new slip leases for the coming season", step: "The new leases in {m} go out by {d}." }] },
  { key: "delmore", name: "Delmore Dental Partners", short: "Delmore", domain: "delmoredental.com", what: "runs seven dental offices", city: "Arlington Heights", since: 2019, contacts: [["Dr. Paula Kim", "managing dentist"], ["Ryan Ostrowski", "practice manager"]], matters: [{ label: "Delmore practice purchase", type: "corporate", other: "Lakeview Family Dental", claim: "buying Lakeview Family Dental", step: "Closing for {m} is set for {d}." }, { label: "Delmore associate contracts", type: "employment", claim: "new contracts for its associate dentists", step: "The new contracts in {m} are due {d}." }] },
  { key: "wexford", name: "Wexford Textiles", short: "Wexford", domain: "wexfordtextiles.com", what: "weaves upholstery fabric", city: "Kankakee", since: 2016, contacts: [["Alan Wexford", "chairman"], ["June Barrow", "general counsel"]], matters: [{ label: "Wexford v. Corvel Furniture", type: "dispute", other: "Corvel Furniture", claim: "an order cancelled after the fabric was woven" }, { label: "Wexford pattern copyrights", type: "ip", claim: "registering forty fabric patterns", step: "The next batch in {m} is filed by {d}." }] },
  { key: "bluestem", name: "Bluestem Veterinary", short: "Bluestem", domain: "bluestemvet.com", what: "runs an animal hospital and two clinics", city: "Naperville", since: 2023, contacts: [["Dr. Elise Park", "owner"], ["Walt Hagen", "hospital manager"]], matters: [{ label: "Bluestem clinic lease", type: "property", claim: "a lease for a third clinic in Lisle", step: "The landlord wants {m} signed by {d}." }] },
  { key: "ironwood", name: "Ironwood Storage", short: "Ironwood", domain: "ironwoodstorage.com", what: "runs self storage sites along the interstate", city: "Bolingbrook", since: 2020, contacts: [["Gail Monroe", "chief executive"], ["Victor Lund", "regional manager"]], matters: [{ label: "Ironwood lien sales", type: "regulatory", claim: "the notices the state requires before a unit's contents are sold" }, { label: "Ironwood Route 53 purchase", type: "property", claim: "buying a storage site on Route 53", step: "Closing for {m} is set for {d}." }] },
  { key: "lindenpark", name: "Linden Park Pediatrics", short: "Linden Park", domain: "lindenparkpeds.com", what: "is a pediatric practice with nine doctors", city: "Park Ridge", since: 2018, contacts: [["Dr. Amara Bello", "managing partner"], ["Chris Daley", "practice administrator"]], matters: [{ label: "Linden Park records request", type: "regulatory", claim: "a parent's request for a child's full chart" }, { label: "Linden Park partner agreement", type: "corporate", claim: "adding two new partners", step: "The partners sign {m} on {d}." }] },
  { key: "thornbury", name: "Thornbury Hotels", short: "Thornbury", domain: "thornburyhotels.com", what: "owns two boutique hotels downtown", city: "Chicago", since: 2021, contacts: [["Celia Thornbury", "owner"], ["Andre Mills", "general manager"]], matters: [{ label: "Thornbury v. Glasswing Design", type: "dispute", other: "Glasswing Design", claim: "a lobby renovation that ran four months late" }, { label: "Thornbury banquet staff claims", type: "employment", claim: "banquet servers who say service charges were kept from them", step: "The answer in {m} is due {d}." }] },
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

/** The firm's own staff beyond the three the film names, as Settings lists them. */
export const MORE_WORKERS = [
  { key: "marcus", topic: "Employment group intake", name: "Marcus Feld", team: "Employment", role: "Partner", lines: ["Marcus Feld leads the employment group and reviews every handbook we send out.", "Marcus wants position statements to lead with the timeline."] },
  { key: "lena", topic: "Real estate closings", name: "Lena Varga", team: "Real estate", role: "Partner", lines: ["Lena Varga leads real estate and signs every closing letter.", "Lena is out on Fridays in the summer."] },
  { key: "owen", topic: "Discovery staffing", name: "Owen Pryce", team: "Litigation", role: "Senior associate", lines: ["Owen Pryce runs discovery on the firm's larger cases.", "Owen keeps the master list of expert witnesses."] },
  { key: "hana", topic: "Trademark filings", name: "Hana Kimura", team: "Intellectual property", role: "Associate", lines: ["Hana Kimura files every trademark application for the firm.", "Hana checks each new mark against state filings too."] },
  { key: "isaac", topic: "Deal diligence list", name: "Isaac Brandt", team: "Corporate", role: "Associate", lines: ["Isaac Brandt runs diligence on deals and keeps the data rooms.", "Isaac is the firm's contact for the bank's closing team."] },
  { key: "clara", topic: "Health care clients", name: "Clara Benn", team: "Health care", role: "Associate", lines: ["Clara Benn handles state surveys and licensing for health clients.", "Clara worked at the state health department for four years."] },
  { key: "rosa", topic: "Agency filing checklist", name: "Rosa Delgado", team: "Employment", role: "Paralegal", lines: ["Rosa Delgado prepares the employment group's agency filings."] },
  { key: "theo", topic: "Court calendar", name: "Theo Mallory", team: "Litigation", role: "Legal assistant", lines: ["Theo Mallory books court reporters and conference rooms.", "Theo keeps the firm's court calendar."] },
  { key: "joy", topic: "Time entry reminders", name: "Joy Adeyemi", team: "Operations", role: "Billing manager", lines: ["Joy Adeyemi sends the invoices and chases anything past 60 days.", "Joy wants time entered by Friday at noon."] },
  { key: "victor", topic: "Laptop and password help", name: "Victor Haines", team: "Operations", role: "IT manager", lines: ["Victor Haines runs the document system and the laptops.", "Victor resets passwords only through the help desk form."] },
];

const PRACTICE: Array<[string, string[]]> = [
  ["Commercial litigation", ["Every new case gets a litigation hold letter within two days.", "Case budgets go to the client before written discovery starts.", "We use a three column chronology for every dispute.", "Grace reviews every complaint before it is filed.", "Motions over ten pages get a second associate's read."]],
  ["Employment", ["Agency charges get a position statement, never a bare denial.", "Handbooks are reviewed every two years or when a law changes.", "Separation agreements for workers over 40 give 21 days to review.", "We ask for time records before we answer any wage claim."]],
  ["Real estate", ["Every lease review starts with the term, the rent and the exit.", "Closing checklists live in the matter folder, one per deal.", "Title work goes to the same title company unless the client asks.", "Estoppel letters go out at least three weeks before a closing."]],
  ["Intellectual property", ["A trademark search comes before any new name is used.", "We watch each client's marks for new filings once a quarter.", "Cease and desist letters are signed by a partner."]],
  ["Health care", ["Patient records requests are answered within the time the state allows.", "Survey responses are written as a plan of correction.", "Any breach of patient data goes to Clara the same day."]],
  ["Corporate", ["Diligence lists follow the firm's standard checklist.", "Board minutes are drafted the week of the meeting.", "Every deal gets a closing binder in the document system."]],
];

const POLICIES: Array<[string, string[]]> = [
  ["Records retention", ["Closed matter files are kept for seven years.", "Original signed documents go back to the client at closing.", "Paper files are scanned and shredded after a year."]],
  ["Information security", ["Client documents are shared through the document system, never by personal email.", "Laptops lock after five minutes.", "Two step sign in is on for every account.", "Lost phones are reported to Victor within an hour."]],
  ["Client intake", ["New clients sign an engagement letter before any work starts.", "Intake calls are booked only after conflicts clear.", "Each new matter gets a number from billing on day one."]],
  ["Remote work", ["Lawyers work from the office Tuesday through Thursday.", "Client calls from home use the firm's video account."]],
  ["Social media", ["No one posts about a client or a case.", "The firm's page is run by Daniel's assistant."]],
];

const DECISIONS = [
  "We decided to move all matters into the new document system by January.",
  "We decided to stop taking new personal injury cases.",
  "We decided that every client gets a budget with its engagement letter.",
  "We switched court reporting to one vendor for the whole firm.",
  "We decided to bill research time only when the client approves it.",
  "We decided to hire a second paralegal for employment work.",
  "We decided to hold the litigation team meeting on Mondays at 9.",
];

const VENDORS: Array<[string, string[]]> = [
  ["Lakeline Court Reporting", ["Lakeline Court Reporting covers every deposition in the Chicago area.", "Lakeline needs exhibits two days before a deposition.", "Rough transcripts from Lakeline arrive the same evening."]],
  ["Clearview Discovery", ["Clearview Discovery hosts the firm's document reviews.", "Clearview bills storage by the month, so closed cases are archived."]],
  ["Statute Research", ["Statute Research is the firm's legal research service.", "Every associate has a Statute Research login of their own."]],
  ["Docketwise Practice", ["Docketwise Practice holds the firm's calendar, time and billing.", "Deadlines are entered in Docketwise the day they are set."]],
  ["Ferris Process Service", ["Ferris Process Service serves papers in Cook and the collar counties.", "Ferris sends proof of service within two days."]],
  ["Northshore Translation", ["Northshore Translation handles Spanish and Polish documents.", "Certified translations from Northshore take a week."]],
  ["Meridian Expert Network", ["Meridian Expert Network finds expert witnesses for trucking and construction cases.", "Meridian sends three names within a week of a request."]],
  ["Vaultline Records", ["Vaultline Records stores the firm's paper files offsite.", "Files come back from Vaultline the next business day."]],
];

const JUDGE_LINES = ["wants courtesy copies of every motion", "holds status calls by phone at 9 am", "rarely grants extensions on discovery", "asks for joint status reports before hearings", "reads every brief closely and asks pointed questions", "sends most discovery fights to the magistrate judge"];
const COUNSEL_LINES = ["answers letters slowly and asks for extensions", "settles most cases before depositions", "is careful and polite in depositions", "files a motion on almost every discovery dispute", "asks for mediation early", "sends long letters before every meet and confer"];

/** The firm's lines added to folders the film already has, by their labels. */
export const MORE_IN: Record<string, string[]> = {
  "Deposition practice": ["Deposition outlines go to the partner two days ahead.", "Each deposition gets a one page summary within a week.", "We order the rough transcript for every deposition."],
  "Billing guidelines": ["Block billing is not allowed.", "Travel time is billed at half rate.", "Write offs over an hour need a partner's approval."],
  "Court rules": ["Cook County motions need a notice of motion with the hearing date.", "Federal filings in the Northern District go in by midnight Central time.", "Judges in the Northern District post standing orders that change often."],
  Templates: ["The engagement letter template has a section for who may approve a settlement.", "The litigation hold template lists phones and text messages.", "Our motion template puts the relief asked for on the first page."],
  "Conflicts checks": ["Conflicts are run on every party and every affiliate.", "A new hire's former clients are added to the conflicts list.", "Conflicts results are saved in the matter folder."],
  "How you write briefs": ["Cite the record for every fact in a brief.", "Keep headings as full sentences that argue the point.", "Use the client's name, never the word plaintiff, in our own briefs.", "Put the standard of review in one short paragraph."],
};

export type Roster = {
  /** The firm's other clients, as Settings and Cori list them. */
  clients: Array<{ key: string; name: string; aliases: string[]; domains: string[]; status: "active" | "paused" }>;
  /** Things to plant in Company and Clients. */
  company: Thing[];
  clientThings: Thing[];
  /** Coworkers to plant in the firm's people folder. */
  people: Thing[];
  /** Lines to file under folders the film already has, by label. */
  more: Record<string, Line[]>;
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
  const folder = (label: string, lines: string[], topic: string[], kind?: Line["kind"]): Thing => ({ label, kind: "folder", lines: lines.map((text) => ({ text, topic, ...(kind ? { kind } : {}) })) });
  const lower = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
  const company: Thing[] = [
    { label: "Practice areas", kind: "folder", kids: PRACTICE.map(([label, lines]) => folder(label, lines, [`${label} practice notes`, `${label} group meeting`, `${label} checklist`])) },
    { label: "Policies", kind: "folder", kids: POLICIES.map(([label, lines]) => folder(label, lines, [`${label} policy`, `Updating the ${lower(label)} policy`, `${label} questions`])) },
    folder("Decisions", DECISIONS, ["Partner meeting notes", "Partner retreat notes", "Firm priorities for the year"], "decision"),
    { label: "Partners and vendors", kind: "folder", kids: VENDORS.map(([label, lines]) => ({ label, kind: "organization", subject: true, lines: lines.map((text) => ({ text, topic: [`${label.split(" ")[0]} setup`, `${label} contract`, `Working with ${label.split(" ")[0]}`] })) })) },
    { label: "Judges", kind: "folder", kids: JUDGES.map((j) => ({ label: j, kind: "person", subject: true, lines: pick(rng, JUDGE_LINES, 2).map((l) => ({ text: `${j} ${l}.`, topic: [`Notes on ${j}`, `Hearing before ${j}`] })) })) },
    { label: "Opposing counsel", kind: "folder", kids: COUNSEL.map((f) => ({ label: f, kind: "organization", subject: true, lines: pick(rng, COUNSEL_LINES, 2).map((l) => ({ text: `${f} ${l}.`, topic: [`Working with ${f.split(" ")[0]}`, `Letter from ${f}`] })) })) },
  ];
  const people: Thing[] = MORE_WORKERS.map((w) => ({
    label: w.name,
    kind: "person",
    key: w.key,
    subject: true,
    values: [["email", `${w.name.split(" ")[0]!.toLowerCase()}.${w.name.split(" ")[1]!.toLowerCase()}@whitlockrhee.com`], ["role", w.role]],
    lines: w.lines.map((text) => ({ text, topic: [w.topic, `Notes on ${w.name.split(" ")[0]}`] })),
  }));
  const more = Object.fromEntries(Object.entries(MORE_IN).map(([label, lines]) => [label, lines.map((text) => ({ text, topic: label === "How you write briefs" ? ["Brief writing notes", "Editing my brief", "Style for the reply brief"] : [`${label} notes`, `${label} questions`, `Updating ${lower(label)}`], ...(label === "How you write briefs" ? { kind: "style" as const } : {}) }))]));
  return {
    clients: CLIENTS.map((c) => ({ key: c.key, name: c.name, aliases: [c.short], domains: [c.domain], status: c.status ?? "active" })),
    company,
    clientThings: CLIENTS.map((c) => clientThing(c, x)),
    people,
    more,
  };
}
