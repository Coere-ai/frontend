import { teamGraph } from "../shape.mjs";

/** Finance: an advisor prepares a client review from every past conversation, one client at a time. Made up for the demo. */
export const field = {
  person: { name: "Daniel Reyes", initials: "DR" },
  firm: "Ashgrove Wealth Partners",
  chats: [
    "Lindqvist annual review prep", "Roth conversion math", "Muni bond ladder for the Parks", "Q3 market commentary",
    "Required minimum distributions", "Okoro estate plan questions", "Rebalancing rules", "Fee schedule wording",
    "529 plan options", "Tax loss harvesting list", "Client letter template", "Compliance review notes", "CFP study plan", "Office holiday schedule",
  ],
  context: {
    draft: "Help me prepare for Elena Lindqvist's annual review on Friday.",
    chat: { title: "Lindqvist annual review prep", date: "Oct 22, 2026" },
    about: "From 5 chats",
    rows: [
      { path: "Clients / Lindqvist household / Goals and income", from: "From 6 chats" },
      { path: "Clients / Lindqvist household / Accounts", from: "From 3 chats" },
    ],
    related: [
      { path: "Company / Rebalancing rules", from: "From 2 chats" },
      { path: "Clients / Lindqvist household / Tax plan", from: "From 2 chats" },
    ],
    line: "Adding your chat 'Lindqvist annual review prep' and your context on the Lindqvist household",
    lineFrom: "From 11 chats",
    sections: [
      { path: "Clients / Lindqvist household / Goals and income", facts: [
        "Elena plans to retire in June 2029 and wants 9,500 dollars a month after tax. (Claude, Sep 12, 2026)",
        "Elena told us her daughter starts college in fall 2027. (ChatGPT, Oct 3, 2026)",
        "Elena is uneasy about stocks after the spring drop and wants less swing. (Claude, Oct 15, 2026)",
      ] },
      { path: "About me", facts: [
        "I am a financial advisor at Ashgrove Wealth Partners.",
        "My name is Daniel Reyes.",
        "I explain numbers in plain words and lead with what changed.",
      ] },
      { path: "Clients / Lindqvist household / Accounts", facts: [
        "The Lindqvist portfolio is 68 percent stocks against a 60 percent target. (ChatGPT, Oct 20, 2026)",
        "A 529 plan for her daughter holds 41,000 dollars. (Gemini, Aug 28, 2026)",
      ] },
    ],
    answer: {
      intro: "Here is an agenda for Elena's review, built on what she has told you this year.",
      steps: "1. Start with her worry. Show the drift to 68 percent stocks and the plan back to 60.\n2. Check the 2029 plan. Walk the 9,500 dollar monthly income goal against today's numbers.\n3. Plan for college. The 529 holds 41,000 dollars with fall 2027 two years out.",
      close: "Want a one page summary to send her before Friday?",
    },
  },
  graph: {
    count: "168 memories from 104 chats in 3 topics",
    hubs: teamGraph({
      company: ["Investment policy", "Rebalancing rules", "Fee schedule", "Compliance", "Custodians", "Client letters"],
      clients: ["Lindqvist household", "Elena Lindqvist", "Annual review", "Okoro family trust", "Estate plan", "Park retirement", "Muni ladder", "Haddad 401k rollover", "Marcus Okoro"],
      tone: "How you explain numbers",
      focus: "Lindqvist household",
    }),
  },
  due: { text: "The Lindqvist annual review is on", date: "October 30", status: "Due in 2 days", review: "4 memories need a look." },
  client: {
    name: "Lindqvist household",
    from: "From 17 chats",
    status: "Active client. 3 open promises.",
    contacts: ["Elena Lindqvist", "Jonas Lindqvist"],
    engagement: "Annual review",
    promises: [
      ["Elena agreed to send her new employer's pension statement before", "October 24", "Oct 10, 2026", "Was due Oct 24, 2026"],
      ["We promised Elena a rebalancing plan back to 60 percent stocks by", "October 30", "Oct 20, 2026", "Due Oct 30, 2026"],
      ["I told Jonas I would model a Roth conversion for 2027 by", "November 14", "Oct 18", "Due Nov 14"],
    ],
    meeting: ["Annual review with Elena and Jonas on", "October 30", "to cover the drift, the 2029 plan and college.", "Oct 22"],
    requests: [
      ["Elena asked for fewer trades and a plain note each time we make one.", "Oct 15"],
      ["The Lindqvists want a quarterly letter with", "three", "numbers and what we did about them.", "Jul 2, 2026"],
      ["Jonas prefers video calls after 5 pm on weekdays.", "Sep 9"],
    ],
    deadlines: [
      ["The rebalancing plan goes to Elena by", "October 30", "Oct 20", "Due Oct 30"],
      ["The 2027 Roth conversion has to be done before", "December 31", "Oct 18", "Due Dec 31"],
      ["The first college payment is due in August 2027.", "Oct 3, 2026"],
    ],
    billing: ["The Lindqvists pay the advisory fee from the joint account, not the IRA.", "Mar 4, 2026"],
    document: ["Pasting Elena's risk questionnaire: income, time frame and", "three", "goals in her own words.", "Oct 15"],
  },
  cori: {
    question: "what did we promise the Lindqvists?",
    answer: "3 open promises to the Lindqvist household, soonest first.",
    items: [
      ["Elena agreed to send her new employer's pension statement before", "October 24", "Was due Oct 24, 2026", "Claude, Oct 10"],
      ["We promised Elena a rebalancing plan back to 60 percent stocks by", "October 30", "Due Oct 30, 2026", "ChatGPT, Oct 20"],
      ["I told Jonas I would model a Roth conversion for 2027 by", "November 14", "Due Nov 14, 2026", "Claude, Oct 18"],
    ],
  },
  clientLine: {
    draft: "Write Elena a short note on why we are trimming stocks back to 60 percent.",
    from: "From 5 chats",
    chats: [
      "Personal", "Lindqvist annual review prep", "Okoro estate plan questions", "Park muni ladder", "Haddad 401k rollover",
      "Roth conversion math", "Rebalancing rules", "Q3 market commentary", "Fee schedule wording", "Tax loss harvesting list",
      "529 plan options", "Client letter template", "Compliance review notes", "Required minimum distributions",
    ],
  },
  app: {
    name: "review-prep",
    ask: "Summarize the Lindqvist household before Friday's review",
    from: 9,
    sections: [
      { path: "Clients / Lindqvist household / Goals and income", facts: [
        "Elena plans to retire in June 2029 and wants 9,500 dollars a month after tax. (Claude, Sep 12, 2026)",
        "Elena is uneasy about stocks after the spring drop and wants less swing. (Claude, Oct 15, 2026)",
      ] },
      { path: "Clients / Lindqvist household / Accounts", facts: [
        "The Lindqvist portfolio is 68 percent stocks against a 60 percent target. (ChatGPT, Oct 20, 2026)",
        "A 529 plan for her daughter holds 41,000 dollars. (Gemini, Aug 28, 2026)",
      ] },
    ],
    reasons: [
      ["Clients / Lindqvist household / Goals and income", "The draft names it"],
      ["Clients / Lindqvist household / Accounts", "Shares words with the draft"],
    ],
  },
};
