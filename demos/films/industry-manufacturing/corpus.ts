import { count, firstName as first, type Book, type Field, type Mate, type Vendor } from "./scale";

/**
 * Brightwater Components at full size: the chats Luis and the plant's
 * engineers, shift leads and quality team had across ChatGPT, Claude and
 * Gemini over a year and a half, grown from a seed by scale.ts in the
 * words of a metal parts plant that machines and welds for vehicle and
 * equipment makers. The customers, the team, the suppliers, the
 * procedures and the rules are made up for the demo; no real company is
 * named. memory.ts files what grows here beside the lines the film writes
 * by hand, which stay as they are.
 */

const SEED = 20261031;

/* ---------- the customers ---------- */

const FIRSTS = ["Anke", "Bastian", "Carmen", "Dmitri", "Elif", "Florian", "Greta", "Henrik", "Ilse", "Jakob", "Katrin", "Lukas", "Marta", "Niklas", "Olga", "Piotr", "Rasmus", "Sabine", "Timo", "Ute", "Viktor", "Wiebke", "Yvonne", "Zoltan", "Agnes", "Bruno", "Clara", "Dieter", "Emma", "Felix", "Gerda", "Hugo", "Ida", "Jonas", "Karla", "Linus", "Mila", "Oskar", "Paula", "Ruben", "Selma", "Theo", "Vera", "Walter", "Arturo", "Beatriz", "Cesar", "Dolores", "Esteban", "Fernanda", "Gabriel", "Hilda", "Ignacio", "Julieta"];
const LASTS = ["Albrecht", "Brandl", "Czerny", "Dvorak", "Engel", "Falk", "Gruber", "Hartmann", "Iversen", "Jansen", "Kessel", "Lorenz", "Maier", "Novak", "Olsen", "Pohl", "Quast", "Richter", "Schulte", "Thiele", "Ulrich", "Voss", "Winkler", "Zeller", "Arce", "Barragan", "Cardenas", "Duran", "Espinoza", "Farias", "Guerra", "Ibarra", "Lozano", "Montoya"];
/** The main contact owns the parts we make; the others plan, ship, check or pay. */
const LEADS = ["supplier quality engineer", "buyer", "purchasing manager", "program manager"];
const ROLES = ["logistics planner", "quality manager", "plant manager", "accounts payable lead", "design engineer", "materials planner"];

/** What each role does for us, as a line about the contact says it. */
const DUTY: Record<string, string> = {
  "supplier quality engineer": "signs off on every PPAP and 8D we send",
  buyer: "places the orders and sets the quarterly volumes",
  "purchasing manager": "negotiates prices and the yearly contract",
  "program manager": "runs the launch of each new part",
  "logistics planner": "books the trucks and sets the delivery windows",
  "quality manager": "owns the scorecard and supplier audits",
  "plant manager": "approves any change at their assembly plant",
  "accounts payable lead": "handles our invoices and chargebacks",
  "design engineer": "owns the drawings and tolerances",
  "materials planner": "sends the weekly releases",
};

