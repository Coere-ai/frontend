import { field } from "../../../scripts/industries/fields/legal.mjs";
import type { World } from "../../stage/world";

/**
 * What Coere's engine answers the strip in the Smart context chapter, in
 * the shapes memory.contextFor and the list's calls answer (packages/memory
 * import-context), as the smart-context film answers Maya's: Nina's draft
 * about the Mendes deposition brings her outline chat whole, who she is,
 * the case and its key witnesses, with the firm's deposition practice and
 * the damages work offered beside them. Every line is the field's own
 * (scripts/industries/fields/legal.mjs). Made up.
 */

type Platform = "chatgpt" | "claude" | "gemini";
type Reason = "name" | "both" | "keyword" | "vector" | "asked" | "standing" | "linked";

type Node = { id: string; path: string[]; reason: Reason; sources: Platform[]; chats: string[]; tokens: number; changedOnly: boolean; version: string };
type Chat = { key: string; platform: Platform; title: string; at: string; chars: number; kinds: ("qa" | "script" | "list" | "code" | "draft")[]; reason: "task" | "asked"; record: string };
type Answer = { pending: Node[]; also: Node[]; topic: string[]; tokens: number; sources: Platform[]; chats: Chat[]; block: string };
type Memory = { node: Node; lines: string[] };

const c = field.context;
const OPEN = "[Context from Coere, my saved memory. Use it if it helps.]";
const CLOSE = "[End of context from Coere]";

/** "From 4 chats" as a count. */
const count = (from: string): number => Number(/\d+/.exec(from)?.[0] ?? 1);
/** Chat ids for a row, drawn from one pool so rows that share chats count them once. */
const ids = (prefix: string, n: number, shared: string[] = []): string[] => [...shared, ...Array.from({ length: Math.max(0, n - shared.length) }, (_, i) => `${prefix}${i + 1}`)].slice(0, n);

const memory = (id: string, path: string[], reason: Reason, sources: Platform[], chats: string[], lines: string[]): Memory => ({
  node: { id, path, reason, sources, chats, tokens: Math.ceil((path.join(" / ").length + lines.join("\n").length) / 3.6), changedOnly: false, version: `v1-${id}` },
  lines,
});

const linesOf = (path: string): string[] => c.sections.find((s) => s.path === path)?.facts ?? [];
const pathOf = (p: string): string[] => p.split(" / ");

// The six chats About me comes from; the case's four share two of them, and the witnesses' two are two of the case's, so the line counts eight chats in all.
const ABOUT_CHATS = ids("a", count(c.about));
const CASE_CHATS = ids("h", count(c.rows[0]!.from), ["a1", "a2"]);
const WITNESS_CHATS = ids("w", count(c.rows[1]!.from), ["h1", "h2"]);

export const ABOUT_ME = memory("core", ["About me"], "standing", [], ABOUT_CHATS, linesOf("About me"));
export const CASE = memory("ent_briarstone", pathOf(c.rows[0]!.path), "name", ["claude", "chatgpt"], CASE_CHATS, linesOf(c.rows[0]!.path));
export const WITNESSES = memory("ent_witnesses", pathOf(c.rows[1]!.path), "keyword", ["chatgpt", "claude"], WITNESS_CHATS, linesOf(c.rows[1]!.path));
const PRACTICE = memory("ent_practice", pathOf(c.related[0]!.path), "keyword", ["claude"], ids("p", count(c.related[0]!.from)), [
  "Every deposition outline starts with the witness's role and who they reported to. (Claude, Sep 10, 2026)",
]);
const DAMAGES = memory("ent_damages", pathOf(c.related[1]!.path), "vector", ["chatgpt"], ids("d", count(c.related[1]!.from)), [
  "Hartwell claims lost contracts from the late March deliveries. (ChatGPT, Oct 7, 2026)",
]);

/** The block in the order the field writes it: the case, who she is, then the witnesses. */
function blockOf(list: readonly Memory[]): string {
  if (list.length === 0) return "";
  const body = list.flatMap((m) => [m.node.path.join(" / "), ...m.lines.map((l) => `- ${l}`)]);
  return [OPEN, ...body, CLOSE, "", ""].join("\n");
}

