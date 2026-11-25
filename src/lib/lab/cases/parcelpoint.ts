import type { LabCase } from "../types";

/**
 * Strategy pair, case 2. Matched with Greenbox: the same cohort table shape,
 * the same hidden pattern (adoption falls as a sign up deal spreads), the
 * same experiment limits and the same five task shapes.
 */
export const parcelpoint: LabCase = {
  id: "parcelpoint",
  pair: "strategy",
  name: "Parcelpoint",
  tagline: "Smart parcel lockers for apartment buildings",
  brief: [
    "Parcelpoint installs parcel lockers in apartment buildings. Property managers sign up a building, residents join with an app and pick up deliveries with a code. Installs grew fast this summer, but the CEO thinks residents in the newer buildings stop using the lockers sooner and wants to know why before the next board meeting.",
    "Since June, sales has leaned on a free install deal for property managers who sign a 2 year contract. The data team has cohort numbers by install month and a Postgres database you can query.",
    "You are joining as a data and product engineer for two sessions. In the first you find the pattern and design an experiment. In the second the results are in and you write the recommendation and the update.",
  ],
  facts: [
    { label: "Pricing", value: "Property managers pay $180 a month per building. Residents pay nothing" },
    { label: "Deal", value: "FREEINSTALL: the $2,400 install fee waived with a 2 year contract" },
    { label: "Adoption", value: "Active means a resident picked up at least one parcel that week" },
    { label: "Database", value: "buildings(id, city, units, installed_at, deal_code), residents(id, building_id, joined_at), pickups(id, resident_id, picked_up_at)" },
    { label: "Install cost", value: "$1,900 per building to Parcelpoint, before any deal" },
  ],
  table: {
    caption: "Resident cohorts by install month",
    columns: ["Install month", "Residents joined", "Active in week 4", "Active in week 8", "Buildings on FREEINSTALL"],
    rows: [
      ["June", "2,000", "1,400", "1,100", "20%"],
      ["July", "2,400", "1,560", "1,200", "35%"],
      ["August", "3,000", "1,800", "1,320", "55%"],
      ["September", "3,500", "1,925", "not yet", "70%"],
    ],
  },
  people: [
    { name: "Malik Osei", role: "CEO", note: "Wants board updates in exactly three sections, Numbers, Risks and Asks, under 250 words." },
    { name: "Hana Kowalski", role: "Data lead", note: "Wants every claim backed by a query she can rerun." },
    { name: "Luis Ferreira", role: "Head of sales", note: "Worried that dropping the deal will halve new buildings." },
  ],
  constraints: [
    "Experiment budget: $8,000 in waived fees and onboarding costs, total.",
    "At most 6 weeks from launch to readout.",
    "Contracts for existing buildings cannot change.",
    "At least 2 arms, one of them FREEINSTALL as it is today.",
    "The success metric is week 8 resident adoption, not signed buildings.",
  ],
  goals: [
    "Find out whether the deal explains the falling adoption.",
    "Run a fair experiment inside the limits.",
    "Recommend what to do and tell the board in Malik's format.",
  ],
  tasks: [
    {
      id: "t1",
      part: 1,
      title: "Find the pattern",
      ai: "chatgpt",
      ask: "Work out week 4 and week 8 adoption for each cohort from the table. Say what pattern you see and give two hypotheses that could explain it.",
      deliverable: "The rates, the pattern and two hypotheses.",
      rubric: [
        "Week 4: 70%, 65%, 60%, 55%",
        "Week 8: 55%, 50%, 44% (September not yet)",
        "Links falling adoption to the rising share of FREEINSTALL",
        "At least one hypothesis that is not the deal (for example newer buildings in different cities)",
      ],
    },
    {
      id: "t2",
      part: 1,
      title: "Check it with SQL",
      ai: "claude",
      ask: "Write one Postgres query over the packet's schema that gives week 4 and week 8 adoption by install month, split by whether the building used FREEINSTALL.",
      deliverable: "The query, with a line on how it defines active.",
      rubric: [
        "Uses the tables and columns as named in the packet",
        "Active means at least one pickup in that week",
        "Splits by deal_code = 'FREEINSTALL'",
        "Hana could rerun it as is",
      ],
    },
    {
      id: "t3",
      part: 1,
      title: "Design the experiment",
      ai: "either",
      ask: "Design the experiment that tests your main hypothesis.",
      deliverable: "Arms, who gets which, sample size per arm, budget and timeline.",
      rubric: [
        "FREEINSTALL as it is today is one arm",
        "Stays within $8,000 and 6 weeks",
        "Week 8 adoption is the success metric",
        "Leaves existing contracts alone",
        "Answers Luis's worry by also tracking signed buildings",
      ],
    },
    {
      id: "t4",
      part: 2,
      title: "Read the results",
      ai: "chatgpt",
      ask: "The experiment from session 1 has finished. Arm A (FREEINSTALL) had week 8 adoption of 42% across 1,000 residents. Arm B (half price install plus a lobby launch event) had 52% across 900 residents. Arm C (full price install plus a concierge sign up day) had 58% across 640 residents. Recommend one arm. Count residents still active at week 8 and the cost per active resident.",
      deliverable: "The comparison and your recommendation.",
      rubric: [
        "Active at week 8: A 420, B 468, C about 371",
        "Uses the $1,900 install cost in cost per active resident",
        "Weighs Luis's building count worry against week 8 adoption",
        "Ties back to the session 1 hypothesis",
      ],
    },
    {
      id: "t5",
      part: 2,
      title: "Write the board update",
      ai: "claude",
      ask: "Write this month's board update for Malik.",
      deliverable: "The update, ready to send.",
      rubric: [
        "Exactly three sections: Numbers, Risks, Asks",
        "Under 250 words",
        "Numbers match the cohort table and the results",
        "Asks names the chosen arm",
      ],
    },
  ],
};
