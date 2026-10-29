import { count, type Book, type Field, type Mate, type Vendor } from "./scale";

/**
 * Westbrook High School at full size: the chats Priya and the science
 * department's teachers, aides and staff had across ChatGPT, Claude and
 * Gemini over a year and a half, grown from a seed by scale.ts in the
 * words of a high school. Each class or program is a folder of its own,
 * with the adults who work with it, its units and labs, and what was
 * promised, planned and asked. The classes, the staff, the partners, the
 * procedures and the rules are made up for the demo. firm.ts files what
 * grows here beside the lines the film writes by hand, which stay as they
 * are.
 */

const SEED = 20261106;

/* ---------- the classes and programs ---------- */

/** School contacts go by title and last name, as students and staff say them. */
const FIRSTS = ["Ada", "Bea", "Cy", "Del", "Eve", "Fay", "Gil", "Hal", "Ike", "Jo", "Kit", "Lou", "Max", "Ned", "Oz", "Pia", "Rae", "Sol", "Tad", "Uma", "Val", "Wes", "Zed", "Ann", "Bo", "Cal", "Dot", "Eli", "Flo", "Gus", "Hy", "Ivy", "Jem", "Kai", "Lea", "Mo"];
const LASTS = ["Lindgren", "Okafor", "Delgado", "Whitaker", "Nakamura", "Petrakis", "Sullivan", "Moreau", "Hargrove", "Castillo", "Brennan", "Iqbal", "Fontaine", "Gallo", "Kowalczyk", "Larkin", "Mbatha", "Novak", "Osei", "Pham", "Quintero", "Rosen", "Sato", "Tremblay", "Ulloa", "Varga", "Wexley", "Yoder", "Zamora", "Abbott", "Bishop", "Crowley", "Dunn", "Ellery", "Foley", "Grady", "Hollis", "Ingle", "Jarvis", "Keane", "Lowell", "Marchetti", "Nolan", "Oduya", "Prescott", "Reinholt", "Sterling", "Thorne", "Vance", "Winslow", "Yancey", "Arroyo", "Beckett", "Carmody", "Dalton", "Esparza", "Fairley", "Garland"];
/** The main adult works in the room with the class; the others support its students and families. */
const LEADS = ["co-teacher", "special education co-teacher", "teaching assistant", "club sponsor"];
const ROLES = ["counselor", "case manager", "parent volunteer", "English learner specialist", "instructional coach", "family liaison"];

const DUTY: Record<string, string> = {
  "co-teacher": "co-teaches the class two days a week",
  "special education co-teacher": "writes the accommodations for the class",
  "teaching assistant": "runs small groups during labs",
  "club sponsor": "runs the group with me after school",
  counselor: "tracks grades and talks to families",
  "case manager": "manages the IEPs for students in the class",
  "parent volunteer": "helps with labs and field trips",
  "English learner specialist": "supports the English learners in the class",
  "instructional coach": "observes the class once a month",
  "family liaison": "calls home when a student stops coming",
};

/** Each class or program: its name, what it is, its units and projects, its size. Made up. */
const CLASSES: Field["clients"] = [
  ["p1bio", "Period 1 Biology", "Period 1", "Period 1 Biology has 28 ninth graders, most of them new to lab work.", ["Genetics unit", "Lab practical"], 3],
  ["p2hon", "Period 2 Biology Honors", "Period 2", "Period 2 Biology Honors has 24 tenth graders who take the state test in May.", ["Ecology unit", "Dissection lab"], 3],
  ["p6anat", "Period 6 Anatomy", "Period 6", "Period 6 Anatomy has 22 juniors and seniors, many headed for nursing programs.", ["Skeletal system unit", "Heart lab"], 2],
  ["p7bio", "Period 7 Biology", "Period 7", "Period 7 Biology has 30 students and is co-taught two days a week.", ["Cell review unit"], 3],
  ["marine", "Marine biology elective", "Marine biology", "Marine biology is a spring elective with 26 students.", ["Tide pool project", "Fish dissection lab"], 3],
  ["forensics", "Forensic science elective", "Forensic science", "Forensic science is a fall elective with 25 students.", ["Crime scene lab"], 1],
  ["capstone", "Senior capstone", "Capstone", "Senior capstone pairs each senior with a mentor for a research project.", ["Research project", "Poster project"], 2],
  ["apbio", "AP Biology", "AP Biology", "AP Biology has 21 juniors and seniors who take the AP exam in May.", ["Enzymes lab", "Exam review unit"], 2],
  ["zoology", "Zoology elective", "Zoology", "Zoology is a spring elective with 24 students.", ["Animal behavior project"], 1],
  ["envsci", "Environmental science", "Environmental science", "Environmental science has 29 eleventh graders.", ["Water quality lab", "Recycling project"], 2],
  ["botany", "Botany elective", "Botany", "Botany is a fall elective that uses the greenhouse.", ["Seed germination lab"], 1],
  ["p4bio", "Period 4 Biology", "Period 4", "Period 4 Biology has 27 tenth graders and a student teacher this fall.", ["Evolution unit", "Microscope lab"], 2],
  ["health", "Health science elective", "Health science", "Health science is a spring elective for students thinking about nursing.", ["First aid unit"], 1],
  ["dual", "Dual credit biology", "Dual credit", "Dual credit biology is taught with Riverside Community College for college credit.", ["College lab unit"], 2],
];

