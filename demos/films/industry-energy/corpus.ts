import { count, firstName as first, type Book, type Field, type Mate, type Vendor } from "./scale";

/**
 * Crestline Renewables at full size: the chats Hannah and the field crews,
 * planners and engineers had across ChatGPT, Claude and Gemini over a
 * year and a half, grown from a seed by scale.ts in the words of a
 * company that maintains wind, solar and battery sites for their
 * operators. The sites, the team, the vendors, the procedures and the
 * rules are made up for the demo; no real company is named. company.ts
 * files what grows here beside the lines the film writes by hand, which
 * stay as they are.
 */

const SEED = 20261103;

/* ---------- the site operators ---------- */

const FIRSTS = ["Aaron", "Bettina", "Calvin", "Delia", "Emil", "Farrah", "Glenn", "Harriet", "Ivan", "Janelle", "Kurt", "Lydia", "Mason", "Noor", "Orrin", "Petra", "Quentin", "Rhea", "Stellan", "Talia", "Upton", "Veda", "Wyatt", "Xavier", "Yolanda", "Zeke", "Abel", "Brenna", "Cyrus", "Dahlia", "Elton", "Fern", "Grady", "Hazel", "Idris", "Jules", "Knox", "Lainey", "Milo", "Nell", "Otto", "Priscilla", "Reid", "Sienna", "Tate", "Vance", "Willa", "Yates"];
const LASTS = ["Ackerman", "Baird", "Calloway", "Dempsey", "Eldridge", "Fenwick", "Garrity", "Holloway", "Irwin", "Jessup", "Kincaid", "Langley", "Mercer", "Nordin", "Oakes", "Pickett", "Redfield", "Sayers", "Talbot", "Upshaw", "Vickers", "Wendell", "Yardley", "Abbott", "Barlow", "Corrigan", "Dorsey", "Easton", "Forsythe", "Galloway", "Hendrix", "Ivers"];
/** The main contact runs the site; the others own its safety, its grid, its money or its land. */
const LEADS = ["site manager", "asset manager", "plant manager", "operations lead"];
const ROLES = ["safety manager", "interconnection lead", "procurement lead", "accounts payable lead", "control room supervisor", "land manager"];

const DUTY: Record<string, string> = {
  "site manager": "signs off on every lift plan and outage",
  "asset manager": "owns the site's budget and its availability numbers",
  "plant manager": "runs the plant day to day and approves our work orders",
  "operations lead": "talks to the grid operator and books outages",
  "safety manager": "runs the site induction and checks our permits",
  "interconnection lead": "handles the substation and the grid operator",
  "procurement lead": "approves quotes and purchase orders",
  "accounts payable lead": "handles our invoices",
  "control room supervisor": "watches the alarms and calls us out at night",
  "land manager": "deals with the landowners and the access roads",
};

