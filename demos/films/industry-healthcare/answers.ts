import type { World } from "../../stage/world";
import { orgRecord, type Mem } from "./memory";
import * as v from "./views";

/**
 * The engine's answers for Lakeshore's memory: every memory and Solution
 * method the dashboard and the team's chat site call, read off the memory
 * memory.ts builds, as the teams film answers Fernhill's
 * (demos/films/teams/answers.ts and build.ts). Arguments come as the
 * engine client sends them, in `args`.
 */

type Args = Record<string, unknown>;
const args = (m: { args?: unknown }): Args => (m.args ?? {}) as Args;

/** Cori's history (memory.chat.*): the conversations this run made, as the engine keeps them. */
function answerCoriHistory(world: World, now: () => number): void {
  type Conv = { id: string; title: string; startedOn: string; createdAt: number; updatedAt: number; turns: number };
  const convs: Conv[] = [];
  const turns = new Map<string, unknown[]>();
  let n = 0;
  world
    .engine("memory.chat.list", () => ({ convs: [...convs].sort((a, b) => b.updatedAt - a.updatedAt), next: null }))
    .engine("memory.chat.get", (m) => {
      const conv = convs.find((c) => c.id === args(m).id);
      return conv ? { conv, turns: turns.get(conv.id) ?? [] } : null;
    })
    .engine("memory.chat.search", () => [])
    .engine("memory.chat.append", (m) => {
      const a = args(m) as { convId: string | null; startedOn: string; turn: { role: string; text: string; blocks: unknown[]; runId: string | null; at?: number } };
      const at = a.turn.at ?? now();
      let conv = convs.find((c) => c.id === a.convId);
      if (!conv) {
        conv = { id: `cc_${(++n).toString(36)}${Date.now().toString(36)}`, title: a.turn.text.slice(0, 48), startedOn: a.startedOn, createdAt: at, updatedAt: at, turns: 0 };
        convs.push(conv);
      }
      conv.turns += 1;
      conv.updatedAt = at;
      turns.set(conv.id, [...(turns.get(conv.id) ?? []), { convId: conv.id, n: conv.turns, role: a.turn.role, at, text: a.turn.text, blocks: a.turn.blocks, runId: a.turn.runId }]);
      return { conv, n: conv.turns };
    })
    .engine("memory.chat.update", () => undefined)
    .engine("memory.chat.keep", () => ({ keep: { days: null }, cleared: 0 }));
}

export function answerMemory(world: World, mem: Mem, now: () => number): void {
  answerCoriHistory(world, now);
  // Set up and built before the film starts: the first run's record, her AIs, and the dashboard visited before.
  world.write("local", {
    "coere.solution": orgRecord(mem),
    "coere.ais": { v: 1, platforms: ["chatgpt", "claude", "gemini"] },
    "coere.prefs": { v: 5, search: false, agent: true, agentDone: true, agentAlways: false, keys: { chat: "rightOption", search: "optionDouble" }, chosen: { agent: false, agentAlways: false } },
    "coere.onboarding": { v: 1, done: true, at: mem.now - 60 * 86_400_000 },
    "coere.memory.prefs": { v: 1, autosave: true, context: { mode: "auto", budget: 1500, standing: true, sensitive: false, skipRecent: false } },
    "coere.memory.finish": { v: 1, state: "shown" },
    "coere.cori.hello": { at: mem.now - 3 * 86_400_000 },
    "coere.memory.recall": { v: 1, on: true },
    // She has seen Cori's Right Option card on an AI before.
    "coere.cori.hint": { v: 1, seen: true, at: mem.now - 30 * 86_400_000 },
  });
  const settings = v.settings(mem);
  world
    .engine("memory.settings", () => settings)
    .engine("memory.setSettings", () => settings)
    .engine("memory.buildEstimate", () => ({ chats: mem.chats.length, seconds: 0, measured: true, progress: null }))
    .engine("memory.status", () => v.status(mem))
    .engine("memory.control", () => v.status(mem))
    .engine("memory.savePositions", () => null)
    .engine("memory.hint", () => null);
  // The voice channel's models calls carry no type (voice/protocol.ts): this install has no voice models to report.
  world.on("", () => null);
  world
    .engine("memory.overview", () => v.overview(mem))
    .engine("memory.node", (m) => v.nodeDetail(mem, String(args(m).id)))
    .engine("memory.children", (m) => v.children(mem, (args(m).id as string | null) ?? null))
    .engine("memory.dueSoon", (m) => v.dueSoon(mem, Number(args(m).limit ?? 5)))
    .engine("memory.corePack", () => ({ version: null, lines: [], chats: 0, hidden: [] }))
    .engine("memory.learned", () => ({ sections: [], keywords: [], blocked: [] }))
    .engine("memory.review", () => v.review(mem))
    .engine("memory.estimate", () => null)
    .engine("memory.clients", () => ({ clients: v.clientViews(mem) }))
    .engine("memory.workers", () => ({ workers: v.workerViews(mem) }))
    .engine("memory.orgGet", () => v.orgSettings(mem))
    .engine("memory.search", (m) => v.search(mem, String(args(m).q ?? ""), Number(args(m).limit ?? 8)))
    .engine("memory.orgReview", () => ({ items: v.orgReview(mem) }))
    .engine("memory.contextFor", (m) => v.contextFor(mem, String(args(m).tail ?? "")))
    .engine("memory.contextSent", () => undefined)
    .engine("memory.skipChats", () => [])
    .engine("memory.documents", () => [])
    .engine("memory.quote", () => null)
    .engine("search", (m) => ({ hits: [], totalMatches: 0, ms: 4, stage: 1, queryTokens: String(args(m).query ?? "").toLowerCase().split(/\s+/).filter(Boolean) }))
    .engine("listConversations", () => ({ rows: [], total: mem.chats.length }))
    // A chat site's scan saves the chats in its sidebar; the library already holds them, so nothing is rewritten.
    .engine("upsertConversation", (m) => {
      const conv = (args(m).conv ?? {}) as { platform?: string; platformConvId?: string; messages?: unknown[] };
      return { id: `${conv.platform}:${conv.platformConvId}`, hash: "0".repeat(16), chunks: 0, bytes: 0, unchanged: true };
    });
}