const DELIVERABLES = ["graded lab reports", "unit study guide", "retake plan", "field trip forms", "progress reports", "reading supports", "extra credit options", "review packet", "comments on their project proposals", "test accommodations list"];
const THEIR_THINGS = ["the accommodation list", "notes on the new seating chart", "the reading level data", "the IEP updates", "the family contact list", "the signed permission slips", "the mentor list"];
const ASKS = ["the study guide a week before each test", "lab dates posted on the class page", "quiz grades within a week", "a plain language version of each test", "fewer homework posts after 8 pm", "a reminder text before field trips", "a printed copy of each assignment for two students", "a list of what to bring on lab days"];
const PREFERS = ["notes in the shared drive", "a quick chat at lunch", "plans a week ahead", "email after school, not during class", "a short list over a long email"];

const book: Book = {
  account: (c) => [`${c.short} roster`, `${c.short} overview`, `${c.name} notes`],
  status: [
    (x) => [[`${x.c.short} planning`], `Active this school year. ${x.c.short} started in August with the science department.`],
    (x) => [[`${x.c.short} room`], `Active this school year. ${x.c.short} meets in room ${x.rng.int(102, 240)}.`],
  ],
  contact: [
    (x) => [[`Notes from ${x.k.name}`, `Intro to ${x.k.name}`], `${x.k.name} is the ${x.k.role} for ${x.c.short} and ${DUTY[x.k.role]}.`],
    (x) => [[`${x.k.name} and ${x.c.short}`, `Meeting ${x.k.name}`], `For ${x.c.short}, ${x.k.name} ${DUTY[x.k.role]} as ${x.k.role}.`],
    (x) => [[`New staff for ${x.c.short}`, `${x.c.short} staff changes`], `${x.k.name} took over as ${x.k.role} for ${x.c.short} in ${x.g.month(x.on)} and ${DUTY[x.k.role]}.`],
  ],
  promise: [
    (x, due) => {
      const what = x.one(DELIVERABLES);
      return [[`${x.c.short} ${what}`, `Promises to ${x.c.short}`], `We promised ${x.c.short} their ${what} by ${due}.`];
    },
    (x, due) => [[`Follow up with ${x.k.name}`, `${x.c.short} next steps`], `I told ${x.k.name} I would send the ${x.one(DELIVERABLES)} by ${due}.`],
    (x, due) => [[`${x.c.short} open items`, `Waiting on ${x.k.name}`], `${x.k.name} agreed to send ${x.one(THEIR_THINGS)} before ${due}.`],
  ],
  meetingAhead: [
    (x, due) => [[`Co-planning with ${x.k.name}`, `${x.c.short} planning`], `Co-planning with ${x.k.name} on ${due} for the next unit.`],
    (x, due) => [[`${x.c.short} family conferences`], `Family conferences for ${x.c.short} on ${due}.`],
    (x, due) => [[`${x.c.short} observation`], `Observation of ${x.c.short} by the instructional coach on ${due}.`],
  ],
  meetingPast: [
    (x, day) => [[`${x.c.short} quiz review`, `${x.c.short} data meeting`], `Met ${x.k.name} on ${day} to look at the quiz results.`],
    (x, day) => [[`${x.c.short} family night`], `Family night for ${x.c.short} on ${day}. About half the families came.`],
    (x, day) => [[`${x.c.short} IEP meeting`], `IEP meeting for a ${x.c.short} student on ${day}, with the new supports agreed.`],
  ],
  deadline: [
    (x, due) => [[`${x.c.short} unit test`], `The next ${x.c.short} unit test is on ${due}.`],
    (x, due) => [[`${x.c.short} project proposals`], `${x.c.short} project proposals are due by ${due}.`],
    (x, due) => [[`${x.c.short} progress reports`], `Progress reports for ${x.c.short} go home by ${due}.`],
  ],
  request: [
    (x) => [[`${x.c.short} family requests`, `${x.c.short} family feedback`], `${x.c.short} families asked for ${x.one(ASKS)}.`],
    (x) => [[`Notes from ${x.k.name}`, `${x.c.short} requests`], `${x.k.name} asked for ${x.one(ASKS)}.`],
  ],
  preference: [(x) => [[`Working with ${x.k.name}`, `${x.c.short} ways of working`], `${x.k.name} prefers ${x.one(PREFERS)}.`]],
  billing: [
    (x) => [[`${x.c.short} lab fees`], `Lab fees for ${x.c.short} are ${x.one([10, 15, 20])} dollars a student, with waivers through the office.`],
    (x) => [[`${x.c.short} supplies`], `${x.c.short} supplies come out of the science department budget.`],
    (x) => [[`${x.c.short} bus costs`], `Buses for ${x.c.short} trips are paid by the parent group.`],
  ],
  document: [
    (x) => [[`${x.c.short} syllabus`], `Pasting the ${x.c.short} syllabus: grading weights, late work and the lab rules.`],
    (x) => [[`${x.c.short} course map`], `Pasting the ${x.c.short} course map: units, labs and test dates by month.`],
  ],
  decision: [
    (x) => [[`${x.c.short} test day`], `${x.c.short} moved its unit tests to the Monday after each lab.`],
    (x) => [[`${x.c.short} lab groups`], `${x.k.name} and I decided to put ${x.c.short} in lab groups of four.`],
    (x) => [[`${x.c.short} retakes`], `${x.c.short} allows one retake a unit, after a review session.`],
  ],
  work: [
    (x) => [[`${x.c.short} ${x.w.toLowerCase()}`, `${x.w} plan`], [`The ${x.w.toLowerCase()} for ${x.c.short} runs ${count(x.rng.int(2, 5))} weeks.`, `${x.c.contacts[0]!.name} wants the ${x.w.toLowerCase()} ready before ${x.g.month(x.g.ahead(25, 120, x.rng).iso)}.`]],
    (x) => [[`${x.w} results`, `${x.c.short} ${x.w.toLowerCase()} scores`], [`Scores on the ${x.w.toLowerCase()} rose ${x.rng.int(4, 15)} points after the review day.`]],
    (x) => [[`${x.w} materials`, `${x.c.short} lab setup`], [`Leah sets up the ${x.w.toLowerCase()} materials two days ahead.`, `The ${x.w.toLowerCase()} needs ${count(x.rng.int(6, 10))} lab stations.`]],
    (x) => [[`${x.w} supports`, `${x.c.short} accommodations`], [`${count(x.rng.int(2, 5))} students in ${x.c.short} get extra time and read aloud for the ${x.w.toLowerCase()}.`]],
    (x) => [[`${x.w} questions`], [`${x.k.name} asked whether the ${x.w.toLowerCase()} can include a short writing piece.`]],
    (x) => [[`${x.w} lessons`, `What we learned from the ${x.w.toLowerCase()}`], [`Next year the ${x.w.toLowerCase()} needs one more day for review.`]],
    (x) => [[`${x.w} family note`], [`Families get a note about the ${x.w.toLowerCase()} the Friday before it starts.`]],
  ],
};

