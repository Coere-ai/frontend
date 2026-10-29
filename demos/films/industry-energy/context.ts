import { field } from "../../../demos/industries/fields/energy.mjs";
import type { World } from "../../stage/world";

/**
 * What Coere's engine answers the strip in the Smart context chapter, in
 * the shapes memory.contextFor and the list's calls answer (packages/memory
 * import-context), as the smart-context film answers Maya's: Hannah's
 * draft about the turbine 14 gearbox job brings her gearbox chat whole,
 * who she is, the turbine and the site's access rules, with the company's
 * lockout steps and crane bookings offered beside them. Every line is the
 * field's own (demos/industries/fields/energy.mjs). Made up.
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

// The four chats About me comes from, the turbine's six and the site's three, two of them the turbine's, so the line counts eleven chats in all.
const ABOUT_CHATS = ids("a", count(c.about));
const TURBINE_CHATS = ids("t", count(c.rows[0]!.from));
const ACCESS_CHATS = ids("s", count(c.rows[1]!.from), ["t1", "t2"]);

export const ABOUT_ME = memory("core", ["About me"], "standing", [], ABOUT_CHATS, linesOf("About me"));
export const TURBINE = memory("ent_turbine14", pathOf(c.rows[0]!.path), "name", ["claude", "chatgpt"], TURBINE_CHATS, linesOf(c.rows[0]!.path));
export const ACCESS = memory("ent_site_access", pathOf(c.rows[1]!.path), "keyword", ["gemini", "chatgpt"], ACCESS_CHATS, linesOf(c.rows[1]!.path));
const LOCKOUT = memory("ent_lockout", pathOf(c.related[0]!.path), "keyword", ["claude"], ids("l", count(c.related[0]!.from)), [
  "Every turbine is locked out at the base and in the nacelle before work starts. (Claude, Aug 12, 2026)",
]);
const CRANES = memory("ent_cranes", pathOf(c.related[1]!.path), "vector", ["claude"], ids("k", count(c.related[1]!.from)), [
  "Cranes are booked through Hollis Lifting with two weeks' notice. (Claude, Oct 20, 2026)",
]);

/** The block in the order the field writes it: the turbine, who she is, then the site's access. */
function blockOf(list: readonly Memory[]): string {
  if (list.length === 0) return "";
  const body = list.flatMap((m) => [m.node.path.join(" / "), ...m.lines.map((l) => `- ${l}`)]);
  return [OPEN, ...body, CLOSE, "", ""].join("\n");
}

/** Her gearbox chat, which goes whole with the draft. */
export const GEARBOX: Chat = {
  key: "k-altamont-t14-gearbox",
  platform: "chatgpt",
  title: c.chat.title,
  at: "2026-10-22T22:40:00Z",
  chars: 2200,
  kinds: ["qa", "list"],
  reason: "task",
  record: "chat:k-altamont-t14-gearbox",
};

/** That chat's text as the engine hands it to the tab (chat-text.ts): one line on what it is, then the saved chat. */
const GEARBOX_TEXT = [
  "This is one of my earlier conversations, saved as raw text by Coere. It says which AI it came from. Read it as my own notes for the message below.",
  "",
  c.chat.title,
  `ChatGPT, ${c.chat.date}`,
  "",
  "You: The oil sample from turbine 14 at Altamont came back with metal particles. What does that tell us about the gearbox?",
  "",
  "ChatGPT: Metal in the oil most often means a bearing is wearing. With the vibration you saw rise in September, the high speed shaft bearing is the first place to look.",
  "",
  "1. Pull a second oil sample to confirm the reading.",
  "2. Run a borescope through the inspection port before you open the gearbox.",
  "3. Have a spare bearing on site, so one crane visit covers the swap.",
  "",
  "You: The crane is booked from November 3 to 7. Is one week enough?",
  "",
  "ChatGPT: For a bearing swap, yes, if the wind allows. Plan two days of margin for wind holds, and check the bearing first thing so the crane is not waiting.",
  "",
  "You: Ray wants the plan by October 30.",
  "",
  "ChatGPT: Then send him the day by day plan with the lockout steps, the lift plan and the wind limits, and ask him to confirm the site briefing on November 3.",
].join("\n");

function answer(pending: Memory[], also: Memory[], chats: Chat[], topic: string[]): Answer {
  // The block keeps the field's order; the list shows who she is first, as the strip ranks a standing memory.
  const block = blockOf([TURBINE, ABOUT_ME, ACCESS].filter((m) => pending.includes(m)));
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

/** The engine's answer for one pause in typing: the gearbox, or turbine 14, brings the turbine and its site. */
function contextFor(args: { tail?: string; keywords?: string[] }): Answer {
  const words = `${args.tail ?? ""} ${(args.keywords ?? []).join(" ")}`.toLowerCase();
  if (/\bgearbox\b|\bturbine 14\b|\baltamont\b/.test(words)) return answer([ABOUT_ME, TURBINE, ACCESS], [LOCKOUT, CRANES], [GEARBOX], [TURBINE.node.path[1]!]);
  return NOTHING;
}

/** Add on an Also related row: that memory, as one that goes. */
function contextAsk(args: { ids?: string[] }): Answer {
  const picked = [LOCKOUT, CRANES].filter((m) => args.ids?.includes(m.node.id)).map((m) => ({ ...m, node: { ...m.node, reason: "asked" as const } }));
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
  mine("memory.contextChat", (a: { key?: string }) => (a.key === GEARBOX.key ? { text: GEARBOX_TEXT } : null));
  mine("memory.contextSent", () => null);
}
