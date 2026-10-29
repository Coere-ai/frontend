import type { World } from "../../stage/world";
import type { Mem } from "./firm";
import * as v from "./views";

/**
 * The engine's answers for Whitlock & Rhee's memory: every memory and
 * Solution method the dashboard and the firm's chat site call, read off the
 * memory firm.ts builds, as the teams film answers its agency (answers.ts
 * there). Arguments come as the engine client sends them, in `args`. Memory
 * is built, so the build's own calls answer that it is done.
 */

type Args = Record<string, unknown>;
const args = (m: { args?: unknown }): Args => (m.args ?? {}) as Args;

/** Cori's history (memory.chat.*): the conversations this run made, as the engine keeps them. */
function answerCoriHistory(world: World): void {
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
      const at = a.turn.at ?? Date.now();
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

export function answerMemory(world: World, mem: Mem): void {
  answerCoriHistory(world);
  const settings = v.settings(mem);
  world
    .engine("memory.status", () => v.status(mem))
    .engine("memory.settings", () => settings)
    .engine("memory.setSettings", () => settings)
    .engine("memory.buildEstimate", () => ({ chats: mem.chats, seconds: 0, measured: true, progress: null }))
    .engine("memory.control", () => v.status(mem))
    .engine("memory.savePositions", () => null)
    .engine("memory.hint", () => null)
    .engine("memory.stats", () => null)
    .engine("capture.tail", () => null);
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
    .engine("memory.skipChats", () => [])
    .engine("memory.forgetPreview", (m) => v.forgetPreview(mem, String(args(m).topic ?? ""), (args(m).id as string | null) ?? null))
    .engine("memory.forgetTopic", (m) => {
      const { receipt, changed } = v.forgetTopic(mem, String(args(m).token));
      // The engine says what changed, so every page reads its graph again.
      setTimeout(() => world.tell({ ch: "coere", type: "engine.event", event: { name: "memory.changed", ids: changed } }), 0);
      return receipt;
    })
    .engine("memory.documents", () => [])
    .engine("memory.exportScoped", async (m) => {
      const scope = args(m).scope as { kind: string; key?: string; name?: string };
      const counts = v.scopeCounts(mem, scope.key ?? "");
      // The engine writes the file to the OPFS staging folder the dashboard takes it from (memory-v2.md 7.9).
      const name = `export-${crypto.randomUUID()}.coere`;
      const dir = await (await navigator.storage.getDirectory()).getDirectoryHandle("coere-staging", { create: true });
      const out = await (await dir.getFileHandle(name, { create: true })).createWritable();
      await out.write(JSON.stringify({ scope, counts, memories: v.allFacts(mem).filter((f) => f.client === scope.key).map((f) => f.text) }));
      await out.close();
      return { staging: name, counts };
    })
    .engine("memory.quote", () => null)
    .engine("search", (m) => ({ hits: [], totalMatches: 0, ms: 4, stage: 1, queryTokens: String(args(m).query ?? "").toLowerCase().split(/\s+/).filter(Boolean) }))
    .engine("listConversations", () => ({ rows: [], total: mem.chats }))
    .engine("stats", () => ({ conversations: mem.chats, chunks: 0, projects: 0, textBytes: 0, dbBytes: 0, byPlatform: {} }))
    // A chat site's scan saves the chats in its sidebar; the library already holds them, so nothing is rewritten.
    .engine("upsertConversation", (m) => {
      const conv = (args(m).conv ?? {}) as { platform?: string; platformConvId?: string; messages?: unknown[] };
      return { id: `${conv.platform}:${conv.platformConvId}`, hash: "0".repeat(16), chunks: 0, bytes: 0, unchanged: true };
    });
}
