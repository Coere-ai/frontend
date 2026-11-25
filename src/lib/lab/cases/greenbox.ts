import type { LabCase } from "../types";

/**
 * Strategy pair, case 1. Matched with Parcelpoint: the same cohort table
 * shape, the same pattern hidden in it (retention falls as a sign up deal
 * spreads), the same experiment limits and the same five task shapes.
 */
export const greenbox: LabCase = {
  id: "greenbox",
  pair: "strategy",
  name: "Greenbox",
  tagline: "Weekly meal kits for students and young professionals",
  brief: [
    "Greenbox ships a weekly box of meal kits. Customers subscribe, skip weeks when they like and cancel any time. Sign ups grew fast this summer, but the CEO thinks the new customers leave sooner and wants to know why before the next investor update.",
    "Since June, growth has leaned on a promo code that takes 50% off the first box. The data team has cohort numbers by sign up month and a Postgres database you can query.",
    "You are joining as a data and product engineer for two sessions. In the first you find the pattern and design an experiment. In the second the results are in and you write the recommendation and the update.",
  ],
  facts: [
    { label: "Plans", value: "2 person (3 meals) at $60 a week, 4 person (3 meals) at $96 a week" },
    { label: "Promo", value: "FIRST50: 50% off the first box only" },
    { label: "Retention", value: "Active means at least one paid, unskipped box in that week" },
    { label: "Database", value: "subscriptions(id, customer_id, plan, started_at, cancelled_at, promo_code), orders(id, subscription_id, week_start, total_cents, skipped), cancellations(subscription_id, reason, cancelled_at)" },
    { label: "Acquisition cost", value: "$42 per new customer, blended, before the promo" },
  ],
  table: {
    caption: "Cohorts by sign up month",
    columns: ["Sign up month", "Sign ups", "Active in week 4", "Active in week 8", "Used FIRST50"],
    rows: [
      ["June", "1,200", "780", "540", "35%"],
      ["July", "1,450", "870", "580", "48%"],
      ["August", "1,900", "1,045", "646", "62%"],
      ["September", "2,300", "1,173", "not yet", "71%"],
    ],
  },
  people: [
    { name: "Rosa Mendez", role: "CEO", note: "Wants investor updates in exactly three sections, Numbers, What we learned and What's next, under 250 words." },
    { name: "Kenji Hart", role: "Data lead", note: "Wants every claim backed by a query he can rerun." },
    { name: "Ama Boateng", role: "Head of growth", note: "Worried that dropping the promo will halve sign ups." },
  ],
  constraints: [
    "Experiment budget: $8,000 in discounts and perks, total.",
    "At most 6 weeks from launch to readout.",
    "Prices for existing subscribers cannot change.",
    "At least 2 arms, one of them FIRST50 as it is today.",
    "The success metric is week 8 retention, not sign ups.",
  ],
  goals: [
    "Find out whether the promo explains the falling retention.",
    "Run a fair experiment inside the limits.",
    "Recommend what to do and tell investors in Rosa's format.",
  ],
  tasks: [
    {
      id: "t1",
      part: 1,
      title: "Find the pattern",
      ai: "chatgpt",
      ask: "Work out week 4 and week 8 retention for each cohort from the table. Say what pattern you see and give two hypotheses that could explain it.",
      deliverable: "The rates, the pattern and two hypotheses.",
      rubric: [
        "Week 4: 65%, 60%, 55%, 51%",
        "Week 8: 45%, 40%, 34% (September not yet)",
        "Links falling retention to the rising share of FIRST50",
        "At least one hypothesis that is not the promo (for example the seasonal mix of students)",
      ],
    },
    {
      id: "t2",
      part: 1,
      title: "Check it with SQL",
      ai: "claude",
      ask: "Write one Postgres query over the packet's schema that gives week 4 and week 8 retention by sign up month, split by whether the customer used FIRST50.",
      deliverable: "The query, with a line on how it defines active.",
      rubric: [
        "Uses the tables and columns as named in the packet",
        "Active means a paid, unskipped box in that week",
        "Splits by promo_code = 'FIRST50'",
        "Kenji could rerun it as is",
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
        "FIRST50 as it is today is one arm",
        "Stays within $8,000 and 6 weeks",
        "Week 8 retention is the success metric",
        "Leaves existing subscribers' prices alone",
        "Answers Ama's worry by also tracking sign ups",
      ],
    },
    {
      id: "t4",
      part: 2,
      title: "Read the results",
      ai: "chatgpt",
      ask: "The experiment from session 1 has finished. Arm A (FIRST50) had week 8 retention of 33% at 1,000 sign ups. Arm B (25% off the first two boxes) had 41% at 920 sign ups. Arm C (no discount, free dessert in box 1) had 46% at 650 sign ups. Recommend one arm. Count customers still active at week 8 and the cost per retained customer.",
      deliverable: "The comparison and your recommendation.",
      rubric: [
        "Active at week 8: A 330, B about 377, C about 299",
        "Uses the $42 acquisition cost in cost per retained customer",
        "Weighs Ama's sign up worry against week 8 retention",
        "Ties back to the session 1 hypothesis",
      ],
    },
    {
      id: "t5",
      part: 2,
      title: "Write the investor update",
      ai: "claude",
      ask: "Write this month's investor update for Rosa.",
      deliverable: "The update, ready to send.",
      rubric: [
        "Exactly three sections: Numbers, What we learned, What's next",
        "Under 250 words",
        "Numbers match the cohort table and the results",
        "What's next names the chosen arm",
      ],
    },
  ],
};
