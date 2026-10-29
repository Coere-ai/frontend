import type { IdentityValueView } from "@coere/memory";
import { Rng } from "@v2/tools/gen-corpus/rng";
import { dayName, type Line, type Thing } from "./grow";

/**
 * Harbourline Trading at its real size: the other buyers and distributors
 * the firm sells to across its markets, each with its people, its
 * contracts (their pricing in a folder of its own) and what the team's
 * chats said about it, slot by slot, and the firm's own knowledge: its
 * factories, its forwarders, its product lines, policies, decisions and
 * staff. The lines are written from templates in a trading house's own
 * words and filled from the partners below by a seeded stream, so the
 * firm is the same every time it is built. Prices move in percents and
 * volumes in containers. Every name is made up, and no line names
 * Meridian or the film's other featured partners, so the sheet, the
 * reply's context and Cori's answer stay as they are.
 */

const SEED = 0xc0a3;

type Contract = { label: string; about: string; port: string; containers: number; terms: "FOB" | "CIF" | "DDP" | "EXW"; step: string };
type PartnerDef = { key: string; name: string; short: string; what: string; city: string; country: string; currency: string; since: number; contacts: Array<[string, string]>; contracts: Contract[] };

/** The firm's other partners: who they are, their people, and their contracts, each with its route and its next dated step. */
const PARTNERS: PartnerDef[] = [
  { key: "brightwell", name: "Brightwell Home", short: "Brightwell", what: "runs 85 home stores across the United Kingdom", city: "Manchester", country: "the UK", currency: "pounds", since: 2019, contacts: [["Harriet Cole", "head of buying"], ["Owen Pike", "supply chain manager"]], contracts: [{ label: "Brightwell enamel range", about: "enamel cookware in four colors", port: "Felixstowe", containers: 24, terms: "FOB", step: "Brightwell confirms its spring order by {d}." }, { label: "Brightwell Christmas glassware", about: "a seasonal glassware line", port: "Felixstowe", containers: 6, terms: "FOB", step: "The Christmas glassware samples go to Brightwell by {d}." }] },
  { key: "nordhaven", name: "Nordhaven Kitchen", short: "Nordhaven", what: "sells kitchenware online across the Nordic countries", city: "Gothenburg", country: "Sweden", currency: "euros", since: 2021, contacts: [["Sofie Lund", "category manager"], ["Erik Dahl", "logistics lead"]], contracts: [{ label: "Nordhaven bamboo tools", about: "bamboo spoons, boards and utensil sets", port: "Gothenburg", containers: 10, terms: "CIF", step: "The Nordhaven bamboo order ships by {d}." }] },
  { key: "casaluz", name: "Casa Luz Hogar", short: "Casa Luz", what: "supplies homeware to department stores in Mexico", city: "Monterrey", country: "Mexico", currency: "dollars", since: 2022, contacts: [["Mariana Ochoa", "purchasing director"], ["Diego Lara", "import manager"]], contracts: [{ label: "Casa Luz ceramic tableware", about: "stoneware plates and bowls", port: "Manzanillo", containers: 18, terms: "FOB", step: "Casa Luz signs the tableware contract by {d}." }] },
  { key: "pacificwares", name: "Pacific Wares Australia", short: "Pacific Wares", what: "wholesales kitchenware to independent shops in Australia", city: "Melbourne", country: "Australia", currency: "Australian dollars", since: 2018, contacts: [["Lachlan Reid", "managing director"], ["Priyanka Das", "buyer"]], contracts: [{ label: "Pacific Wares stainless cutlery", about: "a stainless cutlery line in three patterns", port: "Melbourne", containers: 12, terms: "CIF", step: "The Pacific Wares cutlery reorder is due {d}." }, { label: "Pacific Wares private label", about: "a private label range under their own brand", port: "Melbourne", containers: 8, terms: "CIF", step: "Pacific Wares approves the private label artwork by {d}." }] },
  { key: "lindenhof", name: "Lindenhof Handel", short: "Lindenhof", what: "supplies hotel and restaurant kitchens in Germany", city: "Hamburg", country: "Germany", currency: "euros", since: 2017, contacts: [["Katrin Weber", "head of purchasing"], ["Jonas Krause", "quality manager"]], contracts: [{ label: "Lindenhof hotel cookware", about: "heavy pans and stock pots for hotel kitchens", port: "Hamburg", containers: 20, terms: "CIF", step: "Lindenhof's quality audit of the new pans is on {d}." }] },
  { key: "sunmart", name: "Sunmart Stores", short: "Sunmart", what: "runs 140 discount stores in Malaysia", city: "Kuala Lumpur", country: "Malaysia", currency: "dollars", since: 2020, contacts: [["Aisha Rahman", "general manager, homeware"], ["Kelvin Tan", "logistics manager"]], contracts: [{ label: "Sunmart value range", about: "low cost kitchen basics", port: "Port Klang", containers: 30, terms: "FOB", step: "Sunmart's year end order is confirmed by {d}." }] },
  { key: "aldermoor", name: "Aldermoor & Co", short: "Aldermoor", what: "is a homeware brand sold in American department stores", city: "Chicago", country: "the US", currency: "dollars", since: 2023, contacts: [["Rachel Stein", "VP of sourcing"], ["Marcus Dale", "compliance manager"]], contracts: [{ label: "Aldermoor glass storage", about: "glass jars and food storage with bamboo lids", port: "Long Beach", containers: 22, terms: "FOB", step: "The Aldermoor lab test results are due {d}." }] },
  { key: "maplecrest", name: "Maplecrest Supply", short: "Maplecrest", what: "distributes restaurant supplies across Canada", city: "Toronto", country: "Canada", currency: "Canadian dollars", since: 2021, contacts: [["Claire Fortin", "purchasing manager"], ["Ravi Sandhu", "warehouse manager"]], contracts: [{ label: "Maplecrest sheet pans", about: "aluminium sheet pans for restaurants", port: "Vancouver", containers: 14, terms: "CIF", step: "Maplecrest's next sheet pan order ships by {d}." }] },
  { key: "dunecraft", name: "Dunecraft Trading", short: "Dunecraft", what: "imports homeware for hypermarkets in the Gulf", city: "Dubai", country: "the UAE", currency: "dollars", since: 2019, contacts: [["Omar Saleh", "commercial director"], ["Fatima Noor", "import coordinator"]], contracts: [{ label: "Dunecraft Ramadan promotion", about: "a gift box range for the Ramadan season", port: "Jebel Ali", containers: 16, terms: "CIF", step: "The Ramadan gift boxes must land in Jebel Ali by {d}." }] },
  { key: "tierra", name: "Tierra Andina", short: "Tierra Andina", what: "sells home goods in supermarkets in Chile and Peru", city: "Santiago", country: "Chile", currency: "dollars", since: 2022, contacts: [["Camila Rojas", "head of non food"], ["Felipe Soto", "import manager"]], contracts: [{ label: "Tierra Andina kitchen basics", about: "a basics range for supermarket shelves", port: "San Antonio", containers: 15, terms: "FOB", step: "Tierra Andina confirms the 2027 range by {d}." }] },
  { key: "hoshino", name: "Hoshino Living", short: "Hoshino", what: "runs lifestyle stores in Osaka and Kyoto", city: "Osaka", country: "Japan", currency: "yen", since: 2020, contacts: [["Aiko Hoshino", "buyer"], ["Kenji Mori", "logistics manager"]], contracts: [{ label: "Hoshino enamel kettles", about: "enamel kettles in muted colors", port: "Osaka", containers: 5, terms: "CIF", step: "Hoshino's kettle samples are due {d}." }] },
  { key: "verdant", name: "Verdant Market", short: "Verdant", what: "is an online shop for low waste homeware in France", city: "Lyon", country: "France", currency: "euros", since: 2024, contacts: [["Camille Roux", "founder"], ["Hugo Martin", "operations lead"]], contracts: [{ label: "Verdant refill jars", about: "glass refill jars with steel lids", port: "Le Havre", containers: 4, terms: "DDP", step: "Verdant's first order lands by {d}." }] },
  { key: "goldleaf", name: "Goldleaf Retail", short: "Goldleaf", what: "runs homeware counters in malls across the Philippines", city: "Manila", country: "the Philippines", currency: "dollars", since: 2021, contacts: [["Bianca Reyes", "merchandise manager"], ["Paolo Cruz", "import officer"]], contracts: [{ label: "Goldleaf rice cookers", about: "rice cookers under their store brand", port: "Manila", containers: 9, terms: "FOB", step: "The Goldleaf rice cooker safety tests are due {d}." }] },
  { key: "seaholm", name: "Seaholm Provisions", short: "Seaholm", what: "supplies galleys for cruise lines from Miami", city: "Miami", country: "the US", currency: "dollars", since: 2018, contacts: [["Dana Whitfield", "procurement director"], ["Luis Ortega", "port operations manager"]], contracts: [{ label: "Seaholm galley cookware", about: "heavy duty cookware for ship galleys", port: "Miami", containers: 11, terms: "CIF", step: "Seaholm's dry dock order must ship by {d}." }] },
  { key: "polaris", name: "Polaris Homeware", short: "Polaris", what: "sells kitchenware in 30 stores across Poland", city: "Warsaw", country: "Poland", currency: "euros", since: 2023, contacts: [["Agnieszka Nowak", "head of buying"], ["Tomasz Zielinski", "logistics manager"]], contracts: [{ label: "Polaris enamel range", about: "enamel pots in their own colors", port: "Gdansk", containers: 8, terms: "CIF", step: "Polaris approves the enamel colors by {d}." }] },
  { key: "jadeway", name: "Jadeway Department Stores", short: "Jadeway", what: "runs eight department stores in Taiwan", city: "Taipei", country: "Taiwan", currency: "dollars", since: 2019, contacts: [["Lily Chen", "homeware buyer"], ["Victor Lin", "import manager"]], contracts: [{ label: "Jadeway wedding gift sets", about: "boxed tableware for wedding registries", port: "Keelung", containers: 7, terms: "FOB", step: "The Jadeway gift set proofs are due {d}." }] },
  { key: "oakridge", name: "Oakridge Outfitters", short: "Oakridge", what: "sells camping gear in the US and Canada", city: "Denver", country: "the US", currency: "dollars", since: 2022, contacts: [["Tyler Grant", "sourcing manager"], ["Jenna Moss", "product developer"]], contracts: [{ label: "Oakridge camp cookware", about: "enamel camp mugs, plates and pots", port: "Long Beach", containers: 13, terms: "FOB", step: "The Oakridge camp cookware goes into production on {d}." }] },
  { key: "cedar", name: "Cedar & Salt", short: "Cedar & Salt", what: "is a cookware brand sold online in New Zealand", city: "Auckland", country: "New Zealand", currency: "dollars", since: 2024, contacts: [["Mia Thompson", "founder"]], contracts: [{ label: "Cedar & Salt cast iron", about: "pre seasoned cast iron pans", port: "Auckland", containers: 3, terms: "DDP", step: "The Cedar & Salt cast iron samples are due {d}." }] },
  { key: "almadena", name: "Almadena Distribuciones", short: "Almadena", what: "distributes kitchenware to shops in Portugal", city: "Porto", country: "Portugal", currency: "euros", since: 2020, contacts: [["Joana Ferreira", "commercial manager"], ["Rui Costa", "warehouse lead"]], contracts: [{ label: "Almadena glassware", about: "everyday tumblers and carafes", port: "Leixoes", containers: 9, terms: "CIF", step: "Almadena's glassware reorder is due {d}." }] },
  { key: "suriya", name: "Suriya Home", short: "Suriya", what: "sells homeware in hypermarkets across Thailand", city: "Bangkok", country: "Thailand", currency: "dollars", since: 2021, contacts: [["Nok Suriyawong", "buying manager"], ["Anan Chai", "logistics lead"]], contracts: [{ label: "Suriya melamine range", about: "melamine plates and bowls for families", port: "Laem Chabang", containers: 17, terms: "FOB", step: "The Suriya melamine food safety report is due {d}." }] },
  { key: "bluefjord", name: "Blue Fjord Interiors", short: "Blue Fjord", what: "runs design shops in Oslo and Bergen", city: "Oslo", country: "Norway", currency: "euros", since: 2023, contacts: [["Ingrid Berg", "buyer"]], contracts: [{ label: "Blue Fjord stoneware", about: "hand glazed stoneware mugs", port: "Oslo", containers: 3, terms: "DDP", step: "Blue Fjord's stoneware order lands by {d}." }] },
  { key: "kingsway", name: "Kingsway Wholesale", short: "Kingsway", what: "is a cash and carry for shops in Kenya", city: "Nairobi", country: "Kenya", currency: "dollars", since: 2022, contacts: [["David Mwangi", "purchasing manager"], ["Mercy Wanjiru", "finance officer"]], contracts: [{ label: "Kingsway aluminium pots", about: "aluminium cooking pots in five sizes", port: "Mombasa", containers: 12, terms: "CIF", step: "The Kingsway pot order ships by {d}." }] },
];

