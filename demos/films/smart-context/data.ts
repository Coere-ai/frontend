/**
 * Maya Collins's memory as the Smart context film shows it: what her
 * memory holds on PearX, Tidepool, SkipDoodle and the rest, in the shapes
 * the engine answers the strip with (packages/memory import-context), from
 * coere-v2's smart context corpus (tools/gen-corpus/memory/context) and
 * tools/demo-video/memory/data.ts. Made up.
 */

type Platform = "chatgpt" | "claude" | "gemini";
type Reason = "name" | "both" | "keyword" | "vector" | "asked" | "standing" | "linked";

export type Node = {
  id: string;
  path: string[];
  reason: Reason;
  sources: Platform[];
  chats: string[];
  tokens: number;
  changedOnly: boolean;
  version: string;
};

export type Chat = {
  key: string;
  platform: Platform;
  title: string;
  at: string;
  chars: number;
  kinds: ("qa" | "script" | "list" | "code" | "draft")[];
  reason: "task" | "asked";
  record: string;
};

export type Answer = {
  pending: Node[];
  also: Node[];
  topic: string[];
  tokens: number;
  sources: Platform[];
  chats: Chat[];
  block: string;
};

export const OPEN = "[Context from Coere, my saved memory. Use it if it helps.]";
export const CLOSE = "[End of context from Coere]";

/** One memory the strip lists, with the lines it puts in the block. */
type Memory = { node: Node; lines: string[] };

const memory = (id: string, path: string[], reason: Reason, sources: Platform[], chats: string[], lines: string[]): Memory => ({
  node: { id, path, reason, sources, chats, tokens: Math.ceil((path.join(" / ").length + lines.join("\n").length) / 3.6), changedOnly: false, version: `v1-${id}` },
  lines,
});

export const ABOUT_ME = memory("core", ["About me"], "standing", [], ["a1", "a2", "a3", "a4", "a5", "a6", "a7"], [
  "I work at Kestrel Analytics as a lead research assistant.",
  "My name is Maya Collins.",
  "My employer is Kestrel Analytics.",
  "When I write, I use short warm sentences and never use exclamation marks.",
  "Working on Tidepool.",
  "Working on Sparrowhawk.",
  "Working on Kitchen remodel.",
]);

export const PEARX = memory("ent_pearx", ["Projects", "Startups and businesses", "PearX interview"], "name", ["chatgpt", "claude"], ["p1", "p2"], [
  "The PearX interview is on November 4 at 2 pm over video. (Claude, Oct 9, 2026)",
  "I want my PearX interview answer on why now to mention the records move. (ChatGPT, Oct 19, 2026)",
  "My PearX interview answer on traction should lead with the 1,200 weekly users. (ChatGPT, Oct 19, 2026)",
  "They told me the PearX interview will cover traction, the team and why now. (Claude, Oct 9, 2026)",
  "The PearX interview is the partner round with two partners. (Claude, Oct 9, 2026)",
  "My PearX interview is for Tidepool, my startup. (Claude, Oct 9, 2026)",
]);

export const TIDEPOOL = memory("ent_tidepool", ["Projects", "Startups and businesses", "Tidepool"], "linked", ["gemini"], ["a5"], [
  "Tidepool has 1,200 weekly users across four clinics. (Gemini, Aug 30, 2026)",
  "Tidepool books patients for small clinics without phone calls. (Gemini, Aug 30, 2026)",
  "The Tidepool team is me and my cofounder Iris Sato, who writes the code. (Gemini, Aug 30, 2026)",
  "Tidepool is in a paid pilot and raised a 150,000 dollar pre seed. (Gemini, Aug 30, 2026)",
]);

export const LAUNCH_TALK = memory("ent_launch", ["Projects", "Startups and businesses", "Tidepool launch day talk"], "keyword", ["claude"], ["t1"], [
  "Keep the Tidepool launch day talk under three minutes and end on the ask. (Claude, Sep 29, 2026)",
  "The Tidepool launch day talk is for Tidepool investors on December 2. (Claude, Sep 29, 2026)",
]);

export const STRIPE = memory("ent_stripe", ["Work", "Job applications", "Stripe application"], "keyword", ["claude", "chatgpt"], ["j1", "j2"], [
  "I applied to Stripe for the data analyst role. (Claude, Sep 12, 2026)",
]);