/** Each site operator: its name, what it runs, its jobs, its size. Made up names. */
const SITES: Field["clients"] = [
  ["coyote-flats", "Coyote Flats Solar", "Coyote Flats", "Coyote Flats Solar runs a 120 megawatt solar farm in the Mojave.", ["Tracker motor repairs", "Panel washes"], 3],
  ["raven-hill", "Raven Hill Wind", "Raven Hill", "Raven Hill Wind runs 38 turbines on a ridge above Palm Springs.", ["Blade repairs", "Yaw motor rebuilds"], 3],
  ["silver-basin", "Silver Basin Solar", "Silver Basin", "Silver Basin Solar runs a 75 megawatt solar farm in Nevada.", ["Inverter swaps"], 2],
  ["juniper-mesa", "Juniper Mesa Wind", "Juniper Mesa", "Juniper Mesa Wind runs 61 turbines in eastern Oregon.", ["Main bearing swaps", "Annual inspections"], 3],
  ["larkfield", "Larkfield Storage", "Larkfield", "Larkfield Storage runs a 200 megawatt hour battery plant near Fresno.", ["Battery cooling repairs"], 2],
  ["cinder-cone", "Cinder Cone Wind", "Cinder Cone", "Cinder Cone Wind runs 24 turbines in northern Arizona.", ["Gearbox oil changes"], 1],
  ["bitterbrush", "Bitterbrush Solar", "Bitterbrush", "Bitterbrush Solar runs a 40 megawatt solar farm in Idaho.", ["Fire break cuts"], 1],
  ["owl-canyon", "Owl Canyon Wind", "Owl Canyon", "Owl Canyon Wind runs 45 turbines in the Columbia Gorge.", ["Blade inspections", "Cable repairs"], 2],
  ["sagebrook", "Sagebrook Solar", "Sagebrook", "Sagebrook Solar runs a 90 megawatt solar farm near Lancaster.", ["Combiner box repairs"], 2],
  ["red-fern", "Red Fern Storage", "Red Fern", "Red Fern Storage runs a battery plant beside a solar farm in Utah.", ["Fire system tests"], 1],
  ["windgap", "Windgap Ridge", "Windgap", "Windgap Ridge runs 30 turbines in Wyoming.", ["Converter repairs", "Snow road clearings"], 2],
  ["quail-hollow", "Quail Hollow Solar", "Quail Hollow", "Quail Hollow Solar runs a 55 megawatt solar farm in the Central Valley.", ["Tracker motor repairs"], 1],
  ["iron-spring", "Iron Spring Wind", "Iron Spring", "Iron Spring Wind runs 52 turbines in New Mexico.", ["Pitch system repairs"], 2],
];

const DELIVERABLES = ["outage plan for the spring work", "inspection report from the fall visit", "crane lift plan", "root cause report on the trips", "quote for the repairs", "monthly availability report", "updated spare parts list", "crew list for the site induction", "torque records from the bolt checks", "oil sample results", "drone photos of the damaged units"];
const THEIR_THINGS = ["the SCADA logs for October", "the site access letter", "their outage calendar", "the grid operator's approval", "the warranty papers", "the fire marshal's sign off", "the substation drawings", "the landowner's OK for the new road"];
const ASKS = ["a call before any crew goes up tower", "every lift logged in the site book", "work only between 7 am and 5 pm", "a daily report while a crew is on site", "two weeks' notice before any outage", "photos of every repaired unit", "a spill kit on every truck", "no work on Sundays", "a list of every part we swap"];
const PREFERS = ["texts over email on site days", "plans on one page", "a call on Monday mornings", "reports as PDFs with photos", "one weekly summary, not daily emails"];

