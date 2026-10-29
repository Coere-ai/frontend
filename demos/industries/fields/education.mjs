import { teamGraph } from "../shape.mjs";

/** Education: a teacher plans a unit from what each class already covered, across every AI they use. Made up for the demo. */
export const field = {
  person: { name: "Priya Raman", initials: "PR" },
  firm: "Westbrook High School",
  chats: [
    "Period 3 photosynthesis unit", "Lab safety quiz", "Rubric for lab reports", "Parent email about grades",
    "Field trip permission slip", "Differentiated reading list", "Exit ticket ideas", "Science fair timeline",
    "IEP accommodations summary", "Grading policy wording", "Bell schedule changes", "Department meeting notes", "Substitute plans", "Winter break prep",
  ],
  context: {
    draft: "Help me plan next week's photosynthesis lessons for period 3.",
    chat: { title: "Period 3 photosynthesis unit", date: "Oct 21, 2026" },
    about: "From 5 chats",
    rows: [
      { path: "Clients / Period 3 Biology / Photosynthesis unit", from: "From 6 chats" },
      { path: "Clients / Period 3 Biology / How the class learns", from: "From 3 chats" },
    ],
    related: [
      { path: "Company / Lab safety rules", from: "From 2 chats" },
      { path: "Company / Rubric for lab reports", from: "From 2 chats" },
    ],
    line: "Adding your chat 'Period 3 photosynthesis unit' and your context on Period 3 Biology",
    lineFrom: "From 10 chats",
    sections: [
      { path: "Clients / Period 3 Biology / Photosynthesis unit", facts: [
        "Period 3 finished the leaf structure lesson on October 20. (Claude, Oct 20, 2026)",
        "The unit test for photosynthesis is on November 6. (ChatGPT, Oct 6, 2026)",
        "Many in period 3 mixed up the light and dark reactions on the quiz. (Claude, Oct 16, 2026)",
      ] },
      { path: "About me", facts: [
        "I teach biology at Westbrook High School.",
        "My name is Priya Raman.",
        "I like lessons with a hands on activity every day.",
      ] },
      { path: "Clients / Period 3 Biology / How the class learns", facts: [
        "Period 3 does best with short labs and pair work. (ChatGPT, Sep 18, 2026)",
        "Four students in period 3 have extended time on tests. (Gemini, Aug 28, 2026)",
      ] },
    ],
    answer: {
      intro: "Here is next week for period 3, built on where the class is and the quiz results.",
      steps: "1. Monday: a pair activity sorting light and dark reaction cards, since the quiz mixed them up.\n2. Wednesday: the leaf disk lab, short and hands on.\n3. Friday: a review game, with extended time ready for the four students who need it on November 6.",
      close: "Want the card set for Monday?",
    },
  },
  graph: {
    count: "133 memories from 85 chats in 3 topics",
    hubs: teamGraph({
      company: ["Lab safety rules", "Grading policy", "Rubrics", "Department notes", "Calendar", "Parent contact rules"],
      clients: ["Period 3 Biology", "Photosynthesis unit", "Ms. Alvarez", "Period 5 Biology", "Cell unit", "AP Environmental", "Field trip", "Science club", "Mr. Chen"],
      tone: "How you write for students",
      focus: "Period 3 Biology",
    }),
  },
  due: { text: "The photosynthesis unit test is on", date: "November 6", status: "Due in 9 days", review: "4 memories need a look." },
  client: {
    name: "Period 3 Biology",
    from: "From 14 chats",
    status: "Active class. 3 open promises.",
    contacts: ["Ms. Alvarez", "Mr. Chen"],
    engagement: "Photosynthesis unit",
    promises: [
      ["Ms. Alvarez agreed to share the reading support plan before", "October 24", "Oct 14, 2026", "Was due Oct 24, 2026"],
      ["We promised period 3 their lab reports back by", "October 30", "Oct 22, 2026", "Due Oct 30, 2026"],
      ["I told Mr. Chen I would send the field trip forms home by", "November 3", "Oct 20", "Due Nov 3"],
    ],
    meeting: ["Co-planning with Ms. Alvarez on", "October 29", "to set supports for the unit test.", "Oct 21"],
    requests: [
      ["Ms. Alvarez asked for test questions in plain language for two students.", "Oct 8"],
      ["Families want a weekly class update with", "three", "things: what we did, what is due and how to help.", "Sep 1, 2026"],
      ["Mr. Chen prefers notes in the shared drive over email.", "Sep 25"],
    ],
    deadlines: [
      ["Lab reports go back to period 3 by", "October 30", "Oct 22", "Due Oct 30"],
      ["The photosynthesis unit test is on", "November 6", "Oct 6", "Due Nov 6"],
      ["Science fair proposals are due in early December.", "Oct 1, 2026"],
    ],
    billing: ["The field trip costs 12 dollars a student, with fee waivers through the office.", "Oct 3, 2026"],
    document: ["Pasting the unit plan: goals, labs and the", "three", "big ideas students should leave with.", "Oct 1"],
  },
  cori: {
    question: "what do I owe period 3 this week?",
    answer: "3 open promises for Period 3 Biology, soonest first.",
    items: [
      ["Ms. Alvarez agreed to share the reading support plan before", "October 24", "Was due Oct 24, 2026", "Claude, Oct 14"],
      ["We promised period 3 their lab reports back by", "October 30", "Due Oct 30, 2026", "ChatGPT, Oct 22"],
      ["I told Mr. Chen I would send the field trip forms home by", "November 3", "Due Nov 3, 2026", "Claude, Oct 20"],
    ],
  },
  clientLine: {
    draft: "Write this week's update to period 3 families.",
    from: "From 5 chats",
    chats: [
      "Personal", "Period 3 photosynthesis unit", "Period 5 cell unit", "AP Environmental field trip", "Science club budget",
      "Lab safety quiz", "Rubric for lab reports", "Parent email about grades", "Field trip permission slip", "Differentiated reading list",
      "Exit ticket ideas", "Science fair timeline", "Grading policy wording", "Substitute plans",
    ],
  },
  app: {
    name: "lesson-planner",
    ask: "Where is period 3 in the photosynthesis unit?",
    from: 8,
    sections: [
      { path: "Clients / Period 3 Biology / Photosynthesis unit", facts: [
        "Period 3 finished the leaf structure lesson on October 20. (Claude, Oct 20, 2026)",
        "Many in period 3 mixed up the light and dark reactions on the quiz. (Claude, Oct 16, 2026)",
      ] },
      { path: "Clients / Period 3 Biology / How the class learns", facts: [
        "Period 3 does best with short labs and pair work. (ChatGPT, Sep 18, 2026)",
      ] },
    ],
    reasons: [
      ["Clients / Period 3 Biology / Photosynthesis unit", "The draft names it"],
      ["Clients / Period 3 Biology / How the class learns", "Shares words with the draft"],
    ],
  },
};
