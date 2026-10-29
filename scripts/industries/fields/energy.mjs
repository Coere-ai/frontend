import { teamGraph } from "../shape.mjs";

/** Energy: a field engineer plans work on a wind site with what past crews learned there. Made up for the demo. */
export const field = {
  person: { name: "Hannah Lund", initials: "HL" },
  firm: "Crestline Renewables",
  chats: [
    "Altamont turbine 14 gearbox", "Blade inspection drone plan", "Grid curtailment notice", "Crane booking for November",
    "Lockout tagout steps", "SCADA alarm list", "Spare parts on site", "Winter access road",
    "Permit renewal for Kern site", "Bird survey findings", "Crew rota for December", "Safety stand down notes", "Battery storage bid", "Vendor contacts",
  ],
  context: {
    draft: "Plan next week's gearbox work on turbine 14 at Altamont.",
    chat: { title: "Altamont turbine 14 gearbox", date: "Oct 22, 2026" },
    about: "From 4 chats",
    rows: [
      { path: "Clients / Altamont Wind / Turbine 14", from: "From 6 chats" },
      { path: "Clients / Altamont Wind / Site access", from: "From 3 chats" },
    ],
    related: [
      { path: "Company / Lockout tagout steps", from: "From 2 chats" },
      { path: "Company / Crane bookings", from: "From 2 chats" },
    ],
    line: "Adding your chat 'Altamont turbine 14 gearbox' and your context on Altamont Wind",
    lineFrom: "From 11 chats",
    sections: [
      { path: "Clients / Altamont Wind / Turbine 14", facts: [
        "Turbine 14's gearbox oil showed metal particles on October 18. (Claude, Oct 18, 2026)",
        "The last bearing on turbine 14 was replaced in March 2025. (ChatGPT, Sep 3, 2026)",
        "The 90 tonne crane is booked for Altamont from November 3 to 7. (Claude, Oct 20, 2026)",
      ] },
      { path: "About me", facts: [
        "I lead field maintenance at Crestline Renewables.",
        "My name is Hannah Lund.",
        "Give me plans by day, with safety steps first.",
      ] },
      { path: "Clients / Altamont Wind / Site access", facts: [
        "The north gate at Altamont is locked after 6 pm; the code is with the site office. (Gemini, Aug 9, 2026)",
        "Wind over 12 meters a second stops crane work at Altamont. (ChatGPT, Oct 2, 2026)",
      ] },
    ],
    answer: {
      intro: "Here is a plan for turbine 14, built on the oil sample and the crane booking.",
      steps: "1. Monday: lock out turbine 14 and confirm the 90 tonne crane for November 3.\n2. Tuesday: open the gearbox and check the bearing replaced in March 2025.\n3. Wednesday: swap the bearing if worn, with a wind check before every lift over 12 meters a second.",
      close: "Want a crew briefing sheet for Monday?",
    },
  },
  graph: {
    count: "158 memories from 98 chats in 3 topics",
    hubs: teamGraph({
      company: ["Lockout tagout steps", "Crane bookings", "Safety rules", "Spare parts", "Vendors", "Permits"],
      clients: ["Altamont Wind", "Turbine 14", "Ray Delgado", "Kern Solar", "Inverter faults", "Mesa Storage", "Battery bid", "Pine Ridge Wind", "Ana Ruiz"],
      tone: "How you write field plans",
      focus: "Altamont Wind",
    }),
  },
  due: { text: "Turbine 14 gearbox work starts on", date: "November 3", status: "Due in 6 days", review: "6 memories need a look." },
  client: {
    name: "Altamont Wind",
    from: "From 16 chats",
    status: "Active site. 3 open promises.",
    contacts: ["Ray Delgado", "Ana Ruiz"],
    engagement: "Turbine 14",
    promises: [
      ["Altamont agreed to send the October SCADA logs before", "October 25", "Oct 18, 2026", "Was due Oct 25, 2026"],
      ["We promised Ray a gearbox work plan by", "October 30", "Oct 22, 2026", "Due Oct 30, 2026"],
      ["I told Ana I would confirm the outage window with the grid operator by", "October 31", "Oct 20", "Due Oct 31"],
    ],
    meeting: ["Site safety briefing with Ray Delgado on", "November 3", "before the crane arrives.", "Oct 22"],
    requests: [
      ["Ray asked that every lift be logged in the site book.", "Sep 10"],
      ["Altamont wants a monthly availability report with", "three", "numbers per turbine group.", "Jun 2, 2026"],
      ["Ana prefers radio over phone when crews are up tower.", "Aug 21"],
    ],
    deadlines: [
      ["The gearbox work plan goes to Ray by", "October 30", "Oct 22", "Due Oct 30"],
      ["The crane is booked at Altamont until", "November 7", "Oct 20", "Due Nov 7"],
      ["The Altamont permit renewal is due in January.", "Sep 28, 2026"],
    ],
    billing: ["Altamont pays for unplanned work on a time and materials basis.", "Apr 15, 2026"],
    document: ["Pasting the Altamont service agreement: response times, access and the", "three", "turbines under warranty.", "Sep 28"],
  },
  cori: {
    question: "what did we promise Altamont?",
    answer: "3 open promises to Altamont Wind, soonest first.",
    items: [
      ["Altamont agreed to send the October SCADA logs before", "October 25", "Was due Oct 25, 2026", "Claude, Oct 18"],
      ["We promised Ray a gearbox work plan by", "October 30", "Due Oct 30, 2026", "ChatGPT, Oct 22"],
      ["I told Ana I would confirm the outage window with the grid operator by", "October 31", "Due Oct 31, 2026", "Claude, Oct 20"],
    ],
  },
  clientLine: {
    draft: "Write Ray the turbine 14 work plan for next week.",
    from: "From 6 chats",
    chats: [
      "Personal", "Altamont turbine 14 gearbox", "Kern Solar inverter faults", "Mesa Storage battery bid", "Pine Ridge permit",
      "Blade inspection drone plan", "Grid curtailment notice", "Crane booking for November", "Lockout tagout steps", "SCADA alarm list",
      "Spare parts on site", "Winter access road", "Bird survey findings", "Crew rota for December",
    ],
  },
  app: {
    name: "field-planner",
    ask: "What do we know about turbine 14 at Altamont?",
    from: 9,
    sections: [
      { path: "Clients / Altamont Wind / Turbine 14", facts: [
        "Turbine 14's gearbox oil showed metal particles on October 18. (Claude, Oct 18, 2026)",
        "The 90 tonne crane is booked for Altamont from November 3 to 7. (Claude, Oct 20, 2026)",
      ] },
      { path: "Clients / Altamont Wind / Site access", facts: [
        "Wind over 12 meters a second stops crane work at Altamont. (ChatGPT, Oct 2, 2026)",
      ] },
    ],
    reasons: [
      ["Clients / Altamont Wind / Turbine 14", "The draft names it"],
      ["Clients / Altamont Wind / Site access", "Shares words with the draft"],
    ],
  },
};