/** Each customer: its name, what it is, its part programs, its size. Made up names. */
const CUSTOMERS: Field["clients"] = [
  ["harlow", "Harlow Trucks", "Harlow", "Harlow Trucks builds heavy trucks in Saltillo and buys frame brackets from us.", ["Frame brackets", "Cross members"], 3],
  ["vantor", "Vantor Marine", "Vantor", "Vantor Marine builds outboard engines and buys machined mounts.", ["Engine mounts"], 2],
  ["lindqvist", "Lindqvist Elevators", "Lindqvist", "Lindqvist Elevators builds elevator drives in Sweden and Mexico.", ["Drive housings", "Gear covers"], 3],
  ["arden", "Arden Tractor Works", "Arden", "Arden Tractor Works builds compact tractors in Iowa.", ["Hitch plates"], 2],
  ["solvik", "Solvik Cranes", "Solvik", "Solvik Cranes builds truck cranes and buys welded outrigger arms.", ["Outrigger arms", "Pivot pins"], 3],
  ["talbrook", "Talbrook HVAC", "Talbrook", "Talbrook HVAC builds rooftop units and buys sheet metal frames.", ["Base frames"], 1],
  ["quarry", "Quarry Line Equipment", "Quarry Line", "Quarry Line Equipment builds rock crushers in Arizona.", ["Wear plates"], 2],
  ["brennan", "Brennan Mixers", "Brennan", "Brennan Mixers builds concrete mixer trucks in Texas.", ["Drum brackets"], 1],
  ["eastgate", "Eastgate Rail Systems", "Eastgate", "Eastgate Rail Systems builds bogies for freight cars.", ["Bogie castings", "Brake beams"], 2],
  ["norrholm", "Norrholm Forklifts", "Norrholm", "Norrholm Forklifts builds electric forklifts in Ohio.", ["Mast brackets", "Tilt cylinder mounts"], 3],
  ["calder", "Calder Wind Parts", "Calder", "Calder Wind Parts builds yaw systems for wind turbines.", ["Yaw brackets"], 1],
  ["pinecrest", "Pinecrest Trailers", "Pinecrest", "Pinecrest Trailers builds flatbed trailers in Tennessee.", ["Kingpin plates"], 2],
  ["duvall", "Duvall Compressors", "Duvall", "Duvall Compressors builds air compressors for plants.", ["Motor bases"], 1],
  ["selway", "Selway Mining Equipment", "Selway", "Selway Mining Equipment builds loaders for underground mines.", ["Bucket hinges", "Boom pins"], 2],
];

const DELIVERABLES = ["8D report on the porosity defect", "first article inspection report", "capacity study for next year", "updated control plan", "corrective action for the late shipment", "PPAP package for revision B", "quote for the new bracket", "sample parts for the fit test", "cost down proposal", "packaging spec for the new tray", "gauge study results", "run at rate report"];
const THEIR_THINGS = ["the revised drawing", "their 2027 forecast", "the gauge drawings", "their packaging spec", "the returned parts for analysis", "the tooling purchase order", "the new label format", "the signed deviation"];
const ASKS = ["a weekly scrap report", "the heat number on every bin label", "shipments on Tuesdays and Thursdays only", "a call when any shipment is late", "a second source for the castings", "photos of every rejected part", "one invoice per shipment", "labels with a 2D barcode", "a safety stock of two weeks", "a capability study on the critical bore"];
const PREFERS = ["a call before 9 am their time", "data in their portal, not by email", "short 8D reports with photos", "a visit to the plant each quarter", "one page summaries", "every change in writing first"];