const pick = <T>(rng: Rng, items: readonly T[], n: number): T[] => rng.shuffle([...items]).slice(0, n);
const FIRST = (name: string) => name.split(" ")[0]!;

type X = { rng: Rng; on: (days: number) => string; month: (days: number) => string };

/** A contract's own lines, its pricing in a folder of its own, and the dated line its partner's slots keep. */
function contractLines(p: PartnerDef, c: Contract, x: X, used: Set<string>): { own: Line[]; pricing: Line[]; slots: Line[] } {
  const t = {
    deal: [`${c.label}`, `${c.label} terms`, `${c.label} order`, `${c.label} questions`],
    price: [`${p.short} pricing`, `${c.label} pricing`, `${p.short} margin check`],
    dates: [`${c.label} timeline`, `${c.label} shipping plan`],
  };
  const due = x.rng.int(20, 80);
  const own: Line[] = [
    { text: `The ${c.label} is ${c.about}.`, topic: t.deal },
    { text: `${p.short} buys about ${c.containers} containers a year of it through ${c.port} on ${c.terms} terms.`, topic: t.deal },
    ...pick(x.rng, [
      { text: `Every carton for ${p.short} needs a label in the local language.`, topic: t.deal },
      { text: `${p.short} wants a pre shipment inspection on every order.`, topic: t.deal },
      { text: `The ${c.label} is made at ${x.rng.pick(FACTORY_NAMES)}.`, topic: t.deal },
      { text: `${p.short} reorders the ${c.label.replace(`${p.short} `, "")} every ${x.rng.pick(["two", "three", "four"])} months.`, topic: t.deal },
      { text: `The ${c.label} cartons are packed ${x.rng.pick(["six", "eight", "twelve"])} to a carton with dividers.`, topic: t.deal },
    ].filter((l) => !used.has(l.text)) as Line[], x.rng.int(1, 3)),
  ];
  for (const l of own) used.add(l.text);
  const pricing: Line[] = pick(x.rng, [
    { text: `We raised the ${c.label} price ${x.rng.pick(["2", "3", "4"])} percent in ${x.month(-x.rng.int(60, 300))}.`, topic: t.price, kind: "decision" },
    { text: `The ${c.label} margin is ${x.rng.pick(["14", "16", "18", "21"])} percent after freight.`, topic: t.price },
    { text: `${p.short} gets a ${x.rng.pick(["2", "3"])} percent discount for orders over ${c.containers > 10 ? "five" : "two"} containers.`, topic: t.price },
    { text: `We decided to hold the ${c.label} price through the next season.`, topic: t.price, kind: "decision" },
    { text: `${p.short} pays ${x.rng.pick(["2", "3", "5"])} percent more for the ${c.label.replace(`${p.short} `, "")} in its own colors.`, topic: t.price },
  ] as Line[], x.rng.int(1, 3));
  const slots: Line[] = [{ text: c.step.replace("{d}", x.on(due)), topic: t.dates, slot: "deadlines", kind: "task", key: "due", due }];
  return { own, pricing, slots };
}