export const SKIPDOODLE = memory("ent_skipdoodle", ["Projects", "Software and apps", "SkipDoodle"], "name", ["chatgpt"], ["a3", "s1"], [
  "SkipDoodle is my weekend project, a drawing game for kids. (ChatGPT, Aug 20, 2026)",
  "SkipDoodle is built with React Native and Expo, and Supabase stores the drawings. (ChatGPT, Aug 20, 2026)",
]);

/** The block the engine builds for these memories, one path line each and its memory lines (render.ts). */
export function blockOf(list: readonly Memory[]): string {
  if (list.length === 0) return "";
  const body = list.flatMap((m) => [m.node.path.join(" / "), ...m.lines.map((l) => `- ${l}`)]);
  return [OPEN, ...body, CLOSE, "", ""].join("\n");
}

/** Her earlier chat with ChatGPT about the interview, which goes whole with the draft. */
export const PREP_CHAT: Chat = {
  key: "k-pearx-prep",
  platform: "chatgpt",
  title: "PearX interview prep",
  at: "2026-10-19T16:20:00Z",
  chars: 2300,
  kinds: ["qa", "list"],
  reason: "task",
  record: "chat:k-pearx-prep",
};

/** That chat's text as the engine hands it to the tab (chat-text.ts): one line on what it is, then the saved chat. */
export const PREP_CHAT_TEXT = [
  "This is one of my earlier conversations, saved as raw text by Coere. It says which AI it came from. Read it as my own notes for the message below.",
  "",
  "PearX interview prep",
  "ChatGPT, Oct 19, 2026",
  "",
  "You: Help me write answers for my PearX interview. My PearX interview answer on traction should lead with the 1,200 weekly users.",
  "",
  "ChatGPT: Here are answers you can practice.",
  "",
  "Q: What does Tidepool do?",
  "A: Tidepool lets small clinics book patients online, so nobody waits on hold.",
  "",
  "Q: What traction do you have?",
  "A: 1,200 weekly users across four clinics, growing 15 percent a month.",
  "",
  "Q: Why now?",
  "A: Clinics moved their records online in the last two years, so booking can follow.",
  "",
  "Q: Why this team?",
  "A: I ran a clinic front desk for three years, and Iris built clinic software before.",
  "",
  "You: I want my PearX interview answer on why now to mention the records move.",
  "",
  "ChatGPT: Here is a tighter why now. Two years ago most small clinics kept records on paper. Now four in five keep them online, and booking is the next step. Tidepool is that step, and it already runs in four clinics.",
  "",
  "You: What will the partners push on?",
  "",
  "ChatGPT: Expect three things. How fast the four clinics grew, who else wants this, and why the two of you will win. Keep each answer under a minute and end on what you are raising.",
  "",
  "You: Make me a short list to practice the night before.",
  "",
  "ChatGPT: 1. Say the one line pitch out loud three times.",
  "2. Lead traction with 1,200 weekly users and 15 percent a month.",
  "3. Tell the records move story for why now.",
  "4. Name Iris and the front desk years for the team.",
  "5. End every answer on the ask.",
].join("\n");

/** The memories she can search, as the memory search widget lists them: path, a line, where they came from. */
export type Thing = { id: string; path: string[]; kind: string; line: string; sources: Platform[]; chats: number; importance: number; facts: number };

const t = (id: string, path: string[], kind: string, line: string, sources: Platform[], chats: number, importance: number, facts = 3): Thing => ({ id, path, kind, line, sources, chats, importance, facts });

