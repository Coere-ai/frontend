import { field } from "../../../scripts/industries/fields/consumer.mjs";

/**
 * Coere Connect on ChatGPT for Olivia (field.context): her holiday draft
 * brings her earlier Green Valley reset chat, who she is, and what her
 * memory holds on Green Valley's shelf, promotions and shoppers, with the
 * company's promo calendar and Green Valley's sales offered beside them.
 * Answered in the shapes the engine gives the strip (packages/memory
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

// The chats behind each: About me's five, the shelf's six (two shared with About me) and the shoppers' three (two shared) make ten.
const ABOUT_ME = memory("core", "About me", "standing", [], ids("a", count(C.about)), linesOf("About me"));
const [shelfRow, shoppersRow] = C.rows as { path: string; from: string }[];
const SHELF = memory("ent_shelf", shelfRow!.path, "name", ["claude", "chatgpt", "gemini"], [...ids("s", count(shelfRow!.from) - 2), "a1", "a2"], linesOf(shelfRow!.path));
const SHOPPERS = memory("ent_shoppers", shoppersRow!.path, "name", ["chatgpt", "claude"], [...ids("p", count(shoppersRow!.from) - 2), "a3", "a4"], linesOf(shoppersRow!.path));
const [calendarRow, salesRow] = C.related as { path: string; from: string }[];
const CALENDAR = memory("ent_calendar", calendarRow!.path, "keyword", ["chatgpt"], ids("t", count(calendarRow!.from)), [
  "Holiday promotions are set by the first week of November. (ChatGPT, Aug 4, 2026)",
  "Every promotion runs for at least two weeks. (Claude, Feb 10, 2026)",
]);
const SALES = memory("ent_sales", salesRow!.path, "vector", ["claude", "gemini"], ids("h", count(salesRow!.from)), [
  "Green Valley wants a weekly sell through report with three numbers per store group. (Gemini, Jul 15, 2026)",
  "Green Valley agreed to share October sales by store before October 25. (Claude, Oct 14, 2026)",
]);

/** Her Green Valley reset chat with ChatGPT, which goes whole with the draft. */
const RESET_CHAT: Chat = {
  key: "k-green-valley-reset",
  platform: "chatgpt",
  title: C.chat.title,
  at: "2026-10-21T15:10:00Z",
  chars: 1800,
  kinds: ["qa", "list"],
  reason: "task",
  record: "chat:k-green-valley-reset",
};

/** That chat's text as the engine hands it to the tab (chat-text.ts): one line on what it is, then the saved chat. */
const RESET_TEXT = [
  "This is one of my earlier conversations, saved as raw text by Coere. It says which AI it came from. Read it as my own notes for the message below.",
  "",
  C.chat.title,
  `ChatGPT, ${C.chat.date}`,
  "",
  "You: Green Valley moved our oat bars to eye level in 42 stores this month. Help me make the most of the new spot before the holidays.",
  "",
  "ChatGPT: Eye level is the best shelf you can get. Here is how to use it.",
  "",
  "1. Check the sales in the 42 stores against the rest after four weeks.",
  "2. Put your best seller in the widest facing.",
  "3. Tie the next promotion to the new spot, so shoppers find the offer where they already look.",
  "",
  "You: Maple sells best there in December. Rosa wants maple to lead every holiday display.",
  "",
  "ChatGPT: Then maple leads the holiday plan. Give it the end of aisle display and the ad, and keep cocoa and berry on the shelf beside it.",
  "",
  "You: The holiday planning call with Rosa is on October 29. Their holiday ad closes on November 5.",
  "",
  "ChatGPT: Good. Agree the offer and the ad slot on the call, then send the copy and images by November 5. Book the store demos for the weeks the ad runs, so the samples meet the shoppers the ad brings in.",
].join("\n");

function blockOf(list: Memory[]): string {
  const body = list.flatMap((m) => [m.node.path.join(" / "), ...m.lines.map((l) => `- ${l}`)]);
  return [OPEN, ...body, CLOSE, "", ""].join("\n");
}

const NOTHING = { pending: [], also: [], topic: [], tokens: 0, sources: [], chats: [], block: "" };

/** The engine's answer for a pause in typing: Green Valley's holiday brings it all, in the order the list shows it. */
function contextFor(args: { tail?: string; keywords?: string[] }) {
  const words = `${args.tail ?? ""} ${(args.keywords ?? []).join(" ")}`.toLowerCase();
  if (!/green valley|holiday/.test(words)) return NOTHING;
  const pending = [ABOUT_ME, SHELF, SHOPPERS];
  // The block reads as the field writes it: the shelf and promotions first, then who she is, then the shoppers.
  const block = blockOf([SHELF, ABOUT_ME, SHOPPERS]);
  return {
    pending: pending.map((m) => m.node),
    also: [CALENDAR, SALES].map((m) => m.node),
    topic: [field.client.name as string],
    tokens: Math.ceil(block.length / 3.6),
    sources: ["chatgpt", "claude", "gemini"] as Platform[],
    chats: [RESET_CHAT],
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
  "memory.contextChat": (m) => ((m.args as { key?: string })?.key === RESET_CHAT.key ? { text: RESET_TEXT } : null),
  "memory.contextRelated": () => NOTHING,
  "memory.contextSent": () => null,
};
