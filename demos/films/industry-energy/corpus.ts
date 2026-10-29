import { count, firstName as first, vendorParts, type Book, type Field, type Line, type MakeCtx, type Mate, type Vendor } from "./scale";

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

/** The site operators grown beside the four the film names: name, what it runs, its jobs, its size. Made up names. */
const SITES: Field["clients"] = [
  ["coyote-flats", "Coyote Flats Solar", "Coyote Flats", "Coyote Flats Solar runs a 120 megawatt solar farm in the Mojave.", ["Tracker motor repairs"], 1],
  ["raven-hill", "Raven Hill Wind", "Raven Hill", "Raven Hill Wind runs 38 turbines on a ridge above Palm Springs.", ["Yaw motor rebuilds"], 1],
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

/** Vendors: [name, what they do for us, notice they need, how they bill, our contact]. Made up. */
const HOLLIS: Vendor = ["Hollis Lifting", "supplies the cranes for our wind work", "two weeks", "per lift day", "Gary Hollis"];
const NORTHGEAR: Vendor = ["Northgear", "rebuilds gearboxes", "ten weeks", "half on order", "Ingrid Moss"];
const SKYLINE: Vendor = ["Skyline Drones", "flies our blade inspections", "five days", "per site", "Tariq Ali"];
const BASIN: Vendor = ["Basin Oil Labs", "tests our gearbox oil samples", "three days", "per sample", "Renee Park"];
const WESTLINE: Vendor = ["Westline Electric", "does high voltage switching at substations", "two weeks", "per job", "Carl Jensen"];
const SUMMIT: Vendor = ["Summit Safety Supply", "supplies harnesses and rescue kits", "one week", "net 30", "Joy Ellis"];
const PACIFIC: Vendor = ["Pacific Bearing", "supplies main and pitch bearings", "twelve weeks", "net 60", "Martin Cho"];
const VALLEY: Vendor = ["Valley Fleet", "services our trucks and lifts", "two days", "monthly", "Ruben Ortega"];

/** The sites a line about the work at large names: the ones in memory, never the one the film follows. */
const WIND = ["Pine Ridge", "Raven Hill"];
const SOLAR = ["Kern", "Coyote Flats"];
const SITE_NAMES = [...WIND, ...SOLAR, "Mesa"];
/** A day shortly before the chat, in words ("March 3"). */
const lately = (x: MakeCtx) => x.g.after(x.on, -9, -2, x.rng);
const decision = (text: string): Line => ({ text, kind: "decision" });
const style = (text: string): Line => ({ text, kind: "style" });

/** Company: the crews, lockout, cranes and the rules (the first three are the film's own folders, field.graph's company). */
const COMPANY: Field["company"] = [
  {
    label: "Crews",
    parts: [
      [["Crew sizes", "How crews are set up"], ["Every wind crew has three people and every solar crew two.", "Each crew has a lead who signs the day's work permit."]],
      [["Crew leads"], ["Marcus, Joel and Leo lead the wind crews and Sara leads solar."]],
    ],
  },
  {
    label: "Lockout tagout steps",
    parts: [
      [["Lockout locks", "Lock rules"], ["Every lock carries the name of the person who put it on.", "Locks stay on through a shift change; the new lead adds theirs first.", "A lost key is cut off only with the site manager present."]],
      [["Lockout at substations", "Substation lockout"], ["Substation lockouts are done by Westline, never by our crews.", "Kofi checks the switching order before any substation lockout."]],
      [["Lockout audit", "Lockout checks"], ["Maya audits two lockouts a month at random.", "The last audit found a tag with no date."]],
      [["Group lockout box", "Group lockout"], ["For jobs with more than three people we use a group lockout box.", "The lead keeps the box key until every lock is off."]],
    ],
    make: {
      n: 4,
      from: [(x) => [[`Lockout log ${lately(x)}`, "Lockout log"], [`A lockout at ${x.one(SITE_NAMES)} on ${lately(x)} held for ${x.rng.int(2, 9)} hours while the crew ${x.one(["swapped a pitch motor", "replaced a cable", "changed an inverter board", "cleaned the yaw ring", "tightened tower bolts"])}.`]]],
    },
  },
  {
    label: "Crane bookings",
    parts: [
      [["Crane pads", "Crane day rules"], ["Crane pads are checked a week before the crane arrives.", "Crane days are booked in blocks of five.", "A crane held by wind is billed at half rate."]],
      ...vendorParts(HOLLIS),
      [["Crane lift plan", "Lift plans"], ["Every lift has a written lift plan signed by the site manager.", "The wind is checked before each lift and every hour after.", "Only the signal person talks to the crane operator."]],
      [["Second crane crew"], [decision("We added a second crane crew for the spring outages.")]],
    ],
    make: {
      n: 5,
      from: [(x) => [[`Crane for ${x.one(WIND)}`, "Crane booking"], [`The crane is booked at ${x.one(WIND)} for ${count(x.rng.int(3, 6))} days from ${x.g.after(x.on, 14, 50, x.rng)}.`]]],
    },
  },
  {
    label: "Policies",
    parts: [
      [["Driving on site"], ["The speed limit on site roads is 15 miles an hour.", "Trucks park facing out, ready to leave."]],
      [["Working alone"], ["No one works alone at a remote site.", "Crews check in by radio every two hours."]],
      [["Photos and drones policy"], ["Drone flights need the site's OK the day before.", "Photos of customer sites stay in the work order system."]],
      [["Fatigue rules", "Fatigue"], ["No shift runs past 12 hours.", "Crews get ten hours off between shifts."]],
      [["Overtime and callouts", "Callout pay"], ["Night callouts are paid at double time.", "Each crew lead takes callouts one week in four."]],
      [["Company trucks"], ["Company trucks are for work only, and every trip is logged."]],
      [["Phones while driving"], ["No phone calls while driving on site roads, even hands free."]],
    ],
  },
];

/** Wind turbines: the gearboxes and their oil, the blades, and the pitch and yaw systems. */
const WIND_WORK: Field["sections"][number] = {
  label: "Wind turbines",
  loose: [[["Annual service", "Turbine service intervals"], ["Every turbine gets a full service once a year.", "A full service takes a crew of three one day."]]],
  folders: [
    {
      label: "Gearboxes and oil",
      parts: [
        [["Oil sampling steps", "Oil sampling"], ["Oil samples are taken with the gearbox warm, within an hour of stopping.", "Each sample bottle is labeled with the turbine and the date.", "Samples ship to Basin Oil Labs the same day."]],
        ...vendorParts(BASIN),
        [["Oil sample interval"], [decision("We decided to sample gearbox oil every three months, not every six.")]],
        [["Gearbox rebuild vendor"], [decision("We chose Northgear for gearbox rebuilds after the bid.")]],
        [["Gearbox warning signs", "Gearbox failure signs"], ["Metal in the oil and rising vibration usually come a month before a gearbox fails.", "Priyanka reviews every gearbox with two bad samples in a row."]],
        [["Gearbox replacement", "Gearbox swap cost"], ["A gearbox swap costs about 350,000 dollars with the crane.", "It takes a crew of four about five days."]],
      ],
      make: {
        n: 10,
        from: [
          (x) => {
            const site = x.one(WIND);
            return [[`${site} oil samples`, `${site} oil results`], [`Oil from turbine ${x.rng.int(2, 38)} at ${site} came back ${x.one(["clean", "with high iron", "with water in it", "with copper traces", "clean but dark"])} on ${lately(x)}.`]];
          },
        ],
      },
    },
    {
      label: "Blades",
      parts: [
        ...vendorParts(SKYLINE),
        [["Drone blade inspections"], [decision("We moved blade inspections from rope access to drones.")]],
        [["Blade damage types", "Blade damage"], ["Leading edge wear is the damage we repair most.", "Lightning damage needs a blade engineer to sign off before the turbine restarts."]],
        [["Blade repair season", "Blade repair weather"], ["Blade repairs need dry days over 10 degrees.", "We plan most blade repairs for May to September."]],
        [["Blade repair materials"], ["Blade repairs use the resin system the turbine maker approves, never our own mix."]],
      ],
      make: {
        n: 7,
        from: [(x) => [[`${x.one(WIND)} blade findings`, "Drone inspection results"], [`The drone found ${x.one(["leading edge wear", "a lightning strike", "a crack near the root", "erosion on the tip", "a loose vortex panel"])} on turbine ${x.rng.int(2, 38)} at ${x.one(WIND)} on ${lately(x)}.`]]],
      },
    },
    {
      label: "Pitch and yaw",
      parts: [
        [["Pitch motors", "Pitch faults"], ["Pitch motors are the part we swap most often.", "A pitch fault stops the turbine until a crew resets it."]],
        [["Yaw system", "Yaw checks"], ["Yaw brakes are checked every six months.", "The yaw ring gets grease twice a year."]],
        [["Tower bolts", "Bolt check tools"], [decision("We chose hydraulic tensioners over torque wrenches for tower bolts."), "Tower bolts are checked once a year on every turbine."]],
        [["Pitch battery tests", "Pitch batteries"], ["Pitch batteries are tested every year and swapped every five.", "A weak pitch battery can stop a turbine from feathering in a storm."]],
        [["Slip rings"], ["Slip rings are cleaned at every service."]],
      ],
      make: {
        n: 8,
        from: [(x) => [[`${x.one(WIND)} pitch fault`, "Pitch motor swap"], [`The crew swapped a ${x.one(["pitch motor", "pitch battery", "yaw motor", "yaw brake pad"])} on turbine ${x.rng.int(2, 38)} at ${x.one(WIND)} on ${lately(x)}.`]]],
      },
    },
  ],
};

/** Solar and storage: the inverters, the trackers and the batteries. */
const SOLAR_WORK: Field["sections"][number] = {
  label: "Solar and storage",
  folders: [
    {
      label: "Inverters",
      parts: [
        [["Inverter reset steps", "Inverter reset"], ["An inverter is isolated on both sides before anyone opens it.", "Wait five minutes after isolation before touching the bus.", "Every reset is logged with the fault code."]],
        [["Spare inverter boards"], [decision("We decided to keep two spare inverter boards for every solar site.")]],
        [["Inverter heat", "Hot day trips"], ["Inverters trip most on afternoons over 40 degrees.", "Cleaning the air filters every month cuts heat trips by half."]],
        [["Inverter warranty", "Inverter warranty claims"], ["Most of our inverters are under warranty until 2028.", "Warranty claims need the fault log and photos of the board."]],
        [["Inverter firmware"], ["Inverter firmware is updated only with the site's OK and never in summer."]],
        [["Solar output checks"], ["Output from each solar site is checked every Monday against the weather."]],
      ],
      make: {
        n: 10,
        from: [(x) => [[`${x.one(SOLAR)} inverter ${x.rng.int(1, 24)}`, "Inverter fault"], [`Inverter ${x.rng.int(1, 24)} at ${x.one(SOLAR)} tripped on ${lately(x)} with ${x.one(["a ground fault", "an over temperature alarm", "a DC overvoltage", "a fan failure", "a communication loss"])}.`]]],
      },
    },
    {
      label: "Trackers",
      parts: [
        [["Tracker motors", "Tracker faults"], ["Tracker motors fail most after dust storms.", "A stuck tracker row loses about a fifth of its output."]],
        [["Panel washes", "Washing schedule"], ["Solar panels are washed twice a year, more in dusty years.", "Washes run at night so the panels are cool."]],
        [["Stow in high wind", "Wind stow"], ["Trackers stow flat when wind passes 20 meters a second."]],
        [["Tracker controllers", "Tracker software"], ["Each tracker row has its own controller and a backup battery."]],
        [["Cracked panels", "Panel cracks"], ["Cracked panels are swapped at the next visit, not left until the wash."]],
        [["Solar visit plan", "Solar site visits"], ["Every solar site gets a visit each month, with a full check in spring."]],
      ],
      make: {
        n: 8,
        from: [(x) => [[`${x.one(SOLAR)} tracker repairs`, "Tracker repair log"], [`The crew fixed ${count(x.rng.int(2, 12))} stuck tracker rows at ${x.one(SOLAR)} on ${lately(x)}.`]]],
      },
    },
    {
      label: "Batteries",
      parts: [
        [["Battery cooling", "Cooling checks"], ["Battery containers are kept between 18 and 30 degrees.", "Cooling filters are changed every three months."]],
        [["Fire system tests", "Battery fire systems"], ["Each battery container's fire system is tested every six months.", "The fire marshal must see each test log."]],
        [["Battery safety", "Battery rules"], ["No one works inside a battery container alone.", "Battery containers are opened only after the site's control room says it is safe."]],
        [["Mesa battery work", "Battery bid notes"], ["Mesa's battery will be the first we service at that size.", "Sara is training two solar technicians on battery work."]],
        [["Battery warranty"], ["Battery warranties need the cooling logs kept for every month."]],
        [["Battery certification", "Battery training"], ["Technicians need a battery safety course before working on a container."]],
      ],
      make: {
        n: 6,
        from: [(x) => [[`Battery check ${lately(x)}`, "Battery container check"], [`Container ${x.rng.int(1, 12)} at the battery site ran ${x.rng.int(2, 6)} degrees warm on ${lately(x)} until its filter was changed.`]]],
      },
    },
  ],
};

/** Safety: the rules, climbing and rescue, and what went wrong. */
const SAFETY: Field["sections"][number] = {
  label: "Safety",
  folders: [
    {
      label: "Safety rules",
      parts: [
        [["Site safety basics", "Safety rules review"], ["Every truck carries a first aid kit and a fire extinguisher.", "Hard hats come off only inside the trucks and the site office.", "Two way radios are tested at the start of every shift."]],
        [["Hot work steps", "Hot work"], ["Hot work needs a permit and a fire watch.", "The fire watch stays 30 minutes after the work ends."]],
        [["Storm shutdown", "Lightning rules"], ["Crews come down when lightning is within 10 miles.", "No one climbs for 30 minutes after the last strike."]],
        [["Winter work limits"], [decision("We decided no climbing below minus 20 degrees.")]],
        [["Heat rules", "Working in heat"], ["On days over 38 degrees, solar crews stop at 1 pm.", "Every truck carries ten liters of water a person."]],
        [["Protective gear", "PPE rules"], ["Arc flash suits are worn for any switching over 480 volts.", "Safety glasses are worn on every solar site."]],
        [["Site inductions", "Inductions"], ["Every crew member does each site's induction before their first visit."]],
      ],
      make: {
        n: 3,
        from: [(x) => [[`Safety audit at ${x.one(SITE_NAMES)}`, "Safety audit findings"], [`Maya's audit at ${x.one(SITE_NAMES)} on ${lately(x)} found ${x.one(["a fire extinguisher past its date", "a ladder with a cracked rung", "a first aid kit missing gauze", "a radio with a dead spare battery", "a truck without wheel chocks"])}.`]]],
      },
    },
    {
      label: "Climbing and rescue",
      parts: [
        [["Climbing a turbine", "Climbing steps"], ["Two climbers go up together, each with a radio.", "The rescue kit is checked at the base before every climb.", "Climbs stop when gusts pass 20 meters a second."]],
        ...vendorParts(SUMMIT),
        [["Rescue drills", "Tower rescue practice"], ["Every crew runs a tower rescue drill each quarter.", "A rescue from the nacelle must take under 15 minutes."]],
        [["Harness checks"], ["Harnesses are checked before every climb and logged once a month."]],
        [["Anchor points", "Fall protection"], ["Every anchor point in the tower is checked once a year."]],
      ],
      make: {
        n: 5,
        from: [(x) => [[`Rescue drill ${lately(x)}`, "Rescue drill results"], [`${x.one(["Marcus", "Joel", "Leo"])}'s crew ran a tower rescue drill at ${x.one(WIND)} on ${lately(x)} in ${x.rng.int(9, 14)} minutes.`]]],
      },
    },
    {
      label: "Incidents and near misses",
      parts: [
        [["Incident reporting", "Reporting an incident"], ["Any injury is reported to the safety manager within the hour.", "A near miss is written up the same day.", "Every incident gets a review within a week."]],
        [["Stand downs", "Safety stand down"], ["After a stand down, every crew on the site hears what happened before work starts again."]],
        [["Safety record"], ["We have gone 640 days without a lost time injury."]],
        [["First aid cases"], ["Most of our first aid cases are cuts and heat."]],
      ],
      make: {
        n: 9,
        from: [(x) => [[`Near miss ${lately(x)}`, `${x.one(SITE_NAMES)} near miss`], [`Near miss at ${x.one(SITE_NAMES)} on ${lately(x)}: ${x.one(["a wrench fell from the nacelle into the clear zone", "a truck slid on the gravel road", "a tag was missing on a breaker", "a gust hit 22 meters a second during a lift", "a rattlesnake by the inverter pad"])}.`]]],
      },
    },
  ],
};

/** Parts and vendors: the spares, the vendors and the trucks and tools. */
const PARTS: Field["sections"][number] = {
  label: "Parts and vendors",
  folders: [
    {
      label: "Spare parts",
      parts: [
        [["Spares rules", "Spares restocking"], ["Spares used on a site are restocked within two weeks.", "The yard counts every spare on the first Friday of the month."]],
        ...vendorParts(PACIFIC),
        [["Bearing stock"], [decision("We decided to hold one main bearing at the yard at all times.")]],
        [["Site spares", "Spares by site"], ["Each wind site keeps a cabinet of small spares in its office.", "The cabinet list is checked at every monthly visit."]],
        [["Spare parts budget"], ["We spend about 60,000 dollars a month on spares across all sites."]],
      ],
      make: {
        n: 6,
        from: [(x) => [[`Part on order ${lately(x)}`, "Parts on order"], [`Ethan ordered ${count(x.rng.int(2, 6))} ${x.one(["pitch motors", "inverter boards", "tracker motors", "yaw brake pads", "slip rings"])} on ${lately(x)}, due in ${count(x.rng.int(2, 9))} weeks.`]]],
      },
    },
    {
      label: "Vendors",
      parts: [
        ...vendorParts(NORTHGEAR),
        ...vendorParts(WESTLINE),
        [["Vendor reviews"], ["Every vendor gets a review in January on price, speed and safety."]],
        [["Vendor safety rules"], ["Every vendor crew on our job follows our lockout and climbing rules."]],
        [["Vendor billing", "Vendor invoices"], ["Vendor invoices are matched to a work order before they are paid."]],
      ],
      make: {
        n: 2,
        from: [(x) => [[`Westline job at ${x.one(SITE_NAMES)}`, "Westline switching job"], [`Westline did the switching at ${x.one(SITE_NAMES)} on ${lately(x)} so our crew could ${x.one(["replace a cable joint", "swap a breaker", "test the transformer", "clean the substation"])}.`]]],
      },
    },
    {
      label: "Trucks and tools",
      parts: [
        ...vendorParts(VALLEY),
        [["Truck fleet", "Our trucks"], ["We run 14 service trucks and two boom lifts.", "Every truck gets a service every 10,000 miles."]],
        [["Tool calibration", "Torque tools"], ["Torque tools are calibrated every six months.", "A tool past its date is tagged and sent back to the yard."]],
      ],
      make: {
        n: 5,
        from: [(x) => [[`Truck ${x.rng.int(1, 14)} service`, "Truck repairs"], [`Truck ${x.rng.int(1, 14)} was in the shop from ${lately(x)} for ${x.one(["new brakes", "a cracked windshield", "a tire blowout", "a lift gate repair"])}.`]]],
      },
    },
  ],
};

/** Permits and grid: the county permits, the grid outages and the wildlife rules. */
const PERMITS: Field["sections"][number] = {
  label: "Permits and grid",
  folders: [
    {
      label: "Permits",
      parts: [
        [["Permit tracker", "Permit end dates"], ["Every site's permits are listed in the permit tracker with their end dates.", "Noise permits limit work near homes to daylight hours."]],
        [["Permit renewal steps"], ["A permit renewal needs the site map, the last bird survey and the noise log."]],
        [["Who to call at the county", "County contacts"], ["Each county has one planner we deal with for every permit.", "Owen keeps the county contacts in the permit tracker."]],
        [["Permit fees"], ["Permit fees are passed to the site operator at cost."]],
        [["Road use permits"], ["Oversize loads for blades need a road use permit from the state."]],
      ],
      make: {
        n: 7,
        from: [(x) => [[`${x.one(SITE_NAMES)} permit`, "County permit"], [`The ${x.one(["noise", "road use", "grading", "building"])} permit for ${x.one(SITE_NAMES)} runs out in ${x.g.month(x.g.ahead(60, 300, x.rng).iso)}.`]]],
      },
    },
    {
      label: "Grid outages",
      parts: [
        [["Outage notice rules", "Grid outage rules"], ["The grid operator needs two weeks' notice of a planned outage.", "Dana approves every outage window before it goes to a grid operator."]],
        [["Curtailment", "Grid curtailment"], ["When the grid curtails a site, we use the time for work that needs the turbines off."]],
        [["Switching orders", "Substation switching"], ["Every substation job has a switching order checked by two people."]],
        [["Planned outages", "Outage calendar"], ["Spring outages run from March to May, before the summer peak.", "No planned outages from June to September."]],
        [["Grid operator contacts"], ["Each site has a control room number we call before and after every switching job."]],
      ],
      make: {
        n: 7,
        from: [(x) => [[`${x.one(SITE_NAMES)} outage`, "Outage window"], [`${x.one(SITE_NAMES)} has an outage window on ${x.g.after(x.on, 10, 40, x.rng)} for ${x.one(["substation work", "a breaker swap", "cable repairs", "a transformer test"])}.`]]],
      },
    },
    {
      label: "Wildlife",
      parts: [
        [["Wildlife rules"], ["Work stops near an active nest until the biologist clears it.", "Every crew carries the wildlife card for the site."]],
        [["Bird survey schedule", "Bird surveys"], ["Each bird survey takes two biologists three days per site.", "Eagle sightings go to the site biologist the same day."]],
        [["Desert tortoise rules"], ["At the solar sites, crews check under every truck for tortoises before driving."]],
        [["Bats", "Bat rules"], ["At two wind sites, turbines slow down on calm summer nights to protect bats."]],
        [["Nesting season", "Nesting rules"], ["Nesting season runs from February to August.", "Vegetation is cut only outside nesting season."]],
        [["Wildlife log", "Wildlife finds"], ["Every bird or bat found under a turbine is logged for the biologist."]],
      ],
      make: {
        n: 3,
        from: [(x) => [[`Nest at ${x.one(SITE_NAMES)}`, "Nest found"], [`A ${x.one(["hawk", "raven", "golden eagle", "burrowing owl"])} nest was found near ${x.one(SITE_NAMES)} on ${lately(x)}, and work there stopped for ${count(x.rng.int(2, 9))} days.`]]],
      },
    },
  ],
};

/** Writing: how Hannah writes field plans, the reports to operators and the crew briefings. */
const WRITING: Field["sections"][number] = {
  label: "Writing",
  folders: [
    {
      label: "How you write field plans",
      parts: [
        [["Field plan template", "Writing for crews", "Plan style"], ["I write each day's plan with the crew, the site and the weather at the top.", "I list the parts to load on the truck before the steps.", "I put the rescue plan in every plan for work at height."].map(style)],
        [["Rewrite this plan", "Shorter plans", "Radio friendly steps"], ["I write to site managers in plain words, without our part numbers.", "I end every plan with who to call if something goes wrong.", "I give wind limits in meters a second every time."].map(style)],
        [["Before I send a plan", "Plan checklist"], ["I check every plan for the lockout points before it goes out.", "I put the site's emergency number at the bottom of every plan."].map(style)],
        [["Writing for operators"], ["I write to operators about output first and our work second.", "I keep emails to site managers under 120 words."].map(style)],
      ],
    },
    {
      label: "Reports to operators",
      parts: [
        [["Availability report format", "Monthly report"], ["The monthly report gives availability by turbine group, then the top five faults.", "It goes out by the fifth working day of the month."]],
        [["Incident report to an operator"], ["An incident report to an operator says what happened, who was there and what we changed."]],
        [["Work order summary", "Job summary"], ["Each finished job gets a summary with photos before and after."]],
        [["Report photos"], ["Photos in reports have the turbine number and the date in the corner."]],
        [["Root cause reports", "Root cause report format"], ["A root cause report has the failure, the evidence, the cause and the fix, in that order.", "Priyanka checks every root cause report before it goes out."]],
        [["Writing quotes", "Quote format"], ["Quotes list labor, crane days and parts on separate lines."]],
        [["Late work note"], ["A note about late work gives the new date and the reason in two sentences."]],
      ],
      make: {
        n: 3,
        from: [(x) => {
          const site = x.one(SITE_NAMES);
          return [[`${site} monthly report`, `${site} availability`], [`The ${x.g.month(x.on)} report for ${site} showed ${x.rng.int(94, 99)}.${x.rng.int(0, 9)} percent availability.`]];
        }],
      },
    },
    {
      label: "Crew briefings",
      parts: [
        [["Morning briefing", "Crew briefing format"], ["The morning briefing covers the weather, the work, the hazards and the rescue plan.", "Every crew member says one hazard back before driving out."]],
        [["Briefing sheet", "Briefing template"], ["The briefing sheet fits on one page and goes in the truck."]],
        [["Briefing for new sites"], ["A crew new to a site gets the site rules and the gate codes the day before."]],
        [["Briefing words", "Hazard words"], ["Briefings use the same hazard words every day, like drop zone and clear zone."]],
        [["Briefing in heat"], ["On hot days the briefing starts with water, shade and the stop time."]],
        [["Weekly toolbox talk", "Toolbox talks"], ["Every Monday's briefing has a five minute toolbox talk on one hazard.", "Maya sends the toolbox talk topic on Friday."]],
      ],
    },
  ],
};

/** Plans and deadlines: the year's goals, the crew rota and training. */
const PLANS: Field["sections"][number] = {
  label: "Plans and deadlines",
  loose: [[["Due this month", "This month's deadlines"], ["Spring outage plans for every wind site are due December 1.", "Next year's crew rota goes out by December 15."]]],
  folders: [
    {
      label: "2027 goals",
      parts: [
        [["2027 goals", "Yearly plan", "Planning for next year"], ["Our 2027 goal is 98 percent availability across every wind site.", "We want zero lost time injuries again next year.", "We aim to answer every unplanned callout within four hours."]],
        [["Goals review", "Growth plan"], ["We plan to add three new solar sites to our contracts in 2027.", "We want every gearbox on a three month oil sample plan by spring.", "We aim to cut crane days per job by a fifth."]],
        [["2026 results", "How 2026 went"], ["Availability across our wind sites was 97.1 percent in 2026.", "We answered 91 percent of callouts within four hours."]],
        [["Contract goals", "New contracts"], ["We are bidding on four new sites for 2027.", "Owen wants every contract renewed for three years, not one."]],
        [["Hiring plan"], ["We plan to hire four technicians in 2027, two for wind and two for solar."]],
        [["Operator meetings"], ["The account managers meet each operator once a quarter."]],
      ],
    },
    {
      label: "Crew rota",
      parts: [
        [["Rotation pattern", "Four day rotations"], [decision("We moved field crews to four day rotations at remote sites."), "Crews drive out on Monday and back on Thursday."]],
        [["Team rhythm", "Meeting schedule"], ["Crews meet by video at 6:30 every morning before driving out.", "The planning call for next week is every Thursday at 2.", "Safety stand downs happen the first Monday of each month."]],
        [["Holiday cover", "Holiday rota"], ["Two crews stay on call over the holidays, one wind and one solar."]],
        [["Swapping shifts", "Rota changes"], ["Shift swaps go through Nadia by Wednesday."]],
        [["Callout rota"], ["The callout rota for each month goes out on the 20th of the month before."]],
      ],
      make: {
        n: 3,
        from: [(x) => [[`Rota for ${x.g.month(x.on)}`, "Crew rota"], [`${x.one(["Marcus", "Joel", "Leo", "Sara"])}'s crew is at ${x.one(SITE_NAMES)} from ${x.g.after(x.on, 5, 30, x.rng)} for ${count(x.rng.int(3, 8))} days.`]]],
      },
    },
    {
      label: "Training",
      parts: [
        [["Training plan", "Certifications"], ["Every technician renews climbing and rescue every two years.", "High voltage training is done every year by Westline."]],
        [["New crew members", "New hire plan"], ["New crew members shadow Marcus for their first two weeks.", "Reliability reviews every failed part on the last Friday of the month."]],
        [["Training budget"], ["The training budget is 4,000 dollars a technician a year."]],
        [["Course dates", "Rescue course dates"], ["The next climbing and rescue course is in Livermore in January."]],
        [["Training records"], ["Training records are kept by Maya and checked before every site induction."]],
        [["Drone pilot training"], ["Leo and one more technician are training for their drone licence."]],
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
  clients: SITES,
  extend: [
    ["kern", "Kern Solar", "Kern", ["Tracker motor repairs"]],
    ["mesa", "Mesa Storage", "Mesa", ["Battery cooling repairs"]],
    ["pine", "Pine Ridge Wind", "Pine Ridge", ["Blade repairs"]],
  ],
  self: "Hannah",
  team: TEAM,
  teamFolder: "Crews",
  company: COMPANY,
  sections: [WIND_WORK, SOLAR_WORK, SAFETY, PARTS, PERMITS, WRITING, PLANS],
};