const book: Book = {
  status: [
    (x) => [[`${x.c.short} relationship`], `Active site since ${x.g.monthYear(x.on)}. Crestline runs its scheduled maintenance.`],
    (x) => [[`${x.c.short} relationship`], `Active site since ${x.g.monthYear(x.on)}. We do its scheduled and unplanned work.`],
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
    (x, due) => [[`${x.c.short} site review`, `Prep for ${x.c.short} review`], `Monthly site review with ${x.k.name} on ${due}.`],
    (x, due) => [[`${x.c.short} outage planning`], `Outage planning call with ${x.c.short} on ${due}.`],
    (x, due) => [[`${x.c.short} safety walk`], `Site safety walk with ${first(x.k)} on ${due}.`],
  ],
  meetingPast: [
    (x, day) => [[`${x.c.short} site walk`, `${x.c.short} visit notes`], `Site walk with ${first(x.k)} on ${day}. They signed off on the new crane pad.`],
    (x, day) => [[`${x.c.short} year end review`], `Year end review with ${x.c.short} on ${day} to go through availability.`],
    (x, day) => [[`${x.c.short} contract kickoff`], `Kickoff with ${x.c.short} on ${day} for the new service contract.`],
  ],
  deadline: [
    (x, due) => [[`${x.c.short} availability report`], `The ${x.c.short} availability report is due by ${due}.`],
    (x, due) => [[`${x.c.short} permit paperwork`], `The ${x.c.short} permit paperwork goes to the county by ${due}.`],
    (x, due) => [[`${x.c.short} spring outage`], `The ${x.c.short} spring outage plan is due by ${due}.`],
  ],
  request: [
    (x) => [[`${x.c.short} asks`, `${x.c.short} site feedback`], `${x.c.short} asked for ${x.one(ASKS)}.`],
    (x) => [[`Notes from ${first(x.k)}`, `${x.c.short} requests`], `${first(x.k)} asked for ${x.one(ASKS)}.`],
  ],
  preference: [(x) => [[`Working with ${first(x.k)}`, `${x.c.short} ways of working`], `${first(x.k)} prefers ${x.one(PREFERS)}.`]],
  billing: [
    (x) => [[`${x.c.short} invoices`, `${x.c.short} payment terms`], `${x.c.short} pays net ${x.one([30, 45, 60])} for scheduled work.`],
    (x) => [[`${x.c.short} unplanned work`], `${x.c.short} pays for unplanned work on time and materials.`],
    (x) => [[`${x.c.short} invoice format`], `${x.c.short} wants each invoice split by unit.`],
  ],
  document: [
    (x) => [[`${x.c.short} site rules`], `Pasting the ${x.c.short} site rules: access, radio channels and the steps in an emergency.`],
    (x) => [[`${x.c.short} service agreement`], `Pasting the ${x.c.short} service agreement: response times and the units under warranty.`],
  ],
  decision: [
    (x) => [[`${x.c.short} bearing decision`], `${x.c.short} chose to replace the worn bearings instead of repairing them.`],
    (x) => [[`${x.c.short} outage dates`], `${x.c.short} decided to move the spring outage to April.`],
    (x) => [[`${x.c.short} night work`], `${first(x.k)} approved night work for the cable repair.`],
  ],
  work: [
    (x) => [[`${x.c.short} ${x.w.toLowerCase()}`, `${x.w} plan`], [`The ${x.w.toLowerCase()} at ${x.c.short} are planned for ${x.g.month(x.g.ahead(25, 120, x.rng).iso)}.`, `${first(x.c.contacts[0]!)} wants the ${x.w.toLowerCase()} finished before the summer heat.`]],
    (x) => [[`${x.w} crew plan`, `${x.c.short} crew plan`], [`The ${x.w.toLowerCase()} need a crew of ${count(x.rng.int(2, 5))} for ${count(x.rng.int(2, 6))} days.`]],
    (x) => [[`${x.w} findings`, `${x.c.short} site findings`], [`Marcus's crew found ${count(x.rng.int(2, 8))} more units that need the same work.`, `Joel logged each one with photos in the work order.`]],
    (x) => [[`${x.w} parts`, `${x.c.short} parts order`], [`Parts for the ${x.w.toLowerCase()} take ${count(x.rng.int(2, 8))} weeks to arrive.`, `We keep ${count(x.rng.int(1, 3))} spare sets for the ${x.w.toLowerCase()} at the Livermore yard.`]],
    (x) => [[`${x.w} safety plan`], [`The ${x.w.toLowerCase()} at ${x.c.short} need a work permit from the site office.`]],
    (x) => [[`${x.w} questions`], [`${first(x.k)} asked whether the ${x.w.toLowerCase()} can run at night to keep output up.`]],
    (x) => [[`${x.w} lessons`, `What we learned from the ${x.w.toLowerCase()}`], [`Next time the ${x.w.toLowerCase()} need the site booked ${count(x.rng.int(2, 4))} weeks earlier.`]],
  ],
};

/* ---------- the company ---------- */

