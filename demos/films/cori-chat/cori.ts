import { PLATFORMS } from "@coere/platforms";
import { memoryData, memoryOverWorker, v22Data } from "@v2/apps/extension/src/background/cori/data-memory";
import { engineOverWorker, type Forward } from "@v2/apps/extension/src/background/cori/engine-port";
import { createCoriHost, surfaceData, type Asker } from "@v2/apps/extension/src/background/cori/host";
import { bulkAvailableIn } from "@v2/apps/extension/src/lib/bulk-available";
import { parseCoriAsk } from "@v2/apps/extension/src/lib/cori-messages";
import type { World } from "../../stage/world";
import baked from "./data/cori.json";
import { ZONE } from "./lines";

/**
 * Cori as the service worker hosts him (coere-v2 background/cori/host.ts),
 * in the demo's top page: one Cori per surface, the dashboard's, the
 * toolbar popup's and Claude's, each with the reads its surface may make.
 * His engine calls are answered with what Maya's memory answered them in
 * coere-v2's own memory core (bake.mts), so every answer, card and chip is
 * his own code's over the memory the product holds.
 */
type Call = { method: string; args: unknown; answer: unknown };
type Baked = { calls: Call[]; now: Record<string, unknown>; status: unknown };
const data = baked as unknown as Baked;

/** The same key for the same arguments, whatever their order; the Cori chat a route call names is left out. */
function keyOf(method: string, args: unknown): string {
  const norm = (v: unknown): unknown =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).filter(([k, x]) => x !== undefined && k !== "conv").sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, x]) => [k, norm(x)]))
      : v;
  return `${method} ${JSON.stringify(norm(args ?? null))}`;
}
const TABLE = new Map(data.calls.map((c) => [keyOf(c.method, c.args), c.answer]));

/** What memory answers a read it was not asked in the bake: nothing found. */
function nothing(method: string): unknown {
  if (method === "memory.search") return { stage: 1, intent: { deadline: false, history: false, people: false, window: null }, open: null, hits: [], library: [], total: 0, capped: false };
  if (method === "recall.memory") return { rows: [] };
  if (method === "memory.dueSoon") return [];
  if (method === "search") return { hits: [], total: 0 };
  return null;
}

/** Each memory card's words as the history reads them when a stored chat opens again (memory-cards.ts withMemoryNow). */
export const MEMORY_NOW = data.now;

/** Memory's status once her memory file was imported, as the popup's Home and the dashboard read it. */
export const MEMORY_STATUS = data.status;

/** Which surface a tab asks as: Claude's page, the toolbar popup, or the dashboard. */
const ASKERS: Record<string, Asker> = { claude: { surface: "page", site: "claude" }, popup: { surface: "popup" } };

export function hostCori(world: World): void {
  const missed: string[] = [];
  const forward: Forward = async (msg) => {
    const key = keyOf(msg.method, msg.args);
    if (!TABLE.has(key)) missed.push(key);
    return { id: msg.id, ok: true, result: TABLE.has(key) ? structuredClone(TABLE.get(key)) : nothing(msg.method) } as never;
  };
  (window as unknown as { __coriMissed?: string[] }).__coriMissed = missed;
  const memory = memoryOverWorker(forward);
  const batches = { read: async () => null, progress: async () => new Map() } as never;
  const host = createCoriHost({
    version: 2,
    bulk: PLATFORMS.map((p) => p.id).filter(bulkAvailableIn(true)),
    clock: Date.now,
    zone: () => ZONE,
    dataFor: async (asker) =>
      surfaceData(asker, {
        engine: engineOverWorker(forward),
        batches,
        memory: { ...memoryData(memory, ZONE), v22: { site: v22Data(memory, null, true), own: v22Data(memory, null, false) } },
        clock: Date.now,
      }),
  });
  world.on("cori.ask", async (m, tab) => {
    const ask = parseCoriAsk(m);
    if (!ask) throw new Error("cori.ask has a body Cori cannot read");
    return host.ask(ASKERS[tab] ?? { surface: "dashboard" }, ask);
  });
}
