import { count, firstName as first, type Book, type Field, type Mate, type Vendor } from "./scale";

/**
 * Fieldhouse Pantry at full size: the chats Olivia and her team had
 * across ChatGPT, Claude and Gemini over a year and a half, grown from a
 * seed by scale.ts in the words of an oat bar brand that sells to
 * grocers. The grocery partners, the team, the vendors, the procedures and
 * the rules are made up for the demo; no real company is named.
 * memory.ts files what grows here beside the lines the film writes by
 * hand, which stay as they are.
 */

const SEED = 20261028;

/* ---------- the grocery partners ---------- */

const FIRSTS = ["Alana", "Bryce", "Camila", "Darius", "Eileen", "Felipe", "Gwen", "Hector", "Imani", "Jonas", "Keisha", "Lorenzo", "Mira", "Nolan", "Odette", "Pavel", "Quinn", "Renata", "Silas", "Tamsin", "Ulrich", "Vivian", "Wesley", "Yara", "Zane", "Annika", "Boris", "Celeste", "Desmond", "Esther", "Fiona", "Gideon", "Helena", "Isaac", "Joelle", "Kieran", "Leona", "Mateo", "Nina", "Oscar", "Paloma", "Rhys", "Simone", "Tobias", "Ursula", "Valentin", "Wren", "Ximena", "Yusuf", "Zora", "Ansel", "Bianca", "Cormac", "Delphine", "Emeka", "Freya", "Gustavo", "Hollis", "Ingrid", "Jasper"];
const LASTS = ["Abernathy", "Bjork", "Castellano", "Delacroix", "Esposito", "Fairbanks", "Gallagher", "Halloran", "Ingram", "Jaramillo", "Kowalski", "Lindahl", "Mbeki", "Nakamura", "Oyelaran", "Pruitt", "Quiroga", "Rasmussen", "Sorensen", "Thibodeaux", "Underwood", "Valdez", "Whitcomb", "Yilmaz", "Zielinski", "Ashworth", "Bergstrom", "Cavanaugh", "Dunleavy", "Eckhart"];
/** The main contact buys for the snack aisle; the others run stores, space, promotions or payments. */
const LEADS = ["category buyer", "category manager", "snacks buyer", "director of grocery"];
/** What each role does for us, as a line about the contact says it. */
const DUTY: Record<string, string> = {
  "category buyer": "signs off on every new item and promotion",
  "category manager": "owns the snack aisle plan",
  "snacks buyer": "signs off on every new item and promotion",
  "director of grocery": "approves the yearly plan",
  "store operations manager": "runs displays and demos in the stores",
  "merchandising lead": "decides where displays go",
  "promotions coordinator": "books every ad and coupon",
  "accounts payable lead": "handles our invoices and deductions",
  "space planner": "draws the shelf plans for each reset",
  "vendor relations manager": "runs the vendor portal and new vendor forms",
};
const ROLES = ["store operations manager", "merchandising lead", "promotions coordinator", "accounts payable lead", "space planner", "vendor relations manager"];

