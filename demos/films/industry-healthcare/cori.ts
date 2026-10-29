import { PLATFORMS } from "@coere/platforms";
import { v22Data, memoryData, memoryOverWorker } from "@v2/apps/extension/src/background/cori/data-memory";
import { engineOverWorker, type Forward } from "@v2/apps/extension/src/background/cori/engine-port";
import { createCoriHost, surfaceData, type Asker } from "@v2/apps/extension/src/background/cori/host";
import { bulkAvailableIn } from "@v2/apps/extension/src/lib/bulk-available";
import { parseCoriAsk } from "@v2/apps/extension/src/lib/cori-messages";
import { withOrg } from "@v2/apps/extension/src/solution/seams/cori-host";
import type { World } from "../../stage/world";
import { ZONE } from "./memory";

/**
 * Cori as the service worker runs him (background/cori/host.ts), in the
 * demo's top page: the real host, its surface reads and Coere for Teams'
 * client and worker reads (solution/seams/cori-host.ts), each engine call
 * they make answered by the World, as the offscreen engine answers the
 * worker. A `cori.ask` from a tab gets his answer. Copied from the teams
 * film (demos/films/teams/cori.ts), on the film's clock.
 */
export function answerCori(world: World, now: () => number, pageTabs: readonly string[]): void {
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
    clock: now,
    zone: () => ZONE,
    dataFor: async (asker) => withOrg(surfaceData(asker, { engine, batches: batches as never, memory, clock: now }), forward),
  });
  world.on("cori.ask", async (m, tab) => {
    const ask = parseCoriAsk(m);
    if (!ask) throw new Error("bad_request");
    const asker: Asker = pageTabs.includes(tab) ? { surface: "page", site: "chatgpt" } : { surface: "dashboard" };
    return host.ask(asker, ask);
  });
}
