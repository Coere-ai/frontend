import { field } from "../../../scripts/industries/fields/manufacturing.mjs";

/**
 * Coere Connect on ChatGPT for Luis (field.context): his question on the
 * Line 3 torque faults brings his earlier fault chat, who he is, and what
 * his memory holds on Line 3's faults and equipment, with preventive
 * maintenance and the shift handover notes offered beside them. Answered
 * in the shapes the engine gives the strip (packages/memory
 * import-context), as demos/films/smart-context answers it.
 */

type Platform = "chatgpt" | "claude" | "gemini";
type Reason = "name" | "both" | "keyword" | "vector" | "asked" | "standing" | "linked";
type Node = { id: string; path: string[]; reason: Reason; sources: Platform[]; chats: string[]; tokens: number; changedOnly: boolean; version: string };
type Chat = { key: string; platform: Platform; title: string; at: string; chars: number; kinds: ("qa" | "script" | "list" | "code" | "draft")[]; reason: "task" | "asked"; record: string };
type Memory = { node: Node; lines: string[] };

const C = field.context;
export const DRAFT = C.draft as string;
const OPEN = "[Context from Coere, my saved memory. Use it if it helps.]";
const CLOSE = "[End of context from Coere]";

/** "From 7 chats" as a count. */
const count = (from: string) => Number(/\d+/.exec(from)![0]);
/** The lines a section of the field puts in the block. */
const linesOf = (path: string) => (C.sections as { path: string; facts: string[] }[]).find((s) => s.path === path)?.facts ?? [];

const memory = (id: string, path: string, reason: Reason, sources: Platform[], chats: string[], lines: string[]): Memory => ({
  node: { id, path: path.split(" / "), reason, sources, chats, tokens: Math.ceil((path.length + lines.join("\n").length) / 3.6), changedOnly: false, version: `v1-${id}` },
  lines,
});

const ids = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}${i + 1}`);

// The chats behind each: About me's four, the faults' six (two shared with About me) and the equipment's three make eleven.
const ABOUT_ME = memory("core", "About me", "standing", [], ids("a", count(C.about)), linesOf("About me"));
const [faultsRow, equipmentRow] = C.rows as { path: string; from: string }[];
const FAULTS = memory("ent_faults", faultsRow!.path, "name", ["claude", "chatgpt"], [...ids("f", count(faultsRow!.from) - 2), "a1", "a2"], linesOf(faultsRow!.path));
const EQUIPMENT = memory("ent_equipment", equipmentRow!.path, "keyword", ["gemini", "chatgpt"], ids("e", count(equipmentRow!.from)), linesOf(equipmentRow!.path));
const [maintenanceRow, handoverRow] = C.related as { path: string; from: string }[];
const MAINTENANCE = memory("ent_maintenance", maintenanceRow!.path, "vector", ["gemini"], ids("m", count(maintenanceRow!.from)), [
  "Nutrunner spindles on Line 3 are checked for wear every 500 hours. (Gemini, Jun 12, 2026)",
  "Torque tools are recalibrated every 90 days. (Claude, Jul 3, 2026)",
]);
const HANDOVER = memory("ent_handover", handoverRow!.path, "keyword", ["chatgpt"], ids("h", count(handoverRow!.from)), [
  "Night shift logs every line stop over ten minutes in the handover notes. (ChatGPT, Sep 8, 2026)",
  "Ana leads the night shift on Line 3. (ChatGPT, Oct 9, 2026)",
]);

/** His fault chat with ChatGPT, which goes whole with the draft. */
const FAULT_CHAT: Chat = {
  key: "k-line3-torque",
  platform: "chatgpt",
  title: C.chat.title,
  at: "2026-10-22T15:20:00Z",
  chars: 1800,
  kinds: ["qa", "list"],
  reason: "task",
  record: "chat:k-line3-torque",
};

/** That chat's text as the engine hands it to the tab (chat-text.ts): one line on what it is, then the saved chat. */
const FAULT_TEXT = [
  "This is one of my earlier conversations, saved as raw text by Coere. It says which AI it came from. Read it as my own notes for the message below.",
  "",
  C.chat.title,
  `ChatGPT, ${C.chat.date}`,
  "",
  "You: Line 3 stopped twice last night on torque faults at station 4. The nutrunner reads low torque on the third bolt of the bracket.",
  "",
  "ChatGPT: Low torque on one bolt usually points to the tool, not the part. Check these in order.",
  "",
  "1. Spindle wear and the socket.",
  "2. The calibration date of the nutrunner.",
  "3. Anything that changed on the shift, such as the hall temperature.",
  "",
  "You: We replaced the spindle in August and it held for nine weeks. Night shift says the faults come back when the hall gets cold.",
  "",
  "ChatGPT: Then log the hall temperature against each fault for a week. If the faults follow the cold, warm up the tool before the shift starts and recheck the torque on the first ten brackets.",
  "",
  "You: Hannah at Corvane wants a root cause report by October 31.",
  "",
  "ChatGPT: Then keep the log simple: time, temperature, station and torque reading. One week of it is enough to show the cause.",
].join("\n");

function blockOf(list: Memory[]): string {
  const body = list.flatMap((m) => [m.node.path.join(" / "), ...m.lines.map((l) => `- ${l}`)]);
  return [OPEN, ...body, CLOSE, "", ""].join("\n");
}

const NOTHING = { pending: [], also: [], topic: [], tokens: 0, sources: [], chats: [], block: "" };

/** The engine's answer for a pause in typing: Line 3's faults bring it all, in the order the list shows it. */
function contextFor(args: { tail?: string; keywords?: string[] }) {
  const words = `${args.tail ?? ""} ${(args.keywords ?? []).join(" ")}`.toLowerCase();
  if (!/line 3|torque/.test(words)) return NOTHING;
  const pending = [ABOUT_ME, FAULTS, EQUIPMENT];
  // The block reads as the field writes it: the faults first, then who he is, then the equipment.
  const block = blockOf([FAULTS, ABOUT_ME, EQUIPMENT]);
  return {
    pending: pending.map((m) => m.node),
    also: [MAINTENANCE, HANDOVER].map((m) => m.node),
    topic: ["Line 3"],
    tokens: Math.ceil(block.length / 3.6),
    sources: ["chatgpt", "claude", "gemini"] as Platform[],
    chats: [FAULT_CHAT],
    block,
  };
}

/** What ChatGPT answers her draft: field.context.answer, in its three parts. */
export const ANSWER = [C.answer.intro, "", C.answer.steps, "", C.answer.close].join("\n");

/** The strip's engine calls on the Connect tab, by method. */
export const CONNECT: Record<string, (m: { args?: unknown }) => unknown> = {
  "memory.contextFor": (m) => contextFor((m.args ?? {}) as never),
  "memory.contextAsk": () => NOTHING,
  "memory.contextDeeper": () => NOTHING,
  "memory.contextMore": () => ({ chats: [], nodes: [] }),
  "memory.contextChat": (m) => ((m.args as { key?: string })?.key === FAULT_CHAT.key ? { text: FAULT_TEXT } : null),
  "memory.contextRelated": () => NOTHING,
  "memory.contextSent": () => null,
};
