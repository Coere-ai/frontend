import { count, firstName as first, vendorParts, type Book, type Field, type Line, type MakeCtx, type Mate, type Vendor } from "./scale";

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

/** The partners grown beside the four the film names: name, what it is, where, its pieces of work. Made up names. */
const PARTNERS: Array<[key: string, name: string, short: string, about: string, works: string[], size: number]> = [
  ["bluestem", "Bluestem Grocers", "Bluestem", "Bluestem Grocers runs 41 stores across Kansas and Missouri.", ["Spring shelf reset", "Club pack listing"], 1],
  ["copper-kettle", "Copper Kettle Markets", "Copper Kettle", "Copper Kettle Markets runs 18 upscale grocery stores around Denver.", ["Cinnamon trial"], 1],
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

/* ---------- the brand ---------- */

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
const RIDGELINE: Vendor = ["Ridgeline Co-Packing", "bakes and wraps every oat bar", "six weeks", "every two weeks", "Paula Strand"];
const SWEETWATER: Vendor = ["Sweetwater Oats", "supplies our rolled oats", "four weeks", "net 30", "Glen Hardy"];
const COPPERFIELD: Vendor = ["Copperfield Maple Co", "supplies the maple syrup for the maple bars", "eight weeks", "net 45", "Ruth Lavoie"];
const HARTWELL: Vendor = ["Hartwell Packaging", "prints our boxes and shelf trays", "five weeks", "on delivery", "Vince Oduya"];
const LARCH: Vendor = ["Larch Logistics", "runs our two warehouses and ships to grocers", "three days", "monthly", "Tessa Brandvold"];
const FAIRWAY: Vendor = ["Fairway Demo Staffing", "staffs our store demos", "ten days", "per demo", "Lena Fischer"];
const NORTHCOTE: Vendor = ["Northcote Labs", "tests every new recipe for allergens and shelf life", "three weeks", "per test", "Dr. Amir Shah"];
const TANDEM: Vendor = ["Tandem Retail Data", "sends us store sales from most grocers", "a week", "yearly", "Holly Marsh"];

/** The partners a line about the business at large names: the ones in memory, never the one the film follows. */
const NAMED = ["Harbor Foods", "Pine Street", "Northway", "Bluestem", "Copper Kettle"];
const FLAVORS = ["maple", "cocoa", "berry"];
const TOWNS = ["Akron", "Dayton", "Toledo", "Wichita", "Topeka", "Boulder", "Duluth", "Rochester", "Eugene", "Salem"];
const OFFERS = ["buy two get one", "a dollar off a box", "20 percent off", "two boxes for 7 dollars"];
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
/** A day shortly before the chat, in words ("March 3"). */
const lately = (x: MakeCtx) => x.g.after(x.on, -9, -2, x.rng);
const money = (n: number) => n.toLocaleString("en-US");
const decision = (text: string): Line => ({ text, kind: "decision" });
const style = (text: string): Line => ({ text, kind: "style" });

const PROCEDURES: Array<[string, string[]]> = [
  ["New item setup", ["Every new item needs a spec sheet, a case image and a cost sheet before a buyer sees it.", "Hiro signs the allergen statement before a new item form goes out.", "New item forms go to the buyer at least ten weeks before the shelf date."]],
  ["Promotion approval", ["A promotion is written up with its dates, its stores and its cost before anyone agrees to it.", "Dana checks every promotion against the trade spend tracker.", "An approved promotion goes on the shared calendar the same day."]],
  ["Deduction disputes", ["Every deduction is matched to a promotion within two weeks.", "A deduction with no backup is disputed in writing with the grocer's portal.", "Tom keeps the dispute log for the East Coast partners."]],
  ["Store demo booking", ["Store demos are booked with Fairway at least ten days ahead.", "Each demo gets 300 samples, one table and a sign with the price.", "The store manager gets a call two days before every demo."]],
  ["Out of stock response", ["An out of stock over three days goes to Sam the same morning.", "Chris tells the buyer when the next truck will arrive.", "We send the store a credit if a promotion runs with an empty shelf."]],
  ["Price change notice", ["Grocers get 60 days' notice of any list price change.", "A price change letter goes out on letterhead and by email.", "Marcus calls the top ten partners before the letter goes out."]],
];

/** Company: the team, how it works, its tools and its rules. */
const COMPANY: Field["company"] = [
  { label: "Team", parts: [] },
  {
    label: "How we work",
    parts: [
      ...PROCEDURES.map(([label, steps]): [string[], string[]] => [[`${label} steps`, `How we do ${label.toLowerCase()}`, `${label} checklist`], steps]),
      [["Store visit checklist", "Store visit steps"], ["Every store visit checks the shelf, the price tag and the back room.", "Photos of the shelf go in the visit report the same day."]],
    ],
  },
  {
    label: "Tools and systems",
    parts: [
      [["Trade spend tracker setup", "Where is the trade spend tracker"], ["We keep every promotion and what it cost in the trade spend tracker.", "Dana Kim runs the trade spend tracker."]],
      [["Shared promo calendar access", "Promo calendar access"], ["The shared promo calendar holds every promotion date for every partner.", "Priya Nair runs the shared promo calendar."]],
      [["Retail data portal setup"], ["Weekly store sales from Tandem land in the retail data portal.", "Marcus Hale runs the retail data portal."]],
      [["Deduction log access"], ["Every deduction and its dispute goes in the deduction log.", "Tom Wexler keeps the deduction log."]],
      [["Spec sheet folder"], ["The spec sheet folder has a spec sheet and allergen statement for each item.", "Hiro Sato owns the spec sheet folder."]],
      [["Order desk setup"], ["Every purchase order and short shipment goes through the order desk.", "Chris Doyle runs the order desk."]],
      [["Grocer portal logins", "New logins"], ["Grocer portals use one shared login per partner, kept in the password manager.", "New hires get access to the portals in their first week."]],
      [["Shared drive layout"], ["Sell sheets and spec sheets live in the shared drive, one folder per partner."]],
    ],
  },
  {
    label: "Policies",
    parts: [
      [["Travel and expenses policy"], ["Store visits are booked through the travel tool, not on personal cards.", "Meals with a buyer stay under the grocer's own gift rules."]],
      [["Gifts and samples policy"], ["Buyers get samples, never gifts.", "Free product for a store event needs a written request from the store."]],
      [["Talking about price"], ["We never discuss one grocer's price with another grocer.", "List prices are only sent from the pricing inbox."]],
      [["Claims on the box"], ["Every claim on the box needs a lab test behind it.", "We do not call the bars healthy on any box or post."]],
      [["Social media policy"], ["Only Elena posts for the brand.", "Store photos are posted only with the grocer's written OK."]],
      [["Time off", "Holiday cover"], ["Field reps take time off outside the holiday reset weeks.", "Every account has a named backup when its manager is away."]],
      [["Expense reports"], ["Expense reports are due by the fifth of each month.", "Receipts over 25 dollars need a photo."]],
    ],
  },
];

/** Products: the bars, their boxes, the next flavor and the lab work behind them. */
const PRODUCTS: Field["sections"][number] = {
  label: "Products",
  folders: [
    {
      label: "Flavors and SKUs",
      parts: [
        [["Flavor sales by region", "Which flavor sells where"], ["Maple is our best seller in the Midwest.", "Cocoa sells best in stores near colleges.", "Berry is the bar most often out of stock."]],
        [["SKU list", "Item codes"], ["Each flavor comes in a single bar, a box of 6 and a club pack of 24.", "The maple box of 6 is item 1042 and our biggest seller.", "Club packs only go to club stores and online grocers."]],
        [["Berry recipe change", "Berry bar feedback"], ["We cut the sugar in the berry bar by two grams in May.", "Buyers said the new berry bar tastes the same as the old one."]],
        [["Slow movers", "Cutting slow items"], ["The berry club pack sells under ten cases a week and is up for review.", "A flavor that sells under one case per store a week gets a review."]],
        [["Bar size test"], [decision("We decided to keep the bar at 45 grams after the shrink test.")]],
      ],
      make: {
        n: 6,
        from: [
          (x) => {
            const fl = x.one(FLAVORS);
            return [[`${cap(fl)} sales in ${x.g.month(x.on)}`, `Flavor sales ${x.g.month(x.on)}`], [`${cap(fl)} sold ${money(x.rng.int(9, 26) * 100)} cases across all partners in ${x.g.month(x.on)}.`]];
          },
          (x) => {
            const who = x.one(NAMED);
            return [[`Flavor mix at ${who}`], [`Maple is ${x.rng.int(40, 55)} percent of our sales at ${who} and cocoa ${x.rng.int(25, 35)} percent.`]];
          },
        ],
      },
    },
    {
      label: "Packaging",
      parts: [
        [["Box details", "What goes on the box"], ["Every box lists the oats' farm region.", "The club pack box is printed in two colors to save cost.", "Shelf trays hold 12 boxes."]],
        [["Box refresh timeline", "New box rollout"], ["The new box art goes to Hartwell for proofs in November.", "Old boxes run out at the co-packer by the end of December.", "Stores get the new boxes from mid January."]],
        ...vendorParts(HARTWELL),
        [["Case labels", "Pallet labels"], ["Every case label shows the item code, the best by date and the lot.", "Pallets go out with one label on each of two sides."]],
        [["Tray damage", "Damaged trays"], ["Trays crushed in transit were most of last spring's damage claims.", "Hartwell added a thicker corner to the tray in June."]],
        [["Tray material options"], [decision("We chose a recyclable tray over a plastic one for the new box.")]],
        [["Box of 4 for small stores", "Smaller box"], ["Small stores asked for a box of 4.", "A box of 4 would need a new tray from Hartwell."]],
      ],
    },
    {
      label: "Cinnamon launch",
      parts: [
        [["Cinnamon launch plan", "Cinnamon rollout"], ["Cinnamon goes to buyers with the spring line reviews in January.", "We want cinnamon in 300 stores in its first three months.", "Launch stores get a free first case and a demo."]],
        [["Cinnamon recipe tests", "Cinnamon taste panel"], ["The third cinnamon recipe won the taste panel 31 votes to 12.", "Cinnamon uses Ceylon cinnamon, not cassia.", "Northcote cleared cinnamon for shelf life at nine months."]],
        [["Cinnamon box art", "Cinnamon packaging"], ["The cinnamon box is a warm brown with the same layout as maple.", "Elena wants the cinnamon box proofs by December 1."]],
        [["Cinnamon pricing", "Cinnamon cost sheet"], ["Cinnamon costs four cents more a bar than maple to make.", "Cinnamon launches at the same list price as maple."]],
        [["Cinnamon sell sheet", "Cinnamon pitch"], ["The cinnamon sell sheet leads with the taste panel result.", "Copper Kettle and Bluestem get the first cinnamon pitches."]],
        [["Cinnamon launch risks"], ["Cinnamon supply is tight until February.", "If the boxes slip, we launch in the old style box with a sticker."]],
        [["Cinnamon launch date"], [decision("We decided to launch cinnamon in March 2027, not in January.")]],
        [["Cinnamon demo plan"], ["Every cinnamon launch store gets a Saturday demo in its first month.", "Fairway needs the cinnamon demo list by January 10."]],
      ],
    },
    {
      label: "Recipes and testing",
      parts: [
        ...vendorParts(NORTHCOTE),
        [["Allergen statement", "Allergen sheet"], ["All our bars are made on a line that also runs almonds.", "The allergen statement lists oats, maple, cocoa and the almond warning.", "Hiro updates the allergen sheet after any recipe change."]],
        [["Shelf life test results", "Shelf life tests"], ["Our bars hold their taste for ten months at room temperature.", "Bars kept above 30 degrees go soft after four months."]],
        [["Honey flavor test", "Honey flavor results"], [decision("We dropped the honey flavor after the spring tests."), "Tasters found the honey bar too sweet next to maple."]],
        [["Protein bar idea", "New bar ideas"], ["Marketing wants a protein oat bar for 2028.", "A protein bar would need a new line at Ridgeline."]],
        [["Gluten claims", "Gluten free question"], ["Our oats are not certified gluten free, so we make no gluten claim.", "A gluten free bar would need oats from a certified mill."]],
      ],
    },
  ],
};

const QUARTERS = ["first quarter", "second quarter", "third quarter", "fourth quarter"];

/** Promotions: the calendar, the money behind it, the demos and the coupons. */
const PROMOTIONS: Field["sections"][number] = {
  label: "Promotions",
  folders: [
    {
      label: "Promo calendar",
      parts: [
        [["Promo calendar rules", "Calendar rules"], ["Spring promotions are set by the end of January.", "Back to school promotions run the last two weeks of August.", "No partner gets two promotions in the same month."]],
        [["Promo calendar for Larch", "Warehouse calendar"], ["The promo calendar is shared with Larch so the warehouses can plan."]],
        [["Spring promo calendar", "Spring promotions"], ["Spring promotions run from the first week of March to the end of April.", "Bluestem and Copper Kettle both want a spring promotion this year."]],
        [["Promo calendar changes"], ["Priya sends the calendar to the field reps every Friday."]],
      ],
      make: {
        n: 8,
        from: [
          (x) => {
            const who = x.one(NAMED);
            return [[`${who} promotion dates`, `${who} ${x.g.month(x.on)} promotion`], [`${who} runs ${x.one(OFFERS)} on our oat bars from ${x.g.after(x.on, 20, 60, x.rng)} for two weeks.`]];
          },
        ],
      },
    },
    {
      label: "Trade spend rules",
      parts: [
        [["Trade spend rules", "What counts as trade spend"], ["Display fees count as trade spend.", "Coupons count against trade spend when they are redeemed, not when they print.", "Every partner gets a trade spend budget in January."]],
        [["Trade spend budget 2027", "Trade spend plan"], ["The 2027 trade spend budget is 2.1 million dollars across all partners.", "Each partner's budget is set from last year's sales and growth."]],
        [["Trade spend review", "Trade spend by partner"], ["Dana reviews trade spend by partner every month.", "A partner over its budget by ten percent gets a call from Marcus."]],
        [["Display fees", "Endcap costs"], ["An endcap costs between 500 and 2,000 dollars a store for two weeks.", "We only pay for displays the store sends photos of."]],
        [["Deep discount rule"], [decision("We decided no promotion goes deeper than 25 percent off without finance.")]],
      ],
      make: {
        n: 5,
        from: [
          (x) => {
            const who = x.one(NAMED);
            return [[`${who} trade spend`, `${who} budget check`], [`${who} has used ${x.rng.int(55, 96)} percent of its trade spend budget for the year.`]];
          },
        ],
      },
    },
    {
      label: "Sampling events",
      parts: [
        [["Demo tips", "What works at demos"], ["Saturday demos sell about twice what Friday demos sell.", "Demo staff wear the green aprons, never a grocer's uniform.", "We sample maple first and cocoa second."]],
        ...vendorParts(FAIRWAY),
        [["Demo results", "Store demo results"], ["A good store demo sells about 40 boxes in a weekend.", "Demos near the checkout sell more than demos in the snack aisle."]],
        [["Demo days"], [decision("We moved store demos from weekdays to Friday to Sunday.")]],
      ],
      make: {
        n: 6,
        from: [
          (x) => {
            const who = x.one(NAMED);
            return [[`${who} demo weekend`, `${who} demo results`], [`The demo at ${who}'s ${x.one(TOWNS)} store sold ${x.rng.int(24, 70)} boxes over the weekend of ${lately(x)}.`]];
          },
        ],
      },
    },
    {
      label: "Coupons and loyalty",
      parts: [
        [["Loyalty app coupons", "Digital coupons"], ["Digital coupons go out through each grocer's loyalty app.", "A digital coupon costs us the discount plus 9 cents a redemption.", "Priya books loyalty app coupons six weeks ahead."]],
        [["Coupon results", "Coupon redemption"], ["About one coupon in twelve gets redeemed.", "Coupons on maple are redeemed twice as often as coupons on berry."]],
        [["Print coupons"], [decision("We stopped print coupons in 2025 because so few were used.")]],
        [["Coupon clearing house", "Coupon fraud"], ["Coupons are cleared through one clearing house that bills us monthly.", "A store that redeems far more coupons than it sells gets a check."]],
        [["When coupons drop", "Coupon calendar"], ["Most loyalty coupons drop on Wednesdays with the weekly ad."]],
      ],
      make: {
        n: 6,
        from: [
          (x) => {
            const who = x.one(NAMED);
            return [[`${who} loyalty coupon`, `${who} coupon results`], [`${who}'s loyalty coupon for ${x.one(["50 cents", "a dollar", "75 cents"])} off a box ran in ${x.g.month(x.on)}, and ${money(x.rng.int(8, 40) * 100)} were redeemed.`]];
          },
        ],
      },
    },
  ],
};

/** Supply chain: the co-packer, what goes in the bars, and getting them to the stores. */
const SUPPLY: Field["sections"][number] = {
  label: "Supply chain",
  folders: [
    {
      label: "Ridgeline Co-Packing",
      kind: "organization",
      parts: [
        ...vendorParts(RIDGELINE),
        [["Production plan", "Co-packer schedule"], ["Ridgeline makes each flavor once every three weeks.", "Sam sends Ridgeline the production plan every Monday.", "A run of one flavor is at least 40,000 bars."]],
        [["Ridgeline audit", "Co-packer audit"], ["Hiro audits Ridgeline every spring.", "The last Ridgeline audit found one open item about pest traps."]],
        [["Mock recall", "Recall drill"], ["We run a mock recall with Ridgeline every six months.", "A mock recall must trace every case within four hours."]],
      ],
      make: {
        n: 7,
        from: [
          (x) => {
            const fl = x.one(FLAVORS);
            return [[`${cap(fl)} run ${x.g.month(x.on)}`, `Ridgeline ${fl} run`], [`Ridgeline ran ${money(x.rng.int(30, 60) * 100)} cases of ${fl} in the week of ${lately(x)}.`]];
          },
          (x) => {
            const fl = x.one(FLAVORS);
            return [[`Short ${fl} run`, `Ridgeline short run`], [`The ${fl} run on ${lately(x)} came in ${money(x.rng.int(3, 12) * 100)} cases short because of a wrapper fault.`]];
          },
        ],
      },
    },
    {
      label: "Ingredients",
      parts: [
        ...vendorParts(SWEETWATER),
        ...vendorParts(COPPERFIELD),
        [["Oat prices", "Oat contract"], ["Our oat contract with Sweetwater is fixed until August 2027.", "Oat prices went up 7 percent this year."]],
        [["Maple syrup supply", "Maple shortage"], ["A short maple season can push syrup prices up by a third.", "We keep eight weeks of maple syrup at Ridgeline."]],
        [["Cocoa supply"], ["Our cocoa comes from a broker in Rotterdam and is bought six months ahead."]],
        [["Oat lot rejected", "Oat quality"], ["Ridgeline rejected one oat lot in August for moisture.", "Every oat lot comes with a moisture test from the mill."]],
        [["Cocoa costs", "Cocoa prices"], ["Cocoa costs rose by half in two years.", "We may cut the cocoa in the cocoa bar if prices stay this high."]],
      ],
    },
    {
      label: "Warehouses and shipping",
      parts: [
        ...vendorParts(LARCH),
        [["Warehouse locations", "Where our stock is"], ["Larch runs our warehouses in Joliet and in Reno.", "The Joliet warehouse ships to every partner east of the Rockies."]],
        [["Delivery windows", "Grocer delivery rules"], ["Most grocers want deliveries between 4 am and noon.", "A missed delivery window can cost a 250 dollar fine."]],
        [["Fill rate", "Short shipments"], ["Our fill rate was 97 percent last quarter.", "Chris tells the buyer about any short shipment the same day."]],
        [["Holiday shipping plan", "Holiday freight"], ["Holiday orders ship two weeks earlier than usual.", "Larch adds a Saturday shift from mid November."]],
      ],
      make: {
        n: 7,
        from: [
          (x) => {
            const who = x.one(NAMED);
            return [[`Late truck to ${who}`, `${who} delivery`], [`A Larch truck to ${who} was ${count(x.rng.int(2, 7))} hours late on ${lately(x)} and missed its window.`]];
          },
          (x) => {
            const who = x.one(NAMED);
            return [[`${who} order shipped`, `${who} big order`], [`The ${who} order of ${money(x.rng.int(6, 30) * 100)} cases left ${x.one(["Joliet", "Reno"])} on ${lately(x)}.`]];
          },
        ],
      },
    },
  ],
};

/** Sales data: the weekly numbers, what shoppers say and how partners score us. */
const DATA: Field["sections"][number] = {
  label: "Sales data",
  folders: [
    {
      label: "Weekly sales",
      parts: [
        ...vendorParts(TANDEM),
        [["Weekly sales report", "Sales report setup"], ["The weekly sales report goes out every Tuesday at noon.", "It shows sales, units and on shelf rate by partner."]],
        [["Online sales", "Online grocery"], ["Online orders are 8 percent of our sales and growing.", "Online shoppers buy the club pack three times as often as store shoppers."]],
      ],
      make: {
        n: 9,
        from: [
          (x) => {
            const who = x.one(NAMED);
            return [[`${who} sales week of ${lately(x)}`, `${who} weekly sales`], [`${who} sold ${money(x.rng.int(18, 90) * 100)} boxes in the week of ${lately(x)}, up ${x.rng.int(2, 14)} percent on last year.`]];
          },
          (x) => {
            const who = x.one(NAMED);
            return [[`${who} sales dip`, `Why ${who} sales fell`], [`${who} sales fell ${x.rng.int(4, 12)} percent in the week of ${lately(x)} while their snack aisle was being reset.`]];
          },
        ],
      },
    },
    {
      label: "Shopper insights",
      parts: [
        [["Shopper survey notes", "What shoppers told us"], ["Our shoppers are mostly parents buying for school lunches.", "Shoppers pick oat bars for the short list of ingredients.", "Most shoppers find us in the snack aisle, not the cereal aisle."]],
        [["Survey for 2027", "Next shopper survey"], ["The next shopper survey runs in February with 1,500 shoppers.", "Priya wants questions about cinnamon in it."]],
        [["Focus group notes", "Focus groups"], ["The Chicago focus group liked the old maple box more than the new one.", "Parents asked for a smaller bar for young children."]],
        [["Loyalty app data", "What loyalty data shows"], ["Loyalty app data shows half our shoppers buy two boxes at a time.", "Shoppers who try cocoa come back for maple more often than the other way round."]],
        [["Who buys cocoa", "Cocoa shoppers"], ["Cocoa shoppers are younger and buy more often online.", "Cocoa sells 30 percent more in the weeks before exams."]],
        [["Lunch box season", "Back to school shoppers"], ["Sales rise about a fifth in the first three weeks of school.", "Back to school shoppers buy the box of 6 more than single bars."]],
        [["Shoppers and price", "Price sensitivity"], ["Shoppers switch away when our box costs more than 5.99 dollars.", "A dollar off moves about three times as many boxes as 20 percent off."]],
        [["Store brand bars", "Private label"], ["Store brand oat bars sell for about a dollar less than ours.", "Shoppers who switch to store brand often come back within two months."]],
      ],
    },
    {
      label: "Scorecards",
      parts: [
        [["Partner scorecards", "How partners score us"], ["Each partner scores us on fill rate, on time delivery and sales growth.", "A score under 90 on any line gets a plan within two weeks."]],
        [["On shelf rate", "Store audits"], ["Jamal checks on shelf rate in 20 stores every month.", "Most empty shelves happen on Mondays after a busy weekend."]],
      ],
      make: {
        n: 11,
        from: [
          (x) => {
            const who = x.one(NAMED);
            return [[`${who} scorecard`, `${who} scorecard review`], [`${who} scored us ${x.rng.int(91, 99)} on fill rate and ${x.rng.int(86, 98)} on on time delivery for the ${x.one(QUARTERS)}.`]];
          },
        ],
      },
    },
  ],
};

/** Money: the price list, what grocers take off our invoices, and getting paid. */
const MONEY: Field["sections"][number] = {
  label: "Pricing and payments",
  folders: [
    {
      label: "Pricing",
      parts: [
        [["2027 price list", "Price list"], ["The 2027 price list goes to every partner by November 20.", "List price for a box of 6 is 4.20 dollars to the grocer.", "Club packs list at 14.80 dollars."]],
        [["February price increase"], [decision("We raised list prices 4 percent from February."), "Two partners asked to delay the increase until April."]],
        [["Cost per bar", "Bar costs"], ["A maple bar costs us 31 cents to make and pack.", "Freight adds about 3 cents a bar."]],
        [["Default holiday offer"], [decision("We chose buy two get one as the default holiday offer.")]],
        [["Slotting fee limits"], [decision("We stopped paying slotting fees above two flavors per grocer.")]],
        [["Shelf price check", "Price gaps"], ["Our box of 6 sells for 4.99 to 5.79 dollars on shelf.", "The leading snack bar brand sells for about 50 cents less."]],
        [["Club pack price"], ["Club stores sell the club pack for 16.99 dollars.", "We hold club pack prices for the whole year."]],
        [["Price for new partners"], ["New partners start on list price with a launch allowance of 10 percent."]],
        [["Online pricing", "Price for online grocers"], ["Online grocers get the same list price as stores.", "We pay for the product photos online grocers ask for."]],
      ],
    },
    {
      label: "Deductions",
      parts: [
        [["Deduction backlog", "Open deductions"], ["We have 46 open deductions worth about 38,000 dollars.", "Tom wants the backlog under 20 by the end of the year."]],
        [["Damaged goods deductions", "Unsaleables"], ["Most grocers take 1 to 3 percent off for damaged goods.", "We ask for photos for any damage claim over 500 dollars."]],
      ],
      make: {
        n: 10,
        from: [
          (x) => {
            const who = x.one(NAMED);
            return [[`${who} deduction ${x.rng.int(4100, 4999)}`, `${who} deduction question`], [`${who} took ${money(x.rng.int(4, 60) * 50)} dollars off invoice ${x.rng.int(20100, 20999)} for ${x.one(["a display we never saw", "damaged trays", "a coupon that ran in the wrong week", "a late delivery fine", "a promotion we paid already"])}.`]];
          },
          (x) => {
            const who = x.one(NAMED);
            return [[`Deduction won back from ${who}`, `${who} dispute`], [`We won back ${money(x.rng.int(6, 40) * 50)} dollars from ${who} on a deduction with no backup.`]];
          },
        ],
      },
    },
    {
      label: "Invoices and payments",
      parts: [
        [["Payment terms", "Partner payment terms"], ["Most partners pay in 30 days and two pay in 45.", "We give a 1 percent discount for payment in ten days."]],
        [["Late payments", "Overdue invoices"], ["Chris chases any invoice 15 days past due.", "Late payments are listed in the deduction log too."]],
        [["Broker commission", "Bluebird Brokers"], ["Bluebird Brokers represents us with grocers in the South on a 5 percent commission.", "Bluebird's contract renews every January."]],
        [["Invoice errors", "Wrong invoices"], ["Most invoice errors come from old prices left in the order desk.", "Chris checks every invoice over 20,000 dollars before it goes out."]],
      ],
      make: {
        n: 8,
        from: [
          (x) => {
            const who = x.one(NAMED);
            return [[`${who} payment ${x.g.month(x.on)}`, `${who} paid late`], [`${who} paid ${count(x.rng.int(2, 5))} invoices late in ${x.g.month(x.on)}, the longest by ${x.rng.int(9, 24)} days.`]];
          },
        ],
      },
    },
  ],
};

/** Writing: how the brand sounds, how Olivia writes plans, and the notes that go to buyers. */
const WRITING: Field["sections"][number] = {
  label: "Writing",
  folders: [
    {
      label: "Brand voice",
      parts: [
        [["Brand voice rules", "How we sound"], ["We write oats with a small o unless it starts a sentence.", "We never use the word guilt in our copy.", "Our signs say what is in the bar, not what it does."]],
        [["Brand words", "Words we use"], ["We say partner, not retailer, in our own notes.", "Flavors are written in lower case in a sentence, like maple and cocoa."]],
        [["Social posts", "Social plan"], ["Elena posts three times a week.", "Posts show the bars in lunch boxes and on trails."]],
        [["Sell sheet style"], ["Sell sheets fit on one page with one photo of the box."]],
        [["Website copy", "About us page"], ["The website says who we are in three sentences.", "Every product page lists the ingredients first."]],
        [["Words to avoid", "Copy checks"], ["We avoid the words superfood, clean and natural.", "Elena reads every new piece of copy before it goes out."]],
        [["Product photos", "Photo style"], ["Product photos are shot on wood in daylight.", "We never show a bar next to fruit it does not contain."]],
      ],
    },
    {
      label: "How you write plans",
      parts: [
        [["Writing to buyers", "Plan template", "Email style"], ["I put the date first in every subject line.", "I write to buyers in short paragraphs with one ask each.", "I end every plan with the next step and who owns it."].map(style)],
        [["Rewrite this note", "Shorter partner notes", "Team update draft"], ["I use numbers, not adjectives, when I talk about results.", "I keep notes to partners under 150 words.", "I say we, not I, when I write for the team."].map(style)],
        [["Plan format", "One page plans"], ["I put last year's result next to every number in a plan.", "I use a table for anything with more than three stores."].map(style)],
        [["Business review deck", "Slide decks"], ["I keep business review decks to eight slides.", "I put the ask on the first slide."].map(style)],
        [["Recap style"], ["I write recaps as what happened, what it means and what we do next."].map(style)],
      ],
    },
    {
      label: "Notes to buyers",
      parts: [
        [["Buyer note template", "Note to a buyer"], ["Notes to buyers start with the date and the one ask.", "We attach numbers as a table, never as a screenshot."]],
        [["Business review recap", "Review follow up"], ["After every business review we send a recap within two days.", "The recap lists what we agreed, who owns it and the date."]],
        [["Holiday cards", "Year end notes"], ["Every buyer gets a handwritten card and a box of bars in December."]],
        [["Price increase note", "Price letter wording"], ["The price letter says why, how much and from when, in three sentences."]],
        [["Note after a store visit", "Thank you notes"], ["After a store visit we thank the store manager by name within a day."]],
        [["Out of stock note", "Apology note"], ["An out of stock note says sorry, why it happened and the next delivery date.", "We never blame the warehouse in a note to a buyer."]],
        [["Intro to a new buyer", "New buyer intro"], ["A note to a new buyer has our three flavors, our best numbers and one ask."]],
        [["Promotion recap note", "Promo recap"], ["A promotion recap goes to the buyer within two weeks of the end.", "It shows units, the lift over a normal week and what we would change."]],
        [["Complaint reply", "Reply to a store complaint"], ["A reply to a store complaint goes out the same day, even if it only says we are looking into it."]],
        [["Line review pitch", "Pitch for line review"], ["A line review pitch covers sales, the shopper and what we ask for, in that order.", "We bring a sample box for every person in the room."]],
      ],
    },
  ],
};

/** Plans and deadlines: the year's goals, the team's meetings and the shows. */
const PLANS: Field["sections"][number] = {
  label: "Plans and deadlines",
  loose: [[["Due this month", "This month's deadlines"], ["Sell sheets for the spring line reviews are due November 15.", "The 2027 trade spend budget closes on December 10.", "Line review dates for spring go out in early December."]]],
  folders: [
    {
      label: "2027 goals",
      parts: [
        [["2027 goals", "Yearly plan", "Planning for next year"], ["Our 2027 goal is 25 new grocery partners.", "We want cocoa in 80 percent of our partners' stores by the end of 2027.", "We aim to keep trade spend under 18 percent of gross sales."]],
        [["Goals review", "Growth plan"], ["We want on shelf rates above 95 percent at every top ten partner.", "We plan to launch one new flavor a year.", "We want every partner on a weekly sales feed by June."]],
        [["Q4 priorities", "Fourth quarter plan"], ["Our top priority this quarter is the holiday promotions.", "Second is getting cinnamon onto every spring line review."]],
        [["How 2026 went", "2026 results"], ["We added 9 grocery partners in 2026.", "Trade spend ended 2026 at 17.4 percent of gross sales."]],
        [["Hiring plan 2027", "Hiring plan"], ["We plan to hire two field reps in 2027, one in Texas and one in Ohio.", "A new account manager starts in February."]],
        [["Cinnamon goal"], ["We want cinnamon in 1,000 stores by the end of 2027."]],
      ],
    },
    {
      label: "Team meetings",
      parts: [
        [["Team rhythm", "Meeting schedule", "Weekly meetings"], ["Sales meets every Monday at 9 to go through the week's promotions.", "Finance closes trade spend for the month on the third working day.", "We review every partner's scorecard in the first week of each quarter."]],
        [["Team calendar", "Standing meetings"], ["The whole team meets the first Thursday of the month for a sales update.", "Ops and sales meet on Wednesdays about the production plan.", "Every new hire spends a day at Ridgeline in their first month."]],
        [["Team offsite", "Offsite plan"], ["The team offsite is in Milwaukee on January 22 and 23.", "Each team brings its three goals for 2027 to the offsite."]],
        [["Field rep calls", "Rep check in"], ["Field reps call in on Fridays at 3 with the week's store visits.", "Jamal sends store photos to the team channel after each visit."]],
        [["One on ones"], ["I meet each field rep one on one every other week."]],
        [["Year end party"], ["The year end party is on December 18 at the office."]],
        [["Quarterly business reviews", "Business review calendar"], ["Each top partner gets a business review every quarter.", "Marcus books the reviews for the next quarter at once."]],
      ],
    },
    {
      label: "Trade shows",
      parts: [
        [["Expo West plan", "Trade show booth"], ["We have a booth at Expo West in March, number 3417.", "The booth needs 2,000 samples and four people each day."]],
        [["Trade show leads", "Show follow ups"], ["We met 14 new grocery buyers at the last show.", "Every lead from a show gets a note within a week."]],
        [["Midwest grocers show"], ["The Midwest grocers show is in Chicago in September."]],
        [["Show budget", "Expo West costs"], ["Expo West costs about 28,000 dollars with travel.", "We split show costs between sales and marketing."]],
        [["Samples for shows"], ["Ridgeline sets aside 3,000 bars before each show."]],
        [["Booth graphics", "Booth design"], ["The booth wall shows the three flavors and cinnamon coming soon.", "Hartwell prints the booth graphics."]],
        [["Who works the booth", "Show staffing"], ["Marcus, Grace and two field reps work Expo West.", "Each person at the booth gets a list of the buyers we want to meet."]],
        [["Winter food show"], [decision("We decided to skip the winter food show this year to save for Expo West.")]],
      ],
    },
  ],
};

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
    ["northway", "Northway Grocers", "Northway", ["Holiday displays"]],
  ],
  self: "Olivia",
  team: TEAM,
  teamFolder: "Team",
  company: COMPANY,
  sections: [PRODUCTS, PROMOTIONS, SUPPLY, DATA, MONEY, WRITING, PLANS],
};
