import { teamGraph } from "../shape.mjs";

/** Manufacturing: a plant engineer fixes a line fault with what earlier shifts learned. Made up for the demo. */
export const field = {
  person: { name: "Luis Moreno", initials: "LM" },
  firm: "Brightwater Components",
  chats: [
    "Line 3 torque fault", "PLC alarm codes", "Supplier PPAP checklist", "Weld cell cycle time",
    "Preventive maintenance plan", "Scrap rate by shift", "Changeover checklist", "Kaizen ideas for Q4",
    "Calibration schedule", "Safety audit findings", "Spare parts list", "Shift handover notes", "Lean training plan", "Plant tour agenda",
  ],
  context: {
    draft: "Line 3 is throwing torque faults again. What did we try last time?",
    chat: { title: "Line 3 torque fault", date: "Oct 22, 2026" },
    about: "From 4 chats",
    rows: [
      { path: "Clients / Corvane Motors / Line 3 / Faults", from: "From 6 chats" },
      { path: "Clients / Corvane Motors / Line 3 / Equipment", from: "From 3 chats" },
    ],
    related: [
      { path: "Company / Preventive maintenance", from: "From 2 chats" },
      { path: "Company / Shift handover notes", from: "From 3 chats" },
    ],
    line: "Adding your chat 'Line 3 torque fault' and your context on Line 3",
    lineFrom: "From 11 chats",
    sections: [
      { path: "Clients / Corvane Motors / Line 3 / Faults", facts: [
        "In August the torque faults on Line 3 came from a worn spindle on station 4. (Claude, Aug 19, 2026)",
        "Night shift found the faults rise when the hall drops below 15 degrees. (ChatGPT, Oct 9, 2026)",
        "Replacing the spindle cleared the faults for nine weeks. (Claude, Aug 26, 2026)",
      ] },
      { path: "About me", facts: [
        "I am a process engineer at Brightwater Components.",
        "My name is Luis Moreno.",
        "I want steps in the order a technician would do them.",
      ] },
      { path: "Clients / Corvane Motors / Line 3 / Equipment", facts: [
        "Station 4 runs an Atlas Copco nutrunner, last calibrated on September 2. (Gemini, Sep 2, 2026)",
        "Spare spindles are in cage B, two on hand. (ChatGPT, Oct 1, 2026)",
      ] },
    ],
    answer: {
      intro: "Last time it was the station 4 spindle, and night shift has seen a cold hall make it worse. Here is the order to check.",
      steps: "1. Check station 4 first. Look at spindle wear, since the last one lasted nine weeks.\n2. Rule out the cold. Log the hall temperature against each fault on night shift.\n3. Recalibrate if it persists. The nutrunner was last done on September 2.",
      close: "Want a checklist for the night shift lead?",
    },
  },
  graph: {
    count: "176 memories from 109 chats in 3 topics",
    hubs: teamGraph({
      company: ["Preventive maintenance", "Safety rules", "Shift handover notes", "Suppliers", "Quality system", "Spare parts"],
      clients: ["Corvane Motors", "Line 3", "Hannah Weiss", "Ostrava Rail", "Brake housings", "Pell Agritech", "PPAP approval", "Kessler Pumps", "Nils Berg"],
      tone: "How you write procedures",
      focus: "Corvane Motors",
    }),
  },
  due: { text: "The Corvane quality report is due by", date: "October 31", status: "Due in 3 days", review: "8 memories need a look." },
  client: {
    name: "Corvane Motors",
    from: "From 18 chats",
    status: "Active client. 3 open promises.",
    contacts: ["Hannah Weiss", "Nils Berg"],
    engagement: "Line 3",
    promises: [
      ["Corvane agreed to send the updated bracket drawing before", "October 24", "Oct 11, 2026", "Was due Oct 24, 2026"],
      ["We promised Hannah a root cause report on the torque faults by", "October 31", "Oct 22, 2026", "Due Oct 31, 2026"],
      ["I told Nils I would confirm the December shipment volume by", "November 6", "Oct 20", "Due Nov 6"],
    ],
    meeting: ["Quality review with Hannah Weiss on", "November 3", "to walk through the Line 3 faults.", "Oct 22"],
    requests: [
      ["Hannah asked to be told of any fault that stops the line for more than an hour.", "Sep 14"],
      ["Corvane wants a weekly quality report with", "three", "numbers: scrap, rework and on time delivery.", "Jun 5, 2026"],
      ["Nils prefers calls before 9 am Central European time.", "Aug 30"],
    ],
    deadlines: [
      ["The root cause report goes to Hannah by", "October 31", "Oct 22", "Due Oct 31"],
      ["The December shipment of 4,800 brackets leaves on", "December 4", "Oct 2", "Due Dec 4"],
      ["The yearly supplier audit by Corvane is in February.", "Sep 20, 2026"],
    ],
    billing: ["Corvane pays net 60 and wants the part number on every invoice line.", "Mar 18, 2026"],
    document: ["Pasting the Corvane quality agreement: limits, inspection and the", "three", "defects that stop a shipment.", "Sep 20"],
  },
  cori: {
    question: "what did we promise Corvane?",
    answer: "3 open promises to Corvane Motors, soonest first.",
    items: [
      ["Corvane agreed to send the updated bracket drawing before", "October 24", "Was due Oct 24, 2026", "Claude, Oct 11"],
      ["We promised Hannah a root cause report on the torque faults by", "October 31", "Due Oct 31, 2026", "ChatGPT, Oct 22"],
      ["I told Nils I would confirm the December shipment volume by", "November 6", "Due Nov 6, 2026", "Claude, Oct 20"],
    ],
  },
  clientLine: {
    draft: "Write Hannah a short update on the Line 3 torque faults.",
    from: "From 6 chats",
    chats: [
      "Personal", "Line 3 torque fault", "Ostrava Rail brake housings", "Pell Agritech PPAP", "Kessler Pumps quote",
      "PLC alarm codes", "Supplier PPAP checklist", "Weld cell cycle time", "Preventive maintenance plan", "Scrap rate by shift",
      "Changeover checklist", "Calibration schedule", "Safety audit findings", "Shift handover notes",
    ],
  },
  app: {
    name: "line-assistant",
    ask: "What do we know about torque faults on Line 3?",
    from: 9,
    sections: [
      { path: "Clients / Corvane Motors / Line 3 / Faults", facts: [
        "In August the torque faults on Line 3 came from a worn spindle on station 4. (Claude, Aug 19, 2026)",
        "Night shift found the faults rise when the hall drops below 15 degrees. (ChatGPT, Oct 9, 2026)",
      ] },
      { path: "Clients / Corvane Motors / Line 3 / Equipment", facts: [
        "Spare spindles are in cage B, two on hand. (ChatGPT, Oct 1, 2026)",
      ] },
    ],
    reasons: [
      ["Clients / Corvane Motors / Line 3 / Faults", "The draft names it"],
      ["Clients / Corvane Motors / Line 3 / Equipment", "Shares words with the draft"],
    ],
  },
};