/* ---------- the school ---------- */

/** The rest of the staff, past the three the film names: [name, team, role, what they own, what to ask them about]. Made up. */
export const TEAM: Mate[] = [
  ["Grace Okafor", "Science", "Physics teacher", "the physics labs and the shared carts", "the lab schedule"],
  ["Martin Reyes", "Science", "Earth science teacher", "the ninth grade earth science course", "the weather station"],
  ["Helen Park", "Administration", "Assistant principal", "the master schedule and the science department", "room changes"],
  ["Sam Whitley", "Student support", "Counselor", "grade nine and ten counseling", "a student who is struggling"],
  ["Nora Quinlan", "Student support", "Special education coordinator", "IEPs and testing supports", "accommodations"],
  ["Victor Ames", "Library", "Librarian", "research lessons and the book carts", "sources for projects"],
  ["Joyce Tran", "Front office", "Attendance clerk", "attendance and early dismissals", "a missing attendance mark"],
  ["Ben Castillo", "Technology", "Technology coordinator", "student laptops and the class pages", "a broken laptop"],
];

const VENDORS: Vendor[] = [
  ["Cedar Creek Nature Center", "hosts our field trips and the watershed program", "three weeks", "per student", "Ms. Holt"],
  ["Bluebird Bus Lines", "drives our field trips", "two weeks", "per trip", "Dale Fisher"],
  ["Northfield Lab Supply", "supplies glassware, slides and chemicals", "two weeks", "on the school's purchase order", "Wendy Cho"],
  ["Greenleaf Seeds", "supplies seeds and soil for the greenhouse", "one week", "net 30", "Paul Ito"],
  ["Riverside Print Shop", "prints the science fair posters", "five days", "per job", "Lou Garcia"],
  ["Harbor Specimen Co", "supplies preserved specimens for dissection", "four weeks", "per order", "Ivy Moreau"],
];