/** One partner: its folder, its people, its contracts, and its lines by slot. */
function partnerThing(p: PartnerDef, x: X): Thing {
  const [k1, k2 = k1] = p.contacts;
  const f1 = FIRST(k1![0]);
  const f2 = FIRST(k2![0]);
  const c0 = p.contracts[0]!;
  const topic = {
    account: [`${p.short} account notes`, `${p.short} intro call`, `New buyer: ${p.short}`],
    call: [`${p.short} call notes`, `Prep for ${f1} call`, `Email to ${f1}`, `${p.short} follow up`, `${p.short} weekly check in`],
    money: [`${p.short} payment terms`, `${p.short} invoice question`, `${p.short} credit check`],
    ship: [`${p.short} shipping`, `${p.short} freight quote`, `${p.short} booking`],
  };
  const d = x.rng.int(20, 70);
  const lines: Line[] = [
    { text: `${p.name} ${p.what}, from ${p.city}.`, topic: topic.account, slot: "overview", kind: "attribute", key: "client.industry" },
    { text: `${p.short} has bought from Harbourline since ${p.since}.`, topic: topic.account, slot: "relationship", kind: "attribute", key: "client.status" },
    ...pick(x.rng, [
      { text: `We promised ${f1} samples of the new colors by ${x.on(d)}.`, topic: topic.call, slot: "promises", kind: "task", key: "promise.what", due: d },
      { text: `I told ${f2} I would confirm the freight rate to ${c0.port} by ${x.on(d + 4)}.`, topic: topic.ship, slot: "promises", kind: "task", key: "promise.what", due: d + 4 },
      { text: `${p.short} agreed to send its 2027 forecast before ${x.on(d + 7)}.`, topic: topic.call, slot: "promises", kind: "task", key: "promise.what", due: d + 7 },
    ] as Line[], x.rng.int(1, 2)),
    { text: `${x.rng.pick(["Video call", "Quarterly review", "Pricing call"])} with ${f1} on ${x.on(d + 3)}.`, topic: topic.call, slot: "meetings", kind: "event", key: "meeting.when", due: d + 3 },
    ...pick(x.rng, [
      { text: `${f1} asked for photos of every order before it leaves the factory.`, topic: topic.call, slot: "requests", key: "request.what" },
      { text: `${p.short} wants the packing list a week before each shipment.`, topic: topic.ship, slot: "requests", key: "request.what" },
      { text: `${f2} asked for a monthly report on late shipments.`, topic: topic.ship, slot: "requests", key: "request.what" },
      { text: `${p.short} asked for recycled cartons on every order from next year.`, topic: topic.call, slot: "requests", key: "request.what" },
    ] as Line[], x.rng.int(1, 2)),
    x.rng.pick([
      { text: `${p.short} pays in ${p.currency} by telegraphic transfer, 30 days from the bill of lading.`, topic: topic.money, slot: "billing", kind: "attribute", key: "billing.terms" },
      { text: `${p.short} pays in ${p.currency} by letter of credit at sight.`, topic: topic.money, slot: "billing", kind: "attribute", key: "billing.terms" },
      { text: `${p.short} pays a 30 percent deposit and the rest before loading, in ${p.currency}.`, topic: topic.money, slot: "billing", kind: "attribute", key: "billing.terms" },
    ] as Line[]),
    ...(x.rng.chance(0.5) ? [{ text: `${f1} prefers ${x.rng.pick(["calls in the late afternoon Hong Kong time", "email over calls", "a written quote before any call", "messages on the shared chat"])}.`, topic: topic.call, slot: "preferences", kind: "preference", key: "client_pref.what" } as Line] : []),
    ...(x.rng.chance(0.4) ? [{ text: `Pasting ${p.short}'s purchase order: items, colors, cartons and the ship date.`, topic: topic.ship, slot: "documents" } as Line] : []),
  ];
  const kids: Thing[] = p.contacts.map(([name, role], i) => ({
    label: name,
    kind: "person",
    key: `${p.key}-${i}`,
    values: [["role", role], ["location", p.city]] as Array<[IdentityValueView["field"], string]>,
    lines: [{ text: `${name} is the ${role} at ${p.short} and ${x.rng.pick(["signs every purchase order", "books the freight on their side", "approves new products", "is the first call on any delay"])}.`, topic: topic.account, slot: "contacts", kind: "attribute" }],
  }));
  const used = new Set<string>();
  for (const c of p.contracts) {
    const { own, pricing, slots } = contractLines(p, c, x, used);
    lines.push(...slots);
    kids.push({ label: c.label, kind: "project", lines: own, kids: [{ label: `${c.label} pricing`, kind: "folder", lines: pricing }] });
  }
  return { label: p.name, kind: "organization", client: p.key, aliases: [p.short], subject: true, lines, kids };
}