const book: Book = {
  status: [
    (x) => [[`${x.c.short} relationship`], `Active customer since ${x.g.monthYear(x.on)}. We make ${count(x.rng.int(3, 14))} part numbers for them.`],
    (x) => [[`${x.c.short} relationship`], `Active customer since ${x.g.monthYear(x.on)}. Their scorecard rates us green.`],
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
    (x, due) => [[`${x.c.short} supplier audit`], `Supplier audit by ${x.c.short} on ${due}, covering welding and traceability.`],
    (x, due) => [[`${x.c.short} launch readiness`], `Launch readiness review with ${x.c.short} on ${due}.`],
  ],
  meetingPast: [
    (x, day) => [[`${x.c.short} plant tour`, `${x.c.short} visit notes`], `Plant tour for ${first(x.k)} on ${day}. They signed off on the new weld cell.`],
    (x, day) => [[`${x.c.short} quality review`], `Quality review with ${x.c.short} on ${day} to close the open 8D.`],
  ],
  deadline: [
    (x, due) => [[`${x.c.short} capacity study`], `The ${x.c.short} capacity study is due by ${due}.`],
    (x, due) => [[`${x.c.short} price review`], `The yearly price review with ${x.c.short} closes on ${due}.`],
    (x, due) => [[`${x.c.short} first shipment`], `First production parts for ${x.c.short} ship on ${due}.`],
  ],
  request: [
    (x) => [[`${x.c.short} asks`, `${x.c.short} quality feedback`], `${x.c.short} asked for ${x.one(ASKS)}.`],
    (x) => [[`Notes from ${first(x.k)}`, `${x.c.short} requests`], `${first(x.k)} asked for ${x.one(ASKS)}.`],
  ],
  preference: [(x) => [[`Working with ${first(x.k)}`, `${x.c.short} ways of working`], `${first(x.k)} prefers ${x.one(PREFERS)}.`]],
  billing: [
    (x) => [[`${x.c.short} invoices`, `${x.c.short} payment terms`], `${x.c.short} pays net ${x.one([45, 60, 90])} and wants the part number on every invoice line.`],
    (x) => [[`${x.c.short} chargebacks`], `${x.c.short} charges back ${x.one([1, 2, 3])} percent of the order for each late delivery.`],
    (x) => [[`${x.c.short} tooling payment`], `${x.c.short} pays for tooling once the first articles are approved.`],
  ],
  document: [
    (x) => [[`${x.c.short} supplier manual`], `Pasting the ${x.c.short} supplier manual: labels, packaging and the steps for a deviation.`],
    (x) => [[`${x.c.short} scorecard`], `Pasting the ${x.c.short} scorecard: quality, delivery and response time by month.`],
  ],
  decision: [
    (x) => [[`${x.c.short} steel change`], `${x.c.short} approved our move to the second steel mill.`],
    (x) => [[`${x.c.short} weld cell move`], `${x.c.short} agreed to move their parts to the new robot weld cell.`],
    (x) => [[`${x.c.short} deviation`], `${first(x.k)} accepted the deviation for the burr on the outer edge.`],
  ],
  work: [
    (x) => [[`${x.c.short} ${x.w.toLowerCase()}`, `${x.w} plan`], [`The ${x.w.toLowerCase()} for ${x.c.short} run on Line ${x.rng.pick([2, 4, 5, 6])} at ${x.rng.int(40, 140)} parts an hour.`, `${first(x.c.contacts[0]!)} wants the ${x.w.toLowerCase()} settled before ${x.g.month(x.g.ahead(30, 90, x.rng).iso)}.`]],
    (x) => [[`${x.w} yield`, `${x.c.short} ${x.w.toLowerCase()} numbers`], [`First pass yield on the ${x.w.toLowerCase()} is ${x.rng.int(88, 99)} percent.`]],
    (x) => [[`${x.w} defects`, `${x.c.short} rejects`], [`Night shift saw burrs on the ${x.w.toLowerCase()} after each tool change.`, `Ana's crew now checks the first part after every tool change.`]],
    (x) => [[`${x.w} timeline`, `${x.c.short} ${x.w.toLowerCase()} dates`], [`The ${x.w.toLowerCase()} need a capability study before full volume.`, `${x.c.short} wants ${count(x.rng.int(2, 6))} weeks of safety stock for the ${x.w.toLowerCase()}.`]],
    (x) => [[`${x.w} cycle time`], [`${first(x.k)} asked us to cut the ${x.w.toLowerCase()} cycle time by ${x.rng.int(3, 12)} seconds.`]],
    (x) => [[`${x.w} tooling`], [`The ${x.w.toLowerCase()} fixtures came from Fuentes in ${x.g.month(x.on)}.`, `Daniel added the ${x.w.toLowerCase()} fixtures to the maintenance plan.`]],
    (x) => [[`${x.w} lessons`, `What we learned on the ${x.w.toLowerCase()}`], [`Next time the ${x.w.toLowerCase()} need the gauges ordered ${count(x.rng.int(2, 4))} weeks earlier.`]],
  ],
};

/* ---------- the plant ---------- */

/** The team: [name, team, role, what they own, what to ask them about]. Made up. */
export const TEAM: Mate[] = [
  ["Ana Ruiz", "Production", "Night shift lead", "the night shift on Lines 3 and 4", "what happened overnight"],
  ["Tomas Herrera", "Production", "Day shift lead", "the day shift on every line", "line staffing"],
  ["Daniel Ortiz", "Maintenance", "Maintenance lead", "the preventive maintenance plan", "machine breakdowns"],
  ["Rafael Cruz", "Maintenance", "Maintenance technician", "the robot weld cells", "weld robot faults"],
  ["Priya Shah", "Quality", "Quality manager", "customer complaints and 8D reports", "a quality hold"],
  ["Mei Lin", "Quality", "Quality engineer", "PPAP packages", "control plans"],
  ["Jorge Salas", "Quality", "Metrology technician", "the gauge lab and calibration", "a gauge out of calibration"],
  ["Sofia Navarro", "Engineering", "Manufacturing engineer", "new part launches", "fixtures and cycle times"],
  ["Ines Duarte", "Supply chain", "Materials planner", "steel and casting orders", "a late coil"],
  ["Victor Garza", "Supply chain", "Logistics lead", "outbound trucks and export papers", "a shipment that missed its truck"],
  ["Laura Mendez", "Safety", "Safety coordinator", "lockout training and the safety audits", "a near miss"],
];

