import type { LabCase } from "../types";

/**
 * Build pair, case 2. Matched with Shiftwise task for task: schema, rule
 * engine with tests, API contract, a rule change in part 2, a rollout plan.
 */
export const ledgerly: LabCase = {
  id: "ledgerly",
  pair: "build",
  name: "Ledgerly",
  tagline: "Invoicing for freelance creative studios",
  brief: [
    "Ledgerly sends invoices and tracks payments for small creative studios. A studio bills its clients, clients pay in parts or all at once, and Ledgerly works out what is still owed. The company is 11 months old, has 3 engineers and runs on Python 3.12, FastAPI and Postgres 15 hosted on Supabase.",
    "Its biggest customer, Northline Studio, bills 38 clients in three currencies. Northline lost two weeks of cash last quarter because balances with late fees were worked out by hand and wrong, so it asked Ledgerly to compute every balance itself.",
    "You are joining as a contract engineer for two sessions. In the first you design the data model and the balance engine. In the second the customer adds tax rules and you ship the change.",
  ],
  facts: [
    { label: "Stack", value: "Python 3.12, FastAPI, Postgres 15 on Supabase, pytest for tests" },
    { label: "Customer", value: "Northline Studio: 38 active clients, billing in USD, EUR and GBP" },
    { label: "Currency", value: "An invoice has one currency for life. No conversion inside Ledgerly" },
    { label: "Statuses", value: "draft, sent, partially_paid, paid, void" },
    { label: "Money", value: "Amounts stored in integer minor units (cents, pence). Never floats" },
    { label: "IDs", value: "ULID primary keys everywhere, a company convention" },
  ],
  people: [
    { name: "Priya Raman", role: "CTO", note: "Owns the API. Wants every refusal to carry a machine readable code, never only a sentence." },
    { name: "Jonah Reyes", role: "Finance lead at Northline Studio", note: "Reads every release note. Wants plain words and the date a change takes effect." },
    { name: "Aiko Sato", role: "Engineer", note: "Owns deploys. Enforces the close freeze: no production deploys on the last 2 business days of a month." },
  ],
  constraints: [
    "Rule L1: payment is due 30 days after the invoice is sent.",
    "Rule L2: a 14 day grace period follows the due date. No late fee during grace.",
    "Rule L3: after grace, a late fee of 1.5% of the unpaid balance is added once per full 30 days overdue, rounded half up to the minor unit.",
    "A payment larger than the balance is refused, not stored as credit.",
    "Payment plans: at most 3 installments, and the first must be at least 40% of the balance.",
  ],
  goals: [
    "A schema and a balance engine that compute what is owed, late fees included.",
    "A payment plan API the client portal team can build against.",
    "Ship the customer's tax change in session 2 without breaking 38 clients' balances.",
  ],
  tasks: [
    {
      id: "t1",
      part: 1,
      title: "Design the schema",
      ai: "chatgpt",
      ask: "Design the Postgres tables for studios, clients, invoices, line items, payments and payment plans. Follow the company conventions in the packet.",
      deliverable: "The SQL (CREATE TABLE statements with keys and constraints).",
      rubric: [
        "ULID primary keys",
        "Amounts in integer minor units",
        "One currency per invoice, limited to USD, EUR, GBP",
        "Status limited to draft, sent, partially_paid, paid, void",
        "A sent time stored so L1 can be computed",
        "Payment plans with installments and amounts",
      ],
    },
    {
      id: "t2",
      part: 1,
      title: "Write the balance engine",
      ai: "claude",
      ask: "Write compute_balance(invoice, payments, today) in Python. It returns the balance and every late fee applied. Write pytest tests for each rule, including a case right on each limit.",
      deliverable: "The function and its tests.",
      rubric: [
        "L1, L2 and L3 enforced with the packet's numbers",
        "Each refusal carries a machine readable code (Priya's rule)",
        "Refuses an overpayment",
        "Tests cover day 30, day 44 and day 45 and the rounding rule",
        "Uses pytest",
      ],
    },
    {
      id: "t3",
      part: 1,
      title: "Specify the payment plan API",
      ai: "either",
      ask: "Write the API contract for proposing a payment plan, accepting it and missing an installment.",
      deliverable: "Endpoints, request and response bodies, and error codes.",
      rubric: [
        "At most 3 installments",
        "First installment at least 40% of the balance",
        "Says how a missed installment interacts with L3 late fees",
        "Error responses carry codes, matching the balance engine",
      ],
    },
    {
      id: "t4",
      part: 2,
      title: "Ship the tax change",
      ai: "chatgpt",
      ask: "New from Jonah: from next month, EUR invoices to clients in the EU carry 20% VAT on each line item, shown separately, and a studio can issue a credit note that lowers a sent invoice. Update the schema and the balance engine from session 1. Keep every earlier rule.",
      deliverable: "The schema change, the code change and the new tests.",
      rubric: [
        "Builds on the session 1 schema rather than starting over",
        "VAT only on EUR invoices to EU clients, per line item, stored separately",
        "Credit notes lower the balance and late fees follow the lowered balance",
        "New refusals get their own codes beside the earlier ones",
        "L1, L2, L3 and the overpayment rule still hold, in integer minor units",
      ],
    },
    {
      id: "t5",
      part: 2,
      title: "Plan the rollout",
      ai: "claude",
      ask: "Write the rollout plan for Northline's 38 clients and the release note for Northline Studio.",
      deliverable: "A short migration and deploy plan, then the release note.",
      rubric: [
        "Respects Aiko's close freeze",
        "Migration runs on Postgres 15 on Supabase without downtime",
        "Says what happens to invoices already sent before the change",
        "Release note in plain words with the date the change takes effect (Jonah)",
        "Covers all three currencies",
      ],
    },
  ],
};