/** The rest of the team, past the crews the film names: [name, team, role, what they own, what to ask them about]. Made up. */
export const TEAM: Mate[] = [
  ["Sara Okonjo", "Field maintenance", "Solar technician", "inverter and tracker repairs", "inverter faults"],
  ["Leo Brandt", "Field maintenance", "Blade technician", "blade repairs and drone inspections", "blade damage"],
  ["Kofi Mensah", "Field maintenance", "High voltage technician", "switching and cable work", "substation outages"],
  ["Nadia Volkova", "Operations", "Work planner", "the schedule for every site", "when a crew is free"],
  ["Ethan Cole", "Operations", "Parts coordinator", "the Livermore yard and its spares", "a part on order"],
  ["Maya Fernandes", "Safety", "Safety manager", "safety training and audits", "a near miss"],
  ["Owen Harlan", "Commercial", "Account manager", "service contracts with the site operators", "contract terms"],
  ["Priyanka Desai", "Engineering", "Reliability engineer", "failure analysis and oil samples", "why a part failed"],
];

const VENDORS: Vendor[] = [
  ["Hollis Lifting", "supplies the cranes for our wind work", "two weeks", "per lift day", "Gary Hollis"],
  ["Northgear", "rebuilds gearboxes", "ten weeks", "half on order", "Ingrid Moss"],
  ["Skyline Drones", "flies our blade inspections", "five days", "per site", "Tariq Ali"],
  ["Basin Oil Labs", "tests our gearbox oil samples", "three days", "per sample", "Renee Park"],
  ["Westline Electric", "does high voltage switching at substations", "two weeks", "per job", "Carl Jensen"],
  ["Summit Safety Supply", "supplies harnesses and rescue kits", "one week", "net 30", "Joy Ellis"],
  ["Pacific Bearing", "supplies main and pitch bearings", "twelve weeks", "net 60", "Martin Cho"],
  ["Valley Fleet", "services our trucks and lifts", "two days", "monthly", "Ruben Ortega"],
];

const PROCEDURES: Array<[string, string[]]> = [
  ["Climbing a turbine", ["Two climbers go up together, each with a radio.", "The rescue kit is checked at the base before every climb.", "Climbs stop when gusts pass 20 meters a second."]],
  ["Inverter reset", ["An inverter is isolated on both sides before anyone opens it.", "Wait five minutes after isolation before touching the bus.", "Every reset is logged with the fault code."]],
  ["Crane lift", ["Every lift has a written lift plan signed by the site manager.", "The wind is checked before each lift and every hour after.", "Only the signal person talks to the crane operator."]],
  ["Oil sampling", ["Oil samples are taken with the gearbox warm, within an hour of stopping.", "Each sample bottle is labeled with the turbine and the date.", "Samples ship to Basin Oil Labs the same day."]],
  ["Hot work", ["Hot work needs a permit and a fire watch.", "The fire watch stays 30 minutes after the work ends."]],
  ["Storm shutdown", ["Crews come down when lightning is within 10 miles.", "No one climbs for 30 minutes after the last strike."]],
  ["Incident reporting", ["Any injury is reported to the safety manager within the hour.", "A near miss is written up the same day.", "Every incident gets a review within a week."]],
];

const POLICIES: Array<[string, string[]]> = [
  ["Driving on site", ["The speed limit on site roads is 15 miles an hour.", "Trucks park facing out, ready to leave."]],
  ["Working alone", ["No one works alone at a remote site.", "Crews check in by radio every two hours."]],
  ["Wildlife", ["Work stops near an active nest until the biologist clears it.", "Every crew carries the wildlife card for the site."]],
  ["Photos and drones", ["Drone flights need the site's OK the day before.", "Photos of customer sites stay in the work order system."]],
  ["Fatigue", ["No shift runs past 12 hours.", "Crews get ten hours off between shifts."]],
];

const DECISIONS: Field["decisions"] = [
  ["Technical decisions", "Oil sample interval", "We decided to sample gearbox oil every three months, not every six."],
  ["Technical decisions", "Drone blade inspections", "We moved blade inspections from rope access to drones."],
  ["Technical decisions", "Bolt check tools", "We chose hydraulic tensioners over torque wrenches for tower bolts."],
  ["Technical decisions", "Spare inverter boards", "We decided to keep two spare inverter boards for every solar site."],
  ["Field decisions", "Second crane crew", "We added a second crane crew for the spring outages."],
  ["Field decisions", "Four day rotations", "We moved field crews to four day rotations at remote sites."],
  ["Field decisions", "Winter work limits", "We decided no climbing below minus 20 degrees."],
  ["Supplier decisions", "Gearbox rebuild vendor", "We chose Northgear for gearbox rebuilds after the bid."],
  ["Supplier decisions", "Bearing stock", "We decided to hold one main bearing at the yard at all times."],
];

