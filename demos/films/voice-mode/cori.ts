import { createCoriHost } from "@v2/apps/extension/src/background/cori/host";
import { pageData } from "@v2/apps/extension/src/background/cori/data-page";
import { parseCoriAsk } from "@v2/apps/extension/src/lib/cori-messages";
import type { World } from "../../stage/world";

/**
 * Cori's answers on ChatGPT, from the service worker's own Cori host
 * (background/cori/host.ts): his notes and rules answer the line her voice
 * sent, over the reads a site tab gets (data-page.ts). "What can you do?"
 * needs no read; a search would find nothing here.
 */
export function setupCori(world: World): void {
  const host = createCoriHost({
    version: 2,
    bulk: ["chatgpt", "claude", "gemini"],
    clock: Date.now,
    zone: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    dataFor: async () => ({ ...pageData({ search: async () => [] } as never, async () => []) }),
  });
  world.on("cori.ask", async (m) => {
    const ask = parseCoriAsk(m);
    if (!ask) throw new Error("cori.ask has a body Cori cannot read");
    return host.ask({ surface: "page", site: "chatgpt" }, ask);
  });
}