/** Each partner: its name, what it is, where, and its pieces of work. Made up names. */
const PARTNERS: Array<[key: string, name: string, short: string, about: string, works: string[], size: number]> = [
  ["bluestem", "Bluestem Grocers", "Bluestem", "Bluestem Grocers runs 41 stores across Kansas and Missouri.", ["Spring shelf reset", "Club pack listing"], 3],
  ["copper-kettle", "Copper Kettle Markets", "Copper Kettle", "Copper Kettle Markets runs 18 upscale grocery stores around Denver.", ["Endcap display", "Cinnamon launch"], 2],
  ["ridgeway", "Ridgeway Foods", "Ridgeway", "Ridgeway Foods runs 96 supermarkets across Pennsylvania and New York.", ["Back to school promotion", "Price increase"], 3],
  ["lakeshore", "Lakeshore Fresh", "Lakeshore", "Lakeshore Fresh runs 27 stores along Lake Michigan.", ["Summer sampling tour"], 2],
  ["maple-hollow", "Maple Hollow Market", "Maple Hollow", "Maple Hollow Market is a family owned grocer with 6 stores in Vermont.", ["Maple flavor feature"], 1],
  ["sunfield", "Sunfield Grocery", "Sunfield", "Sunfield Grocery runs 58 stores in Arizona and New Mexico.", ["Spring shelf reset", "Loyalty coupon test"], 3],
  ["prairie-basket", "Prairie Basket", "Prairie Basket", "Prairie Basket is an online grocer that delivers across Iowa and Nebraska.", ["Online listing refresh"], 1],
  ["tallgrass", "Tallgrass Market", "Tallgrass", "Tallgrass Market runs 14 natural food stores in Oklahoma.", ["Cinnamon launch"], 1],
  ["riverbend", "Riverbend Co-op", "Riverbend", "Riverbend Co-op is a member owned grocer with 4 stores in Wisconsin.", ["Member sampling days"], 1],
  ["fairmont", "Fairmont Fresh", "Fairmont", "Fairmont Fresh runs 33 stores across Tennessee.", ["Endcap display", "New store openings"], 2],
  ["oakline", "Oakline Grocers", "Oakline", "Oakline Grocers runs 72 stores in Georgia and the Carolinas.", ["Holiday gift boxes", "Club pack listing"], 3],
  ["brookside", "Brookside Markets", "Brookside", "Brookside Markets runs 22 neighborhood stores in Philadelphia.", ["Checkout trial size"], 2],
  ["westfield", "Westfield Natural Foods", "Westfield", "Westfield Natural Foods runs 11 stores in Washington state.", ["Bulk bin trial"], 1],
  ["bayview", "Bayview Grocery", "Bayview", "Bayview Grocery runs 29 stores around the Chesapeake Bay.", ["Summer sampling tour", "Price increase"], 2],
];

const DELIVERABLES = ["spring promotion plan", "new item forms for cinnamon", "updated case prices", "display photos from the top stores", "shelf tags for the reset", "sell through recap", "samples of the new box", "2027 price list", "coupon proposal", "club pack spec sheet", "store demo calendar", "allergen statement for the new flavor"];
const THEIR_THINGS = ["store counts for the reset", "their spring ad calendar", "scan data by store", "the planogram for the snack aisle", "backup for last month's deductions", "their new vendor portal steps", "the list of stores getting the endcap", "their 2027 promotion calendar"];
const ASKS = ["a shelf ready case of 12", "a smaller trial size for checkout lanes", "two more weeks on the coupon", "sales by store every Monday", "photos of every display once it is set", "a demo in each new store", "a price that holds through June", "cocoa in every store, not only the top ones", "an allergen sheet for each flavor", "a case pack of 8 for small stores"];
const PREFERS = ["a call on Tuesday mornings", "plans on one page", "numbers in a table, not a deck", "email before noon", "a short text when a demo moves", "every price change in writing", "photos over long reports"];

