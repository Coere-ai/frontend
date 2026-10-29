import { PLATFORMS } from "@coere/platforms";
import { v22Data, memoryData, memoryOverWorker } from "@v2/apps/extension/src/background/cori/data-memory";
import { engineOverWorker, type Forward } from "@v2/apps/extension/src/background/cori/engine-port";
import { createCoriHost, surfaceData, type Asker } from "@v2/apps/extension/src/background/cori/host";
import { bulkAvailableIn } from "@v2/apps/extension/src/lib/bulk-available";
import { parseCoriAsk } from "@v2/apps/extension/src/lib/cori-messages";
import { withOrg } from "@v2/apps/extension/src/solution/seams/cori-host";
import { ORG_RECORD_KEY } from "@coere/solution";
import type { World } from "../../stage/world";
import { NOW, ZONE, type Mem } from "./memory";
import * as v from "./views";

/**
 * Coere for Teams' side of the World for Ashgrove: every memory and
 * Solution method the dashboard, the chat site and Cori call, read off the
 * memory memory.ts builds (as demos/films/teams/answers.ts does for
 * Fernhill), and Cori as the service worker runs him, the real host with
 * Coere for Teams' client reads (solution/seams/cori-host.ts).
 */

type Args = Record<string, unknown>;
const args = (m: { args?: unknown }): Args => (m.args ?? {}) as Args;

/** The film's clock: its day, running at the real pace from when the World was made. */
export function filmClock(): () => number {
  const start = Date.now();
  return () => NOW + (Date.now() - start);
}

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

export function answerTeam(world: World, mem: Mem): void {
  // The firm was set up on the first run, months ago; Cori said his hello then (console/cori/hello.ts).
  world.write("local", { [ORG_RECORD_KEY]: v.orgRecord(mem), "coere.cori.hello": { at: NOW - 30 * 86_400_000 } });
  answerCoriHistory(world);
  // The voice channel's models calls carry no type: this install has no voice models to report.
  world.on("", () => null);
  let settings = v.settings(mem);
  world
    .engine("memory.status", () => v.status(mem))
    .engine("memory.settings", () => settings)
    .engine("memory.setSettings", (m) => (settings = { ...settings, ...(args(m) as never) }))
    .engine("memory.buildEstimate", () => ({ chats: v.sourceChats(mem).all, seconds: 0, measured: true, progress: null }))
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
    .engine("memory.orgReview", () => ({ items: [] }))
    .engine("memory.search", (m) => v.search(mem, String(args(m).q ?? ""), Number(args(m).limit ?? 8)))
    .engine("memory.documents", () => [])
    .engine("memory.quote", () => null)
    .engine("search", (m) => ({ hits: [], totalMatches: 0, ms: 4, stage: 1, queryTokens: String(args(m).query ?? "").toLowerCase().split(/\s+/).filter(Boolean) }))
    .engine("listConversations", () => ({ rows: [], total: v.sourceChats(mem).all }));
}

/** Cori as the service worker runs him, in the demo's top page; a `cori.ask` from a tab gets his answer. */
export function answerCori(world: World, clock: () => number): void {
  const forward: Forward = async (msg) => {
    const r = (await world.handle(msg as never, "worker")) as { ok: boolean; result?: unknown; error?: { code: string; message: string } };
    return r.ok ? { id: msg.id, ok: true, result: r.result } : { id: msg.id, ok: false, error: r.error as never };
  };
  const engine = engineOverWorker(forward);
  const calls = memoryOverWorker(forward);
  const memory = { ...memoryData(calls, ZONE), v22: { site: v22Data(calls, null, true), own: v22Data(calls, null, false) } };
  const batches = { read: async () => null, progress: async () => ({}) };
  const host = createCoriHost({
    version: 2,
    bulk: PLATFORMS.map((p) => p.id).filter(bulkAvailableIn(true)),
    clock,
    zone: () => ZONE,
    dataFor: async (asker) => withOrg(surfaceData(asker, { engine, batches: batches as never, memory, clock }), forward),
  });
  world.on("cori.ask", async (m, tab) => {
    const ask = parseCoriAsk(m);
    if (!ask) throw new Error("bad_request");
    const asker: Asker = tab === "note" || tab === "prep" ? { surface: "page", site: "chatgpt" } : { surface: "dashboard" };
    return host.ask(asker, ask);
  });
}
