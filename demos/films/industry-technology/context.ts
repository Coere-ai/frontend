import type { World } from "../../stage/world";
import { cite, dayAt, iso, SAM, FIRM } from "./field";
import { CLAUDE_ASK, CLAUDE_EARLIER, CLAUDE_REPLY, RETRY_TITLE } from "./lines.mjs";
import { DECISIONS, STACK } from "./memory";

/**
 * What Coere's engine answers the strip on ChatGPT in the Connect chapter,
 * as memory.contextFor and the list's calls answer it (packages/memory
 * import-context, in the shapes demos/films/smart-context answers with):
 * Sam's question about the invoice webhook brings his Claude chat on the
 * retry bug, who he is, and the Ledger API's stack and decisions, with the
 * code review checklist and the on call runbook as also related. On Claude,
 * where that chat is open, nothing goes.
 */

type Platform = "chatgpt" | "claude" | "gemini";
type Reason = "name" | "both" | "keyword" | "vector" | "asked" | "standing" | "linked";
type Node = { id: string; path: string[]; reason: Reason; sources: Platform[]; chats: string[]; tokens: number; changedOnly: boolean; version: string };
type Chat = { key: string; platform: Platform; title: string; at: string; chars: number; kinds: ("qa" | "script" | "list" | "code" | "draft")[]; reason: "task" | "asked"; record: string };
type Memory = { node: Node; lines: string[] };

const OPEN = "[Context from Coere, my saved memory. Use it if it helps.]";
const CLOSE = "[End of context from Coere]";

const ids = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => `k${from + i}`);

const memory = (id: string, path: string[], reason: Reason, sources: Platform[], chats: string[], lines: string[]): Memory => ({
  node: { id, path, reason, sources, chats, tokens: Math.ceil((path.join(" / ").length + lines.join("\n").length) / 3.6), changedOnly: false, version: `v1-${id}` },
  lines,
});

const LEDGER = ["Clients", "Halcyon Health", "Ledger API"];

const stack = () =>
  memory("ent_ledger_stack", [...LEDGER, "Tech stack"], "name", ["claude", "chatgpt"], ids(3, 11), STACK.slice(0, 3).map((l) => `${l.text} ${cite(l.chat)}`));
const aboutMe = () => memory("core", ["About me"], "standing", [], ids(1, 8), [`I am a backend engineer at ${FIRM}.`, `My name is ${SAM.name}.`, "Answer with code first, then one line on why."]);
const decisions = () =>
  memory("ent_ledger_decisions", [...LEDGER, "Decisions"], "keyword", ["claude", "gemini"], ids(10, 13), DECISIONS.slice(0, 2).map((l) => `${l.text} ${cite(l.chat)}`));
const checklist = () => memory("ent_checklist", ["Company", "Code review checklist"], "keyword", ["chatgpt"], ids(20, 21), ["Every pull request needs a test and a reviewer from another team."]);
const runbook = () => memory("ent_runbook", ["Clients", "Halcyon Health", "On call runbook"], "vector", ["gemini"], ids(22, 22), ["The on call engineer acks a page within 15 minutes."]);

/** His Claude chat on the retry bug, carried whole into the new chat; he added to it a moment ago. */
export const retryChat = (): Chat => ({
  key: "k-ledger-retry",
  platform: "claude",
  title: RETRY_TITLE,
  at: iso(Date.now() - 4 * 60_000),
  chars: 1900,
  kinds: ["qa", "code"],
  reason: "task",
  record: "chat:k-ledger-retry",
});

/** That chat's text as the engine hands it to the tab (chat-text.ts): one line on what it is, then the saved chat. */
const retryChatText = (): string =>
  [
    "This is one of my earlier conversations, saved as raw text by Coere. It says which AI it came from. Read it as my own notes for the message below.",
    "",
    RETRY_TITLE,
    `Claude, ${new Date(dayAt(0)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}`,
    "",
    ...[...CLAUDE_EARLIER, { role: "user", text: CLAUDE_ASK }, { role: "assistant", text: CLAUDE_REPLY }].flatMap((m) => [`${m.role === "user" ? "You" : "Claude"}: ${m.text}`, ""]),
  ].join("\n");

function blockOf(list: readonly Memory[]): string {
  if (list.length === 0) return "";
  const body = list.flatMap((m) => [m.node.path.join(" / "), ...m.lines.map((l) => `- ${l}`)]);
  return [OPEN, ...body, CLOSE, "", ""].join("\n");
}

function answer(pending: Memory[], also: Memory[] = [], chats: Chat[] = []) {
  const block = blockOf(pending);
  return {
    pending: pending.map((m) => m.node),
    also: also.map((m) => m.node),
    topic: pending.filter((m) => m.node.reason !== "standing").map((m) => m.node.path.at(-1)!),
    tokens: Math.ceil(block.length / 3.6),
    sources: [...new Set(pending.flatMap((m) => m.node.sources))],
    chats,
    block,
  };
}

const NOTHING = answer([]);

/** The engine's answer for one pause in his typing on ChatGPT. */
export function connectContext(args: { tail?: string; keywords?: string[] }) {
  const words = `${args.tail ?? ""} ${(args.keywords ?? []).join(" ")}`.toLowerCase();
  if (/\bwebhook\b|\binvoice\b/.test(words)) return answer([stack(), aboutMe(), decisions()], [checklist(), runbook()], [retryChat()]);
  return NOTHING;
}

export function setupConnect(world: World): void {
  world
    .engine("memory.contextAsk", () => NOTHING)
    .engine("memory.contextDeeper", () => NOTHING)
    .engine("memory.contextMore", () => ({ chats: [], nodes: [] }))
    .engine("memory.contextRelated", () => NOTHING)
    .engine("memory.contextChat", (m) => ((m.args as { key?: string })?.key === retryChat().key ? { text: retryChatText() } : null))
    .engine("capture.tail", () => null);
}
