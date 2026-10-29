/**
 * Maya Collins's memory as the Smart context film shows it: what her
 * memory holds on PearX, Tidepool, SkipDoodle and the rest, in the shapes
 * the engine answers the strip with (packages/memory import-context). The
 * lines are the film's, from coere-v2's smart context corpus
 * (tools/gen-corpus/memory/context) and tools/demo-video/memory/data.ts;
 * each memory's id, path and the chats behind its lines are the ones her
 * memory file holds (bake.mts, data/maya.json). Made up.
 */
import maya from "./data/maya.json";

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

/** A memory of hers as the bake read it from her memory file: its id, its path, and the chats behind each of its lines. */
type Baked = { id: string; path: string[]; lines: { text: string; chats: string[] }[] };
const FEATURED = (maya as unknown as { featured: Record<string, Baked> }).featured;

/** A line as the block shows it, "(Claude, Oct 9, 2026)" and all, is found in her memory by its words. */
const said = (line: string): string => line.replace(/ \([A-Za-z]+, [A-Z][a-z]{2} \d+, \d{4}\)$/, "");

/** The chats behind the lines that go: "From N chats" counts these, once each. */
function chatsBehind(b: Baked, lines: readonly string[]): string[] {
  const chats = lines.flatMap((l) => b.lines.find((x) => x.text === said(l))?.chats ?? []);
  if (chats.length === 0) throw new Error(`no chats behind ${b.path.join(" / ")}`);
  return [...new Set(chats)];
}

/** A memory the strip shows; the AIs it came from are those of the chats behind its lines. */
const memory = (key: string, reason: Reason, lines: string[]): Memory => {
  const b = FEATURED[key]!;
  const chats = chatsBehind(b, lines);
  const sources = [...new Set(chats.map((c) => c.split(":")[0] as Platform))];
  return {
    node: { id: b.id, path: b.path, reason, sources, chats, tokens: Math.ceil((b.path.join(" / ").length + lines.join("\n").length) / 3.6), changedOnly: false, version: `v1-${b.id}` },
    lines,
  };
};

/** Who she is, her core pack's lines, from the many chats that said them. */
export const ABOUT_ME: Memory = {
  node: { id: "core", path: ["About me"], reason: "standing", sources: [], chats: (maya as unknown as { about: string[] }).about, tokens: 0, changedOnly: false, version: "v1-core" },
  lines: [
    "I work at Kestrel Analytics as a lead research assistant.",
    "My name is Maya Collins.",
    "My employer is Kestrel Analytics.",
    "When I write, I use short warm sentences and never use exclamation marks.",
    "Working on Tidepool.",
    "Working on Sparrowhawk.",
    "Working on Kitchen remodel.",
  ],
};
ABOUT_ME.node.tokens = Math.ceil(ABOUT_ME.lines.join("\n").length / 3.6);

export const PEARX = memory("pearx", "name", [
  "The PearX interview is on November 4 at 2 pm over video. (Claude, Oct 9, 2026)",
  "I want my PearX interview answer on why now to mention the records move. (ChatGPT, Oct 19, 2026)",
  "My PearX interview answer on traction should lead with the 1,200 weekly users. (ChatGPT, Oct 19, 2026)",
  "They told me the PearX interview will cover traction, the team and why now. (Claude, Oct 9, 2026)",
  "The PearX interview is the partner round with two partners. (Claude, Oct 9, 2026)",
  "My PearX interview is for Tidepool, my startup. (Claude, Oct 9, 2026)",
]);

export const TIDEPOOL = memory("tidepool", "linked", [
  "Tidepool has 1,200 weekly users across four clinics. (Gemini, Aug 30, 2026)",
  "Tidepool books patients for small clinics without phone calls. (Gemini, Aug 30, 2026)",
  "The Tidepool team is me and my cofounder Iris Sato, who writes the code. (Gemini, Aug 30, 2026)",
  "Tidepool is in a paid pilot and raised a 150,000 dollar pre seed. (Gemini, Aug 30, 2026)",
]);

export const LAUNCH_TALK = memory("launch", "keyword", [
  "Keep the Tidepool launch day talk under three minutes and end on the ask. (Claude, Sep 29, 2026)",
  "The Tidepool launch day talk is for Tidepool investors on December 2. (Claude, Sep 29, 2026)",
]);

export const STRIPE = memory("stripe", "keyword", [
  "I applied to Stripe for the data analyst role. (Claude, Sep 12, 2026)",
]);

export const SKIPDOODLE = memory("skipdoodle", "name", [
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