/** The factories the firm buys from, and the forwarders that move its containers. */
const FACTORY_NAMES = ["Hengli Enamel Works", "Foshan Brightstar Ceramics", "Ningbo Crestline Glass", "Yangjiang Steelcraft", "Fujian Greenleaf Bamboo"];
const FACTORIES: Array<[string, string[]]> = [
  ["Hengli Enamel Works", ["Hengli Enamel Works makes our enamel cookware in Shenzhen.", "Hengli needs 45 days from deposit to loading.", "We audit Hengli every spring."]],
  ["Foshan Brightstar Ceramics", ["Brightstar makes our stoneware and tableware.", "Brightstar's kiln shuts for two weeks at Lunar New Year."]],
  ["Ningbo Crestline Glass", ["Crestline makes our glass jars and tumblers.", "Crestline breakage runs under 1 percent when packed in dividers."]],
  ["Yangjiang Steelcraft", ["Steelcraft makes our cutlery and sheet pans.", "Steelcraft holds stock of the three best selling patterns."]],
  ["Fujian Greenleaf Bamboo", ["Greenleaf makes our bamboo tools and lids.", "Greenleaf's bamboo is certified from managed forests."]],
];
const FORWARDERS: Array<[string, string[]]> = [
  ["Tidelink Logistics", ["Tidelink books most of our European containers.", "Tidelink quotes are good for two weeks."]],
  ["Eastgate Freight", ["Eastgate Freight handles our shipments to the Americas.", "Eastgate sends tracking updates every Monday."]],
  ["Coral Bay Shipping", ["Coral Bay Shipping covers Southeast Asia and Australia.", "Coral Bay is cheapest for less than container loads."]],
];

