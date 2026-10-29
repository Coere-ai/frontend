import type { IdentityValueView } from "@coere/memory";
import { Rng } from "@v2/tools/gen-corpus/rng";
import { dayName, type Line, type SectionSpec, type Thing } from "./grow";

/**
 * Harbourline Trading at its real size: three more buyers the firm sells
 * to, each with its people, its contracts (their pricing with them) and
 * what the team's chats said about it, slot by slot; the team; and the
 * rest of the firm's memory, section by section, each with a few folders
 * in a trading house's own words. Partner lines are written
 * from templates filled by a seeded stream, so the firm is the same every
 * time it is built. Prices move in percents and volumes in containers.
 * Every name is made up, and no line outside a partner's own folder names
 * Meridian or the film's other featured partners, so the sheet, the
 * reply's context and Cori's answer stay as they are.
 */

const SEED = 0xc0a3;

type Contract = { label: string; about: string; port: string; containers: number; terms: "FOB" | "CIF" | "DDP" | "EXW"; step: string };
type PartnerDef = { key: string; name: string; short: string; what: string; city: string; country: string; currency: string; since: number; contacts: Array<[string, string]>; contracts: Contract[] };

/** The firm's other partners: who they are, their people, and their contracts, each with its route and its next dated step. */
const PARTNERS: PartnerDef[] = [
  { key: "nordhaven", name: "Nordhaven Kitchen", short: "Nordhaven", what: "sells kitchenware online across the Nordic countries", city: "Gothenburg", country: "Sweden", currency: "euros", since: 2021, contacts: [["Sofie Lund", "category manager"]], contracts: [{ label: "Nordhaven bamboo tools", about: "bamboo spoons, boards and utensil sets", port: "Gothenburg", containers: 10, terms: "CIF", step: "The Nordhaven bamboo order ships by {d}." }] },
  { key: "lindenhof", name: "Lindenhof Handel", short: "Lindenhof", what: "supplies hotel and restaurant kitchens in Germany", city: "Hamburg", country: "Germany", currency: "euros", since: 2017, contacts: [["Katrin Weber", "head of purchasing"]], contracts: [{ label: "Lindenhof hotel cookware", about: "heavy pans and stock pots for hotel kitchens", port: "Hamburg", containers: 20, terms: "CIF", step: "Lindenhof's quality audit of the new pans is on {d}." }] },
  { key: "suriya", name: "Suriya Home", short: "Suriya", what: "sells homeware in hypermarkets across Thailand", city: "Bangkok", country: "Thailand", currency: "dollars", since: 2021, contacts: [["Nok Suriyawong", "buying manager"], ["Anan Chai", "logistics lead"]], contracts: [{ label: "Suriya melamine range", about: "melamine plates and bowls for families", port: "Laem Chabang", containers: 17, terms: "FOB", step: "The Suriya melamine food safety report is due {d}." }] },
];

const pick = <T>(rng: Rng, items: readonly T[], n: number): T[] => rng.shuffle([...items]).slice(0, n);
const FIRST = (name: string) => name.split(" ")[0]!;

type X = { rng: Rng; on: (days: number) => string; month: (days: number) => string };

/** A contract's own lines, its pricing, and the dated line its partner's slots keep. */
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
    // Its pricing is filed with the contract itself, so a partner's folder fans out once.
    kids.push({ label: c.label, kind: "project", lines: [...own, ...pricing] });
  }
  return { label: p.name, kind: "organization", client: p.key, aliases: [p.short], subject: true, lines, kids };
}

/** The factories the firm buys from, which a contract names. */
const FACTORY_NAMES = ["Hengli Enamel Works", "Foshan Brightstar Ceramics", "Ningbo Crestline Glass", "Yangjiang Steelcraft", "Fujian Greenleaf Bamboo"];

