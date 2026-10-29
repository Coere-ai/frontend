import { field } from "../../../scripts/industries/fields/finance.mjs";

/**
 * Daniel's own memory as the Smart context strip reads it in the first
 * chapter (the shapes of demos/films/smart-context/data.ts and
 * packages/memory import-context): his review prep chat goes whole, About
 * me goes with the first message, and the Lindqvist household's goals and
 * accounts go because the draft names Elena; the firm's rebalancing rules
 * and the household's tax plan are related. The words are the field's
 * (scripts/industries/fields/finance.mjs).
 */

type Platform = "chatgpt" | "claude" | "gemini";
type Reason = "name" | "both" | "keyword" | "vector" | "asked" | "standing" | "linked";

export type Node = { id: string; path: string[]; reason: Reason; sources: Platform[]; chats: string[]; tokens: number; changedOnly: boolean; version: string };
export type Chat = { key: string; platform: Platform; title: string; at: string; chars: number; kinds: ("qa" | "script" | "list" | "code" | "draft")[]; reason: "task" | "asked"; record: string };
export type Answer = { pending: Node[]; also: Node[]; topic: string[]; tokens: number; sources: Platform[]; chats: Chat[]; block: string };

const OPEN = "[Context from Coere, my saved memory. Use it if it helps.]";
const CLOSE = "[End of context from Coere]";
const ctx = field.context;
const sectionOf = (path: string) => ctx.sections.find((s: { path: string }) => s.path === path)!;

const node = (id: string, path: string, reason: Reason, sources: Platform[], chats: string[]): Node => {
  const facts = sectionOf(path)?.facts ?? [];
  return { id, path: path.split(" / "), reason, sources, chats, tokens: Math.ceil((path.length + facts.join("\n").length) / 3.6), changedOnly: false, version: `v1-${id}` };
};

// Eleven chats in all behind what goes: five for About me, six for the goals, three for the accounts, some shared.
const ABOUT = node("core", "About me", "standing", [], ["d1", "d2", "d3", "d4", "d5"]);
const GOALS = node("ent_lq_goals", ctx.rows[0].path, "name", ["claude", "chatgpt"], ["l1", "l2", "l3", "l4", "d4", "d5"]);
const ACCOUNTS = node("ent_lq_accounts", ctx.rows[1].path, "keyword", ["chatgpt", "gemini"], ["l5", "l6", "l1"]);
const REBALANCING: Node = { id: "ent_rebalancing", path: ctx.related[0].path.split(" / "), reason: "vector", sources: ["claude"], chats: ["r1", "r2"], tokens: 60, changedOnly: false, version: "v1-reb" };
const TAX: Node = { id: "ent_lq_tax", path: ctx.related[1].path.split(" / "), reason: "linked", sources: ["claude"], chats: ["t1", "t2"], tokens: 48, changedOnly: false, version: "v1-tax" };

/** The block in the field's order, one path line each and its memory lines (render.ts). */
const BLOCK = [OPEN, ...ctx.sections.flatMap((s: { path: string; facts: string[] }) => [s.path, ...s.facts.map((f) => `- ${f}`)]), CLOSE, "", ""].join("\n");

/** His earlier ChatGPT chat about the review, which goes whole with the draft. */
export const PREP_CHAT: Chat = {
  key: "k-lindqvist-prep",
  platform: "chatgpt",
  title: ctx.chat.title,
  at: "2026-10-22T16:40:00Z",
  chars: 1900,
  kinds: ["qa", "list"],
  reason: "task",
  record: "chat:k-lindqvist-prep",
};

/** That chat's text as the engine hands it to the tab (chat-text.ts). */
export const PREP_CHAT_TEXT = [
  "This is one of my earlier conversations, saved as raw text by Coere. It says which AI it came from. Read it as my own notes for the message below.",
  "",
  ctx.chat.title,
  `ChatGPT, ${ctx.chat.date}`,
  "",
  "You: Elena Lindqvist's annual review is next week. What changed since last year?",
  "",
  "ChatGPT: Three things changed. Her portfolio drifted to 68 percent stocks against a 60 percent target. Her daughter starts college in fall 2027. And she told you in October that the spring drop made her uneasy.",
  "",
  "You: What should I bring to the meeting?",
  "",
  "ChatGPT: 1. A one page view of the drift and the trades that bring it back to 60 percent.",
  "2. Her 2029 retirement plan against today's numbers.",
  "3. The 529 balance and what college will need.",
  "4. A short list of questions on her new employer's pension.",
  "",
  "You: She asked for fewer trades last time. How do I show the rebalance?",
  "",
  "ChatGPT: Show it as one set of trades, not many. Say what moves from stocks to bonds, why it brings her back to 60 percent, and that you will send a plain note once it is done. Lead with her worry about the spring drop, then the plan.",
  "",
  "You: And the college money?",
  "",
  "ChatGPT: The 529 plan holds 41,000 dollars with two years to go. Ask whether she wants to keep adding each month, and how much of the first year she hopes it covers.",
].join("\n");

export const PREP_ANSWER: Answer = {
  pending: [ABOUT, GOALS, ACCOUNTS],
  also: [REBALANCING, TAX],
  topic: [GOALS.path.at(-1)!, ACCOUNTS.path.at(-1)!],
  tokens: Math.ceil(BLOCK.length / 3.6),
  sources: ["claude", "chatgpt", "gemini"],
  chats: [PREP_CHAT],
  block: BLOCK,
};

export const NOTHING: Answer = { pending: [], also: [], topic: [], tokens: 0, sources: [], chats: [], block: "" };

/** What ChatGPT answers the draft: the field's agenda, built on what goes. */
export const PREP_REPLY = [ctx.answer.intro, "", ctx.answer.steps, "", ctx.answer.close].join("\n");