/** A partner's chats: what it does and who to call, how much notice it needs, and how it bills. */
const vendorLines = ([name, does, notice, bills, contact]: Vendor): Array<[string[], string[]]> => {
  const short = name.split(" ").slice(0, 2).join(" ");
  return [
    [[`${name} intro`, `Call with ${short}`], [`${name} ${does}.`, `Our contact at ${short} is ${contact}.`]],
    [[`Booking ${short}`, `${short} timing`], [`${short} needs ${notice} of notice to book.`]],
    [[`${short} billing`, `${short} invoice`], [`${short} bills ${bills}.`]],
  ];
};

const PROCEDURES: Array<[string, string[]]> = [
  ["Lab setup requests", ["Lab requests go to Leah at least two days ahead.", "Each request lists the lab, the period and how many stations."]],
  ["Chemical spill", ["Students step back and the teacher calls the office.", "Small spills are cleaned with the spill kit under the sink.", "Every spill is written up the same day."]],
  ["Field trip forms", ["Permission slips go home three weeks before a trip.", "The trip list goes to the nurse a week ahead.", "Fee waivers are handled by the office, never by the teacher."]],
  ["Substitute plans", ["Every teacher keeps three days of emergency plans in the main office.", "Sub plans never include a lab.", "The sub folder has the seating charts and the bell schedule."]],
  ["Grade changes", ["Grade changes after the quarter closes need the assistant principal's OK.", "Each change is logged with its reason."]],
  ["Late work", ["Late work is accepted until the unit test.", "Late work loses ten percent, never more."]],
];

const POLICIES: Array<[string, string[]]> = [
  ["Phones in class", ["Phones go in the wall pockets at the start of class.", "Phones come out only for a lab photo the teacher asks for."]],
  ["Retakes", ["Students can retake one test a unit.", "A retake needs a review session first."]],
  ["Family contact", ["Families hear from a teacher before a grade drops below a C.", "Teachers answer family emails within two school days."]],
  ["Student photos", ["Student photos go online only with a signed media form.", "Photos of student work leave names out."]],
  ["Grading", ["Labs are 40 percent of the grade, tests 40 and homework 20.", "No zero goes in the gradebook without a call home."]],
];

