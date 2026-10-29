/** Legal: an associate prepares a deposition, with each client's matters kept to that client. Made up for the demo. */
import { teamGraph } from "../shape.mjs";

export const field = {
  person: { name: "Nina Okafor", initials: "NO" },
  firm: "Whitlock & Rhee LLP",
  chats: [
    "Hartwell deposition outline", "Motion to compel draft", "Briarstone discovery requests", "Case law on spoliation",
    "Intake call with Osei Bakery", "Lease review for Calder Foods", "Expert witness questions", "October billing narrative",
    "Settlement range memo", "Privilege log format", "Deposition exhibit list", "Trial calendar", "CLE ethics hours", "Firm style guide",
  ],
  context: {
    draft: "Help me prepare for the Mendes deposition on Thursday.",
    chat: { title: "Hartwell deposition outline", date: "Oct 21, 2026" },
    about: "From 6 chats",
    rows: [
      { path: "Clients / Hartwell Logistics / Hartwell v. Briarstone", from: "From 4 chats" },
      { path: "Clients / Hartwell Logistics / Key witnesses", from: "From 2 chats" },
    ],
    related: [
      { path: "Firm / Deposition practice", from: "From 1 chat" },
      { path: "Clients / Hartwell Logistics / Damages", from: "From 2 chats" },
    ],
    line: "Adding your chat 'Hartwell deposition outline' and your context on Hartwell v. Briarstone",
    lineFrom: "From 8 chats",
    sections: [
      { path: "Clients / Hartwell Logistics / Hartwell v. Briarstone", facts: [
        "Carl Mendes of Briarstone is deposed on Thursday, October 29 at 10 am. (Claude, Oct 14, 2026)",
        "Briarstone says its trucks ran late because of a dispatch software outage in March. (ChatGPT, Oct 2, 2026)",
        "Our theory is that Briarstone knew of the outage for two weeks and kept billing full rates. (Claude, Oct 9, 2026)",
      ] },
      { path: "About me", facts: [
        "I am a litigation associate at Whitlock & Rhee.",
        "My name is Nina Okafor.",
        "I write short, plain deposition questions and avoid compound ones.",
      ] },
      { path: "Clients / Hartwell Logistics / Key witnesses", facts: [
        "Carl Mendes ran dispatch at Briarstone from 2023 to 2026. (ChatGPT, Oct 2, 2026)",
        "Exhibit 14 is the March 6 email where Mendes calls the outage a known issue. (Claude, Oct 14, 2026)",
      ] },
    ],
    answer: {
      intro: "Here is a plan for the Mendes deposition, built on your outline and the case record.",
      steps: "1. Lock in his role. Dispatch lead from 2023 to 2026, and who he reported to.\n2. Walk the timeline. When he first heard of the outage, then Exhibit 14 from March 6.\n3. Close on billing. Who decided to keep full rates once he knew.",
      close: "Want me to draft the questions for each part?",
    },
  },
  graph: {
    count: "141 memories from 87 chats in 3 topics",
    hubs: teamGraph({
      company: ["Deposition practice", "Billing guidelines", "Court rules", "Partners and staff", "Templates", "Conflicts checks"],
      clients: ["Hartwell Logistics", "Hartwell v. Briarstone", "Priya Hale", "Osei Bakery", "Lease dispute", "Calder Foods", "Calder trademark", "Dunmore Clinic", "Tom Reyes"],
      tone: "How you write briefs",
      focus: "Hartwell Logistics",
    }),
  },
  due: { text: "The Hartwell expert report goes to opposing counsel by", date: "November 3", status: "Due in 5 days", review: "6 memories need a look." },
  client: {
    name: "Hartwell Logistics",
    from: "From 14 chats",
    status: "Active client. 3 open promises.",
    contacts: ["Priya Hale", "Tom Reyes"],
    engagement: "Hartwell v. Briarstone",
    promises: [
      ["Hartwell agreed to send the March dispatch logs before", "October 27", "Oct 15, 2026", "Was due Oct 27, 2026"],
      ["We promised Priya Hale a deposition summary by", "October 30", "Oct 22, 2026", "Due Oct 30, 2026"],
      ["I told Tom I would confirm the settlement range with the partners by", "November 2", "Oct 20", "Due Nov 2"],
    ],
    meeting: ["Prep call with Priya Hale on", "October 28", "to walk through the Mendes questions.", "Oct 21"],
    requests: [
      ["Priya asked that every update go to her and not to the operations team.", "Oct 9"],
      ["Hartwell wants a short monthly case report with", "three", "points and the next deadline.", "Sep 30, 2026"],
      ["Tom prefers calls before noon Central time.", "Oct 3"],
    ],
    deadlines: [
      ["The expert report goes to opposing counsel by", "November 3", "Oct 12", "Due Nov 3"],
      ["Discovery in Hartwell v. Briarstone closes on", "December 11", "Sep 18", "Due Dec 11"],
      ["The mediation brief is due a week before mediation in January.", "Oct 1, 2026"],
    ],
    billing: ["Hartwell wants invoices split by matter, with Briarstone time on its own line.", "Aug 19, 2026"],
    document: ["Pasting the engagement letter: scope, rates and the", "two", "people who may approve a settlement.", "Sep 2"],
  },
  cori: {
    question: "what deadlines do we have for Hartwell?",
    answer: "3 open deadlines for Hartwell Logistics, soonest first.",
    items: [
      ["We promised Priya Hale a deposition summary by", "October 30", "Due Oct 30, 2026", "Claude, Oct 22"],
      ["The expert report goes to opposing counsel by", "November 3", "Due Nov 3, 2026", "ChatGPT, Oct 12"],
      ["Discovery in Hartwell v. Briarstone closes on", "December 11", "Due Dec 11, 2026", "Claude, Sep 18"],
    ],
  },
  clientLine: {
    draft: "Draft a status update to Priya at Hartwell about the deposition schedule.",
    from: "From 6 chats",
    chats: [
      "Personal", "Hartwell deposition outline", "Briarstone discovery requests", "Calder Foods lease review", "Osei Bakery intake",
      "Dunmore Clinic records request", "Motion to compel draft", "Settlement range memo", "Privilege log format", "Expert witness questions",
      "Calder trademark search", "Trial calendar", "Billing narratives", "Conflicts check for Dunmore",
    ],
  },
  app: {
    name: "matter-desk",
    ask: "Where does Hartwell v. Briarstone stand before the Mendes deposition?",
    from: 7,
    sections: [
      { path: "Clients / Hartwell Logistics / Hartwell v. Briarstone", facts: [
        "Carl Mendes of Briarstone is deposed on Thursday, October 29 at 10 am. (Claude, Oct 14, 2026)",
        "Discovery in Hartwell v. Briarstone closes on December 11. (Claude, Sep 18, 2026)",
        "The expert report goes to opposing counsel by November 3. (ChatGPT, Oct 12, 2026)",
      ] },
      { path: "Clients / Hartwell Logistics / Key witnesses", facts: [
        "Exhibit 14 is the March 6 email where Mendes calls the outage a known issue. (Claude, Oct 14, 2026)",
      ] },
    ],
    reasons: [
      ["Clients / Hartwell Logistics / Hartwell v. Briarstone", "The draft names it"],
      ["Clients / Hartwell Logistics / Key witnesses", "Shares words with the draft"],
    ],
  },
};