const consumerBook: Book = {
  status: [
    (x) => [[`${x.c.short} relationship`], `Active client since ${x.g.monthYear(x.on)}. ${first(x.k)} is our main buyer there.`],
    (x) => [[`${x.c.short} relationship`], `Active client since ${x.g.monthYear(x.on)}. We sell all three flavors there.`],
  ],
  contact: [
    (x) => [[`Call notes with ${x.k.name}`, `Intro to ${first(x.k)}`], `${x.k.name} is the ${x.k.role} at ${x.c.short} and ${DUTY[x.k.role]}.`],
    (x) => [[`${first(x.k)} at ${x.c.short}`, `Meeting ${first(x.k)}`], `At ${x.c.short}, ${first(x.k)} ${DUTY[x.k.role]} as ${x.k.role}.`],
    (x) => [[`New contact at ${x.c.short}`, `${x.c.short} team changes`], `${x.k.name} took over as ${x.k.role} at ${x.c.short} in ${x.g.month(x.on)} and ${DUTY[x.k.role]}.`],
  ],
  promise: [
    (x, due) => {
      const what = x.one(DELIVERABLES);
      return [[`${x.c.short} ${what}`, `Promises to ${x.c.short}`], `We promised ${first(x.k)} the ${what} by ${due}.`];
    },
    (x, due) => [[`Follow up with ${first(x.k)}`, `${x.c.short} next steps`], `I told ${first(x.k)} I would send the ${x.one(DELIVERABLES)} by ${due}.`],
    (x, due) => [[`${x.c.short} open items`, `Waiting on ${x.c.short}`], `${x.c.short} agreed to send ${x.one(THEIR_THINGS)} before ${due}.`],
  ],
  meetingAhead: [
    (x, due) => [[`${x.c.short} business review`, `Prep for ${x.c.short} review`], `Quarterly business review with ${x.k.name} on ${due}.`],
    (x, due) => [[`${x.c.short} line review`], `Line review with ${x.c.short} on ${due} to look at the snack aisle.`],
    (x, due) => [[`${x.c.short} store walk`], `Store walk with ${first(x.k)} on ${due} in their two busiest stores.`],
  ],
  meetingPast: [
    (x, day) => [[`${x.c.short} summer results`, `${x.c.short} review notes`], `Met ${first(x.k)} on ${day} to go through the summer results.`],
    (x, day) => [[`${x.c.short} category review`], `Category review with ${x.c.short} on ${day}. They kept all three flavors.`],
  ],
  deadline: [
    (x, due) => [[`${x.c.short} new item forms`], `New item forms for ${x.c.short} are due by ${due}.`],
    (x, due) => [[`${x.c.short} spring ad`], `The ${x.c.short} spring ad closes on ${due}.`],
    (x, due) => [[`${x.c.short} 2027 costs`], `${x.c.short} needs the 2027 cost sheet by ${due}.`],
  ],
  request: [
    (x) => [[`${x.c.short} asks`, `${x.c.short} buyer feedback`], `${x.c.short} asked for ${x.one(ASKS)}.`],
    (x) => [[`Notes from ${first(x.k)}`, `${x.c.short} requests`], `${first(x.k)} asked for ${x.one(ASKS)}.`],
  ],
  preference: [
    (x) => [[`Working with ${first(x.k)}`, `${x.c.short} ways of working`], `${first(x.k)} prefers ${x.one(PREFERS)}.`],
  ],
  billing: [
    (x) => [[`${x.c.short} invoices`, `${x.c.short} payment terms`], `${x.c.short} pays net ${x.one([30, 45, 60])} and takes promotion costs off the invoice.`],
    (x) => [[`${x.c.short} invoice rules`], `${x.c.short} wants the purchase order number on every invoice.`],
    (x) => [[`${x.c.short} deductions`], `${x.c.short} deducts unsaleables at ${x.one([1, 2, 3])} percent of each invoice.`],
  ],
  document: [
    (x) => [[`${x.c.short} vendor guide`], `Pasting the ${x.c.short} vendor guide: delivery windows, case labels and the rules for pallets.`],
    (x) => [[`${x.c.short} scorecard`], `Pasting the ${x.c.short} scorecard: on shelf rate, fill rate and two notes from the buyer.`],
  ],
  decision: [
    (x) => [[`${x.c.short} spring offer`], `${x.c.short} chose buy two get one over a price cut for spring.`],
    (x) => [[`${x.c.short} flavor range`], `${x.c.short} decided to carry cocoa in every store from January.`],
    (x) => [[`${x.c.short} display decision`], `${first(x.k)} turned down the endcap and asked for shelf tags instead.`],
  ],
  work: [
    (x) => [[`${x.c.short} ${x.w.toLowerCase()}`, `${x.w} plan`], [`The ${x.w.toLowerCase()} at ${x.c.short} covers ${x.rng.int(8, 40)} stores.`, `${first(x.c.contacts[0]!)} wants the ${x.w.toLowerCase()} agreed before ${x.g.month(x.g.ahead(30, 90, x.rng).iso)}.`]],
    (x) => [[`${x.w} results`, `${x.c.short} ${x.w.toLowerCase()} numbers`], [`Sales rose ${x.rng.int(6, 24)} percent in the stores that had the ${x.w.toLowerCase()}.`]],
    (x) => [[`${x.w} store check`, `${x.c.short} store visits`], [`${count(x.rng.int(3, 9))} stores were late with the ${x.w.toLowerCase()}, so we lost the first weekend.`, `Jamal checks the ${x.w.toLowerCase()} in person every other Friday.`]],
    (x) => [[`${x.w} timeline`, `${x.c.short} ${x.w.toLowerCase()} dates`], [`The ${x.w.toLowerCase()} for ${x.c.short} runs for ${count(x.rng.int(2, 8))} weeks.`, `${x.c.short} wants the shelf tags a week before the ${x.w.toLowerCase()} starts.`]],
    (x) => [[`${x.w} questions`], [`${first(x.k)} asked whether the ${x.w.toLowerCase()} can include the cinnamon bars.`]],
    (x) => [[`${x.w} trade spend`], [`The ${x.w.toLowerCase()} stays inside the 18 percent trade spend rule.`, `Dana signed off on the ${x.w.toLowerCase()} costs in ${x.g.month(x.on)}.`]],
    (x) => [[`${x.w} lessons`, `What we learned from the ${x.w.toLowerCase()}`], [`Next time the ${x.w.toLowerCase()} needs the order in ${count(x.rng.int(2, 4))} weeks earlier.`]],
  ],
};