const DECISIONS: Field["decisions"] = [
  ["Department decisions", "Common unit tests", "We decided every biology section gives the same unit tests."],
  ["Department decisions", "Shared lab calendar", "We moved lab bookings to one shared calendar for the department."],
  ["Department decisions", "Science fair date", "We set the science fair for the second week of March."],
  ["Grading decisions", "Homework weight", "We dropped homework from 30 to 20 percent of the grade."],
  ["Grading decisions", "Standards based rubrics", "We decided to grade labs with the department rubric only."],
  ["Grading decisions", "Retake limit", "We chose one retake a unit, not unlimited retakes."],
  ["Lab decisions", "Virtual dissection option", "We decided students can choose a virtual dissection instead of a real one."],
  ["Lab decisions", "Goggle sets", "We chose to give every student their own goggles for the year."],
  ["Lab decisions", "Greenhouse use", "We opened the greenhouse to every biology class on Fridays."],
];

const TOOLS: Field["tools"] = [
  ["gradebook", "every grade and late mark", "Helen Park"],
  ["class pages", "assignments, lab dates and study guides", "Ben Castillo"],
  ["lab request form", "every lab setup request", "Leah Kim"],
  ["science shared drive", "unit plans, rubrics and old tests", "Dana Brooks"],
  ["family messaging app", "messages to families in their language", "Joyce Tran"],
  ["attendance system", "attendance by period", "Joyce Tran"],
];

const RITUALS = [
  "The science department meets every other Tuesday after school.",
  "Biology teachers plan together on Thursdays during fourth period.",
  "Grades are due on the Friday after each quarter ends.",
  "The data meeting after each unit test is on the following Wednesday.",
  "New teachers meet their mentor every Monday morning.",
  "The whole staff meets the first Wednesday of the month.",
];

const GOALS = [
  "Our goal for this year is 85 percent of ninth graders passing biology.",
  "We want every student to do at least eight hands on labs a semester.",
  "We aim to raise state test scores in biology by five points.",
  "We want every family to hear good news from a teacher by October.",
  "We plan to double the number of science fair entries.",
  "We want every lab report graded with the same rubric across the department.",
];

/** More of what the school knows, in the folders the graph names (field.graph's company). */
const TOPICS: Record<string, string[]> = {
  "Lab safety rules": ["Long hair is tied back in every lab.", "No food or drinks past the lab door.", "Students sign the safety contract before their first lab."],
  "Grading policy": ["Quarter grades close on the last Friday of the quarter.", "Extra credit can raise a grade by two percent at most."],
  Rubrics: ["Lab reports are graded on question, method, data and conclusion.", "Every rubric has four levels, written in student friendly words.", "Projects use the department's presentation rubric."],
  Calendar: ["State testing for biology is the second week of May.", "No tests on the day before a break.", "Early release days are the first Wednesday of each month."],
  "Parent contact rules": ["Calls home are logged in the family messaging app.", "Translated messages go out for families who asked for them."],
};

const TONE = [
  "I write instructions for students as numbered steps.",
  "I keep reading levels around grade seven for class handouts.",
  "I start family updates with something the class did well.",
  "I bold the due date in every assignment.",
  "I use the same words for lab steps all year.",
  "I write test questions in plain language first, then add the science words.",
];

export const FIELD: Field = {
  seed: SEED,
  book,
  firsts: FIRSTS,
  lasts: LASTS,
  leads: LEADS,
  roles: ROLES,
  honorific: (rng) => rng.pick(["Ms.", "Mr.", "Mrs.", "Dr."]),
  // Summer break: a teacher's chats rarely fall in July.
  quiet: [6],
  // Winter break and spring break: nothing is planned for them.
  breaks: [["12-19", "01-04"], ["03-22", "03-29"]],
  clients: CLASSES,
  domainOf: () => undefined,
  extend: [
    ["p5bio", "Period 5 Biology", "Period 5", ["Genetics unit"]],
    ["apes", "AP Environmental", "AP Environmental", ["Air quality lab"]],
  ],
  self: "Priya",
  team: TEAM,
  teamsLabel: "Staff and departments",
  emailDomain: "westbrookhs.org",
  vendors: VENDORS,
  vendorLines,
  procedures: PROCEDURES,
  policies: POLICIES,
  decisions: DECISIONS,
  tools: TOOLS,
  rituals: RITUALS,
  goals: GOALS,
  topics: TOPICS,
  tone: { label: "How you write for students", lines: TONE, titles: ["Student handout style", "Writing for ninth graders", "Family update template", "Rewrite these directions", "Plain language test", "Assignment template"] },
};
