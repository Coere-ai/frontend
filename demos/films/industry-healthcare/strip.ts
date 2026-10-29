import { field } from "../../../scripts/industries/fields/healthcare.mjs";
import type { World } from "../../stage/world";

/**
 * Amara's own memory as Coere Connect's strip reads it on ChatGPT, in the
 * shapes the engine answers it with (packages/memory import-context), as
 * the smart-context film answers Maya's: her monitoring visit draft brings
 * her earlier "Dunmore site visit prep" chat whole, who she is, and what
 * she knows about Dunmore Cardiology's HEART-2 study and its open queries,
 * with the company's monitoring procedures and amendment 3 offered beside
 * them. Words and dates are the field's (scripts/industries/fields/healthcare.mjs).
 * Operations only: no participant's details are ever in memory.
 */

type Platform = "chatgpt" | "claude" | "gemini";
type Reason = "name" | "both" | "keyword" | "vector" | "asked" | "standing" | "linked";

type Node = { id: string; path: string[]; reason: Reason; sources: Platform[]; chats: string[]; tokens: number; changedOnly: boolean; version: string };
type Chat = { key: string; platform: Platform; title: string; at: string; chars: number; kinds: ("qa" | "script" | "list" | "code" | "draft")[]; reason: "task" | "asked"; record: string };
type Answer = { pending: Node[]; also: Node[]; topic: string[]; tokens: number; sources: Platform[]; chats: Chat[]; block: string };
type Memory = { node: Node; lines: string[] };

const OPEN = "[Context from Coere, my saved memory. Use it if it helps.]";
const CLOSE = "[End of context from Coere]";
const c = field.context;

const ids = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}${i + 1}`);

const memory = (id: string, path: string[], reason: Reason, sources: Platform[], chats: string[], lines: string[]): Memory => ({
  node: { id, path, reason, sources, chats, tokens: Math.ceil((path.join(" / ").length + lines.join("\n").length) / 3.6), changedOnly: false, version: `v1-${id}` },
  lines,
});

const linesOf = (path: string) => c.sections.find((s) => s.path === path)?.facts ?? [];
const pathOf = (path: string) => path.split(" / ");

/** "From 5 chats", "From 7 chats" and "From 3 chats" in the list, and 12 chats in all on the line with the prep chat. */
const ABOUT_ME = memory("core", ["About me"], "standing", [], ids("a", 5), linesOf("About me"));
const STUDY = memory("ent_heart2", pathOf(c.rows[0].path), "name", ["chatgpt", "claude"], ["a1", ...ids("h", 6)], linesOf(c.rows[0].path));
const QUERIES = memory("ent_queries", pathOf(c.rows[1].path), "keyword", ["gemini"], ["h1", "h2", "q1"], linesOf(c.rows[1].path));
const MONITORING = memory("ent_monitoring", pathOf(c.related[0].path), "keyword", ["claude"], ["m1", "m2"], [
  "Every monitoring visit ends with one findings email within five working days. (Claude, Sep 30, 2026)",
]);
const AMENDMENT = memory("ent_amendment3", pathOf(c.related[1].path), "keyword", ["claude", "chatgpt"], ["p1", "p2"], [
  "Every site retrains its staff on protocol amendment 3 before its next visit. (Claude, Sep 25, 2026)",
]);

/** Her earlier chat with ChatGPT about the visit, which goes whole with the draft. */
const PREP_CHAT: Chat = {
  key: "k-dunmore-prep",
  platform: "chatgpt",
  title: c.chat.title,
  at: "2026-10-21T16:20:00Z",
  chars: 1900,
  kinds: ["qa", "list"],
  reason: "task",
  record: "chat:k-dunmore-prep",
};

/** That chat's text as the engine hands it to the tab (chat-text.ts): one line on what it is, then the saved chat. */
const PREP_CHAT_TEXT = [
  "This is one of my earlier conversations, saved as raw text by Coere. It says which AI it came from. Read it as my own notes for the message below.",
  "",
  c.chat.title,
  `ChatGPT, ${c.chat.date}`,
  "",
  "You: The Dunmore monitoring visit is on November 4 and 5. What should the visit cover?",
  "",
  "ChatGPT: For a two day visit, plan it like this.",
  "",
  "Day one: source document review against the case report forms.",
  "Day two: consent forms, the delegation log, training records and lab kit stock.",
  "",
  "You: What should I ask the site to send before the visit?",
  "",
  "ChatGPT: Ask for three things a week ahead.",
  "1. The training log for protocol amendment 3.",
  "2. Answers to the oldest open data queries.",
  "3. The current consent form version in use.",
  "",
  "You: Keep the agenda to one page for Joel.",
  "",
  "ChatGPT: Done. One page, two days, with the document list at the end.",
].join("\n");

function blockOf(list: readonly Memory[]): string {
  if (list.length === 0) return "";
  const body = list.flatMap((m) => [m.node.path.join(" / "), ...m.lines.map((l) => `- ${l}`)]);
  return [OPEN, ...body, CLOSE, "", ""].join("\n");
}

/**
 * The answer for her draft: the list shows About me first, as a standing
 * memory, and the block reads the study first, as the field's sent
 * message has it.
 */
function answer(pending: Memory[], also: Memory[] = [], chats: Chat[] = [], topic: string[] = []): Answer {
  const order = [STUDY, ABOUT_ME, QUERIES].filter((m) => pending.includes(m));
  const block = blockOf(order);
  return {
    pending: pending.map((m) => m.node),
    also: also.map((m) => m.node),
    topic,
    tokens: Math.ceil(block.length / 3.6),
    sources: [...new Set(pending.flatMap((m) => m.node.sources))],
    chats,
    block,
  };
}

const NOTHING = answer([]);

/** The engine's answer for one pause in typing: the visit, or Dunmore, brings it all. */
function contextFor(args: { tail?: string; keywords?: string[] }): Answer {
  const words = `${args.tail ?? ""} ${(args.keywords ?? []).join(" ")}`.toLowerCase();
  if (/\bdunmore\b|\bmonitoring visit\b/.test(words)) return answer([ABOUT_ME, STUDY, QUERIES], [MONITORING, AMENDMENT], [PREP_CHAT], ["Dunmore Cardiology"]);
  return NOTHING;
}

/** Answers the strip's calls from the Coere Connect tab; `tab` names it. */
export function answerStrip(world: World, tab: string, other: (method: string, m: unknown, from: string) => unknown): void {
  const mine = (method: string, fn: (args: never) => unknown) =>
    world.engine(method, (m, from) => (from === tab ? fn((m.args ?? {}) as never) : other(method, m, from)));
  mine("memory.contextFor", contextFor);
  mine("memory.contextAsk", () => NOTHING);
  mine("memory.contextDeeper", () => NOTHING);
  mine("memory.contextMore", () => ({ chats: [], nodes: [] }));
  mine("memory.contextGraph", () => ({ nodes: [], more: 0 }));
  mine("memory.contextFind", () => ({ results: [], lit: [] }));
  mine("memory.contextRelated", () => NOTHING);
  mine("memory.contextChat", (a: { key?: string }) => (a.key === PREP_CHAT.key ? { text: PREP_CHAT_TEXT } : null));
  mine("memory.contextSent", () => null);
}

/** What ChatGPT answers her draft, streamed. */
export const CONTEXT_REPLY = [c.answer.intro, "", c.answer.steps, "", c.answer.close].join("\n");