/* ---------- the company ---------- */

/** The team: [name, team, role, what they own, what to ask them about]. Made up. */
export const TEAM: Mate[] = [
  ["Marcus Hale", "Sales", "Sales lead", "the national grocery accounts", "price changes"],
  ["Tom Wexler", "Sales", "Regional sales manager, East", "the East Coast partners", "deductions from the East Coast grocers"],
  ["Grace Liu", "Sales", "Regional sales manager, West", "the western partners", "new store openings in the west"],
  ["Jamal Reed", "Sales", "Field sales rep", "store visits in the Midwest", "displays that were not set"],
  ["Priya Nair", "Marketing", "Shopper marketing manager", "coupons and the loyalty apps", "shopper data"],
  ["Elena Petrova", "Marketing", "Brand manager", "packaging and the brand voice", "claims on the box"],
  ["Dana Kim", "Finance", "Trade spend analyst", "the trade spend tracker", "promotion costs"],
  ["Nadia Farouk", "Finance", "Finance director", "pricing approvals", "offers past 25 percent off"],
  ["Sam Okafor", "Operations", "Supply chain planner", "the production plan with the co-packer", "out of stocks"],
  ["Hiro Sato", "Operations", "Food safety manager", "allergen statements and audits", "spec sheets"],
  ["Chris Doyle", "Operations", "Customer service lead", "orders and short shipments", "a missing delivery"],
];

/** Vendors: [name, what they do for us, notice they need, how they bill, our contact]. Made up. */
const VENDORS: Vendor[] = [
  ["Ridgeline Co-Packing", "bakes and wraps every oat bar", "six weeks", "every two weeks", "Paula Strand"],
  ["Sweetwater Oats", "supplies our rolled oats", "four weeks", "net 30", "Glen Hardy"],
  ["Copperfield Maple Co", "supplies the maple syrup for the maple bars", "eight weeks", "net 45", "Ruth Lavoie"],
  ["Hartwell Packaging", "prints our boxes and shelf trays", "five weeks", "on delivery", "Vince Oduya"],
  ["Larch Logistics", "runs our two warehouses and ships to grocers", "three days", "monthly", "Tessa Brandvold"],
  ["Bluebird Brokers", "represents us with grocers in the South", "two weeks", "on a 5 percent commission", "Ray Pollard"],
  ["Fairway Demo Staffing", "staffs our store demos", "ten days", "per demo", "Lena Fischer"],
  ["Northcote Labs", "tests every new recipe for allergens and shelf life", "three weeks", "per test", "Dr. Amir Shah"],
  ["Tandem Retail Data", "sends us store sales from most grocers", "a week", "yearly", "Holly Marsh"],
];