/** Suppliers: [name, what they do for us, notice they need, how they bill, our contact]. Made up. */
const VENDORS: Vendor[] = [
  ["Norte Steel", "rolls the coil steel for every bracket", "six weeks", "net 45", "Alejandro Rios"],
  ["Altamira Castings", "pours the iron castings we machine", "ten weeks", "net 60", "Patricia Leal"],
  ["Sierra Gauges", "calibrates our gauges and torque tools", "two weeks", "per visit", "Hector Saenz"],
  ["Fuentes Tooling", "builds our weld fixtures and dies", "eight weeks", "half up front", "Marco Fuentes"],
  ["Rapido Freight", "trucks our parts to customers in Mexico and Texas", "two days", "weekly", "Claudia Ponce"],
  ["Coldwater Plating", "zinc plates the brackets", "one week", "per lot", "Ben Whitaker"],
  ["Integra Robotics", "services the six weld robots", "three days", "on a yearly contract", "Sanjay Rao"],
  ["Pacific Fasteners", "supplies bolts, nuts and inserts", "four weeks", "net 30", "Grace Tan"],
];

const PROCEDURES: Array<[string, string[]]> = [
  ["Line stop response", ["Any stop over ten minutes is logged with its cause before the line restarts.", "A stop over an hour goes to the plant manager and to the customer if their parts are short.", "Maintenance writes a work order for every stop, even one fixed on the spot."]],
  ["Tool change", ["Every tool change starts with lockout and tagout.", "The first part after a tool change goes to the gauge table before the run goes on.", "Worn tools are tagged red and sent to the tool crib."]],
  ["First article inspection", ["A first article is measured on every dimension of the drawing.", "Mei signs the first article report before parts ship.", "First articles are kept for a year in the quality room."]],
  ["Engineering change", ["No drawing change goes to the floor until the customer approves it in writing.", "Every change gets a new revision letter on the work instruction.", "Old revision parts are counted and quarantined the day a change starts."]],
  ["Nonconforming parts", ["Suspect parts go in the red cage with a hold tag.", "A hold is released only by quality.", "Scrap is weighed and logged by part number every shift."]],
  ["Customer complaint 8D", ["The 8D team meets within 24 hours of a complaint.", "Containment at the customer starts the same day.", "Root cause is proven on the line before the 8D closes."]],
  ["Weld cell startup", ["Weld cells are purged and test welded at the start of every shift.", "A test coupon from each cell is cut and checked every Monday."]],
];

const POLICIES: Array<[string, string[]]> = [
  ["Protective gear", ["Safety glasses and steel toe boots are worn everywhere past the yellow line.", "Hearing protection is worn in the press area at all times."]],
  ["Visitors on the floor", ["Visitors sign in and wear a red vest.", "Customer visitors are walked by an engineer, never alone."]],
  ["Overtime", ["Overtime is posted by Wednesday for the weekend.", "No one works more than 12 hours in a day."]],
  ["Photos in the plant", ["Photos of customer parts stay on plant devices.", "Customer drawings are never sent from personal email."]],
  ["Quality holds", ["Anyone on the floor can stop the line for a quality concern.", "A stopped line restarts only with the shift lead and quality together."]],
];

const DECISIONS: Field["decisions"] = [
  ["Technical decisions", "Second weld cell for brackets", "We decided to add a second robot weld cell for brackets instead of a third shift."],
  ["Technical decisions", "Nutrunner brand", "We chose to standardize every nutrunner on one brand by spring."],
  ["Technical decisions", "Gauge lab temperature", "We moved the gauge lab into the air conditioned room after the summer drift."],
  ["Technical decisions", "Spindle check interval", "We decided to check spindles every 500 hours, not every 1,000."],
  ["Plant decisions", "Night shift on Line 6", "We added a night shift on Line 6 from September."],
  ["Plant decisions", "Kaizen events", "We decided to run one kaizen event a month, each on a different line."],
  ["Plant decisions", "Shared tool crib", "We merged the two tool cribs into one by the shipping dock."],
  ["Supplier decisions", "Second steel mill", "We decided to buy bracket steel from two mills."],
  ["Supplier decisions", "Plating supplier audit", "We put Coldwater Plating on a monthly audit after the salt spray failures."],
  ["Supplier decisions", "Fastener kanban", "We moved fasteners to a kanban with Pacific Fasteners."],
];