const TOOLS: Field["tools"] = [
  ["SCADA viewer", "every site's alarms and output", "Dana Whitfield"],
  ["work order system", "every job, its photos and its parts", "Nadia Volkova"],
  ["spares register", "every spare part and where it sits", "Ethan Cole"],
  ["crew calendar", "who is on which site each day", "Nadia Volkova"],
  ["permit tracker", "every county permit and when it ends", "Owen Harlan"],
  ["oil sample log", "every oil sample and its result", "Priyanka Desai"],
];

const RITUALS = [
  "Crews meet by video at 6:30 every morning before driving out.",
  "The planning call for next week is every Thursday at 2.",
  "Safety stand downs happen the first Monday of each month.",
  "Reliability reviews every failed part on the last Friday of the month.",
  "The account managers meet each operator once a quarter.",
  "New crew members shadow Marcus for their first two weeks.",
];

const GOALS = [
  "Our 2027 goal is 98 percent availability across every wind site.",
  "We want zero lost time injuries again next year.",
  "We aim to answer every unplanned callout within four hours.",
  "We plan to add three new solar sites to our contracts in 2027.",
  "We want every gearbox on a three month oil sample plan by spring.",
  "We aim to cut crane days per job by a fifth.",
];

/** More of what the company knows, in the folders the graph names (field.graph's company). */
const TOPICS: Record<string, string[]> = {
  "Lockout tagout steps": ["Every lock carries the name of the person who put it on.", "Locks stay on through a shift change; the new lead adds theirs first.", "A lost key is cut off only with the site manager present."],
  "Crane bookings": ["Crane pads are checked a week before the crane arrives.", "Crane days are booked in blocks of five.", "A crane held by wind is billed at half rate."],
  "Safety rules": ["Every truck carries a first aid kit and a fire extinguisher.", "Hard hats come off only inside the trucks and the site office.", "Two way radios are tested at the start of every shift."],
  "Spare parts": ["Pitch motors are the part we swap most often.", "Spares used on a site are restocked within two weeks.", "The yard counts every spare on the first Friday of the month."],
  Permits: ["Every site's permits are listed in the permit tracker with their end dates.", "Noise permits limit work near homes to daylight hours."],
};

const TONE = [
  "I write each day's plan with the crew, the site and the weather at the top.",
  "I list the parts to load on the truck before the steps.",
  "I put the rescue plan in every plan for work at height.",
  "I write to site managers in plain words, without our part numbers.",
  "I end every plan with who to call if something goes wrong.",
  "I give wind limits in meters a second every time.",
];

export const FIELD: Field = {
  seed: SEED,
  book,
  firsts: FIRSTS,
  lasts: LASTS,
  leads: LEADS,
  roles: ROLES,
  clients: SITES,
  extend: [
    ["kern", "Kern Solar", "Kern", ["Tracker motor repairs"]],
    ["mesa", "Mesa Storage", "Mesa", ["Battery cooling repairs"]],
    ["pine", "Pine Ridge Wind", "Pine Ridge", ["Blade repairs"]],
  ],
  self: "Hannah",
  team: TEAM,
  emailDomain: "crestlinerenewables.com",
  vendors: VENDORS,
  vendorsLabel: "Vendors",
  procedures: PROCEDURES,
  policies: POLICIES,
  decisions: DECISIONS,
  tools: TOOLS,
  rituals: RITUALS,
  goals: GOALS,
  topics: TOPICS,
  tone: { label: "How you write field plans", lines: TONE, titles: ["Field plan template", "Writing for crews", "Plan style", "Rewrite this plan", "Shorter plans", "Radio friendly steps"] },
};
