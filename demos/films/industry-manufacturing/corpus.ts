import { count, firstName as first, vendorParts, type Book, type Field, type Line, type MakeCtx, type Mate, type Vendor } from "./scale";

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

/** The customers grown beside the four the film names: name, what it is, its part programs, its size. Made up names. */
const CUSTOMERS: Field["clients"] = [
  ["harlow", "Harlow Trucks", "Harlow", "Harlow Trucks builds heavy trucks in Saltillo and buys frame brackets from us.", ["Cross members"], 1],
  ["lindqvist", "Lindqvist Elevators", "Lindqvist", "Lindqvist Elevators builds elevator drives in Sweden and Mexico.", ["Drive housings"], 1],
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
const NORTE: Vendor = ["Norte Steel", "rolls the coil steel for every bracket", "six weeks", "net 45", "Alejandro Rios"];
const ALTAMIRA: Vendor = ["Altamira Castings", "pours the iron castings we machine", "ten weeks", "net 60", "Patricia Leal"];
const SIERRA: Vendor = ["Sierra Gauges", "calibrates our gauges and torque tools", "two weeks", "per visit", "Hector Saenz"];
const FUENTES: Vendor = ["Fuentes Tooling", "builds our weld fixtures and dies", "eight weeks", "half up front", "Marco Fuentes"];
const RAPIDO: Vendor = ["Rapido Freight", "trucks our parts to customers in Mexico and Texas", "two days", "weekly", "Claudia Ponce"];
const COLDWATER: Vendor = ["Coldwater Plating", "zinc plates the brackets", "one week", "per lot", "Ben Whitaker"];
const INTEGRA: Vendor = ["Integra Robotics", "services the six weld robots", "three days", "on a yearly contract", "Sanjay Rao"];
const PACIFIC: Vendor = ["Pacific Fasteners", "supplies bolts, nuts and inserts", "four weeks", "net 30", "Grace Tan"];

/** The customers a line about the plant at large names: the ones in memory, never the one the film follows. */
const NAMED = ["Ostrava", "Pell", "Kessler", "Harlow", "Lindqvist"];
const LINES = ["Line 1", "Line 2", "Line 4", "Line 5", "Line 6"];
const PARTS = ["frame brackets", "brake housings", "hitch brackets", "pump housings", "drive housings", "cross members"];
const CAUSES = ["a jammed feeder", "a worn weld tip", "a broken proximity sensor", "a coil change that ran long", "a hydraulic leak", "a fixture clamp that would not close", "waiting on a forklift", "a robot fault"];
const DEFECTS = ["porosity in the weld", "burrs on the outer edge", "a bore out of tolerance", "missing threads", "zinc peeling at the bend", "a cracked casting"];
const SHIFTS = ["day shift", "night shift"];
/** A day shortly before the chat, in words ("March 3"). */
const lately = (x: MakeCtx) => x.g.after(x.on, -9, -2, x.rng);
const decision = (text: string): Line => ({ text, kind: "decision" });
const style = (text: string): Line => ({ text, kind: "style" });

/** Company: the plant's people, the handover between shifts, the maintenance plan and the rules. */
const COMPANY: Field["company"] = [
  { label: "Plant team", parts: [] },
  {
    label: "Shift handover notes",
    parts: [
      [["Handover rules", "Writing the handover"], ["Each shift lead writes the handover before leaving the floor.", "Handover notes list open work orders and any quality holds.", "Day shift reads the night notes at the 7:30 meeting."]],
      [["Handover template", "What goes in the handover"], ["The handover starts with safety, then quality, then output.", "Every line gets one line in the handover, even when nothing happened."]],
    ],
    make: {
      n: 9,
      from: [
        (x) => {
          const line = x.one(LINES);
          return [[`${line} handover ${lately(x)}`, `${x.one(SHIFTS)} handover`], [`On ${lately(x)} the ${x.one(SHIFTS)} handover said ${line} lost ${x.rng.int(20, 90)} minutes to ${x.one(CAUSES)}.`]];
        },
        (x) => [[`Handover ${lately(x)}`, "Night notes"], [`The night handover on ${lately(x)} left a quality hold on ${x.rng.int(40, 400)} ${x.one(PARTS)} for day shift to sort.`]],
      ],
    },
  },
  {
    label: "Preventive maintenance",
    parts: [
      [["Maintenance plan", "What gets checked when"], ["Weld robots get a tip dress check every shift.", "Hydraulic presses get an oil sample every quarter.", "Line 5 conveyors are greased every Saturday.", "Every work order lists the spare parts it used."]],
      [["Spindle check interval"], [decision("We decided to check spindles every 500 hours, not every 1,000.")]],
      [["Maintenance backlog", "Open work orders"], ["We have 38 open preventive work orders, 9 of them past due.", "Daniel wants nothing more than two weeks past due by January."]],
      [["Planned shutdown", "December shutdown"], ["The plant shuts for maintenance from December 23 to January 2.", "The shutdown list has 64 jobs, led by the Line 2 press rebuild."]],
    ],
    make: {
      n: 6,
      from: [
        (x) => {
          const line = x.one(LINES);
          return [[`${line} preventive work`, `${line} maintenance ${x.g.month(x.on)}`], [`Maintenance changed the ${x.one(["gearbox oil", "conveyor belt", "hydraulic filters", "servo cables", "clamp cylinders"])} on ${line} on ${lately(x)}.`]];
        },
      ],
    },
  },
  {
    label: "Policies",
    parts: [
      [["Protective gear policy"], ["Safety glasses and steel toe boots are worn everywhere past the yellow line.", "Hearing protection is worn in the press area at all times."]],
      [["Visitors on the floor"], ["Visitors sign in and wear a red vest.", "Customer visitors are walked by an engineer, never alone."]],
      [["Overtime policy"], ["Overtime is posted by Wednesday for the weekend.", "No one works more than 12 hours in a day."]],
      [["Photos in the plant"], ["Photos of customer parts stay on plant devices.", "Customer drawings are never sent from personal email."]],
      [["Quality hold rule"], ["Anyone on the floor can stop the line for a quality concern.", "A stopped line restarts only with the shift lead and quality together."]],
      [["Time off requests", "Vacation rules"], ["Vacation requests go in two weeks ahead.", "No more than two people from one line are off in the same week."]],
      [["Phones on the floor"], ["Phones stay in lockers past the yellow line, except for leads."]],
      [["Uniforms"], ["Every employee gets three shirts and one pair of boots a year."]],
      [["Smoking area"], ["Smoking is only allowed in the area by the north gate."]],
    ],
  },
];

/** Production: the stops, the scrap and the people on each shift. */
const PRODUCTION: Field["sections"][number] = {
  label: "Production",
  folders: [
    {
      label: "Line stops",
      parts: [
        [["Line stop response", "Line stop steps"], ["Any stop over ten minutes is logged with its cause before the line restarts.", "A stop over an hour goes to the plant manager and to the customer if their parts are short.", "Maintenance writes a work order for every stop, even one fixed on the spot."]],
        [["Top stop causes", "Why lines stop"], ["Feeders and weld tips cause half our stop minutes.", "Most long stops start on night shift between 2 and 4 am."]],
      ],
      make: {
        n: 14,
        from: [
          (x) => {
            const line = x.one(LINES);
            return [[`${line} stop ${lately(x)}`, `${line} downtime`], [`${line} stopped for ${x.rng.int(15, 140)} minutes on ${lately(x)} because of ${x.one(CAUSES)}.`]];
          },
        ],
      },
    },
    {
      label: "Scrap and rework",
      parts: [
        [["Scrap rules", "Logging scrap"], ["Scrap is weighed and logged by part number every shift.", "Rework is done only on the rework bench, never at the line."]],
        [["Scrap target", "Scrap cost"], ["Scrap cost us 41,000 dollars last quarter.", "Welded parts make up two thirds of our scrap."]],
      ],
      make: {
        n: 14,
        from: [
          (x) => {
            const part = x.one(PARTS);
            return [[`Scrap on ${part}`, `${x.g.month(x.on)} scrap report`], [`We scrapped ${x.rng.int(30, 260)} ${part} in the week of ${lately(x)} for ${x.one(DEFECTS)}.`]];
          },
          (x) => [[`Rework ${lately(x)}`, "Rework bench notes"], [`The rework bench saved ${x.rng.int(40, 300)} ${x.one(PARTS)} on ${lately(x)} that had ${x.one(DEFECTS)}.`]],
        ],
      },
    },
    {
      label: "Shifts and staffing",
      parts: [
        [["Shift pattern", "Shift times"], ["Day shift runs from 6 am to 2:30 pm and night shift from 10 pm to 6:30 am.", "Second shift only runs on Lines 3 and 5."]],
        [["Night shift on Line 6"], [decision("We added a night shift on Line 6 from September.")]],
        [["Operator training", "Cross training"], ["Every operator is trained on at least two lines.", "The training matrix is updated after every new hire."]],
        [["Hiring for night shift", "Open roles"], ["We have six open operator roles, four of them on nights.", "New operators shadow a lead for their first two weeks."]],
        [["Absences", "Covering absences"], ["Monday absences run about twice the weekly average.", "Tomas keeps two floaters on day shift to cover absences."]],
        [["Second weld cell for brackets"], [decision("We decided to add a second robot weld cell for brackets instead of a third shift.")]],
        [["Temporary workers", "Agency staff"], ["Agency operators never run the presses.", "We hire agency staff only through Grupo Talento."]],
        [["Attendance bonus", "Shift bonus"], ["Operators with no absences in a month get a 500 peso bonus."]],
        [["Line 3 staffing"], ["Line 3 needs five operators a shift, six when the weld cell runs."]],
        [["Overtime hours", "Overtime this quarter"], ["We ran 1,900 overtime hours last quarter, most of it on Line 3.", "Tomas wants overtime under 1,200 hours next quarter."]],
      ],
    },
  ],
};

/** Quality: the system, the complaints, the launches and the gauges. */
const QUALITY: Field["sections"][number] = {
  label: "Quality",
  folders: [
    {
      label: "Quality system",
      parts: [
        [["Control plans", "Quality system rules"], ["Control plans are reviewed once a year for every part.", "Every gauge has a study before it is used on a new part.", "Customer complaints are counted per million parts shipped."]],
        [["Nonconforming parts", "Red cage rules"], ["Suspect parts go in the red cage with a hold tag.", "A hold is released only by quality."]],
        [["ISO audit", "Certification audit"], ["Our IATF certification audit is in April.", "The last audit closed with two minor findings, both on training records."]],
        [["Internal audits"], ["Mei runs one internal process audit every week on a different line."]],
        [["Parts per million", "Quality numbers"], ["We shipped at 38 parts per million defective this year.", "Our target for 2027 is under 25."]],
        [["Layered audits"], ["Shift leads do a layered audit at one station every shift."]],
      ],
      make: {
        n: 4,
        from: [
          (x) => {
            const who = x.one(NAMED);
            return [[`${who} parts per million ${x.g.month(x.on)}`, `${who} quality numbers`], [`Our defects for ${who} in ${x.g.month(x.on)} came to ${x.rng.int(0, 60)} parts per million.`]];
          },
        ],
      },
    },
    {
      label: "8D reports",
      parts: [
        [["Customer complaint 8D", "How we run an 8D"], ["The 8D team meets within 24 hours of a complaint.", "Containment at the customer starts the same day.", "Root cause is proven on the line before the 8D closes."]],
      ],
      make: {
        n: 12,
        from: [
          (x) => {
            const who = x.one(NAMED);
            return [[`${who} 8D ${x.rng.int(110, 199)}`, `${who} complaint`], [`${who} opened an 8D on ${lately(x)} for ${x.one(DEFECTS)} on ${x.rng.int(12, 180)} ${x.one(PARTS)}.`]];
          },
          (x) => {
            const who = x.one(NAMED);
            return [[`${who} 8D closed`, `Closing the ${who} 8D`], [`We closed the ${who} 8D on ${lately(x)} after ${x.one(["a new fixture clamp", "a second weld check", "a change to the plating rack", "a new gauge at the line", "retraining night shift"])} fixed the cause.`]];
          },
        ],
      },
    },
    {
      label: "PPAP and first articles",
      parts: [
        [["First article inspection", "First article steps"], ["A first article is measured on every dimension of the drawing.", "Mei signs the first article report before parts ship.", "First articles are kept for a year in the quality room."]],
        [["PPAP levels", "PPAP checklist"], ["Most customers want a level 3 PPAP for a new part.", "A PPAP package takes Mei about three weeks."]],
        [["Engineering change", "Drawing changes"], ["No drawing change goes to the floor until the customer approves it in writing.", "Every change gets a new revision letter on the work instruction.", "Old revision parts are counted and quarantined the day a change starts."]],
      ],
      make: {
        n: 6,
        from: [
          (x) => {
            const who = x.one(NAMED);
            return [[`${who} PPAP status`, `${who} first articles`], [`${who} approved the PPAP for the new ${x.one(PARTS)} on ${lately(x)}.`]];
          },
        ],
      },
    },
    {
      label: "Gauges and calibration",
      parts: [
        ...vendorParts(SIERRA),
        [["Gauge lab rules", "Gauge lab"], ["The gauge lab is kept at 20 degrees.", "No gauge leaves the lab without its tag."]],
        [["Gauge lab temperature"], [decision("We moved the gauge lab into the air conditioned room after the summer drift.")]],
        [["Gauge studies", "Gauge R and R"], ["Every new gauge gets a repeatability study before first use.", "A gauge that fails its study is tagged red and sent to Sierra."]],
      ],
      make: {
        n: 6,
        from: [
          (x) => [[`Gauge out of calibration ${lately(x)}`, "Gauge recall"], [`A ${x.one(["bore gauge", "thread gauge", "height gauge", "torque wrench"])} on ${x.one(LINES)} was found out of calibration on ${lately(x)}, and its last ${x.rng.int(2, 9)} days of parts were checked again.`]],
        ],
      },
    },
  ],
};

/** Equipment: the weld cells, the presses and machines, the spares and the tooling. */
const EQUIPMENT: Field["sections"][number] = {
  label: "Equipment",
  folders: [
    {
      label: "Weld cells",
      parts: [
        ...vendorParts(INTEGRA),
        [["Weld cell startup", "Weld cell checks"], ["Weld cells are purged and test welded at the start of every shift.", "A test coupon from each cell is cut and checked every Monday."]],
        [["Weld cell cycle times"], ["The six weld cells run between 44 and 58 seconds a part.", "Cell 4 is the slowest because of its older robot."]],
      ],
      make: {
        n: 8,
        from: [
          (x) => [[`Weld cell ${x.rng.int(1, 6)} fault`, "Weld robot fault"], [`Weld cell ${x.rng.int(1, 6)} stopped on ${lately(x)} with a ${x.one(["wire feed fault", "collision alarm", "torch cable break", "servo overload"])}.`]],
        ],
      },
    },
    {
      label: "Presses and machining",
      parts: [
        [["Press line", "Press capacity"], ["Line 2 has two 400 tonne presses and one 250 tonne press.", "The 400 tonne presses run the frame brackets."]],
        [["CNC cells", "Machining cells"], ["We machine castings on eight CNC machines in two cells.", "Each CNC gets a spindle check every 500 hours."]],
        [["Line 2 press rebuild", "Press rebuild plan"], ["The older 400 tonne press is rebuilt over the December shutdown.", "The rebuild costs about 180,000 dollars."]],
        [["Nutrunner brand"], [decision("We chose to standardize every nutrunner on one brand by spring.")]],
        [["Press brake tests"], ["Press brakes are tested every month by maintenance."]],
      ],
      make: {
        n: 6,
        from: [
          (x) => [[`CNC ${x.rng.int(1, 8)} downtime`, "CNC breakdown"], [`CNC ${x.rng.int(1, 8)} was down for ${x.rng.int(3, 30)} hours from ${lately(x)} waiting on a ${x.one(["spindle bearing", "coolant pump", "tool changer arm", "control board"])}.`]],
        ],
      },
    },
    {
      label: "Spare parts",
      parts: [
        [["Spares rules", "Where spares are"], ["Spares for the weld robots sit in the cage by Line 5.", "A spare used is reordered the same day.", "Spindle bearings take five weeks to arrive."]],
        [["Spares budget"], ["We spend about 22,000 dollars a month on spares.", "Robot spares are a third of that."]],
        [["Missing spares", "Spares count"], ["The last count found four spares used and never logged."]],
      ],
      make: {
        n: 6,
        from: [(x) => [[`Spare ordered ${lately(x)}`, "Spares order"], [`We ordered two ${x.one(["weld tips packs", "proximity sensors", "servo motors", "hydraulic valves", "conveyor rollers"])} on ${lately(x)} after the last ones were used.`]]],
      },
    },
    {
      label: "Tooling and fixtures",
      parts: [
        ...vendorParts(FUENTES),
        [["Tool change", "Tool change steps"], ["Every tool change starts with lockout and tagout.", "The first part after a tool change goes to the gauge table before the run goes on.", "Worn tools are tagged red and sent to the tool crib."]],
        [["Shared tool crib"], [decision("We merged the two tool cribs into one by the shipping dock.")]],
        [["Fixture wear checks"], ["Weld fixtures are checked for wear at every tool change."]],
        [["Die life", "Die maintenance"], ["Our bracket dies are sharpened every 80,000 hits.", "Fuentes keeps a spare die for the three busiest brackets."]],
      ],
      make: {
        n: 3,
        from: [(x) => [[`Die sharpening ${lately(x)}`, "Die log"], [`The die for the ${x.one(PARTS)} was sharpened on ${lately(x)} after ${x.rng.int(60, 95)},000 hits.`]]],
      },
    },
  ],
};

/** Safety: the rules, lockout and training, and what went wrong. */
const SAFETY: Field["sections"][number] = {
  label: "Safety",
  folders: [
    {
      label: "Safety rules",
      parts: [
        [["Floor safety rules", "Safety rules review"], ["Forklifts and people use separate aisles in the warehouse.", "Every new hire does lockout training in the first week.", "Near misses are reported the same shift."]],
        [["Guarding", "Machine guards"], ["No machine runs with a guard open, even for a test part.", "Light curtains are tested at the start of every shift."]],
        [["Forklift rules"], ["Forklifts drive at walking speed inside the plant.", "Only certified drivers use a forklift, and the card is checked each year."]],
        [["Hot work on the floor", "Hot work permit"], ["Grinding and welding outside the cells need a hot work permit.", "A fire watch stays 30 minutes after hot work ends."]],
        [["Chemical storage", "Chemicals"], ["Oils and solvents are kept in the yellow cabinets by maintenance.", "Every chemical has its safety sheet in the binder at the door."]],
        [["Hot days", "Heat in summer"], ["On days over 35 degrees, every line takes a water break each hour."]],
      ],
      make: {
        n: 3,
        from: [(x) => [[`Safety walk ${lately(x)}`, "Safety walk findings"], [`The safety walk on ${lately(x)} found ${x.one(["a blocked fire exit by shipping", "a missing guard bolt on a press", "a frayed sling in the crane bay", "an eyewash station out of date", "boxes stacked too high by Line 6"])}, fixed the same day.`]]],
      },
    },
    {
      label: "Lockout and training",
      parts: [
        [["Lockout steps", "Lockout procedure"], ["Every person working on a machine puts on their own lock.", "Stored energy is checked with a try start before work begins.", "Locks come off only when the person who put them on is there."]],
        [["Training plan", "Safety training"], ["Every operator gets a lockout refresher once a year.", "Forklift drivers renew their card every year.", "First aid training covers two people on every shift."]],
        [["Training records"], ["Training records are kept by Laura in the safety binder and the HR system."]],
        [["Lockout audit", "Lockout checks"], ["Laura audits three lockouts a week at random.", "The last audit found one lock with no name tag."]],
      ],
      make: {
        n: 6,
        from: [(x) => [[`Training ${lately(x)}`, "Training session notes"], [`${x.rng.int(8, 24)} people from ${x.one(SHIFTS)} finished ${x.one(["the lockout refresher", "forklift training", "first aid training", "fire extinguisher training"])} on ${lately(x)}.`]]],
      },
    },
    {
      label: "Incidents and near misses",
      parts: [
        [["Incident reporting", "How we report incidents"], ["Any injury is reported to Laura within the hour.", "Every incident gets a review within a week."]],
        [["Safety record", "Days without injury"], ["We have gone 412 days without a lost time injury.", "Cuts on sheet metal are our most common first aid case."]],
      ],
      make: {
        n: 10,
        from: [
          (x) => [[`Near miss ${lately(x)}`, `${x.one(LINES)} near miss`], [`Near miss on ${lately(x)}: ${x.one(["a forklift backed into the walkway by Line 4", "a pallet slid off the rack in shipping", "a guard was found open on a press", "an operator reached past a light curtain", "oil on the floor by the weld cells"])}.`]],
          (x) => [[`First aid case ${lately(x)}`, "First aid log"], [`An operator on ${x.one(LINES)} needed first aid on ${lately(x)} for a cut from a sheet metal edge.`]],
        ],
      },
    },
  ],
};

/** Supply chain: the suppliers, the steel and castings, and getting parts out the door. */
const SUPPLY: Field["sections"][number] = {
  label: "Supply chain",
  folders: [
    {
      label: "Suppliers",
      parts: [
        [["Supplier scorecards", "Supplier reviews"], ["Every supplier gets a scorecard each quarter.", "A supplier with two late deliveries in a month gets a call from Ines.", "Castings are checked on arrival for porosity on a sample of five."]],
        ...vendorParts(COLDWATER),
        [["Plating supplier audit"], [decision("We put Coldwater Plating on a monthly audit after the salt spray failures.")]],
        ...vendorParts(PACIFIC),
        [["Fastener kanban"], [decision("We moved fasteners to a kanban with Pacific Fasteners.")]],
      ],
      make: {
        n: 4,
        from: [(x) => [[`${x.one(["Coldwater", "Pacific", "Norte", "Altamira"])} scorecard`, "Supplier scorecard results"], [`${x.one(["Coldwater Plating", "Pacific Fasteners", "Norte Steel", "Altamira Castings"])} scored ${x.rng.int(72, 98)} on its quarterly scorecard, with ${x.rng.int(0, 4)} late deliveries.`]]],
      },
    },
    {
      label: "Steel and castings",
      parts: [
        ...vendorParts(NORTE),
        ...vendorParts(ALTAMIRA),
        [["Second steel mill"], [decision("We decided to buy bracket steel from two mills.")]],
        [["Steel prices", "Steel surcharge"], ["Norte adds a surcharge each month based on scrap prices.", "Steel is about 40 percent of a bracket's cost."]],
      ],
      make: {
        n: 7,
        from: [
          (x) => [[`Late coil ${lately(x)}`, "Coil delivery"], [`A Norte coil due on ${lately(x)} came ${x.rng.int(2, 6)} days late, and Ines moved the run to the next week.`]],
          (x) => [[`Casting lot ${x.rng.int(300, 399)}`, "Casting quality"], [`Altamira casting lot ${x.rng.int(300, 399)} had ${x.rng.int(2, 9)} castings with porosity in the sample.`]],
        ],
      },
    },
    {
      label: "Shipping",
      parts: [
        ...vendorParts(RAPIDO),
        [["Export papers", "Customs"], ["Every export truck needs a pedimento and the commercial invoice.", "Victor files export papers the day before a truck leaves."]],
        [["Shipping schedule", "Truck schedule"], ["Trucks leave for Texas on Tuesdays and Thursdays.", "Trucks for the Saltillo customers leave every day at 4 pm."]],
      ],
      make: {
        n: 9,
        from: [
          (x) => {
            const who = x.one(NAMED);
            return [[`${who} shipment ${lately(x)}`, `${who} truck`], [`The ${who} truck on ${lately(x)} left with ${x.rng.int(800, 6000).toLocaleString("en-US")} ${x.one(PARTS)}.`]];
          },
          (x) => {
            const who = x.one(NAMED);
            return [[`Missed truck for ${who}`, `${who} late shipment`], [`The ${who} shipment missed its truck on ${lately(x)} and went by expedite the next morning.`]];
          },
        ],
      },
    },
  ],
};

/** Writing: how Luis writes procedures, the work instructions and the updates to customers. */
const WRITING: Field["sections"][number] = {
  label: "Writing",
  folders: [
    {
      label: "How you write procedures",
      parts: [
        [["Procedure template", "Writing work instructions", "Report style"], ["I write procedures as numbered steps with one action each.", "I put the safety step first in any procedure.", "I add a photo for every step an operator might miss."].map(style)],
        [["Rewrite this step", "Customer update draft", "Shorter instructions"], ["I write reports to customers with the cause, the fix and the proof.", "I keep updates to customers short and in plain English.", "I give numbers with their units every time."].map(style)],
        [["Reviewing a procedure", "Procedure checklist"], ["I read every new procedure aloud at the line before it goes up.", "I write the why for a step only when skipping it would hurt someone."].map(style)],
        [["Bilingual steps", "Spanish and English"], ["I write steps in Spanish first, then English.", "I keep the same verb for the same action in every procedure."].map(style)],
        [["Writing for new hires"], ["I write for someone in their first week on the line.", "I avoid our own shorthand, like PM and WO, in any procedure."].map(style)],
      ],
    },
    {
      label: "Work instructions",
      parts: [
        [["Work instruction format", "Instruction template"], ["Every work instruction has the part, the revision and the date at the top.", "Work instructions are printed in Spanish and English.", "Each station has its instruction at eye level."]],
        [["Instruction updates", "Changing an instruction"], ["A new instruction is signed by the shift lead and quality.", "Old instructions are pulled from the line the same day."]],
        [["Photos in instructions"], ["Photos in instructions show the good part next to the bad one."]],
        [["Visual aids", "Defect boards"], ["Each line has a board with the three defects to watch for.", "The boards change when a customer opens an 8D."]],
        [["Changeover instructions", "Changeover steps"], ["Changeover instructions list the tools to bring before the steps.", "A changeover takes 25 minutes on Line 3 when the cart is ready."]],
        [["Instruction audit"], ["Quality checks that every station has the current instruction once a week."]],
        [["Instruction codes", "Instruction numbering"], ["Work instructions are numbered by line, station and part."]],
      ],
    },
    {
      label: "Customer updates",
      parts: [
        [["Customer update template", "Update to a customer"], ["A customer update starts with what happened and what the customer needs to do.", "We send updates from the quality inbox so the whole team sees them."]],
        [["8D summary style"], ["An 8D summary fits on one page with photos of the bad part and the fix."]],
        [["Late shipment note", "Shipment delay note"], ["A late shipment note gives the new date, the cause and what we did to catch up."]],
        [["Weekly quality report", "Quality report format"], ["The weekly quality report shows scrap, rework and on time delivery in a table.", "It goes out on Monday by noon."]],
        [["Plant visit agenda"], ["A plant visit agenda lists who they meet, which lines they see and the time for questions."]],
        [["Steel surcharge letter", "Price increase letter"], ["A surcharge letter shows the steel index, our cost and the new price for each part."]],
        [["Thanks after an audit"], ["After a customer audit we send thanks and the plan for every finding within a week."]],
        [["Monthly customer letter"], ["Our top customers get a short letter each month with scrap, delivery and what changed."]],
        [["Holiday schedule note"], ["Customers get our holiday shipping schedule by November 15."]],
        [["Quality alert format"], ["A quality alert to a customer goes out within four hours with the lot numbers."]],
      ],
    },
  ],
};

/** Plans and deadlines: the year's goals, the plant's meetings and what is coming. */
const PLANS: Field["sections"][number] = {
  label: "Plans and deadlines",
  loose: [[["Due this month", "This month's deadlines"], ["The capacity plan for 2027 is due to the plant manager on November 20.", "Every control plan review for this year closes by December 15."]]],
  folders: [
    {
      label: "2027 goals",
      parts: [
        [["2027 goals", "Plant goals", "Yearly plan"], ["Our 2027 goal is scrap under 1.5 percent on every line.", "We want overall equipment effectiveness above 80 percent on Lines 3 and 5.", "We aim for zero lost time injuries again next year."]],
        [["Goals review", "Planning for next year"], ["We want every customer scorecard green by June.", "We plan to launch four new part programs in 2027.", "We want every machine on a preventive maintenance plan by March."]],
        [["How 2026 went", "2026 results"], ["Scrap ended 2026 at 1.9 percent.", "On time delivery for the year was 96 percent."]],
        [["Capital plan 2027", "Investment plan"], ["The 2027 capital plan has a new laser cutter and a seventh weld cell.", "The laser cutter would cut blank costs by a fifth."]],
        [["Power costs", "Energy use"], ["Power is our third biggest cost after steel and people.", "We want to cut power use per part by a tenth in 2027."]],
      ],
    },
    {
      label: "Plant meetings",
      parts: [
        [["Meeting schedule", "Daily meetings"], ["The tier one meeting runs at each line at 7:30 every morning.", "Plant leads meet at 9 every day to go through stops, scrap and shipments.", "Quality reviews open 8D reports every Tuesday."]],
        [["Weekly meetings", "Plant calendar"], ["Maintenance plans the next week's work every Thursday afternoon.", "The safety walk is every Friday at 2 with a different lead each week.", "The monthly plant meeting is the first Monday, with every shift."]],
        [["Kaizen events"], [decision("We decided to run one kaizen event a month, each on a different line.")]],
        [["Plant town hall", "Monthly town hall"], ["The plant manager holds a town hall on the last Friday of each month.", "Questions for the town hall go in the box by the cafeteria."]],
        [["Customer review calls"], ["Each top customer gets a review call every quarter with Priya and Sofia."]],
        [["Shift start huddle"], ["Every shift starts with a five minute huddle at the line board."]],
      ],
    },
    {
      label: "Launches and audits",
      parts: [
        [["New part launches", "Launch plan"], ["Each new part launch has a run at rate before the first shipment.", "Sofia keeps the launch plan for every program."]],
        [["Customer audits 2027", "Audit calendar"], ["Three customers audit us next year: Corvane in February, Harlow in May and Lindqvist in September.", "Audits take two days and need every training record ready."]],
        [["Launch for Lindqvist", "Lindqvist launch"], ["The new Lindqvist drive housing launches in April.", "The first 200 parts go by air for their line trial."]],
        [["Harlow cross member launch"], ["Harlow wants the new cross members at full volume by July."]],
        [["Run at rate plan", "Run at rate"], ["A run at rate is 300 parts made at full speed with every gauge in use."]],
        [["Quote pipeline", "New program quotes"], ["We have seven quotes open for 2027 programs.", "Sofia needs cycle times from the line before any quote goes out."]],
        [["PPAP dates 2027"], ["Four PPAP packages are due in the first half of 2027."]],
      ],
    },
  ],
};

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
  teamFolder: "Plant team",
  company: COMPANY,
  sections: [PRODUCTION, QUALITY, EQUIPMENT, SAFETY, SUPPLY, WRITING, PLANS],
};