const TOOLS: Field["tools"] = [
  ["MES screens", "every line's counts, stops and scrap", "Tomas Herrera"],
  ["maintenance work order system", "every work order and spare part used", "Daniel Ortiz"],
  ["quality portal", "8D reports, PPAP packages and first articles", "Priya Shah"],
  ["drawings drive", "the current revision of every customer drawing", "Sofia Navarro"],
  ["shipping schedule", "every truck and its parts", "Victor Garza"],
  ["gauge register", "every gauge and its calibration date", "Jorge Salas"],
];

const RITUALS = [
  "The tier one meeting runs at each line at 7:30 every morning.",
  "Plant leads meet at 9 every day to go through stops, scrap and shipments.",
  "Quality reviews open 8D reports every Tuesday.",
  "Maintenance plans the next week's work every Thursday afternoon.",
  "The safety walk is every Friday at 2 with a different lead each week.",
  "The monthly plant meeting is the first Monday, with every shift.",
];

const GOALS = [
  "Our 2027 goal is scrap under 1.5 percent on every line.",
  "We want overall equipment effectiveness above 80 percent on Lines 3 and 5.",
  "We aim for zero lost time injuries again next year.",
  "We want every customer scorecard green by June.",
  "We plan to launch four new part programs in 2027.",
  "We want every machine on a preventive maintenance plan by March.",
];

/** More of what the plant knows, in the folders the graph names (field.graph's company). */
const TOPICS: Record<string, string[]> = {
  "Preventive maintenance": ["Weld robots get a tip dress check every shift.", "Hydraulic presses get an oil sample every quarter.", "Line 5 conveyors are greased every Saturday.", "Every work order lists the spare parts it used."],
  "Safety rules": ["Forklifts and people use separate aisles in the warehouse.", "Every new hire does lockout training in the first week.", "Near misses are reported the same shift."],
  "Shift handover notes": ["Each shift lead writes the handover before leaving the floor.", "Handover notes list open work orders and any quality holds.", "Day shift reads the night notes at the 7:30 meeting."],
  Suppliers: ["Every supplier gets a scorecard each quarter.", "A supplier with two late deliveries in a month gets a call from Ines.", "Castings are checked on arrival for porosity on a sample of five."],
  "Quality system": ["Control plans are reviewed once a year for every part.", "Every gauge has a study before it is used on a new part.", "Customer complaints are counted per million parts shipped."],
  "Spare parts": ["Spares for the weld robots sit in the cage by Line 5.", "A spare used is reordered the same day.", "Spindle bearings take five weeks to arrive."],
};

const TONE = [
  "I write procedures as numbered steps with one action each.",
  "I put the safety step first in any procedure.",
  "I add a photo for every step an operator might miss.",
  "I write reports to customers with the cause, the fix and the proof.",
  "I keep updates to customers short and in plain English.",
  "I give numbers with their units every time.",
];

export const FIELD: Field = {
  seed: SEED,
  book,
  firsts: FIRSTS,
  lasts: LASTS,
  leads: LEADS,
  roles: ROLES,
  clients: CUSTOMERS,
  extend: [
    ["ostrava", "Ostrava Rail", "Ostrava", ["Brake levers"]],
    ["pell", "Pell Agritech", "Pell", ["Hitch brackets"]],
    ["kessler", "Kessler Pumps", "Kessler", ["Cast pump housings"]],
  ],
  self: "Luis",
  team: TEAM,
  emailDomain: "brightwatercomponents.com",
  vendors: VENDORS,
  vendorsLabel: "Partners and vendors",
  procedures: PROCEDURES,
  policies: POLICIES,
  decisions: DECISIONS,
  tools: TOOLS,
  rituals: RITUALS,
  goals: GOALS,
  topics: TOPICS,
  tone: { label: "How you write procedures", lines: TONE, titles: ["Procedure template", "Writing work instructions", "Report style", "Rewrite this step", "Customer update draft", "Shorter instructions"] },
};
