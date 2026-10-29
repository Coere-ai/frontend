import type { World } from "../../stage/world";
import {
  ABOUT_ME,
  blockOf,
  LAUNCH_TALK,
  PEARX,
  PREP_CHAT,
  PREP_CHAT_TEXT,
  SECTION_OF,
  SECTIONS,
  SKIPDOODLE,
  STRIPE,
  THINGS,
  TIDEPOOL,
  type Answer,
  type Chat,
  type Node,
  type Thing,
} from "./data";

/**
 * What Coere's engine answers the strip in this film, as memory.contextFor
 * and the list's calls answer it (packages/memory import-context): her
 * interview draft brings her earlier prep chat, who she is, the interview
 * and Tidepool; her SkipDoodle chat brings who she is and the project, a
 * follow up brings nothing new, and the stack brings the project back.
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
  const all = [LAUNCH_TALK, STRIPE, TIDEPOOL, PEARX, SKIPDOODLE];
  if (args.ids?.length) return answer(all.filter((m) => args.ids!.includes(m.node.id)).map((m) => ({ ...m, node: { ...m.node, reason: "asked" as const } })));
  const request = (args.request ?? "").toLowerCase();
  if (/launch|talk/.test(request)) return answer([{ ...LAUNCH_TALK, node: { ...LAUNCH_TALK.node, reason: "asked" } }]);
  if (/stripe/.test(request)) return answer([{ ...STRIPE, node: { ...STRIPE.node, reason: "asked" } }]);
  return NOTHING;
}

/** Her graph for the memory search: the person, the sections, the folders and every thing (smart/graph.ts). */
function contextGraph() {
  const nodes: { id: string; kind: string; label: string; section: string; parent: string | null; importance: number; facts: number; memories: number[]; chats: number }[] = [];
  nodes.push({ id: "self", kind: "self", label: "Maya Collins", section: "personal", parent: null, importance: 1, facts: 7, memories: [], chats: 0 });
  for (const [id, label] of Object.entries(SECTIONS)) nodes.push({ id, kind: "section", label, section: id, parent: null, importance: 0.5, facts: 0, memories: [], chats: 0 });
  const ids = new Map(THINGS.map((x) => [x.path.join("/"), x.id]));
  const folders = new Set<string>();
  const parentOf = (path: string[]): string => {
    const section = SECTION_OF[path[0]!]!;
    if (path.length <= 2) return section;
    const up = path.slice(0, -1);
    const known = ids.get(up.join("/"));
    if (known) return known;
    const folder = `f:${up.join("/")}`;
    if (!folders.has(folder)) {
      folders.add(folder);
      nodes.push({ id: folder, kind: "folder", label: up.at(-1)!, section, parent: parentOf(up), importance: 0.3, facts: 0, memories: [], chats: 0 });
    }
    return folder;
  };
  for (const x of THINGS) {
    const memories = Array.from({ length: x.facts }, (_, i) => Math.max(0.2, x.importance - i * 0.12));
    nodes.push({ id: x.id, kind: x.kind, label: x.path.at(-1)!, section: SECTION_OF[x.path[0]!]!, parent: parentOf(x.path), importance: x.importance, facts: x.facts, memories, chats: x.chats });
  }
  return { nodes, more: 0 };
}

const nodeOf = (x: Thing): Node => ({
  id: x.id,
  path: x.path,
  reason: "keyword",
  sources: x.sources,
  chats: Array.from({ length: x.chats }, (_, i) => `${x.id}-c${i}`),
  tokens: 40,
  changedOnly: false,
  version: `v1-${x.id}`,
});

/** The memory search as she types: what her words start, best first, the top four as rows (smart/find.ts). */
function contextFind(args: { query?: string; skip?: string[] }) {
  const skip = new Set(args.skip ?? []);
  const words = (args.query ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const open = THINGS.filter((x) => !skip.has(x.id));
  if (words.length === 0) {
    const ranked = ["ent_launch", "ent_stripe", "ent_iris", "ent_skipdoodle"].map((id) => open.find((x) => x.id === id)).filter((x): x is Thing => Boolean(x));
    return { results: ranked.map((x) => ({ ...nodeOf(x), line: x.line })), lit: [] };
  }
  const starts = (text: string, w: string) => text.toLowerCase().split(/[^a-z0-9']+/).some((part) => part.startsWith(w));
  const hit = (x: Thing) => words.every((w) => starts(x.path.join(" "), w) || starts(x.line, w));
  const found = open.filter(hit).sort((a, b) => b.importance - a.importance);
  // A folder stands for what it holds, so a thing inside a listed folder is not listed again.
  const rows = found.filter((x) => !found.some((f) => f.kind === "folder" && f !== x && x.path.join("/").startsWith(f.path.join("/") + "/") && x.id !== "ent_dana_wedding"));
  return { results: rows.slice(0, 4).map((x) => ({ ...nodeOf(x), line: x.line })), lit: found.map((x) => x.id) };
}

/** A pick in the memory search: that memory, as one that goes. */
function contextRelated(args: { id?: string }): Answer {
  const x = THINGS.find((t) => t.id === args.id);
  if (!x) return NOTHING;
  return answer([{ node: { ...nodeOf(x), reason: "asked" }, lines: [x.line] }]);
}

export function setupMemory(world: World): void {
  world
    .engine("memory.contextFor", (m) => contextFor((m.args ?? {}) as never))
    .engine("memory.contextAsk", (m) => contextAsk((m.args ?? {}) as never))
    // Ask Cori's wider pass finds nothing past what already goes; her words bring the rest.
    .engine("memory.contextDeeper", () => NOTHING)
    .engine("memory.contextMore", () => ({ chats: [], nodes: [] }))
    .engine("memory.contextGraph", () => contextGraph())
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