const PRODUCT_LINES: Array<[string, string[]]> = [
  ["Enamel cookware", ["Enamel cookware is our biggest line by volume.", "Enamel colors are matched to a physical swatch, never a screen."]],
  ["Glassware", ["Glassware ships with dividers in every carton.", "Glass lids are tested for heat shock."]],
  ["Bamboo kitchen tools", ["Bamboo tools are oiled before packing so they do not crack at sea."]],
  ["Stainless cutlery", ["Cutlery comes in three patterns and two finishes.", "Every cutlery set is checked for rust after a salt spray test."]],
  ["Ceramic tableware", ["Tableware is tested for lead and cadmium for every market.", "Tableware ships in sets of four or sixteen."]],
];

const POLICIES: Array<[string, string[]]> = [
  ["Quality control", ["Every order gets a pre shipment inspection by a third party.", "A failed inspection means the factory reworks the order at its own cost."]],
  ["Samples", ["Samples are free for orders over two containers.", "Samples go by courier within ten days of a request."]],
  ["Credit", ["New partners pay a deposit until they have six months of clean payments.", "Credit limits are reviewed each January."]],
];

const DECISIONS = [
  "We decided to quote every new partner in dollars unless they ask for euros.",
  "We decided to stop selling non stick pans with older coatings.",
  "We switched European bookings to Tidelink in the spring.",
  "We decided to keep two factories for every product line.",
  "We decided to visit every top ten partner once a year.",
];

