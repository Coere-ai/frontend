import { count, type Book, type Field, type Line, type MakeCtx, type Mate, type Vendor } from "./scale";

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

/** The classes grown beside the four the film names: name, what it is, its units and projects, its size. Made up. */
const CLASSES: Field["clients"] = [
  ["p1bio", "Period 1 Biology", "Period 1", "Period 1 Biology has 28 ninth graders, most of them new to lab work.", ["Genetics unit", "Lab practical"], 1],
  ["marine", "Marine biology elective", "Marine biology", "Marine biology is a spring elective with 26 students.", ["Tide pool project"], 1],
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

/** Partners: [name, what they do for us, notice they need, how they bill, our contact]. Made up. */
const CEDAR: Vendor = ["Cedar Creek Nature Center", "hosts our field trips and the watershed program", "three weeks", "per student", "Ms. Holt"];
const BLUEBIRD: Vendor = ["Bluebird Bus Lines", "drives our field trips", "two weeks", "per trip", "Dale Fisher"];
const NORTHFIELD: Vendor = ["Northfield Lab Supply", "supplies glassware, slides and chemicals", "two weeks", "on the school's purchase order", "Wendy Cho"];
const GREENLEAF: Vendor = ["Greenleaf Seeds", "supplies seeds and soil for the greenhouse", "one week", "net 30", "Paul Ito"];
const RIVERSIDE: Vendor = ["Riverside Print Shop", "prints the science fair posters", "five days", "per job", "Lou Garcia"];
const HARBOR: Vendor = ["Harbor Specimen Co", "supplies preserved specimens for dissection", "four weeks", "per order", "Ivy Moreau"];

/** A partner's chats: what it does and who to call, how much notice it needs, and how it bills. */
const vendorParts = ([name, does, notice, bills, contact]: Vendor): Array<[string[], string[]]> => {
  const short = name.split(" ").slice(0, 2).join(" ");
  return [
    [[`${name} intro`, `Call with ${short}`], [`${name} ${does}.`, `Our contact at ${short} is ${contact}.`]],
    [[`Booking ${short}`, `${short} timing`], [`${short} needs ${notice} of notice to book.`]],
    [[`${short} billing`, `${short} invoice`], [`${short} bills ${bills}.`]],
  ];
};

/** The classes a line about the school year at large names: the ones in memory, never the one the film follows. */
const NAMED = ["Period 1", "Period 5", "AP Environmental", "Marine biology"];
const UNITS = ["cell unit", "genetics unit", "ecology unit", "evolution unit", "photosynthesis unit"];
/** A day shortly before the chat, in words ("March 3"). */
const lately = (x: MakeCtx) => x.g.after(x.on, -9, -2, x.rng);
const decision = (text: string): Line => ({ text, kind: "decision" });
const style = (text: string): Line => ({ text, kind: "style" });

/** Company: the department, its lab safety rules, the grading policy and the rubrics (the film's own folders). */
const COMPANY: Field["company"] = [
  {
    label: "Department notes",
    parts: [
      [["Department roles", "Who does what in science"], ["The science department has nine teachers, one lab technician and one aide.", "Each course has a lead teacher who keeps its unit plans."]],
      [["Department budget"], ["The science department budget is 14,000 dollars a year, split by course."]],
    ],
  },
  {
    label: "Lab safety rules",
    parts: [
      [["Lab safety basics", "Lab rules"], ["Long hair is tied back in every lab.", "No food or drinks past the lab door.", "Students sign the safety contract before their first lab."]],
      [["Chemical spill steps", "Chemical spill"], ["Students step back and the teacher calls the office.", "Small spills are cleaned with the spill kit under the sink.", "Every spill is written up the same day."]],
      [["Goggle sets"], [decision("We chose to give every student their own goggles for the year.")]],
      [["Eyewash and showers", "Safety equipment checks"], ["The eyewash stations are flushed every Monday.", "Fire blankets and extinguishers are checked each month by the office."]],
      [["Lab safety for subs"], ["A substitute never runs a lab, even a short one."]],
      [["Fire drills in labs"], ["During a fire drill in a lab, burners go off and goggles stay on."]],
      [["Lab safety signs"], ["Every lab bench has the safety rules taped to its edge in English and Spanish."]],
    ],
    make: {
      n: 2,
      from: [(x) => [[`Safety quiz ${x.one(NAMED)}`, "Safety quiz results"], [`${x.rng.int(18, 30)} students in ${x.one(NAMED)} passed the lab safety quiz on ${lately(x)}, and the rest retook it the next day.`]]],
    },
  },
  {
    label: "Grading policy",
    parts: [
      [["Grading rules", "Quarter grades"], ["Quarter grades close on the last Friday of the quarter.", "Extra credit can raise a grade by two percent at most."]],
      [["Late work policy", "Late work"], ["Late work is accepted until the unit test.", "Late work loses ten percent, never more."]],
      [["Retakes policy", "Retakes"], ["Students can retake one test a unit.", "A retake needs a review session first."]],
      [["Grade changes", "Changing a grade"], ["Grade changes after the quarter closes need the assistant principal's OK.", "Each change is logged with its reason."]],
      [["Homework weight"], [decision("We dropped homework from 30 to 20 percent of the grade.")]],
      [["Zeros", "Missing work"], ["No zero goes in the gradebook without a call home."]],
      [["Extra credit"], ["Extra credit is one lab write up a quarter."]],
      [["Grading fairness", "Blind grading"], ["I grade lab reports with names folded over, then unfold to enter them."]],
    ],
  },
  {
    label: "Rubrics",
    parts: [
      [["Rubric rules", "Department rubrics"], ["Lab reports are graded on question, method, data and conclusion.", "Every rubric has four levels, written in student friendly words.", "Projects use the department's presentation rubric."]],
      [["Standards based rubrics"], [decision("We decided to grade labs with the department rubric only.")]],
      [["Rubric for posters", "Poster rubric"], ["The science fair poster rubric scores the question, the data and the talk.", "Judges get the same rubric as the students."]],
      [["Rubric calibration", "Grading together"], ["Biology teachers grade five lab reports together each quarter to keep scores even."]],
      [["Claim evidence reasoning", "Rubric for written answers"], ["Written answers are scored on claim, evidence and reasoning.", "Each part is worth two points."]],
      [["Rubric for lab notebooks", "Notebook checks"], ["Lab notebooks are checked each quarter for dates, data and a sketch for every lab.", "A complete notebook is worth one lab grade."]],
    ],
  },
];

/** Labs: setting them up, the supplies and the greenhouse. */
const LABS: Field["sections"][number] = {
  label: "Labs",
  folders: [
    {
      label: "Lab setups",
      parts: [
        [["Lab setup requests", "Asking for a lab setup"], ["Lab requests go to Leah at least two days ahead.", "Each request lists the lab, the period and how many stations."]],
        [["Shared lab calendar"], [decision("We moved lab bookings to one shared calendar for the department.")]],
        [["Lab rooms", "Lab room schedule"], ["Biology has two lab rooms, 210 and 214.", "Chemistry has room 214 on Fridays."]],
        [["Clean up routine", "Lab clean up"], ["The last five minutes of every lab are for clean up.", "Each lab group has a clean up job card."]],
        [["Which days are lab days", "Lab days"], ["Lab days are Tuesday and Thursday for every biology class."]],
      ],
      make: {
        n: 13,
        from: [
          (x) => {
            const who = x.one(NAMED);
            return [[`${who} lab setup`, `Lab for ${who}`], [`Leah set up ${count(x.rng.int(6, 10))} stations for ${who}'s ${x.one(["microscope lab", "enzyme lab", "osmosis lab", "DNA extraction lab", "owl pellet lab", "water quality lab"])} on ${lately(x)}.`]];
          },
        ],
      },
    },
    {
      label: "Lab supplies",
      parts: [
        ...vendorParts(NORTHFIELD),
        ...vendorParts(HARBOR),
        [["Lab budget", "Supply budget"], ["The biology supply budget is 3,200 dollars for the year.", "Specimens use about a third of it."]],
        [["Virtual dissection option"], [decision("We decided students can choose a virtual dissection instead of a real one.")]],
        [["Chemical inventory"], ["The chemical inventory is updated every June and January."]],
      ],
      make: {
        n: 8,
        from: [(x) => [[`Supply order ${lately(x)}`, "Lab supply order"], [`I ordered ${x.one(["two cases of slides", "a box of pipettes", "new test tube racks", "agar plates", "pH strips", "50 pairs of gloves"])} from Northfield on ${lately(x)}.`]]],
      },
    },
    {
      label: "Greenhouse",
      parts: [
        ...vendorParts(GREENLEAF),
        [["Greenhouse use"], [decision("We opened the greenhouse to every biology class on Fridays.")]],
        [["Greenhouse care", "Watering schedule"], ["The greenhouse is watered at 7 am and 3 pm on school days.", "Over breaks the custodian waters it twice a week."]],
        [["Greenhouse projects"], ["The bean growth project runs in the greenhouse every October.", "Each class gets two benches."]],
        [["Aphids", "Greenhouse pests"], ["Aphids came back in the greenhouse in October.", "We use soap spray, never pesticides."]],
      ],
      make: {
        n: 6,
        from: [(x) => [[`Greenhouse ${x.g.month(x.on)}`, "Greenhouse notes"], [`${x.one(NAMED)} planted ${x.one(["bean seeds", "radish seeds", "fast plants", "corn seedlings"])} in the greenhouse on ${lately(x)}.`]]],
      },
    },
  ],
};

/** Assessment: unit tests, the state test and the gradebook. */
const ASSESSMENT: Field["sections"][number] = {
  label: "Assessment",
  folders: [
    {
      label: "Unit tests",
      parts: [
        [["Common unit tests"], [decision("We decided every biology section gives the same unit tests.")]],
        [["Test writing", "Writing unit tests"], ["Each unit test has 25 questions and one short answer.", "Dana approves every unit test a week before it is given."]],
        [["Data meetings", "Test data"], ["The data meeting after each unit test is on the following Wednesday.", "We look at the three questions most students missed."]],
        [["Retake sessions", "Test retakes"], ["Retake sessions are Wednesdays after school.", "Most retakes raise the score by about ten points."]],
        [["Weekly quizzes", "Quizzes"], ["Every Friday has a five question quiz.", "Quizzes are 5 percent of the grade."]],
        [["Exit tickets", "Daily checks"], ["Every lesson ends with a one question exit ticket.", "I sort exit tickets into got it, almost and not yet."]],
        [["Lab practical dates"], ["The lab practical is in the last week of each semester."]],
      ],
      make: {
        n: 10,
        from: [
          (x) => {
            const who = x.one(NAMED);
            return [[`${who} test results`, `${who} ${x.one(UNITS)} test`], [`${who} averaged ${x.rng.int(68, 88)} percent on the ${x.one(UNITS)} test given on ${lately(x)}.`]];
          },
        ],
      },
    },
    {
      label: "State test prep",
      parts: [
        [["State test dates", "State testing"], ["State testing for biology is the second week of May.", "Practice tests run in March and April."]],
        [["State test scores", "Last year's scores"], ["Last year 78 percent of our students passed the state biology test.", "Genetics was our weakest strand."]],
        [["Review plan", "State test review"], ["Each class gets ten review days before the state test.", "Review days mix stations, practice questions and one lab."]],
        [["Testing rooms", "State test rooms"], ["State tests are taken in the library and the gym."]],
        [["Released questions"], ["We use released state questions in every unit test."]],
      ],
      make: {
        n: 7,
        from: [(x) => [[`Practice test ${x.one(NAMED)}`, "Practice test results"], [`${x.one(NAMED)} scored ${x.rng.int(58, 82)} percent on the ${x.one(["genetics", "ecology", "cells", "evolution"])} practice set on ${lately(x)}.`]]],
      },
    },
    {
      label: "Gradebook",
      parts: [
        [["Gradebook setup", "Gradebook"], ["We keep every grade and late mark in the gradebook.", "Helen Park runs the gradebook settings for the school."]],
        [["Grading weights", "Grade weights"], ["Labs are 40 percent of the grade, tests 40 and homework 20."]],
        [["Grades due dates"], ["Grades are due on the Friday after each quarter ends."]],
        [["Grade check days", "Grade checks"], ["Students check their grades with me every other Monday."]],
        [["Incomplete grades"], ["An incomplete must be made up within two weeks of the quarter."]],
      ],
      make: {
        n: 9,
        from: [(x) => [[`${x.one(NAMED)} missing work`, "Missing work list"], [`${count(x.rng.int(3, 9))} students in ${x.one(NAMED)} had missing labs in the gradebook on ${lately(x)}.`]]],
      },
    },
  ],
};

/** Student support: accommodations, reading supports and attendance. */
const SUPPORT: Field["sections"][number] = {
  label: "Student support",
  folders: [
    {
      label: "Accommodations",
      parts: [
        [["IEP accommodations", "Accommodations list"], ["Every IEP accommodation is listed in my planning book by period.", "Extended time means time and a half on tests and quizzes."]],
        [["Testing supports", "Test supports"], ["Students with read aloud take tests in room 118 with an aide.", "Nora sends the updated accommodations list each quarter."]],
        [["504 plans"], ["Two students have 504 plans for health reasons, with breaks as needed."]],
        [["Behavior supports", "Behavior plans"], ["Three students have behavior plans with a check in each day."]],
        [["Assistive tech"], ["Two students use text to speech on their laptops for every reading."]],
      ],
      make: {
        n: 9,
        from: [(x) => [[`IEP update ${lately(x)}`, "IEP meeting notes"], [`A student in ${x.one(NAMED)} got ${x.one(["extended time", "a reader for tests", "preferential seating", "notes before each lesson", "a quiet room for tests"])} added at the IEP meeting on ${lately(x)}.`]]],
      },
    },
    {
      label: "Reading supports",
      parts: [
        [["Reading levels", "Handout reading level"], ["Most of my students read at grade eight or nine.", "I keep handouts near grade seven so everyone can read them."]],
        [["Vocabulary walls", "Word walls"], ["Each unit has a word wall with ten words and a picture for each."]],
        [["English learners", "Supports for English learners"], ["Twelve of my students are English learners.", "They get the key words in their language before each unit."]],
        [["Audio versions"], ["Every reading has an audio version on the class page."]],
        [["Sentence starters"], ["Lab reports come with sentence starters for each part."]],
        [["Reading aloud", "Read alouds"], ["I read the first page of every new reading aloud to the class."]],
        [["Peer helpers"], ["Each lab group has one peer helper who has done the lab before."]],
      ],
      make: {
        n: 6,
        from: [(x) => [[`Reading support for ${x.one(UNITS)}`, "Reading support plan"], [`I made a short reading guide with pictures for the ${x.one(UNITS)} on ${lately(x)}.`]]],
      },
    },
    {
      label: "Counseling and attendance",
      parts: [
        [["Attendance rules", "Attendance"], ["Attendance is taken in the first ten minutes of class.", "Three absences in a unit trigger a call from the family liaison."]],
        [["Referrals", "Counselor referrals"], ["A student who seems upset goes to Sam Whitley the same day.", "I send Sam a note after any talk about a student."]],
        [["After school tutoring", "Tutoring"], ["Science tutoring is Tuesdays and Thursdays until 4 in room 210.", "Honor society students tutor ninth graders."]],
        [["Wellness room", "Student wellness"], ["The wellness room is open during lunch for students who need a break."]],
        [["Credit recovery"], ["Students who fail a semester can recover credit in summer school."]],
        [["Late arrivals"], ["Students who arrive late sign the late book by the door."]],
      ],
      make: {
        n: 9,
        from: [(x) => [[`Attendance ${x.one(NAMED)}`, "Attendance check"], [`${count(x.rng.int(2, 6))} students in ${x.one(NAMED)} missed three or more days by ${lately(x)}.`]]],
      },
    },
  ],
};

/** Families: contact rules, the weekly updates and conferences. */
const FAMILIES: Field["sections"][number] = {
  label: "Families",
  folders: [
    {
      label: "Parent contact rules",
      parts: [
        [["Family contact rules", "Contact rules"], ["Families hear from a teacher before a grade drops below a C.", "Teachers answer family emails within two school days."]],
        [["Family messaging", "Messaging app"], ["Calls home are logged in the family messaging app.", "Translated messages go out for families who asked for them."]],
        [["Student photos policy"], ["Student photos go online only with a signed media form.", "Photos of student work leave names out."]],
        [["Family email rules", "Email templates"], ["Emails to families use the school template with the school logo.", "I copy the counselor on any email about a failing grade."]],
        [["Calls home", "Phone calls home"], ["Calls home are made between 4 and 7 pm."]],
        [["Difficult conversations"], ["For a hard call home I write down three points first and stick to them."]],
        [["Contact log"], ["Every call and email to a family goes in the contact log the same day."]],
      ],
      make: {
        n: 3,
        from: [(x) => [[`Call home ${lately(x)}`, `${x.one(NAMED)} call home`], [`I called the family of a ${x.one(NAMED)} student on ${lately(x)} about ${x.one(["missing labs", "a great test score", "three absences in a week", "a retake", "a lab safety slip"])}.`]]],
      },
    },
    {
      label: "Family updates",
      parts: [
        [["Weekly update format", "Family update format"], ["Family updates go out every Friday by 4 pm.", "Each update has what we learned, what is due and one photo."]],
        [["Good news calls", "Positive calls home"], ["I make two good news calls home every week."]],
        [["Translated updates", "Update languages"], ["Updates go out in English, Spanish and Vietnamese."]],
        [["Parent volunteers", "Volunteers"], ["Parent volunteers help with labs on Thursdays.", "Volunteers need a background check from the office."]],
      ],
      make: {
        n: 11,
        from: [(x) => {
          const who = x.one(NAMED);
          return [[`${who} family update`, `Update to ${who} families`], [`The ${who} update on ${lately(x)} told families about the ${x.one(UNITS)} and the next test.`]];
        }],
      },
    },
    {
      label: "Conferences",
      parts: [
        [["Conference schedule", "Family conferences"], ["Family conferences are in November and March.", "Each conference slot is ten minutes."]],
        [["Conference notes", "Conference prep"], ["I bring each student's last three grades and one piece of work.", "I write one goal with each family."]],
        [["Interpreters", "Conference interpreters"], ["The office books interpreters for conferences a week ahead."]],
        [["Student led conferences"], ["In March, students lead their own conferences with a short portfolio."]],
      ],
      make: {
        n: 6,
        from: [(x) => [[`Conference ${x.one(NAMED)}`, "Conference follow up"], [`After conferences on ${lately(x)}, ${count(x.rng.int(2, 5))} families in ${x.one(NAMED)} asked for weekly grade emails.`]]],
      },
    },
  ],
};

/** Trips and events: field trips, the science fair and family nights. */
const EVENTS: Field["sections"][number] = {
  label: "Trips and events",
  folders: [
    {
      label: "Field trips",
      parts: [
        ...vendorParts(CEDAR),
        ...vendorParts(BLUEBIRD),
        [["Field trip forms", "Trip paperwork"], ["Permission slips go home three weeks before a trip.", "The trip list goes to the nurse a week ahead.", "Fee waivers are handled by the office, never by the teacher."]],
        [["Chaperones"], ["Every trip needs one adult for ten students."]],
        [["Trip costs", "Trip budget"], ["A bus to Cedar Creek costs about 450 dollars.", "The parent association pays for one trip per class each year."]],
        [["Medicine on trips", "Trip medicines"], ["The nurse sends medicines in a labeled bag for each trip."]],
      ],
      make: {
        n: 3,
        from: [(x) => [[`${x.one(NAMED)} trip`, "Trip notes"], [`${x.one(NAMED)} went to Cedar Creek on ${lately(x)} and ${x.rng.int(18, 29)} students came.`]]],
      },
    },
    {
      label: "Science fair",
      parts: [
        [["Science fair date"], [decision("We set the science fair for the second week of March.")]],
        ...vendorParts(RIVERSIDE),
        [["Science fair timeline", "Fair milestones"], ["Project questions are due in December and data in February.", "Posters go to Riverside by March 1."]],
        [["Science fair judges", "Fair judges"], ["We need 20 judges for the fair.", "Judges come from Riverside Community College and local labs."]],
        [["Fair prizes", "Fair awards"], ["The top three projects go to the regional fair in April."]],
      ],
      make: {
        n: 5,
        from: [(x) => [[`Fair projects ${x.one(NAMED)}`, "Fair project ideas"], [`${count(x.rng.int(3, 9))} students in ${x.one(NAMED)} picked projects on ${x.one(["plant growth", "water quality", "bacteria", "heart rate", "seed germination"])}.`]]],
      },
    },
    {
      label: "Family nights",
      parts: [
        [["Family science night", "Science night"], ["Family science night is the last Thursday in January.", "Each class runs one table with a hands on activity."]],
        [["Back to school night"], ["At back to school night I give families the syllabus and my email."]],
        [["Open house", "Spring open house"], ["The spring open house shows the greenhouse and the best fair posters."]],
        [["Science night ideas", "Science night stations"], ["Last year's best station was the owl pellet table.", "Each station needs two student helpers."]],
        [["Science night supplies"], ["Science night supplies come from the parent association's 200 dollar grant."]],
        [["Volunteers for science night"], ["We need ten parent volunteers for science night."]],
        [["Regional events", "Science Olympiad"], ["The Science Olympiad regional is in February at the community college."]],
        [["Science night sign ups", "Science night planning"], ["Families sign up for science night on the class page.", "Last year about 140 people came."]],
        [["Awards night"], ["The science awards are given at awards night in late May."]],
      ],
    },
  ],
};

/** Writing: how Priya writes for students, the handouts and the letters she writes. */
const WRITING: Field["sections"][number] = {
  label: "Writing",
  folders: [
    {
      label: "How you write for students",
      parts: [
        [["Student handout style", "Writing for ninth graders", "Family update template"], ["I write instructions for students as numbered steps.", "I keep reading levels around grade seven for class handouts.", "I start family updates with something the class did well."].map(style)],
        [["Rewrite these directions", "Plain language test", "Assignment template"], ["I bold the due date in every assignment.", "I use the same words for lab steps all year.", "I write test questions in plain language first, then add the science words."].map(style)],
        [["Feedback on lab reports", "Writing feedback"], ["I write one thing that worked and one thing to fix on every lab report."].map(style)],
        [["Family emails", "Writing for families"], ["I write to families in short sentences with no school jargon.", "I always end with how to reach me."].map(style)],
        [["Slide style", "Slides for class"], ["My slides have one idea and one picture each.", "I put the question of the day on the first slide."].map(style)],
        [["Word choice", "Science words"], ["I teach a science word only after students have seen the thing it names."].map(style)],
      ],
    },
    {
      label: "Handouts and directions",
      parts: [
        [["Lab handout format", "Lab sheet template"], ["Every lab sheet has the question, the materials, the steps and a data table.", "Safety steps are in a box at the top."]],
        [["Study guides", "Study guide format"], ["Each unit's study guide fits on two pages.", "Study guides go out a week before the test."]],
        [["Class page posts"], ["Every handout is posted on the class page the day it is given."]],
        [["Answer keys"], ["Answer keys are kept in the locked drawer, never on the class page."]],
        [["Directions for labs", "Lab directions"], ["Lab directions have one action per step and a picture for any step with glass or heat."]],
      ],
      make: {
        n: 6,
        from: [(x) => [[`Handout for the ${x.one(UNITS)}`, "New handout"], [`I rewrote the ${x.one(["lab sheet", "study guide", "vocabulary list", "review packet"])} for the ${x.one(UNITS)} on ${lately(x)} in shorter steps.`]]],
      },
    },
    {
      label: "Letters and recommendations",
      parts: [
        [["Recommendation letters", "Letter of recommendation"], ["Recommendation letters need two weeks' notice.", "I ask each student for a list of what they want me to mention."]],
        [["Award letters", "Science award"], ["The science award letter goes to families in May."]],
        [["Letter to families about labs", "Lab fee letter"], ["The lab fee letter explains the fee, what it buys and how to ask for a waiver."]],
        [["Thanks to volunteers", "Thank you notes"], ["Volunteers get a thank you card signed by the class."]],
        [["Sub notes", "Notes to subs"], ["My sub notes list the seating chart, the lesson and two helpful students."]],
        [["College letters timeline"], ["Most recommendation requests come in October, so I write them on Sunday mornings that month."]],
      ],
      make: {
        n: 5,
        from: [(x) => [[`Recommendation for a senior ${x.rng.int(1, 9)}`, "Recommendation draft"], [`I wrote a recommendation on ${lately(x)} for a senior applying to ${x.one(["a nursing program", "a state university", "a summer research camp", "an engineering program"])}.`]]],
      },
    },
  ],
};

/** Plans and deadlines: the calendar, the year's goals and the meetings. */
const PLANS: Field["sections"][number] = {
  label: "Plans and deadlines",
  loose: [[["Due this month", "This month's deadlines"], ["Progress reports go home on November 20.", "Science fair questions are due December 11."]]],
  folders: [
    {
      label: "Calendar",
      parts: [
        [["School calendar", "Calendar notes"], ["No tests on the day before a break.", "Early release days are the first Wednesday of each month.", "Winter break runs from December 19 to January 4."]],
        [["Bell schedule", "Assembly schedule"], ["Assembly days use the short bell schedule with 40 minute periods."]],
        [["Quarter end dates", "Quarter dates"], ["Quarters end on November 13, January 29, April 9 and June 11."]],
        [["Testing calendar"], ["No unit tests in the two weeks before state testing."]],
        [["Picture day"], ["Picture day is October 30, so labs move to the next day."]],
        [["Spring break"], ["Spring break is March 22 to 29."]],
        [["Sub plans", "Substitute plans"], ["Every teacher keeps three days of emergency plans in the main office.", "Sub plans never include a lab."]],
      ],
    },
    {
      label: "School year goals",
      parts: [
        [["Goals for this year", "Department goals"], ["Our goal for this year is 85 percent of ninth graders passing biology.", "We want every student to do at least eight hands on labs a semester.", "We aim to raise state test scores in biology by five points."]],
        [["Goals review", "Mid year goals check"], ["We want every family to hear good news from a teacher by October.", "We plan to double the number of science fair entries.", "We want every lab report graded with the same rubric across the department."]],
        [["My goals", "Personal goals"], ["My goal this year is more short labs and fewer long lectures.", "I want to call every family at least once by winter break."]],
        [["Goals check in", "Mid year results"], ["At mid year last year, 81 percent of ninth graders were passing biology."]],
        [["Labs so far", "Lab count"], ["Each class has done six hands on labs so far this semester."]],
        [["Next year plans", "Planning for next year"], ["Next year I want to add a field study unit in the fall.", "I want two more greenhouse labs in the spring."]],
      ],
    },
    {
      label: "Meetings",
      parts: [
        [["Meeting schedule", "Department meetings"], ["The science department meets every other Tuesday after school.", "Biology teachers plan together on Thursdays during fourth period.", "The whole staff meets the first Wednesday of the month."]],
        [["Mentoring", "New teacher mentoring"], ["New teachers meet their mentor every Monday morning."]],
        [["Professional development", "Training days"], ["The next training day is January 5 on reading in science."]],
        [["Grade level meetings", "Grade level team"], ["The tenth grade team meets on the second Monday of the month about students who are struggling."]],
        [["IEP meeting days"], ["IEP meetings are booked by Nora and usually fall on Tuesday mornings."]],
        [["Course team meetings"], ["The biology course team meets after school on the day before each unit starts."]],
        [["Observations", "Observation schedule"], ["My formal observation is in February with Helen Park."]],
      ],
      make: {
        n: 3,
        from: [(x) => [[`Department meeting ${lately(x)}`, "Department meeting notes"], [`At the department meeting on ${lately(x)} we talked about ${x.one(["the shared lab calendar", "common test dates", "the science fair judges", "goggle replacements", "the new rubric for posters"])}.`]]],
      },
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
  honorific: (rng) => rng.pick(["Ms.", "Mr.", "Mrs.", "Dr."]),
  // Summer break: a teacher's chats rarely fall in July.
  quiet: [6],
  // Winter break and spring break: nothing is planned for them.
  breaks: [["12-19", "01-04"], ["03-22", "03-29"]],
  clients: CLASSES,
  domainOf: () => undefined,
  extend: [
    ["p5bio", "Period 5 Biology", "Period 5", ["Cell model project"]],
    ["apes", "AP Environmental", "AP Environmental", ["Air quality lab"]],
  ],
  self: "Priya",
  team: TEAM,
  teamFolder: "Department notes",
  company: COMPANY,
  sections: [LABS, ASSESSMENT, SUPPORT, FAMILIES, EVENTS, WRITING, PLANS],
};