const PROCEDURES: Array<[string, string[]]> = [
  ["New item setup", ["Every new item needs a spec sheet, a case image and a cost sheet before a buyer sees it.", "Hiro signs the allergen statement before a new item form goes out.", "New item forms go to the buyer at least ten weeks before the shelf date."]],
  ["Promotion approval", ["A promotion is written up with its dates, its stores and its cost before anyone agrees to it.", "Dana checks every promotion against the trade spend tracker.", "An approved promotion goes on the shared calendar the same day."]],
  ["Deduction disputes", ["Every deduction is matched to a promotion within two weeks.", "A deduction with no backup is disputed in writing with the grocer's portal.", "Tom keeps the dispute log for the East Coast partners."]],
  ["Store demo booking", ["Store demos are booked with Fairway at least ten days ahead.", "Each demo gets 300 samples, one table and a sign with the price.", "The store manager gets a call two days before every demo."]],
  ["Out of stock response", ["An out of stock over three days goes to Sam the same morning.", "Chris tells the buyer when the next truck will arrive.", "We send the store a credit if a promotion runs with an empty shelf."]],
  ["Price change notice", ["Grocers get 60 days' notice of any list price change.", "A price change letter goes out on letterhead and by email.", "Marcus calls the top ten partners before the letter goes out."]],
  ["Recall drill", ["We run a mock recall with Ridgeline every six months.", "A mock recall must trace every case within four hours."]],
];

const POLICIES: Array<[string, string[]]> = [
  ["Travel and expenses", ["Store visits are booked through the travel tool, not on personal cards.", "Meals with a buyer stay under the grocer's own gift rules."]],
  ["Gifts and samples", ["Buyers get samples, never gifts.", "Free product for a store event needs a written request from the store."]],
  ["Talking about price", ["We never discuss one grocer's price with another grocer.", "List prices are only sent from the pricing inbox."]],
  ["Claims on the box", ["Every claim on the box needs a lab test behind it.", "We do not call the bars healthy on any box or post."]],
  ["Social media", ["Only Elena posts for the brand.", "Store photos are posted only with the grocer's written OK."]],
];

const DECISIONS: Array<[string, string, string]> = [
  ["Product decisions", "Cinnamon launch date", "We decided to launch cinnamon in March 2027, not in January."],
  ["Product decisions", "Honey flavor test results", "We dropped the honey flavor after the spring tests."],
  ["Product decisions", "Bar size test", "We decided to keep the bar at 45 grams after the shrink test."],
  ["Product decisions", "Tray material options", "We chose a recyclable tray over a plastic one for the new box."],
  ["Retail decisions", "Who gets club packs", "We decided club packs go only to club stores and online grocers."],
  ["Retail decisions", "Slotting fee limits", "We stopped paying slotting fees above two flavors per grocer."],
  ["Retail decisions", "Starting range for new partners", "We decided every new partner starts with maple and cocoa only."],
  ["Retail decisions", "Demo days", "We moved store demos from weekdays to Friday to Sunday."],
  ["Pricing decisions", "February price increase", "We raised list prices 4 percent from February."],
  ["Pricing decisions", "Deep discount rule", "We decided no promotion goes deeper than 25 percent off without finance."],
  ["Pricing decisions", "Default holiday offer", "We chose buy two get one as the default holiday offer."],
]