/** The team beyond the three the film names, as Settings lists them. */
export const MORE_WORKERS = [
  { key: "wing", topic: "Factory visits", name: "Wing Lau", team: "Sourcing", role: "Sourcing manager", lines: ["Wing Lau runs the factory audits and visits.", "Wing negotiates factory prices each spring."] },
  { key: "hannah", topic: "Quality reports", name: "Hannah Ko", team: "Operations", role: "Quality manager", lines: ["Hannah Ko books the inspections and reads every report.", "Hannah keeps the lab test file for each market."] },
  { key: "felix", topic: "European accounts", name: "Felix Brandt", team: "Sales", role: "Account manager, Europe", lines: ["Felix Brandt covers the European partners from Hamburg.", "Felix flies to the Ambiente fair each February."] },
  { key: "joy", topic: "Americas accounts", name: "Joy Santos", team: "Sales", role: "Account manager, Americas", lines: ["Joy Santos covers partners in the Americas.", "Joy works Hong Kong evenings to overlap with the Americas."] },
  { key: "kit", topic: "Shipping desk", name: "Kit Wong", team: "Operations", role: "Shipping clerk", lines: ["Kit Wong prepares the shipping documents for every order."] },
];

/** The firm's lines added to topics the film already has, by their labels. */
const MORE_IN: Record<string, string[]> = {
  "Payment terms": ["Deposits are 30 percent unless finance agrees to less.", "Late payers move to letters of credit."],
  "Customs codes": ["Glass storage jars ship under HS code 7013.", "Bamboo utensils need a phytosanitary certificate for Australia."],
  "Pricing rules": ["Freight is quoted separately from product price.", "Quotes are valid for 30 days."],
  Markets: ["Australia and New Zealand grew fastest this year.", "The Gulf orders peak before Ramadan."],
  "Trade shows": ["We take a booth at the Ambiente fair in Frankfurt each February.", "Trade show samples are shipped back, never sold."],
  "How you negotiate": ["I put the volume on the table before the price.", "I write down every concession the same day."],
};

