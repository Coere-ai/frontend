import type { PlatformId } from "@coere/core";
import { PLATFORMS } from "@coere/platforms";
import { memoryData, memoryOverWorker, v22Data } from "@v2/apps/extension/src/background/cori/data-memory";
import { engineOverWorker, type Forward } from "@v2/apps/extension/src/background/cori/engine-port";
import { createCoriHost, surfaceData, type Asker } from "@v2/apps/extension/src/background/cori/host";
import type { BatchReads } from "@v2/apps/extension/src/background/cori/data-status";
import { bulkAvailableIn } from "@v2/apps/extension/src/lib/bulk-available";
import { parseCoriAsk } from "@v2/apps/extension/src/lib/cori-messages";
import type { World } from "../../stage/world";
import type { FilmEngine } from "./engine";

/**
 * Cori as the service worker hosts him (coere-v2 apps/extension/src
 * background/cori/host.ts): one Cori per surface, built from his own
 * notes and the reads each asker may make, here over the film's engine,
 * so his answers are his own code's and memory's (memory.route and the
 * rest come from the tape, as the real memory answered them). A site tab
 * asks as that site's page; the dashboard and its Cori page as the
 * dashboard.
 */
const HOSTS: Record<string, PlatformId> = { "chatgpt.com": "chatgpt", "claude.ai": "claude", "gemini.google.com": "gemini" };
const ZONE = "America/Los_Angeles";

export function hostCori(world: World, engine: FilmEngine, siteOf: (tab: string) => string | undefined, now: () => number): void {
  const forward: Forward = async (msg) => ({ id: msg.id, ...(await engine.answer(msg.method, msg.args)) }) as never;
  const memory = memoryOverWorker(forward);
  const batches = {
    read: async () => (world.stores.session["coere.batch"] as never) ?? null,
    progress: async () => new Map() as never,
  } as unknown as BatchReads;
  const host = createCoriHost({
    version: 2,
    bulk: PLATFORMS.map((p) => p.id).filter(bulkAvailableIn(true)),
    clock: now,
    zone: () => ZONE,
    dataFor: async (asker) =>
      surfaceData(asker, {
        engine: engineOverWorker(forward),
        batches,
        memory: { ...memoryData(memory, ZONE), v22: { site: v22Data(memory, null, true), own: v22Data(memory, null, false) } },
        clock: now,
      }),
  });
  world.on("cori.ask", async (m, tab) => {
    const ask = parseCoriAsk(m);
    if (!ask) throw new Error("cori.ask has a body Cori cannot read");
    const site = HOSTS[siteOf(tab) ?? ""];
    const asker: Asker = site ? { surface: "page", site } : { surface: "dashboard" };
    return host.ask(asker, ask);
  });
}