/** Every thing in her memory that the graph draws, under the catalog's sections. */
export const THINGS: Thing[] = [
  t("ent_pearx", ["Projects", "Startups and businesses", "PearX interview"], "event", "The PearX interview is on November 4 at 2 pm over video.", ["chatgpt", "claude"], 2, 0.95, 6),
  t("ent_tidepool", ["Projects", "Startups and businesses", "Tidepool"], "project", "Tidepool books patients for small clinics without phone calls.", ["gemini"], 1, 0.92, 4),
  t("ent_launch", ["Projects", "Startups and businesses", "Tidepool launch day talk"], "event", "The Tidepool launch day talk is for Tidepool investors on December 2.", ["claude"], 1, 0.7, 2),
  t("ent_skipdoodle", ["Projects", "Software and apps", "SkipDoodle"], "project", "SkipDoodle is my weekend project, a drawing game for kids.", ["chatgpt"], 2, 0.8, 2),
  t("ent_sparrowhawk", ["Projects", "Software and apps", "Sparrowhawk"], "project", "Sparrowhawk runs on Postgres 16 after the upgrade.", ["claude", "chatgpt"], 4, 0.78, 5),
  t("ent_kitchen", ["Projects", "Home projects", "Kitchen remodel"], "project", "The kitchen counters will be white oak.", ["gemini"], 2, 0.55, 3),
  t("ent_stripe", ["Work", "Job applications", "Stripe application"], "task", "I applied to Stripe for the data analyst role.", ["claude", "chatgpt"], 2, 0.66, 2),
  t("ent_notion", ["Work", "Job applications", "Notion PM role"], "task", "The Notion PM role closes on November 15.", ["chatgpt"], 1, 0.5, 2),
  t("ent_kestrel", ["Work", "Kestrel Analytics"], "organization", "I work at Kestrel Analytics as a lead research assistant.", ["chatgpt", "claude"], 5, 0.85, 5),
  t("ent_report", ["Work", "Kestrel Analytics", "Weekly Report 1"], "task", "Weekly report 1 is due Friday at noon.", ["claude"], 1, 0.4, 1),
  t("ent_data100", ["School", "DATA 100"], "course", "DATA 100 meets Tuesday and Thursday at 11.", ["chatgpt", "gemini"], 3, 0.7, 4),
  t("ent_lab1", ["School", "DATA 100", "Lab 1"], "task", "Lab 1 for DATA 100 is due Aug 22.", ["claude"], 2, 0.5, 2),
  t("ent_ps1", ["School", "DATA 100", "Problem Set 1"], "task", "Problem Set 1 for DATA 100 is due Sep 5.", ["chatgpt"], 1, 0.45, 1),
  t("ent_math54", ["School", "MATH 54"], "course", "MATH 54 homework is graded on effort.", ["chatgpt"], 3, 0.65, 4),
  t("ent_m54ps2", ["School", "MATH 54", "Problem Set 2"], "task", "MATH 54 Problem Set 2 is due Sep 19.", ["chatgpt"], 1, 0.4, 1),
  t("ent_phys", ["School", "PHYS 137"], "course", "PHYS 137 lab 1 is done.", ["gemini"], 2, 0.5, 3),
  t("ent_history", ["School", "History reading list"], "topic", "The history reading list has six books for the term.", ["claude"], 1, 0.35, 2),
  t("ent_weddings", ["Plans and deadlines", "Events", "Weddings"], "folder", "Lena's wedding is for Lena Delacroix and Omar Haddad on December 12 in Portland.", ["gemini", "chatgpt"], 2, 0.75, 0),
  t("ent_lena_wedding", ["Plans and deadlines", "Events", "Weddings", "Lena's wedding"], "event", "Lena's wedding is for Lena Delacroix and Omar Haddad on December 12 in Portland.", ["gemini", "chatgpt"], 2, 0.74, 3),
  t("ent_dana_wedding", ["Plans and deadlines", "Events", "Weddings", "Dana's wedding"], "event", "Dana's wedding is in Austin in May, and I need a gift.", ["chatgpt"], 1, 0.5, 2),
  t("ent_bank", ["Plans and deadlines", "Bank appointment"], "event", "Bank appointment is on Thursday at 9am.", ["claude"], 1, 0.62, 2),
  t("ent_montreal", ["Plans and deadlines", "Montreal trip"], "event", "The Montreal trip budget is $1,400 for 5 nights.", ["claude"], 1, 0.6, 3),
  t("ent_coffee", ["Plans and deadlines", "Coffee with Elena Lindqvist"], "event", "Coffee with Elena Lindqvist is on Monday at 10.", ["gemini"], 1, 0.4, 1),
  t("ent_lunch_lena", ["Plans and deadlines", "Lunch with Lena Delacroix"], "event", "Lunch with Lena Delacroix is on Saturday at noon.", ["chatgpt"], 1, 0.4, 1),
  t("ent_lisbon", ["Travel", "Lisbon trip"], "event", "The Lisbon trip is in March for six days.", ["chatgpt"], 2, 0.55, 3),
  t("ent_iris", ["People", "Iris Sato"], "person", "Iris Sato is my cofounder at Tidepool and writes the code.", ["gemini", "claude"], 3, 0.8, 3),
  t("ent_lena", ["People", "Lena Delacroix"], "person", "Lena Delacroix is my oldest friend from school.", ["gemini"], 2, 0.6, 2),
  t("ent_kim", ["People", "Prof. Kim"], "person", "Prof. Kim teaches DATA 100.", ["chatgpt"], 1, 0.45, 1),
  t("ent_nadia", ["People", "Nadia Reyes"], "person", "Nadia Reyes is my manager at Kestrel Analytics.", ["claude"], 2, 0.55, 2),
  t("ent_priya", ["People", "Priya Okafor"], "person", "Priya Okafor runs the design team at Kestrel.", ["claude"], 1, 0.4, 1),
  t("ent_elena", ["People", "Elena Lindqvist"], "person", "Elena Lindqvist is a mentor from my last job.", ["gemini"], 1, 0.4, 1),
  t("ent_caleb", ["People", "Caleb Moreau"], "person", "Caleb Moreau plays Tuesday soccer with me.", ["chatgpt"], 1, 0.35, 1),
  t("ent_answers", ["Preferences", "How you want answers"], "topic", "Keep answers short unless I ask for detail.", ["chatgpt", "claude"], 4, 0.9, 3),
  t("ent_style", ["Writing style", "Short warm sentences"], "topic", "When I write, I use short warm sentences and never use exclamation marks.", ["claude"], 3, 0.85, 2),
  t("ent_soccer", ["Hobbies and sports", "Tuesday soccer"], "topic", "I play soccer on Tuesdays at 7.", ["chatgpt"], 1, 0.35, 1),
  t("ent_tart", ["Food and drink", "Pear tart"], "topic", "The pear tart for Sunday needs four pears.", ["gemini"], 1, 0.3, 1),
  t("ent_heater", ["Home and living", "Broken heater"], "topic", "The landlord fixes the heater on Wednesday.", ["claude"], 1, 0.35, 1),
  t("ent_doctor", ["Health", "Doctor visit notes"], "topic", "Next checkup is in January.", ["gemini"], 1, 0.35, 1),
  t("ent_m54r1", ["School", "MATH 54", "Reading 1"], "task", "MATH 54 Reading 1 is chapter 2.", ["chatgpt"], 1, 0.3, 1),
  t("ent_m54r2", ["School", "MATH 54", "Reading 2"], "task", "MATH 54 Reading 2 is chapter 3.", ["chatgpt"], 1, 0.3, 1),
  t("ent_m54lab", ["School", "MATH 54", "Lab 1"], "task", "MATH 54 Lab 1 is on Friday.", ["gemini"], 1, 0.3, 1),
  t("ent_p137r1", ["School", "PHYS 137", "Reading 1"], "task", "PHYS 137 Reading 1 covers waves.", ["gemini"], 1, 0.3, 1),
  t("ent_p137ps1", ["School", "PHYS 137", "Problem Set 1"], "task", "PHYS 137 Problem Set 1 is due Sep 12.", ["gemini"], 1, 0.35, 2),
  t("ent_d100proj", ["School", "DATA 100", "Project 1"], "project", "DATA 100 Project 1 uses the housing data.", ["chatgpt"], 2, 0.45, 2),
  t("ent_hartmann", ["People", "Prof. Hartmann"], "person", "Prof. Hartmann teaches MATH 54.", ["chatgpt"], 1, 0.35, 1),
  t("ent_alvarez", ["People", "Prof. Alvarez"], "person", "Prof. Alvarez teaches PHYS 137.", ["gemini"], 1, 0.35, 1),
  t("ent_silas", ["People", "Silas Haddad"], "person", "Silas Haddad is Omar's brother.", ["gemini"], 1, 0.3, 1),
  t("ent_omar", ["People", "Omar Haddad"], "person", "Omar Haddad is marrying Lena in December.", ["gemini"], 1, 0.4, 1),
  t("ent_dana", ["People", "Dana Brooks"], "person", "Dana Brooks is a coworker getting married in May.", ["chatgpt"], 1, 0.35, 1),
  t("ent_orrinwood", ["Information", "Orrinwood"], "topic", "Orrinwood is the street the clinic is on.", ["claude"], 1, 0.3, 1),
  t("ent_sabletide", ["Information", "Sabletide"], "topic", "Sabletide is the data vendor Kestrel uses.", ["claude"], 1, 0.3, 2),
  t("ent_tesselcrest", ["Information", "Tesselcrest"], "topic", "Tesselcrest is a board game Iris likes.", ["gemini"], 1, 0.25, 1),
  t("ent_ferrostone", ["Information", "Ferrostone"], "topic", "Ferrostone makes the clinic tablets.", ["gemini"], 1, 0.25, 1),
  t("ent_flights", ["Travel", "Flight times for the trip"], "event", "The flight to Lisbon leaves at 7:40 am.", ["chatgpt"], 1, 0.4, 2),
  t("ent_github", ["Work", "GitHub handles for the team"], "topic", "The team's GitHub handles are in the shared doc.", ["chatgpt"], 1, 0.3, 1),
  t("ent_sparrowdb", ["Projects", "Software and apps", "Sparrowhawk", "Database upgrade"], "task", "Sparrowhawk moved to Postgres 16.", ["claude"], 2, 0.45, 2),
  t("ent_sparrowdonate", ["Projects", "Software and apps", "Sparrowhawk", "Donations"], "topic", "Sparrowhawk takes donations through Stripe.", ["claude"], 1, 0.35, 1),
  t("ent_counters", ["Projects", "Home projects", "Kitchen remodel", "Counters"], "task", "The counters are white oak.", ["gemini"], 1, 0.3, 1),
  t("ent_dinner", ["Food and drink", "Dinner ideas"], "topic", "I cook vegetarian on weeknights.", ["chatgpt"], 1, 0.3, 1),
  t("ent_birthday", ["Personal info", "Birthday"], "topic", "My birthday is March 3.", ["claude"], 1, 0.4, 1),
  t("ent_home_city", ["Personal info", "Berkeley"], "topic", "I live in Berkeley.", ["chatgpt", "claude"], 2, 0.5, 1),
  t("ent_tone", ["Preferences", "Tone"], "topic", "Keep a calm, direct tone.", ["claude"], 2, 0.5, 1),
];

