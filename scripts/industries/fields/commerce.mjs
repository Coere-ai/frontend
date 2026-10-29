import { teamGraph } from "../shape.mjs";

/** Commerce: a trade team keeps every partner's terms, contacts and promises across markets. Made up for the demo. */
export const field = {
  person: { name: "Grace Leung", initials: "GL" },
  firm: "Harbourline Trading",
  chats: [
    "Meridian Foods contract renewal", "Incoterms for Rotterdam route", "Q4 pricing to Singapore", "Letter of credit checklist",
    "Customs codes for kitchenware", "Freight quote comparison", "Supplier audit in Shenzhen", "FX hedge for euro invoices",
    "New distributor in Busan", "Payment terms negotiation", "Trade show follow ups", "Margin by region", "Warehouse lease in Kowloon", "Team travel policy",
  ],
  context: {
    draft: "Help me prepare for the Meridian Foods renewal call tomorrow.",
    chat: { title: "Meridian Foods contract renewal", date: "Oct 22, 2026" },
    about: "From 4 chats",
    rows: [
      { path: "Clients / Meridian Foods / Supply agreement", from: "From 7 chats" },
      { path: "Clients / Meridian Foods / Pricing history", from: "From 3 chats" },
    ],
    related: [
      { path: "Company / Payment terms", from: "From 2 chats" },
      { path: "Clients / Meridian Foods / Shipping", from: "From 2 chats" },
    ],
    line: "Adding your chat 'Meridian Foods contract renewal' and your context on Meridian Foods",
    lineFrom: "From 12 chats",
    sections: [
      { path: "Clients / Meridian Foods / Supply agreement", facts: [
        "The Meridian supply agreement ends on December 31 and renews for two years. (Claude, Sep 25, 2026)",
        "Meridian buys 40 containers a year through Rotterdam on FOB terms. (ChatGPT, Aug 11, 2026)",
        "Meridian asked for 60 day payment terms instead of 30. (Claude, Oct 19, 2026)",
      ] },
      { path: "About me", facts: [
        "I run key accounts at Harbourline Trading in Hong Kong.",
        "My name is Grace Leung.",
        "I keep talking points short and put numbers first.",
      ] },
      { path: "Clients / Meridian Foods / Pricing history", facts: [
        "We held Meridian's price flat in 2026 after freight costs fell. (Gemini, Jan 14, 2026)",
        "Our floor for 2027 is a 3 percent increase. (ChatGPT, Oct 20, 2026)",
      ] },
    ],
    answer: {
      intro: "Here are talking points for the Meridian renewal, built on the account's history.",
      steps: "1. Open on volume. 40 containers a year makes them a top five account.\n2. Trade terms for price. Offer 45 day terms if they accept the 3 percent increase.\n3. Lock the length. Two years at the new price, with freight reviewed each June.",
      close: "Want a one page proposal to send after the call?",
    },
  },
  graph: {
    count: "187 memories from 112 chats in 3 topics",
    hubs: teamGraph({
      company: ["Payment terms", "Freight partners", "Customs codes", "Pricing rules", "Markets", "Trade shows"],
      clients: ["Meridian Foods", "Supply agreement", "Ines Vogel", "Kanto Housewares", "Busan launch", "Solano Imports", "Letter of credit", "Rhee Distribution", "Pieter de Wit"],
      tone: "How you negotiate",
      focus: "Meridian Foods",
    }),
  },
  due: { text: "The Meridian Foods renewal call is on", date: "October 28", status: "Due tomorrow", review: "7 memories need a look." },
  client: {
    name: "Meridian Foods",
    from: "From 19 chats",
    status: "Active client. 3 open promises.",
    contacts: ["Ines Vogel", "Pieter de Wit"],
    engagement: "Supply agreement",
    promises: [
      ["Meridian agreed to send its 2027 volume forecast before", "October 24", "Oct 12, 2026", "Was due Oct 24, 2026"],
      ["We promised Ines a renewal proposal by", "October 31", "Oct 19, 2026", "Due Oct 31, 2026"],
      ["I told Pieter I would confirm the Rotterdam freight rate by", "November 7", "Oct 21", "Due Nov 7"],
    ],
    meeting: ["Renewal call with Ines Vogel on", "October 28", "to agree terms for 2027 and 2028.", "Oct 22"],
    requests: [
      ["Ines asked for 60 day payment terms instead of 30.", "Oct 19"],
      ["Meridian wants a monthly shipping report with", "three", "numbers: on time rate, damage and cost.", "Jul 8, 2026"],
      ["Pieter prefers email before 10 am Amsterdam time.", "Sep 2"],
    ],
    deadlines: [
      ["The renewal proposal goes to Ines by", "October 31", "Oct 19", "Due Oct 31"],
      ["The current supply agreement ends on", "December 31", "Sep 25", "Due Dec 31"],
      ["The first 2027 shipment leaves Shenzhen in the second week of January.", "Oct 3, 2026"],
    ],
    billing: ["Meridian pays in euros by letter of credit through ING Rotterdam.", "Feb 11, 2026"],
    document: ["Pasting the 2025 supply agreement: price, volume and the", "three", "termination clauses.", "Sep 25"],
  },
  cori: {
    question: "what did we promise Meridian Foods?",
    answer: "3 open promises to Meridian Foods, soonest first.",
    items: [
      ["Meridian agreed to send its 2027 volume forecast before", "October 24", "Was due Oct 24, 2026", "Claude, Oct 12"],
      ["We promised Ines a renewal proposal by", "October 31", "Due Oct 31, 2026", "ChatGPT, Oct 19"],
      ["I told Pieter I would confirm the Rotterdam freight rate by", "November 7", "Due Nov 7, 2026", "Claude, Oct 21"],
    ],
  },
  clientLine: {
    draft: "Draft a reply to Ines about moving Meridian to 45 day terms.",
    from: "From 6 chats",
    chats: [
      "Personal", "Meridian Foods contract renewal", "Kanto Housewares launch", "Solano Imports quote", "Rhee Distribution terms",
      "Incoterms for Rotterdam route", "Q4 pricing to Singapore", "Letter of credit checklist", "Customs codes for kitchenware", "Freight quote comparison",
      "FX hedge for euro invoices", "Trade show follow ups", "Margin by region", "Supplier audit in Shenzhen",
    ],
  },
  app: {
    name: "account-brief",
    ask: "Brief me on Meridian Foods before the renewal call",
    from: 10,
    sections: [
      { path: "Clients / Meridian Foods / Supply agreement", facts: [
        "The Meridian supply agreement ends on December 31 and renews for two years. (Claude, Sep 25, 2026)",
        "Meridian asked for 60 day payment terms instead of 30. (Claude, Oct 19, 2026)",
      ] },
      { path: "Clients / Meridian Foods / Pricing history", facts: [
        "Our floor for 2027 is a 3 percent increase. (ChatGPT, Oct 20, 2026)",
      ] },
    ],
    reasons: [
      ["Clients / Meridian Foods / Supply agreement", "The draft names it"],
      ["Clients / Meridian Foods / Pricing history", "Shares words with the draft"],
    ],
  },
};
