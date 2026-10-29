import { teamGraph } from "../shape.mjs";

/** Healthcare: a research coordinator runs a trial with partner clinics, with no patient details in memory. Made up for the demo. */
export const field = {
  person: { name: "Amara Osei", initials: "AO" },
  firm: "Lakeshore Clinical Research",
  chats: [
    "Dunmore site visit prep", "Protocol amendment 3", "IRB renewal checklist", "Enrollment by site",
    "Adverse event reporting", "Consent form wording", "Monitoring visit notes", "Budget per patient visit",
    "Lab kit shipping", "Data query backlog", "Investigator meeting agenda", "Site training plan", "GCP refresher", "Team rota for December",
  ],
  context: {
    draft: "Help me prepare for the monitoring visit at Dunmore Cardiology next week.",
    chat: { title: "Dunmore site visit prep", date: "Oct 21, 2026" },
    about: "From 5 chats",
    rows: [
      { path: "Clients / Dunmore Cardiology / HEART-2 study", from: "From 7 chats" },
      { path: "Clients / Dunmore Cardiology / Open queries", from: "From 3 chats" },
    ],
    related: [
      { path: "Company / Monitoring procedures", from: "From 2 chats" },
      { path: "Company / Protocol amendment 3", from: "From 2 chats" },
    ],
    line: "Adding your chat 'Dunmore site visit prep' and your context on Dunmore Cardiology",
    lineFrom: "From 12 chats",
    sections: [
      { path: "Clients / Dunmore Cardiology / HEART-2 study", facts: [
        "Dunmore has enrolled 18 of its 24 participants in HEART-2. (Claude, Oct 16, 2026)",
        "The monitoring visit at Dunmore is on November 4 and 5. (ChatGPT, Oct 12, 2026)",
        "Dunmore still has to retrain staff on protocol amendment 3. (Claude, Oct 19, 2026)",
      ] },
      { path: "About me", facts: [
        "I coordinate clinical trials at Lakeshore Clinical Research.",
        "My name is Amara Osei.",
        "I want checklists, not paragraphs.",
      ] },
      { path: "Clients / Dunmore Cardiology / Open queries", facts: [
        "Dunmore has 11 open data queries, 4 older than 30 days. (Gemini, Oct 18, 2026)",
        "Two consent forms at Dunmore use the old version. (ChatGPT, Oct 17, 2026)",
      ] },
    ],
    answer: {
      intro: "Here is a checklist for the Dunmore visit on November 4 and 5, built on where the site stands.",
      steps: "1. Close old queries. Ask the site to clear the 4 queries older than 30 days first.\n2. Fix consent. Re-consent with the current form where the old version was used.\n3. Confirm training. Get sign off on amendment 3 for every staff member before the visit.",
      close: "Want an email to the Dunmore coordinator with these three asks?",
    },
  },
  graph: {
    count: "149 memories from 93 chats in 3 topics",
    hubs: teamGraph({
      company: ["Monitoring procedures", "Protocol amendment 3", "IRB contacts", "Lab kits", "Training", "Budget rules"],
      clients: ["Dunmore Cardiology", "HEART-2 study", "Dr. Lena Park", "Riverbend Hospital", "Open queries", "Northgate Clinic", "Site budget", "Alder Health", "Joel Kim"],
      tone: "How you write checklists",
      focus: "Dunmore Cardiology",
    }),
  },
  due: { text: "The Dunmore monitoring visit starts on", date: "November 4", status: "Due in 7 days", review: "5 memories need a look." },
  client: {
    name: "Dunmore Cardiology",
    from: "From 15 chats",
    status: "Active site. 3 open promises.",
    contacts: ["Dr. Lena Park", "Joel Kim"],
    engagement: "HEART-2 study",
    promises: [
      ["Dunmore agreed to send staff training logs for amendment 3 before", "October 28", "Oct 19, 2026", "Due Oct 28, 2026"],
      ["We promised Joel the visit agenda and document list by", "October 30", "Oct 21, 2026", "Due Oct 30, 2026"],
      ["I told Dr. Park I would confirm the extra lab kits by", "November 2", "Oct 20", "Due Nov 2"],
    ],
    meeting: ["Monitoring visit at Dunmore on", "November 4", "and 5, with source document review.", "Oct 12"],
    requests: [
      ["Dr. Park asked that visit findings come in one email, not several.", "Sep 22"],
      ["Dunmore wants a monthly site report with", "three", "numbers: enrolled, queries and deviations.", "Jul 1, 2026"],
      ["Joel prefers calls on Tuesday or Thursday afternoons.", "Aug 12"],
    ],
    deadlines: [
      ["The visit agenda goes to Joel by", "October 30", "Oct 21", "Due Oct 30"],
      ["Enrollment at Dunmore closes on", "December 15", "Sep 8", "Due Dec 15"],
      ["The IRB renewal for Dunmore is due in March.", "Oct 2, 2026"],
    ],
    billing: ["Dunmore is paid per completed visit, invoiced at the end of each month.", "Feb 9, 2026"],
    document: ["Pasting the HEART-2 site agreement: visits, payments and the", "three", "reports the site owes us.", "Aug 3"],
  },
  cori: {
    question: "what does Dunmore still owe us?",
    answer: "3 open promises with Dunmore Cardiology, soonest first.",
    items: [
      ["Dunmore agreed to send staff training logs for amendment 3 before", "October 28", "Due Oct 28, 2026", "Claude, Oct 19"],
      ["We promised Joel the visit agenda and document list by", "October 30", "Due Oct 30, 2026", "ChatGPT, Oct 21"],
      ["I told Dr. Park I would confirm the extra lab kits by", "November 2", "Due Nov 2, 2026", "Claude, Oct 20"],
    ],
  },
  clientLine: {
    draft: "Draft the visit agenda email to Joel at Dunmore.",
    from: "From 5 chats",
    chats: [
      "Personal", "Dunmore site visit prep", "Riverbend enrollment", "Northgate IRB renewal", "Alder Health contract",
      "Protocol amendment 3", "IRB renewal checklist", "Enrollment by site", "Adverse event reporting", "Consent form wording",
      "Monitoring visit notes", "Budget per patient visit", "Lab kit shipping", "Data query backlog",
    ],
  },
  app: {
    name: "site-monitor",
    ask: "What should I check at Dunmore Cardiology next week?",
    from: 8,
    sections: [
      { path: "Clients / Dunmore Cardiology / HEART-2 study", facts: [
        "Dunmore has enrolled 18 of its 24 participants in HEART-2. (Claude, Oct 16, 2026)",
        "Dunmore still has to retrain staff on protocol amendment 3. (Claude, Oct 19, 2026)",
      ] },
      { path: "Clients / Dunmore Cardiology / Open queries", facts: [
        "Dunmore has 11 open data queries, 4 older than 30 days. (Gemini, Oct 18, 2026)",
      ] },
    ],
    reasons: [
      ["Clients / Dunmore Cardiology / HEART-2 study", "The draft names it"],
      ["Clients / Dunmore Cardiology / Open queries", "Shares words with the draft"],
    ],
  },
};