const TOOLS: Array<[string, string, string]> = [
  ["The trade spend tracker", "every promotion and what it cost", "Dana Kim"],
  ["The shared promo calendar", "every promotion date for every partner", "Priya Nair"],
  ["The retail data portal", "weekly store sales from Tandem", "Marcus Hale"],
  ["The deduction log", "every deduction and its dispute", "Tom Wexler"],
  ["The spec sheet folder", "a spec sheet and allergen statement for each item", "Hiro Sato"],
  ["The order desk", "every purchase order and short shipment", "Chris Doyle"],
];

const RITUALS = [
  "Sales meets every Monday at 9 to go through the week's promotions.",
  "Finance closes trade spend for the month on the third working day.",
  "We review every partner's scorecard in the first week of each quarter.",
  "The whole team meets the first Thursday of the month for a sales update.",
  "Ops and sales meet on Wednesdays about the production plan.",
  "Every new hire spends a day at Ridgeline in their first month.",
];

const GOALS = [
  "Our 2027 goal is 25 new grocery partners.",
  "We want cocoa in 80 percent of our partners' stores by the end of 2027.",
  "We aim to keep trade spend under 18 percent of gross sales.",
  "We want on shelf rates above 95 percent at every top ten partner.",
  "We plan to launch one new flavor a year.",
  "We want every partner on a weekly sales feed by June.",
];

/** More of what the brand knows, in the folders the graph names (field.graph's company). */
const TOPICS: Record<string, string[]> = {
  "Promo calendar": ["Spring promotions are set by the end of January.", "Back to school promotions run the last two weeks of August.", "No partner gets two promotions in the same month.", "The promo calendar is shared with Larch so the warehouses can plan."],
  "Trade spend rules": ["Display fees count as trade spend.", "Coupons count against trade spend when they are redeemed, not when they print.", "Every partner gets a trade spend budget in January."],
  "Flavors and SKUs": ["Maple is our best seller in the Midwest.", "Cocoa sells best in stores near colleges.", "Each flavor comes in a single bar, a box of 6 and a club pack of 24.", "Berry is the bar most often out of stock."],
  Packaging: ["Every box lists the oats' farm region.", "The club pack box is printed in two colors to save cost.", "Shelf trays hold 12 boxes."],
  "Sampling events": ["Saturday demos sell about twice what Friday demos sell.", "Demo staff wear the green aprons, never a grocer's uniform.", "We sample maple first and cocoa second."],
  "Brand voice": ["We write oats with a small o unless it starts a sentence.", "We never use the word guilt in our copy.", "Our signs say what is in the bar, not what it does."],
};

const TONE = [
  "I put the date first in every subject line.",
  "I write to buyers in short paragraphs with one ask each.",
  "I end every plan with the next step and who owns it.",
  "I use numbers, not adjectives, when I talk about results.",
  "I keep notes to partners under 150 words.",
  "I say we, not I, when I write for the team.",
];

/* ---------- growing it ---------- */

export const FIELD: Field = {
  seed: SEED,
  book: consumerBook,
  firsts: FIRSTS,
  lasts: LASTS,
  leads: LEADS,
  roles: ROLES,
  clients: PARTNERS,
  extend: [
    ["harbor", "Harbor Foods", "Harbor Foods", ["Endcap display"]],
    ["pine-street", "Pine Street Co-op", "Pine Street", ["Member sampling days"]],
    ["northway", "Northway Grocers", "Northway", ["Club pack listing"]],
  ],
  self: "Olivia",
  team: TEAM,
  emailDomain: "fieldhousepantry.com",
  vendors: VENDORS,
  procedures: PROCEDURES,
  policies: POLICIES,
  decisions: DECISIONS,
  tools: TOOLS.map(([tool, holds, owner]) => [tool.replace(/^The /, ""), holds, owner]),
  rituals: RITUALS,
  goals: GOALS,
  topics: TOPICS,
  tone: { label: "How you write plans", lines: TONE, titles: ["Writing to buyers", "Plan template", "Email style", "Rewrite this note", "Shorter partner notes", "Team update draft"] },
};