/** The team beyond the three the film names, as Settings lists them. */
export const MORE_WORKERS = [
  { key: "wing", topic: "Factory visits", name: "Wing Lau", team: "Sourcing", role: "Sourcing manager", lines: ["Wing Lau runs the factory audits and visits.", "Wing negotiates factory prices each spring."] },
  { key: "hannah", topic: "Quality reports", name: "Hannah Ko", team: "Operations", role: "Quality manager", lines: ["Hannah Ko books the inspections and reads every report.", "Hannah keeps the lab test file for each market."] },
  { key: "felix", topic: "European accounts", name: "Felix Brandt", team: "Sales", role: "Account manager, Europe", lines: ["Felix Brandt covers the European partners from Hamburg.", "Felix flies to the Ambiente fair each February."] },
  { key: "joy", topic: "Americas accounts", name: "Joy Santos", team: "Sales", role: "Account manager, Americas", lines: ["Joy Santos covers partners in the Americas.", "Joy works Hong Kong evenings to overlap with the Americas."] },
  { key: "kit", topic: "Shipping desk", name: "Kit Wong", team: "Operations", role: "Shipping clerk", lines: ["Kit Wong prepares the shipping documents for every order."] },
];

/** The three coworkers the film names, with what the team knows about each. */
const NAMED_WORKERS = [
  { key: "tomas", topic: "Sales team notes", name: "Tomas Lindqvist", role: "Sales lead", lines: ["Tomas Lindqvist leads sales and signs off on any discount past 5 percent."] },
  { key: "mei", topic: "Shipping desk", name: "Mei Chan", role: "Shipping coordinator", lines: ["Mei Chan books containers and tracks every vessel."] },
  { key: "arjun", topic: "Finance questions", name: "Arjun Mehta", role: "Finance manager", lines: ["Arjun Mehta approves payment terms past 45 days and every letter of credit."] },
];

/** No more lines on the partners the film names: their folders hold what the film shows. */
const NAMED_MORE: Record<string, Line[]> = {};

/**
 * Harbourline's memory past Company and Clients, in the sections Coere for
 * Teams rings after them, each folder in a trading house's own words.
 * Prices move in percents and volumes in containers.
 */