export type Roster = {
  clients: Array<{ key: string; name: string; aliases: string[] }>;
  company: Thing[];
  forwarders: Thing[];
  clientThings: Thing[];
  more: Record<string, Line[]>;
};

export function roster(now: number): Roster {
  const rng = Rng.derive(SEED, "commerce-roster");
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
  const org = ([label, lines]: [string, string[]], topic: string[]): Thing => ({ label, kind: "organization", subject: true, lines: lines.map((text) => ({ text, topic })) });
  const company: Thing[] = [
    { label: "Factories", kind: "folder", kids: FACTORIES.map((f) => org(f, [`${f[0].split(" ")[0]} factory visit`, `${f[0]} order`, `${f[0]} audit notes`])) },
    { label: "Product lines", kind: "folder", kids: PRODUCT_LINES.map(([label, lines]) => folder(label, lines, [`${label} specs`, `${label} questions`])) },
    { label: "Policies", kind: "folder", kids: POLICIES.map(([label, lines]) => folder(label, lines, [`${label} policy`, `Updating the ${lower(label)} policy`])) },
    folder("Decisions", DECISIONS, ["Management meeting notes", "Strategy for next year"], "decision"),
    {
      label: "People",
      kind: "folder",
      kids: MORE_WORKERS.map((w) => ({
        label: w.name,
        kind: "person",
        key: w.key,
        subject: true,
        values: [["email", `${w.name.split(" ")[0]!.toLowerCase()}@harbourline.hk`], ["role", w.role]] as Array<[IdentityValueView["field"], string]>,
        lines: w.lines.map((text) => ({ text, topic: [w.topic, `Notes on ${w.name.split(" ")[0]}`] })),
      })),
    },
  ];
  const forwarders = FORWARDERS.map((f) => org(f, [`${f[0].split(" ")[0]} quote`, `${f[0]} booking`]));
  const more = Object.fromEntries(
    Object.entries(MORE_IN).map(([label, lines]) => [
      label,
      lines.map((text) => ({ text, topic: label === "How you negotiate" ? ["Negotiation notes", "Prep for a hard call"] : [`${label} notes`, `${label} questions`], ...(label === "How you negotiate" ? { kind: "style" as const } : {}) })),
    ]),
  );
  return {
    clients: PARTNERS.map((p) => ({ key: p.key, name: p.name, aliases: [p.short] })),
    company,
    forwarders,
    clientThings: PARTNERS.map((p) => partnerThing(p, x)),
    more,
  };
}
