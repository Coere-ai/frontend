import { teamGraph } from "../shape.mjs";

/** Technology: an engineer moves from Claude to ChatGPT and the stack and decisions come along. Made up for the demo. */
export const field = {
  person: { name: "Sam Whitaker", initials: "SW" },
  firm: "Northbeam Labs",
  chats: [
    "Ledger API retry bug", "Webhook idempotency keys", "Postgres index for invoices", "NATS consumer lag",
    "Fly.io deploy config", "Go generics question", "Halcyon onboarding flow", "Rate limiter design",
    "Sentry alert noise", "Migration to pgx v5", "Code review checklist", "On call runbook", "Interview loop questions", "Team offsite plan",
  ],
  context: {
    draft: "Why does the invoice webhook fire twice after a timeout?",
    chat: { title: "Ledger API retry bug", date: "Oct 23, 2026" },
    about: "From 8 chats",
    rows: [
      { path: "Clients / Halcyon Health / Ledger API / Tech stack", from: "From 9 chats" },
      { path: "Clients / Halcyon Health / Ledger API / Decisions", from: "From 4 chats" },
    ],
    related: [
      { path: "Company / Code review checklist", from: "From 2 chats" },
      { path: "Clients / Halcyon Health / On call runbook", from: "From 1 chat" },
    ],
    line: "Adding your Claude chat 'Ledger API retry bug' and your context on the Ledger API",
    lineFrom: "From 13 chats",
    sections: [
      { path: "Clients / Halcyon Health / Ledger API / Tech stack", facts: [
        "The Ledger API is Go 1.23 with Postgres 16 through pgx v5. (Claude, Sep 30, 2026)",
        "Events go over NATS JetStream with at least once delivery. (Claude, Oct 2, 2026)",
        "It runs on Fly.io in two regions, iad and fra. (ChatGPT, Aug 14, 2026)",
      ] },
      { path: "About me", facts: [
        "I am a backend engineer at Northbeam Labs.",
        "My name is Sam Whitaker.",
        "Answer with code first, then one line on why.",
      ] },
      { path: "Clients / Halcyon Health / Ledger API / Decisions", facts: [
        "Webhook handlers must be idempotent on the event id. (Claude, Oct 23, 2026)",
        "Retries back off at 2, 8 and 30 seconds, then go to the dead letter queue. (Gemini, Sep 21, 2026)",
      ] },
    ],
    answer: {
      intro: "With at least once delivery in JetStream, a timeout means the message is redelivered while your first handler still runs.",
      steps: "1. Store the event id in a processed_events table with a unique index.\n2. Insert it in the same Postgres transaction as the invoice update, with ON CONFLICT DO NOTHING.\n3. Ack only after commit, and raise AckWait above your slowest handler.",
      close: "Want the handler rewritten with pgx v5 and a test for the double delivery?",
    },
  },
  graph: {
    count: "212 memories from 131 chats in 3 topics",
    hubs: teamGraph({
      company: ["Code review checklist", "On call runbook", "Hiring loop", "Coding standards", "Tools we use", "Architecture notes"],
      clients: ["Halcyon Health", "Ledger API", "Tech stack", "Maya Chen", "Patient portal", "Brightline Freight", "Routing service", "Osprey Pay", "Fraud rules"],
      tone: "How you like answers",
      focus: "Halcyon Health",
    }),
  },
  due: { text: "The Ledger API retry fix ships to staging by", date: "October 27", status: "Due tomorrow", review: "9 memories need a look." },
  client: {
    name: "Halcyon Health",
    from: "From 22 chats",
    status: "Active client. 3 open promises.",
    contacts: ["Maya Chen", "Ravi Patel"],
    engagement: "Ledger API",
    promises: [
      ["Halcyon agreed to share production logs for the double webhook before", "October 24", "Oct 21, 2026", "Was due Oct 24, 2026"],
      ["We promised Maya the retry fix on staging by", "October 27", "Oct 23, 2026", "Due Oct 27, 2026"],
      ["I told Ravi I would write up the idempotency design by", "October 31", "Oct 23", "Due Oct 31"],
    ],
    meeting: ["Architecture review with Halcyon on", "November 4", "to walk through the event pipeline.", "Oct 20"],
    requests: [
      ["Maya asked that every schema change come with a migration plan.", "Sep 18"],
      ["Halcyon wants a weekly status note with", "three", "items and any risk to the launch.", "Aug 6, 2026"],
      ["Ravi wants all alerts routed to the shared on call channel.", "Oct 2"],
    ],
    deadlines: [
      ["The retry fix ships to staging by", "October 27", "Oct 23", "Due Oct 27"],
      ["The patient portal launch is set for", "November 18", "Sep 30", "Due Nov 18"],
      ["The pgx v5 migration has to finish before the launch freeze.", "Oct 9, 2026"],
    ],
    billing: ["Halcyon pays monthly against the retainer, with overage billed hourly.", "Jun 3, 2026"],
    document: ["Pasting the Ledger API spec: endpoints, events and the", "three", "services that consume them.", "Sep 30"],
  },
  cori: {
    question: "what stack does the Ledger API use?",
    answer: "3 memories about the Ledger API stack, most used first.",
    items: [
      ["The Ledger API is Go 1.23 with Postgres 16 through pgx v5, set on", "September 30", "Tech stack", "Claude, Sep 30"],
      ["Events go over NATS JetStream with at least once delivery, since", "October 2", "Tech stack", "Claude, Oct 2"],
      ["It runs on Fly.io in two regions, iad and fra, as of", "August 14", "Tech stack", "ChatGPT, Aug 14"],
    ],
  },
  clientLine: {
    draft: "Write Maya a short update on the webhook fix and when it hits staging.",
    from: "From 7 chats",
    chats: [
      "Personal", "Ledger API retry bug", "Webhook idempotency keys", "Brightline routing service", "Osprey Pay fraud rules",
      "Postgres index for invoices", "NATS consumer lag", "Fly.io deploy config", "Rate limiter design", "Sentry alert noise",
      "Migration to pgx v5", "Code review checklist", "On call runbook", "Halcyon onboarding flow",
    ],
  },
  app: {
    name: "dev-assistant",
    ask: "What should I know before changing the Ledger API webhook handler?",
    from: 11,
    sections: [
      { path: "Clients / Halcyon Health / Ledger API / Tech stack", facts: [
        "The Ledger API is Go 1.23 with Postgres 16 through pgx v5. (Claude, Sep 30, 2026)",
        "Events go over NATS JetStream with at least once delivery. (Claude, Oct 2, 2026)",
      ] },
      { path: "Clients / Halcyon Health / Ledger API / Decisions", facts: [
        "Webhook handlers must be idempotent on the event id. (Claude, Oct 23, 2026)",
        "Retries back off at 2, 8 and 30 seconds, then go to the dead letter queue. (Gemini, Sep 21, 2026)",
      ] },
    ],
    reasons: [
      ["Clients / Halcyon Health / Ledger API / Tech stack", "The draft names it"],
      ["Clients / Halcyon Health / Ledger API / Decisions", "Shares words with the draft"],
    ],
  },
};
