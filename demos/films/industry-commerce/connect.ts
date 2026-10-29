import { field } from "../../../scripts/industries/fields/commerce.mjs";

/**
 * Coere Connect on ChatGPT for Grace (field.context): her renewal draft
 * brings her earlier renewal chat, who she is, and what her memory holds
 * on Meridian's supply agreement and pricing, with payment terms and
 * shipping offered beside them. Answered in the shapes the engine gives
 * the strip (packages/memory import-context), as demos/films/smart-context
 * answers it.
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

// The chats behind each: About me's four, the agreement's seven (two shared with About me) and pricing's three make twelve.
const ABOUT_ME = memory("core", "About me", "standing", [], ids("a", count(C.about)), linesOf("About me"));
const [supplyRow, pricingRow] = C.rows as { path: string; from: string }[];
const SUPPLY = memory("ent_supply", supplyRow!.path, "name", ["chatgpt", "claude"], [...ids("s", count(supplyRow!.from) - 2), "a1", "a2"], linesOf(supplyRow!.path));
const PRICING = memory("ent_pricing", pricingRow!.path, "name", ["gemini"], ids("p", count(pricingRow!.from)), linesOf(pricingRow!.path));
const [termsRow, shippingRow] = C.related as { path: string; from: string }[];
const TERMS = memory("ent_terms", termsRow!.path, "vector", ["claude"], ids("t", count(termsRow!.from)), [
  "Our standard terms are 30 days from the bill of lading. (ChatGPT, Mar 4, 2025)",
  "Terms past 45 days need sign off from finance. (Claude, Apr 21, 2026)",
]);
const SHIPPING = memory("ent_shipping", shippingRow!.path, "keyword", ["claude", "chatgpt"], ids("h", count(shippingRow!.from)), [
  "Meridian wants a monthly shipping report with three numbers: on time rate, damage and cost. (Gemini, Jul 8, 2026)",
  "Pieter books Meridian's Rotterdam freight. (ChatGPT, Aug 11, 2026)",
]);

/** Her renewal chat with ChatGPT, which goes whole with the draft. */
const RENEWAL_CHAT: Chat = {
  key: "k-meridian-renewal",
  platform: "chatgpt",
  title: C.chat.title,
  at: "2026-10-22T07:10:00Z",
  chars: 1900,
  kinds: ["qa", "list"],
  reason: "task",
  record: "chat:k-meridian-renewal",
};

/** That chat's text as the engine hands it to the tab (chat-text.ts): one line on what it is, then the saved chat. */
const RENEWAL_TEXT = [
  "This is one of my earlier conversations, saved as raw text by Coere. It says which AI it came from. Read it as my own notes for the message below.",
  "",
  C.chat.title,
  `ChatGPT, ${C.chat.date}`,
  "",
  "You: Meridian's supply agreement ends on December 31. Help me plan the renewal. They buy 40 containers a year through Rotterdam on FOB terms.",
  "",
  "ChatGPT: Here is a plan for the renewal.",
  "",
  "1. Confirm their 2027 volume before you talk price.",
  "2. Set your floor before the call, and decide what you can trade for it.",
  "3. Send a written proposal within a few days of the call.",
  "",
  "You: Ines asked for 60 day payment terms instead of 30. Our floor for 2027 is a 3 percent increase.",
  "",
  "ChatGPT: Then terms are your best trade. Sixty days costs you about two points of margin on their volume. Forty five days costs about one. Offer 45 days if they accept the 3 percent increase, and keep 60 off the table.",
  "",
  "You: The call with Ines is on October 28. I promised her the proposal by October 31.",
  "",
  "ChatGPT: Good. Use the call to agree the three numbers: price, terms and length. Then the proposal only has to write down what you agreed. Keep freight out of the price, and review it each June so a freight change never reopens the contract.",
].join("\n");

function blockOf(list: Memory[]): string {
  const body = list.flatMap((m) => [m.node.path.join(" / "), ...m.lines.map((l) => `- ${l}`)]);
  return [OPEN, ...body, CLOSE, "", ""].join("\n");
}

const NOTHING = { pending: [], also: [], topic: [], tokens: 0, sources: [], chats: [], block: "" };

/** The engine's answer for a pause in typing: the renewal brings it all, in the order the list shows it. */
function contextFor(args: { tail?: string; keywords?: string[] }) {
  const words = `${args.tail ?? ""} ${(args.keywords ?? []).join(" ")}`.toLowerCase();
  if (!/meridian|renewal/.test(words)) return NOTHING;
  const pending = [ABOUT_ME, SUPPLY, PRICING];
  // The block reads as the field writes it: the agreement first, then who she is, then the pricing.
  const block = blockOf([SUPPLY, ABOUT_ME, PRICING]);
  return {
    pending: pending.map((m) => m.node),
    also: [TERMS, SHIPPING].map((m) => m.node),
    topic: ["Meridian Foods"],
    tokens: Math.ceil(block.length / 3.6),
    sources: ["chatgpt", "claude", "gemini"] as Platform[],
    chats: [RENEWAL_CHAT],
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
  "memory.contextChat": (m) => ((m.args as { key?: string })?.key === RENEWAL_CHAT.key ? { text: RENEWAL_TEXT } : null),
  "memory.contextRelated": () => NOTHING,
  "memory.contextSent": () => null,
};