/** Her outline chat, which goes whole with the draft. */
export const OUTLINE: Chat = {
  key: "k-hartwell-outline",
  platform: "chatgpt",
  title: c.chat.title,
  at: "2026-10-21T21:10:00Z",
  chars: 2100,
  kinds: ["qa", "list"],
  reason: "task",
  record: "chat:k-hartwell-outline",
};

/** That chat's text as the engine hands it to the tab (chat-text.ts): one line on what it is, then the saved chat. */
const OUTLINE_TEXT = [
  "This is one of my earlier conversations, saved as raw text by Coere. It says which AI it came from. Read it as my own notes for the message below.",
  "",
  c.chat.title,
  `ChatGPT, ${c.chat.date}`,
  "",
  "You: Help me outline the deposition of Carl Mendes, Briarstone's former dispatch lead. Keep the questions short and plain.",
  "",
  "ChatGPT: Here is an outline in four parts.",
  "",
  "1. Background. His role from 2023 to 2026, who he reported to, and what dispatch software he used.",
  "2. The outage. When it started, when he first heard of it, and who he told.",
  "3. Exhibit 14. The March 6 email where he calls the outage a known issue. Walk him through it line by line.",
  "4. Billing. Whether anyone changed the rates charged to Hartwell once the outage was known.",
  "",
  "You: Which documents should I have marked?",
  "",
  "ChatGPT: Exhibit 14, the March dispatch logs once Hartwell sends them, and the March invoices to Hartwell. Mark them before the day so the court reporter has copies.",
  "",
  "You: What will opposing counsel object to?",
  "",
  "ChatGPT: Expect form objections on any compound question, and a privilege objection if you ask about talks with Briarstone's lawyers. Keep each question to one fact.",
].join("\n");

function answer(pending: Memory[], also: Memory[], chats: Chat[], topic: string[]): Answer {
  // The block keeps the field's order; the list shows who she is first, as the strip ranks a standing memory.
  const block = blockOf([CASE, ABOUT_ME, WITNESSES].filter((m) => pending.includes(m)));
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

const NOTHING: Answer = { pending: [], also: [], topic: [], tokens: 0, sources: [], chats: [], block: "" };

/** The engine's answer for one pause in typing: the deposition, or Mendes, brings the case. */
function contextFor(args: { tail?: string; keywords?: string[] }): Answer {
  const words = `${args.tail ?? ""} ${(args.keywords ?? []).join(" ")}`.toLowerCase();
  if (/\bdeposition\b|\bmendes\b/.test(words)) return answer([ABOUT_ME, CASE, WITNESSES], [PRACTICE, DAMAGES], [OUTLINE], [CASE.node.path.at(-1)!]);
  return NOTHING;
}

/** Add on an Also related row: that memory, as one that goes. */
function contextAsk(args: { ids?: string[] }): Answer {
  const picked = [PRACTICE, DAMAGES].filter((m) => args.ids?.includes(m.node.id)).map((m) => ({ ...m, node: { ...m.node, reason: "asked" as const } }));
  return picked.length ? { ...answer([], [], [], []), pending: picked.map((m) => m.node), block: blockOf(picked) } : NOTHING;
}

/** The answer ChatGPT streams once the context is in front of the draft. */
export const REPLY = [c.answer.intro, "", c.answer.steps, "", c.answer.close].join("\n");

/** Answers the strip for the tab named `tab`; other tabs fall through to `other`. */
export function answerContext(world: World, tab: string, other: (method: string, m: { args?: unknown }, tab: string) => unknown): void {
  const mine = (method: string, fn: (args: never) => unknown) =>
    world.engine(method, (m, from) => (from === tab ? fn((m.args ?? {}) as never) : other(method, m, from)));
  mine("memory.contextFor", contextFor);
  mine("memory.contextAsk", contextAsk);
  mine("memory.contextDeeper", () => NOTHING);
  mine("memory.contextMore", () => ({ chats: [], nodes: [] }));
  mine("memory.contextChat", (a: { key?: string }) => (a.key === OUTLINE.key ? { text: OUTLINE_TEXT } : null));
  mine("memory.contextSent", () => null);
}