/** The catalog's sections her memory uses, by id, as the Memory page names them. */
export const SECTIONS: Record<string, string> = {
  // In the graph's order: the first sits at the top and the rest follow clockwise, so Plans and deadlines sits to the left.
  personal: "Personal info",
  projects: "Projects",
  work: "Work",
  school: "School",
  knowledge: "Information",
  people: "People",
  travel: "Travel",
  hobbies: "Hobbies and sports",
  food: "Food and drink",
  home: "Home and living",
  plans: "Plans and deadlines",
  health: "Health",
  preferences: "Preferences",
  style: "Writing style",
};

export const SECTION_OF: Record<string, string> = Object.fromEntries(Object.entries(SECTIONS).map(([id, name]) => [name, id]));

/** What ChatGPT answers her interview draft, the first message of a page (tools/demo-video/memory/data.ts). */
export const SESSION_REPLIES: readonly string[] = [
  [
    "Here is a plan for your PearX interview, built on the prep you already did.",
    "",
    "1. Open with traction. Lead with the numbers from your answer, then say why now.",
    "2. Practice the hard questions. I will ask the partners’ likely questions one at a time.",
    "3. Tighten each answer. Aim for under a minute each, and end on the ask.",
    "",
    "Ready for the first question?",
  ].join("\n"),
];

/** What ChatGPT answers in her SkipDoodle chat, in turn. */
export const SKIPDOODLE_REPLIES: readonly string[] = [
  "Got it. SkipDoodle is your drawing game for kids, built with React Native and Expo, with Supabase storing the drawings. What are you working on today?",
  [
    "Here is how I would make that change in SkipDoodle:",
    "",
    "1. Add the new screen as its own Expo route.",
    "2. Keep the drawing state in one hook, so undo stays simple.",
    "3. Save to Supabase only when a drawing is finished.",
  ].join("\n"),
  "Right, the stack is React Native with Expo, and Supabase for storage. For this, Expo’s image tools will be the simplest path.",
];