function sections(): SectionSpec[] {
  return [
    {
      key: "company",
      label: "Company",
      folders: [
        {
          label: "How we work",
          chats: ["Team meeting notes", "Order process", "New partner checklist", "Office routines", "Order desk notes"],
          lines: [
            "The sales team meets Monday at 9 to walk open orders.",
            "Every order has one account manager and one shipping coordinator.",
            "New partners sign our terms of sale before the first order.",
            "Orders are confirmed in writing within one working day.",
            "Every partner call ends with the next date agreed.",
            "Factory and partner emails are filed by order number.",
            "We answer partner emails within one working day, in their time zone.",
            "Each partner gets a yearly visit from its account manager.",
            "Order changes after the deposit need the factory's written yes.",
            "The order desk works Hong Kong hours, and Joy covers the Americas evening.",
            "Big orders get a kickoff call with the factory and the partner.",
            "Every partner has a file with its labels, cartons and documents.",
            "Account managers write a short note after every partner call.",
            "Disputes with a partner go to Tomas before any reply.",
          ],
        },
        {
          label: "Policies",
          chats: ["Quality control policy", "Samples policy", "Credit policy", "Travel policy", "Data and email policy"],
          lines: [
            "Every order gets a pre shipment inspection by a third party.",
            "Samples are free for orders over two containers.",
            "New partners pay a deposit until they have six months of clean payments.",
            "A failed inspection means the factory reworks the order at its own cost.",
            "Samples go by courier within ten days of a request.",
            "Credit limits are reviewed each January.",
            "Factory visits are booked through the travel desk.",
            "Gifts from factories are declined unless they are small.",
            "Partner price lists never leave the shared drive.",
            "Staff may not take a side job with a factory or a partner.",
            "Laptops lock after five minutes and use two step sign in.",
            "Partner data is never shared with another partner.",
          ],
        },
        {
          label: "Systems",
          chats: ["ERP setup", "Shipping portal", "Shared drive structure", "Price list template"],
          lines: [
            "Orders, invoices and stock live in the ERP.",
            "The forwarders' bookings show in one shipping portal.",
            "Price lists are kept in the shared drive, one file per partner.",
            "Inspection reports are filed against the order in the ERP.",
            "Every container has a tracking line in the shipping sheet.",
            "Mei updates the shipping sheet each morning.",
            "The ERP sends a reminder when a deposit is late.",
            "Sample requests are logged in the sample tracker.",
            "The CRM holds every partner contact and call note.",
            "Kit keeps the document templates in the shared drive.",
            "Old orders are archived in the ERP after two years.",
            "Every partner gets a login to see its order status.",
            "The ERP backup runs each night.",
          ],
        },
      ],
      loose: {
        chats: ["Management meeting notes", "Strategy for next year"],
        lines: [
          ["decision", "We decided to keep two factories for every product line."],
          ["decision", "We decided to visit every top ten partner once a year."],
          ["decision", "We decided to quote every new partner in dollars unless they ask for euros."],
        ],
      },
    },
    {
      key: "sourcing",
      label: "Sourcing",
      folders: [
        {
          label: "Factories",
          chats: ["Hengli factory visit", "Brightstar order", "Crestline audit notes", "Steelcraft order", "Greenleaf factory visit", "Factory list"],
          lines: [
            "Hengli Enamel Works makes our enamel cookware in Shenzhen.",
            "Brightstar makes our stoneware and tableware in Foshan.",
            "Crestline makes our glass jars and tumblers in Ningbo.",
            "Steelcraft makes our cutlery and sheet pans in Yangjiang.",
            "Greenleaf makes our bamboo tools and lids in Fujian.",
            "Hengli needs 45 days from deposit to loading.",
            "Brightstar's kiln shuts for two weeks at Lunar New Year.",
            "Crestline breakage runs under 1 percent when packed in dividers.",
            "Steelcraft holds stock of the three best selling patterns.",
            "Greenleaf's bamboo is certified from managed forests.",
            "Every factory signs our supplier code before its first order.",
            "Each product line has a second factory ready if the first fails.",
            "Factories get a forecast for the next two quarters each month.",
            "Factory contacts are in the CRM with their WeChat ids.",
            "We pay factories by bank transfer in two parts.",
          ],
        },
        {
          label: "Factory audits",
          chats: ["Supplier audit in Shenzhen", "Audit checklist", "Audit reports", "Social audit notes"],
          lines: [
            "We audit Hengli every spring.",
            "Wing runs the factory audits and writes up each one.",
            "Every factory gets a social audit every two years.",
            "Audits check fire exits, overtime and wages as well as quality.",
            "A failed audit item gets a fix date and a follow up visit.",
            "Partners can see our audit summaries on request.",
            "New factories are audited before any sample order.",
            "Audit reports are filed in the shared drive by factory and year.",
            "Brightstar passed its last audit with two small findings.",
            "Department store partners in the US ask for audit reports every year.",
            "Audit visits are announced a week ahead, except social audits.",
            "Wing shares audit photos with Hannah the same day.",
          ],
        },
        {
          label: "Samples",
          chats: ["Sample requests", "Sample tracker", "Golden samples", "Sample courier"],
          lines: [
            "Every order is checked against a signed golden sample.",
            "Golden samples are kept in the Hong Kong office for two years.",
            "Sample costs are charged back on orders under two containers.",
            "Color samples are matched under daylight lamps.",
            "Partners get two rounds of samples before they pay.",
            "Samples ship by courier with a tracking number in the tracker.",
            "A third round of samples needs Tomas's approval.",
            "Hannah checks every sample before it goes to a partner.",
            "Pre production samples are photographed and filed.",
            "Samples for trade shows are made a month ahead.",
            "Rejected samples are returned to the factory with notes.",
          ],
        },
        {
          label: "Costs and quotes",
          chats: ["Factory price review", "Cost sheet", "Raw material prices", "Factory quotes"],
          lines: [
            "Wing negotiates factory prices each spring.",
            "Factory quotes hold for 30 days unless steel or glass prices move.",
            "Our cost sheet splits material, labor, packing and margin.",
            "Steel prices set most of the cutlery cost.",
            "We ask two factories to quote any new product.",
            "Factories get a deposit of 30 percent and the rest before loading.",
            "Price rises from factories need three months notice.",
            "Packing costs are quoted separately from the product.",
            "Mold costs are paid once and amortized over the first orders.",
            "Carton costs rose this year, so packing is quoted on every order.",
            "We share a cost breakdown with partners only on private label.",
          ],
        },
      ],
      loose: {
        chats: ["Sourcing notes"],
        lines: ["No new factory is added without a visit by Wing.", "Factory holidays are on the shared calendar."],
      },
    },
    {
      key: "products",
      label: "Products",
      folders: [
        {
          label: "Enamel cookware",
          chats: ["Enamel cookware specs", "Enamel colors", "Enamel range review", "Enamel questions"],
          lines: [
            "Enamel cookware is our biggest line by volume.",
            "Enamel colors are matched to a physical swatch, never a screen.",
            "Enamel pots come in four sizes and eight colors.",
            "Every enamel batch is tested for chips after a drop test.",
            "Induction bases are standard on the new enamel range.",
            "Enamel lids now have steel knobs, not plastic.",
            "Custom enamel colors need a minimum of one container.",
            "Enamel kettles sell best in Japan and Korea.",
            "The enamel range gets two new colors each spring.",
            "Enamel cookware ships two to a carton with paper wrap.",
            "We stopped the speckled finish after too many returns.",
            "Enamel colors are named the same in every market.",
            "The enamel milk pan is the top seller in Korea.",
          ],
        },
        {
          label: "Glassware",
          chats: ["Glassware specs", "Glass storage range", "Glassware breakage", "Glassware questions"],
          lines: [
            "Glassware ships with dividers in every carton.",
            "Glass lids are tested for heat shock.",
            "Glass storage jars come with bamboo or steel lids.",
            "Tumblers come in sets of four and six.",
            "Glass for the US market is tested for lead in the rim.",
            "Breakage claims need photos within seven days of arrival.",
            "The refill jar line grew fastest this year.",
            "Glass storage jars are stackable in three sizes.",
            "Seasonal glassware is ordered by May for the Christmas season.",
            "Every glass item is marked dishwasher safe only after testing.",
            "Glass jars are packed upright with cardboard tops.",
            "Glass orders get an extra 2 percent for breakage.",
          ],
        },
        {
          label: "Bamboo and wood",
          chats: ["Bamboo kitchen tools specs", "Bamboo questions", "Wood finish tests"],
          lines: [
            "Bamboo tools are oiled before packing so they do not crack at sea.",
            "Bamboo utensils need a phytosanitary certificate for Australia.",
            "Bamboo boards come in three sizes with a juice groove.",
            "Wood items ship with silica gel to keep out mold.",
            "Bamboo lids are fitted to the jar at the factory.",
            "Bamboo items are labeled with care instructions in each market's language.",
            "We do not sell bamboo with melamine binders.",
            "Utensil sets come in a cotton bag, not plastic.",
            "Bamboo prices rise after a wet season in Fujian.",
            "Every bamboo batch is checked for moisture before packing.",
          ],
        },
        {
          label: "Cutlery and tableware",
          chats: ["Stainless cutlery specs", "Ceramic tableware specs", "Tableware tests", "Cutlery patterns"],
          lines: [
            "Cutlery comes in three patterns and two finishes.",
            "Every cutlery set is checked for rust after a salt spray test.",
            "Tableware is tested for lead and cadmium for every market.",
            "Tableware ships in sets of four or sixteen.",
            "Stoneware is microwave and oven safe to 220 degrees.",
            "Cutlery is 18/10 steel for the premium line and 18/0 for value.",
            "Tableware glazes are food safe and tested by an outside lab.",
            "Hotel cutlery is heavier and sold by the dozen.",
            "Sheet pans are aluminium with rolled edges.",
            "Matte black cutlery needs extra care in packing to avoid scratches.",
            "Tableware patterns are protected by our own design files.",
            "Cutlery boxes show the steel grade on the front.",
          ],
        },
      ],
      loose: {
        chats: ["Product notes"],
        lines: ["Every product has a spec sheet with materials, sizes and tests.", "New products are tested in one market before they go wide.", "Product photos are shot in Hong Kong on a white background."],
      },
    },
    {
      key: "shipping",
      label: "Shipping",
      folders: [
        {
          label: "Freight partners",
          chats: ["Freight quote comparison", "Tidelink booking", "Eastgate quote", "Coral Bay quote", "Forwarder review"],
          lines: [
            "Tidelink books most of our European containers.",
            "Eastgate Freight handles our shipments to the Americas.",
            "Coral Bay Shipping covers Southeast Asia and Australia.",
            "Tidelink quotes are good for two weeks.",
            "Eastgate sends tracking updates every Monday.",
            "Coral Bay is cheapest for less than container loads.",
            "We switched European bookings to Tidelink in the spring.",
            "Forwarders are reviewed each year on price, delays and claims.",
            "Every booking is confirmed by email with the vessel name.",
            "Forwarders send the draft bill of lading for checking before sailing.",
            "Forwarders get our shipping forecast each month.",
            "Claims for damage go through the forwarder within 30 days.",
          ],
        },
        {
          label: "Customs codes",
          chats: ["Customs codes for kitchenware", "HS code questions", "Duty rates by market", "Customs broker notes"],
          lines: [
            "Glass storage jars ship under HS code 7013.",
            "Bamboo utensils need a phytosanitary certificate for Australia.",
            "Stainless cutlery ships under HS code 8215.",
            "Ceramic tableware ships under HS code 6912.",
            "Codes are checked with the partner's broker before the first order.",
            "The EU needs food contact declarations for every kitchen item.",
            "US orders need a customs bond held by the importer.",
            "Wrong codes are fixed before the goods arrive, never after.",
            "Kit keeps the code list for every product in the shared drive.",
            "Korea checks country of origin marks on every item.",
            "Codes for new products are set before the first sample ships.",
          ],
        },
        {
          label: "Documents",
          chats: ["Shipping documents checklist", "Bill of lading questions", "Certificate of origin", "Packing list template"],
          lines: [
            "Every shipment has an invoice, a packing list and a bill of lading.",
            "Certificates of origin are needed for Korea and Australia.",
            "Kit prepares the shipping documents for every order.",
            "Documents go to the partner's bank within five days of sailing.",
            "The packing list shows carton count, weight and volume.",
            "Telex release is used for partners on open terms.",
            "Original bills go by courier for letters of credit.",
            "Document errors are the main cause of payment delays, so two people check them.",
            "Fumigation certificates are needed for wood items to some markets.",
            "Document templates are updated when a market changes its rules.",
            "Each order's documents are saved together in the ERP.",
          ],
        },
        {
          label: "Incoterms",
          chats: ["Incoterms for Rotterdam route", "FOB or CIF", "Incoterms questions"],
          lines: [
            "Most partners buy FOB Shenzhen or Hong Kong.",
            "CIF quotes include insurance at 110 percent of the invoice.",
            "DDP is offered only to small online partners in Europe.",
            "Risk passes to the buyer when goods are loaded on FOB terms.",
            "Every quote names the Incoterm and the port.",
            "EXW is never offered, since partners struggle with export clearance.",
            "We moved two partners from CIF to FOB when freight rates rose.",
            "Partners new to importing get a short note on what FOB means.",
            "Insurance on CIF orders is placed with one insurer for all lanes.",
            "Partners on FOB terms book their own insurance.",
            "The Incoterm is printed on every proforma invoice.",
          ],
        },
      ],
      loose: {
        chats: ["Shipping notes"],
        lines: ["Peak season space is booked six weeks ahead.", "Every delay over three days is told to the partner the same day."],
      },
    },
    {
      key: "markets",
      label: "Markets",
      folders: [
        {
          label: "Europe",
          chats: ["European market notes", "EU rules for kitchenware", "European partners review", "Ambiente fair notes"],
          lines: [
            "Felix Brandt covers the European partners from Hamburg.",
            "European buyers want food contact tests on every item.",
            "Germany and the Nordics prefer muted colors and steel lids.",
            "European orders peak before the autumn season.",
            "The EU packaging rules will cut plastic in our cartons.",
            "Spain buys more tableware than any other European market.",
            "Partners in Europe pay in euros, and we hedge some of it.",
            "Hotel kitchens in Germany buy heavier pans than retail.",
            "The UK now needs its own conformity marks on some items.",
            "Nordic buyers ask for the carbon footprint of each shipment.",
            "Hamburg is our second port for Northern Europe.",
          ],
        },
        {
          label: "Asia Pacific",
          chats: ["Asia Pacific notes", "Q4 pricing to Singapore", "Australia market notes", "Japan and Korea notes"],
          lines: [
            "Australia and New Zealand grew fastest this year.",
            "Japanese buyers check packaging as closely as the product.",
            "Korea needs Korean labels on every box.",
            "Southeast Asia buys more value range items.",
            "Australia checks wood and bamboo at the border.",
            "Golden Week slows orders from Japan in early May.",
            "Malaysia and Thailand prefer melamine for everyday use.",
            "Partners in Japan expect samples within a week.",
            "Hong Kong partners often pick up from our warehouse.",
            "Australian buyers order twice a year, in spring and autumn.",
            "Thailand needs Thai labels on retail packs.",
          ],
        },
        {
          label: "Americas",
          chats: ["Americas market notes", "US compliance questions", "Mexico and Chile notes", "Canada orders"],
          lines: [
            "Joy Santos covers partners in the Americas.",
            "US buyers want California Prop 65 testing on kitchen items.",
            "Mexico orders run through Manzanillo.",
            "Canada buys more restaurant supplies than retail.",
            "US department stores ask for social audit reports.",
            "Chile and Peru buy basics for supermarket shelves.",
            "Americas orders peak before the US holiday season.",
            "US duties on some kitchenware changed this year, so quotes are checked each month.",
            "Canada needs French on every retail label.",
            "Long Beach is the port for most US orders.",
            "Partners in Mexico prefer prices in dollars.",
          ],
        },
        {
          label: "Gulf and Middle East",
          chats: ["Gulf market notes", "Ramadan season planning", "Jebel Ali shipping"],
          lines: [
            "The Gulf orders peak before Ramadan.",
            "Gift boxes sell best in the Gulf.",
            "Partners in the Gulf want Arabic and English labels.",
            "Jebel Ali is the port for most Gulf orders.",
            "Gulf hypermarkets order in large single shipments.",
            "Ramadan dates move each year, so orders are planned from the calendar.",
            "Gulf buyers want halal friendly coatings on non stick items.",
            "Payment in the Gulf is mostly by letter of credit.",
            "Summer heat means glass ships with extra padding to the Gulf.",
            "Felix covers the Gulf partners until we hire for the region.",
          ],
        },
      ],
      loose: {
        chats: ["Market notes"],
        lines: ["Every new market starts with one partner and one product line.", "Market briefs are updated after each trade show.", "Each market has a one page brief in the shared drive.", "We review market sales at the end of each quarter."],
      },
    },
    {
      key: "money",
      label: "Money",
      folders: [
        {
          label: "Payment terms",
          chats: ["Payment terms negotiation", "Payment terms by partner", "Late payments", "Deposits"],
          lines: [
            "Deposits are 30 percent unless finance agrees to less.",
            "Late payers move to letters of credit.",
            "Partners on open terms get a statement on the first of each month.",
            "Payment reminders go out three days before the due date.",
            "A payment more than 15 days late stops new orders.",
            "Long term partners can earn 60 day terms after two clean years.",
            "Payment terms are written on every proforma invoice.",
            "Bank charges are split between us and the partner.",
            "Deposits are paid before the factory buys raw materials.",
            "Credit notes are issued within a week of an agreed claim.",
            "Partners can pay early for a small discount.",
          ],
        },
        {
          label: "Pricing rules",
          chats: ["Margin by region", "Q4 pricing review", "Price list updates", "Discount rules"],
          lines: [
            "Freight is quoted separately from product price.",
            "Quotes are valid for 30 days.",
            "Our target margin is higher on private label than on our own brand.",
            "Volume discounts start at five containers a year.",
            "Prices for the next year are sent to partners in November.",
            "Any price below cost plus the floor margin needs Tomas.",
            "Price lists show prices per carton and per piece.",
            "We never match a competitor's price without seeing the quote.",
            "Private label prices include the cost of artwork and molds.",
            "Freight surcharges are passed through at cost.",
            "Price breaks are shown at one, five and ten containers.",
          ],
        },
        {
          label: "Letters of credit",
          chats: ["Letter of credit checklist", "LC discrepancies", "Bank contacts", "LC questions"],
          lines: [
            "Every letter of credit is checked against the order before we accept it.",
            "Arjun approves every letter of credit.",
            "Letters of credit must allow partial shipments.",
            "We ask for 21 days to present documents.",
            "Discrepancies cost a fee, so Kit checks the documents twice.",
            "Our bank in Hong Kong advises most letters of credit.",
            "Confirmed letters of credit are needed for new partners in some markets.",
            "Expiry dates leave two weeks after the latest shipment date.",
            "Kit keeps a checklist for each bank's letter of credit format.",
            "Amendments to a letter of credit need Arjun's approval.",
          ],
        },
        {
          label: "Currency",
          chats: ["Currency hedging", "Euro quotes", "FX questions"],
          lines: [
            "We quote in dollars by default.",
            "Euro quotes are hedged when the order is confirmed.",
            "Arjun reviews currency exposure every Friday.",
            "Yen orders are priced with a buffer for currency moves.",
            "Factories are paid in renminbi or dollars.",
            "Currency rates for quotes are set each Monday.",
            "Euro and yen quotes carry the rate date on the quote.",
            "Big currency moves trigger a price review with Tomas.",
            "We hold some euros to pay European costs.",
            "Currency clauses in contracts allow a price review past a set move.",
          ],
        },
      ],
      loose: {
        chats: ["Finance notes"],
        lines: ["Arjun sends the cash report every Monday.", "Bad debts are reviewed at the quarterly finance meeting.", "Month end closes on the third working day.", "Credit insurance covers our largest partners."],
      },
    },
    {
      key: "sales",
      label: "Sales",
      folders: [
        {
          label: "Trade shows",
          chats: ["Trade show follow ups", "Canton Fair plan", "Ambiente fair plan", "Booth planning"],
          lines: [
            "We take a booth at the Ambiente fair in Frankfurt each February.",
            "Trade show samples are shipped back, never sold.",
            "The Canton Fair booth shows the new colors first.",
            "Each trade show has a target list of buyers to meet.",
            "Lead cards are typed into the CRM the same evening.",
            "We book hotels for Frankfurt by September.",
            "Trade show budgets are set in the January plan.",
            "Felix and Grace staff the Frankfurt booth.",
            "Booth staff wear the same shirts and name badges.",
            "We send a thank you email to every buyer we met within two days.",
            "The Hong Kong houseware fair in April is for Asian buyers.",
          ],
        },
        {
          label: "How you negotiate",
          chats: ["Negotiation notes", "Prep for a hard call", "Renewal playbook"],
          lines: [
            ["style", "I put the volume on the table before the price."],
            ["style", "I write down every concession the same day."],
            ["style", "I ask what else matters before I talk about price."],
            ["style", "I give a reason with every no."],
            ["style", "I close each call by reading back what we agreed."],
            ["style", "I keep my tone warm even when the answer is no."],
            ["style", "I let the other side name a number first when I can."],
            ["style", "I never negotiate by email when a call will do."],
          ],
        },
        {
          label: "Proposals",
          chats: ["Proposal template", "Renewal proposals", "New partner proposal"],
          lines: [
            "Proposals fit on two pages, with prices in an appendix.",
            "Every proposal names the Incoterm, the port and the lead time.",
            "Renewal proposals compare this year with last year.",
            "Proposals are read by Tomas before they go out.",
            "We send proposals as PDF with the price list attached.",
            "Each proposal has one clear deadline to accept.",
            "New partner proposals include our audit summary.",
            "Proposals list three options when the partner is price sensitive.",
            "Every proposal is saved in the CRM with its outcome.",
            "Lost proposals get a short note on why.",
          ],
        },
        {
          label: "Leads",
          chats: ["New leads", "Lead follow ups", "Buyer intros"],
          lines: [
            "Leads from email get an answer the same day.",
            "Leads are ranked by volume and fit with our lines.",
            "Intros from partners get a call within two days.",
            "We send a sample pack to qualified leads only.",
            "Leads with no answer after three tries are closed.",
            "Grace reviews the lead list each Friday.",
            "Leads from trade shows are sorted by market the same week.",
            "Every new lead is checked for credit before a quote.",
            "Leads get our catalog as a PDF, not a printed copy.",
            "Grace answers leads from Japan herself.",
            "A lead becomes a partner only after the first paid order.",
          ],
        },
      ],
      loose: {
        chats: ["Sales notes"],
        lines: ["Sales numbers by partner are shared with the team each month.", "We keep a list of partners we lost and why.", "Sales targets are set by market each January.", "Every partner has a yearly business review."],
      },
    },
    {
      key: "plans",
      label: "Plans and deadlines",
      folders: [
        {
          label: "Shipping calendar",
          chats: ["Shipping calendar", "Holiday shutdowns", "Peak season plan", "Lunar New Year plan"],
          lines: [
            "Factories close for about three weeks at Lunar New Year.",
            "Orders for spring must load before the Lunar New Year shutdown.",
            ["task", "Last bookings before the Lunar New Year rush go in by {d}.", 40],
            "Golden Week in October slows factories for a week.",
            "Peak season for Europe and the US runs from July to October.",
            ["task", "The holiday shipping calendar goes to partners by {d}.", 21],
            "Ramadan season orders must sail eight weeks ahead.",
            "The shipping calendar is shared with every partner in December.",
            "Space on Europe lanes is tight from August to October.",
            "Chinese National Day closes ports for part of the first week of October.",
            ["task", "Spring order deadlines go to every partner by {d}.", 28],
            "Partners get two weeks notice of any factory holiday.",
          ],
        },
        {
          label: "Year plan",
          chats: ["Plan for next year", "Strategy for next year", "Budget planning"],
          lines: [
            ["event", "The planning day for next year is on {d}.", 30],
            "We plan to add one new product line next year.",
            "Next year's goal is two new partners in Europe.",
            ["task", "Next year's price lists go out by {d}.", 34],
            "We plan to cut plastic in packing by half.",
            "The budget for next year is set in December.",
            "We want every partner on a yearly plan by spring.",
            "We plan to open a small office in Rotterdam.",
            "Next year's trade show list is set in January.",
            "We want to move one more product line to a second factory.",
            "We aim to cut late shipments to under 5 percent.",
          ],
        },
        {
          label: "Team calendar",
          chats: ["Team calendar", "Travel plans", "Office events"],
          lines: [
            ["event", "The team dinner is on {d}.", 56],
            "The office closes for three days at Lunar New Year.",
            ["event", "Wing's next trip to the factories starts {d}.", 24],
            "Felix visits the European partners each March.",
            "Quarterly reviews with the team are in the first week of each quarter.",
            "Mei takes leave over Christmas, and Kit covers the shipping desk.",
            "Felix and Joy visit Hong Kong each summer.",
            "The team photo is taken at the spring dinner.",
            ["event", "The quarterly team review is on {d}.", 66],
            "Hannah's inspection trips are on the shared calendar.",
          ],
        },
        {
          label: "Hiring and training",
          chats: ["Hiring plan", "Quality inspector search", "Training plan", "New hire checklist"],
          lines: [
            "We are hiring a second quality inspector next year.",
            "New hires spend a week at a factory in their first month.",
            "Every new hire learns the ERP from Kit.",
            "Account managers take a course on letters of credit.",
            "Interviews include a short case on a late shipment.",
            "We hire from the Polytechnic University's logistics course.",
            "Language classes are paid for staff who cover a market.",
            "Each new hire shadows a trade show before working one.",
            "Every new hire gets a buddy for the first month.",
            "Training on customs rules is refreshed each year.",
          ],
        },
      ],
      loose: {
        chats: ["Plans notes"],
        lines: ["Calendars are checked every Monday at the team meeting.", "Partner deadlines live in the CRM with reminders.", ["task", "The office lease renewal is due {d}.", 62], "Every date a partner depends on is in the shared calendar."],
      },
    },
  ];
}

export type Roster = {
  clients: Array<{ key: string; name: string; aliases: string[] }>;
  clientThings: Thing[];
  /** The team as persons in Company's team folder. */
  people: Thing[];
  /** More lines on the partners the film names, by client key. */
  named: Record<string, Line[]>;
  /** The firm's memory by section, Company first, each with its folders. */
  sections: SectionSpec[];
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
  const people: Thing[] = [...NAMED_WORKERS, ...MORE_WORKERS].map((w) => ({
    label: w.name,
    kind: "person",
    key: w.key,
    subject: true,
    values: [["email", `${w.name.split(" ")[0]!.toLowerCase()}@harbourline.hk`], ["role", w.role]] as Array<[IdentityValueView["field"], string]>,
    lines: w.lines.map((text) => ({ text, topic: [w.topic, `Notes on ${w.name.split(" ")[0]}`] })),
  }));
  return {
    clients: PARTNERS.map((p) => ({ key: p.key, name: p.name, aliases: [p.short] })),
    clientThings: PARTNERS.map((p) => partnerThing(p, x)),
    people,
    named: NAMED_MORE,
    sections: sections(),
  };
}
