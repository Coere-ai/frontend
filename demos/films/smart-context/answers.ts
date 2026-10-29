import type { World } from "../../stage/world";
import maya from "./data/maya.json";
import {
  ABOUT_ME,
  blockOf,
  LAUNCH_TALK,
  PEARX,
  PREP_CHAT,
  PREP_CHAT_TEXT,
  SKIPDOODLE,
  STRIPE,
  TIDEPOOL,
  type Answer,
  type Chat,
  type Node,
} from "./data";

/**
 * What Coere's engine answers the strip in this film, as memory.contextFor
 * and the list's calls answer it (packages/memory import-context): her
 * interview draft brings her earlier prep chat, who she is, the interview
 * and Tidepool; her SkipDoodle chat brings who she is and the project, a
 * follow up brings nothing new, and the stack brings the project back.
 * The memory search's graph and what it finds as she types are her memory
 * core's own answers over her whole memory (bake.mts, data/maya.json).
 */

type Memory = { node: Node; lines: string[] };

function answer(pending: Memory[], also: Memory[] = [], chats: Chat[] = []): Answer {
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

/** The draft's words, as the tab sends them: its tail and its keywords. */
const wordsOf = (args: { tail?: string; keywords?: string[] }): string => `${args.tail ?? ""} ${(args.keywords ?? []).join(" ")}`.toLowerCase();

/** The engine's answer for one pause in typing. */
function contextFor(args: { tail?: string; keywords?: string[] }): Answer {
  const words = wordsOf(args);
  if (/\binterview\b/.test(words)) return answer([ABOUT_ME, PEARX, TIDEPOOL], [LAUNCH_TALK, STRIPE], [PREP_CHAT]);
  if (/\bstack\b/.test(words) && /skipdoodle/.test(words)) return answer([SKIPDOODLE]);
  if (/\bskipdoodle\b/.test(words)) return answer([ABOUT_ME, SKIPDOODLE]);
  return NOTHING;
}

/** Ask Cori, or Add on a row: the memories her words or the ids name. */
function contextAsk(args: { request?: string; ids?: string[] }): Answer {
  if (args.ids?.length) return answer(ALL.filter((m) => args.ids!.includes(m.node.id)).map((m) => ({ ...m, node: { ...m.node, reason: "asked" as const } })));
  const request = (args.request ?? "").toLowerCase();
  if (/launch|talk/.test(request)) return answer([{ ...LAUNCH_TALK, node: { ...LAUNCH_TALK.node, reason: "asked" } }]);
  if (/stripe/.test(request)) return answer([{ ...STRIPE, node: { ...STRIPE.node, reason: "asked" } }]);
  return NOTHING;
}

type Found = { results: (Node & { line?: string })[]; lit: string[] };
const BAKED = maya as unknown as { graph: { nodes: { id: string }[]; more: number }; find: Record<string, Found> };
const ALL = [PEARX, TIDEPOOL, LAUNCH_TALK, STRIPE, SKIPDOODLE];

/**
 * The memory search as she types, as her memory core answered each step of
 * the word (smart/find.ts): what her words start, best first, the top rows
 * and every match to light. What already goes with the message is the
 * tab's to skip, so it comes off here, as the engine leaves it out.
 */
function contextFind(args: { query?: string; skip?: string[] }): Found {
  const skip = new Set(args.skip ?? []);
  let query = (args.query ?? "").toLowerCase();
  while (!(query in BAKED.find) && query) query = query.slice(0, -1);
  const found = BAKED.find[query] ?? { results: [], lit: [] };
  return { results: found.results.filter((r) => !skip.has(r.id)), lit: found.lit.filter((id) => !skip.has(id)) };
}

/** A pick in the memory search: that memory, as one that goes. */
function contextRelated(args: { id?: string }): Answer {
  const m = ALL.find((x) => x.node.id === args.id);
  return m ? answer([{ ...m, node: { ...m.node, reason: "asked" } }]) : NOTHING;
}

export function setupMemory(world: World): void {
  world
    .engine("memory.contextFor", (m) => contextFor((m.args ?? {}) as never))
    .engine("memory.contextAsk", (m) => contextAsk((m.args ?? {}) as never))
    // Ask Cori's wider pass finds nothing past what already goes; her words bring the rest.
    .engine("memory.contextDeeper", () => NOTHING)
    .engine("memory.contextMore", () => ({ chats: [], nodes: [] }))
    // Her whole memory as the widget draws it: every live thing with its dots, from her memory core.
    .engine("memory.contextGraph", () => structuredClone(BAKED.graph))
    .engine("memory.contextFind", (m) => contextFind((m.args ?? {}) as never))
    .engine("memory.contextRelated", (m) => contextRelated((m.args ?? {}) as never))
    .engine("memory.contextChat", (m) => ((m.args as { key?: string })?.key === PREP_CHAT.key ? { text: PREP_CHAT_TEXT } : null))
    .engine("memory.contextSent", () => null)
    // The tab asks which of the site's chats Coere skips; none here.
    .engine("memory.skipChats", () => [])
    // Autoscan saves the chats she sends in to the library, as the extension does.
    .engine("upsertConversation", (m) => {
      const conv = (m.args as { conv?: { platformConvId?: string } })?.conv;
      return { id: `chatgpt:${conv?.platformConvId ?? "new"}`, hash: "h", chunks: 1, bytes: 1, unchanged: false };
    })
    .engine("capture.tail", () => null);
}
