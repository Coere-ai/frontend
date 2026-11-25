import type { LabCase } from "../types";

/**
 * Build pair, case 1. Matched with Ledgerly: same five task shapes (schema,
 * rule engine with tests, API contract, a rule change in part 2, a rollout
 * plan), same number of rules to carry, a different domain.
 */
export const shiftwise: LabCase = {
  id: "shiftwise",
  pair: "build",
  name: "Shiftwise",
  tagline: "Shift scheduling for restaurant groups",
  brief: [
    "Shiftwise builds scheduling software for small restaurant groups. Managers publish a week of shifts, staff set their availability, and anyone can ask to swap a shift. The company is 14 months old, has 3 engineers and runs on TypeScript, Next.js and Postgres 15 hosted on Neon.",
    "Its biggest customer, Lupe's Tacos, has 4 locations and 62 staff. Lupe's has had two payroll disputes this year over shifts that broke its own staffing rules, so it asked Shiftwise to refuse those schedules outright instead of warning about them.",
    "You are joining as a contract engineer for two sessions. In the first you design the data model and the rule engine. In the second the customer changes the rules and you ship the change.",
  ],
  facts: [
    { label: "Stack", value: "TypeScript, Next.js 15, Postgres 15 on Neon, Vitest for tests" },
    { label: "Customer", value: "Lupe's Tacos: 4 locations (Mission, Fruitvale, Alameda, Berkeley), 62 staff" },
    { label: "Week", value: "Schedules run Monday 00:00 to Sunday 23:59 in each location's own time zone, all America/Los_Angeles today" },
    { label: "Roles", value: "cook, cashier, prep, shift_lead. Every open shift needs at least one shift_lead on site" },
    { label: "Money", value: "Pay is stored in integer cents per hour on the staff record" },
    { label: "IDs", value: "UUID v7 primary keys everywhere, a company convention" },
  ],
  people: [
    { name: "Dana Okafor", role: "CTO", note: "Owns the API. Wants every rule refusal to carry a machine readable code, never only a sentence." },
    { name: "Marisol Vega", role: "Ops lead at Lupe's Tacos", note: "Reads every release note. Wants plain words and the date a change takes effect." },
    { name: "Theo Lin", role: "Engineer", note: "Owns deploys. Enforces the Friday freeze: no production deploys from Friday 12:00 to Monday 08:00." },
  ],
  constraints: [
    "Rule R1: no shift longer than 10 hours.",
    "Rule R2: a staff member needs at least 10 hours off between the end of one shift and the start of the next.",
    "Rule R3: a shift longer than 5 hours must include an unpaid 30 minute break that starts before the 5th hour ends.",
    "A schedule that breaks any rule is refused, not saved with a warning.",
    "Swap requests: a manager must approve within 24 hours or the request is declined automatically.",
  ],
  goals: [
    "A schema and a rule engine that refuse bad schedules with clear codes.",
    "A swap shift API the mobile team can build against.",
    "Ship the customer's rule change in session 2 without breaking the 4 live locations.",
  ],
  tasks: [
    {
      id: "t1",
      part: 1,
      title: "Design the schema",
      ai: "chatgpt",
      ask: "Design the Postgres tables for locations, staff, availability, shifts, breaks and swap requests. Follow the company conventions in the packet.",
      deliverable: "The SQL (CREATE TABLE statements with keys and constraints).",
      rubric: [
        "UUID v7 primary keys",
        "Pay stored as integer cents per hour on staff",
        "Each location has a time zone",
        "Roles limited to cook, cashier, prep, shift_lead",
        "Breaks modelled so R3 can be checked",
        "Swap requests have a status and a created time for the 24 hour rule",
      ],
    },
    {
      id: "t2",
      part: 1,
      title: "Write the rule engine",
      ai: "claude",
      ask: "Write validateSchedule(shifts) in TypeScript. It returns every rule a draft week breaks. Write Vitest tests for each rule, including a case right on each limit.",
      deliverable: "The function and its tests.",
      rubric: [
        "R1, R2 and R3 all enforced with the packet's numbers",
        "Each refusal carries a machine readable code (Dana's rule)",
        "Checks at least one shift_lead on site for each open hour",
        "Tests cover exactly 10 hours, exactly 10 hours rest and the 5 hour break edge",
        "Uses Vitest",
      ],
    },
    {
      id: "t3",
      part: 1,
      title: "Specify the swap API",
      ai: "either",
      ask: "Write the API contract for asking for a swap, approving it and declining it. Say what happens when nobody answers.",
      deliverable: "Endpoints, request and response bodies, and error codes.",
      rubric: [
        "Automatic decline after 24 hours",
        "An approved swap is run through the same rules (R1 to R3) and refused if it breaks one",
        "Error responses carry codes, matching the rule engine",
      ],
    },
    {
      id: "t4",
      part: 2,
      title: "Ship the rule change",
      ai: "chatgpt",
      ask: "New from Marisol: from next month, staff under 18 may not work after 22:00 and may work at most 4 hours on a school day (Monday to Friday during the school year). Update the schema and the rule engine from session 1. Keep every earlier rule.",
      deliverable: "The schema change, the code change and the new tests.",
      rubric: [
        "Builds on the session 1 schema rather than starting over",
        "Stores date of birth or an under 18 flag, plus a way to know school days",
        "New rules get their own codes beside R1 to R3",
        "R1, R2, R3 and the shift_lead rule still hold",
        "Uses the location's time zone for the 22:00 cutoff",
      ],
    },
    {
      id: "t5",
      part: 2,
      title: "Plan the rollout",
      ai: "claude",
      ask: "Write the rollout plan for the 4 live locations and the release note for Lupe's Tacos.",
      deliverable: "A short migration and deploy plan, then the release note.",
      rubric: [
        "Respects Theo's Friday freeze",
        "Migration runs on Postgres 15 on Neon without downtime",
        "Says what happens to already published schedules that break the new rules",
        "Release note in plain words with the date the change takes effect (Marisol)",
        "Names all 4 locations or says it covers all of them",
      ],
    },
  ],
};
