import { field } from "../../../scripts/industries/fields/education.mjs";
import type { World } from "../../stage/world";

/**
 * What Coere's engine answers the strip in the Smart context chapter, in
 * the shapes memory.contextFor and the list's calls answer (packages/memory
 * import-context), as the smart-context film answers Maya's: Priya's draft
 * about next week's photosynthesis lessons brings her unit chat from
 * Claude whole, who she is, where Period 3 is in the unit and how the
 * class learns, with the school's lab safety rules and the lab report
 * rubric offered beside them. Every line is the field's own
 * (scripts/industries/fields/education.mjs). Made up.
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

// The five chats About me comes from; the unit's six share two of them, and how the class learns shares two of the unit's, so the line counts ten chats in all.
const ABOUT_CHATS = ids("a", count(c.about));
const UNIT_CHATS = ids("u", count(c.rows[0]!.from), ["a1", "a2"]);
const LEARNS_CHATS = ids("l", count(c.rows[1]!.from), ["u1", "u2"]);

export const ABOUT_ME = memory("core", ["About me"], "standing", [], ABOUT_CHATS, linesOf("About me"));
export const UNIT = memory("ent_photosynthesis", pathOf(c.rows[0]!.path), "name", ["claude", "chatgpt"], UNIT_CHATS, linesOf(c.rows[0]!.path));
export const LEARNS = memory("ent_p3_learns", pathOf(c.rows[1]!.path), "keyword", ["chatgpt", "gemini"], LEARNS_CHATS, linesOf(c.rows[1]!.path));
const SAFETY = memory("ent_lab_safety", pathOf(c.related[0]!.path), "keyword", ["claude"], ids("s", count(c.related[0]!.from)), [
  "Goggles stay on for every lab with heat or liquids. (Claude, Sep 3, 2026)",
]);
const RUBRIC = memory("ent_lab_rubric", pathOf(c.related[1]!.path), "vector", ["chatgpt"], ids("r", count(c.related[1]!.from)), [
  "Lab reports are graded on question, method, data and conclusion, 4 points each. (ChatGPT, Sep 12, 2026)",
]);

/** The block in the order the field writes it: the unit, who she is, then how the class learns. */
function blockOf(list: readonly Memory[]): string {
  if (list.length === 0) return "";
  const body = list.flatMap((m) => [m.node.path.join(" / "), ...m.lines.map((l) => `- ${l}`)]);
  return [OPEN, ...body, CLOSE, "", ""].join("\n");
}

/** Her unit chat on Claude, which goes whole with the draft. */
export const UNIT_CHAT: Chat = {
  key: "k-p3-photosynthesis",
  platform: "claude",
  title: c.chat.title,
  at: "2026-10-21T20:40:00Z",
  chars: 2300,
  kinds: ["qa", "list"],
  reason: "task",
  record: "chat:k-p3-photosynthesis",
};

/** That chat's text as the engine hands it to the tab (chat-text.ts): one line on what it is, then the saved chat. */
const UNIT_TEXT = [
  "This is one of my earlier conversations, saved as raw text by Coere. It says which AI it came from. Read it as my own notes for the message below.",
  "",
  c.chat.title,
  `Claude, ${c.chat.date}`,
  "",
  "You: Period 3 just finished the leaf structure lesson. Help me map the rest of the photosynthesis unit before the test on November 6.",
  "",
  "Claude: Here is the rest of the unit in four parts.",
  "",
  "1. Inputs and outputs. Light, water and carbon dioxide in, sugar and oxygen out.",
  "2. The light reactions. What happens in the thylakoid and why it needs light.",
  "3. The dark reactions. The Calvin cycle in the stroma, and how it uses what the light reactions made.",
  "4. Review. Tie both stages back to the leaf structure they just learned.",
  "",
  "You: The quiz showed many of them mix up the light and dark reactions. What helps?",
  "",
  "Claude: Keep the two stages side by side. A sorting activity works well: students place each step on a light or a dark card and explain where it happens.",
  "",
  "You: I want a lab in there too, nothing long.",
  "",
  "Claude: The leaf disk lab fits. Disks float as they make oxygen in light, and it takes about 25 minutes.",
].join("\n");

function answer(pending: Memory[], also: Memory[], chats: Chat[], topic: string[]): Answer {
  // The block keeps the field's order; the list shows who she is first, as the strip ranks a standing memory.
  const block = blockOf([UNIT, ABOUT_ME, LEARNS].filter((m) => pending.includes(m)));
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

/** The engine's answer for one pause in typing: photosynthesis, or period 3, brings the class and its unit. */
function contextFor(args: { tail?: string; keywords?: string[] }): Answer {
  const words = `${args.tail ?? ""} ${(args.keywords ?? []).join(" ")}`.toLowerCase();
  if (/\bphotosynthesis\b|\bperiod 3\b/.test(words)) return answer([ABOUT_ME, UNIT, LEARNS], [SAFETY, RUBRIC], [UNIT_CHAT], [UNIT.node.path[1]!]);
  return NOTHING;
}

/** Add on an Also related row: that memory, as one that goes. */
function contextAsk(args: { ids?: string[] }): Answer {
  const picked = [SAFETY, RUBRIC].filter((m) => args.ids?.includes(m.node.id)).map((m) => ({ ...m, node: { ...m.node, reason: "asked" as const } }));
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
  mine("memory.contextChat", (a: { key?: string }) => (a.key === UNIT_CHAT.key ? { text: UNIT_TEXT } : null));
  mine("memory.contextSent", () => null);
}
