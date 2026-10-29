import { HELLO_KEY } from "@v2/apps/extension/src/console/cori/hello";
import type { World } from "../../stage/world";
import forge from "./data/forge.json";

/**
 * The extension's side of the forge-dev film: the dashboard's Apps
 * section, answered from what the engine worker's real access layer read
 * from a real coere-server paired with Maya's memory (bake.mts), before
 * the app was added and after Make token. Make token gets the token the
 * server made.
 */

type AppsRead = { status: { [k: string]: unknown }; tokens: unknown[]; log: unknown[]; connects: unknown[]; requests: unknown[] };
type Forge = { made: { row: unknown; token: string }; phases: { paired: AppsRead; made: AppsRead; used: AppsRead }; draft: string; context: { block: string }; reads: { status: unknown; settings: unknown; estimate: unknown } };
export const FORGE = forge as unknown as Forge;

export class ForgeWorld {
  step: "paired" | "made" = "paired";

  constructor(private readonly world: World) {}

  install(): void {
    const w = this.world;
    // Cori says hello on the first visit to the dashboard, which this film does not show.
    w.write("local", { [HELLO_KEY]: { at: Date.now() - 3_600_000 } });
    const read = () => FORGE.phases[this.step];
    w.engine("access.status", () => read().status);
    w.engine("access.syncNow", () => read().status);
    w.engine("access.tokens.list", () => read().tokens);
    w.engine("access.contextLog", () => read().log);
    w.engine("access.connects.list", () => read().connects);
    w.engine("access.requests", () => read().requests);
    w.engine("access.suggestions.list", () => []);
    w.engine("access.tokens.create", async () => {
      // The server answers in a moment, as the worker's signed call does.
      await new Promise((r) => setTimeout(r, 450));
      this.step = "made";
      w.tell({ ch: "coere", type: "engine.event", event: { name: "access.status", status: read().status } });
      return FORGE.made;
    });
    w.engine("memory.status", () => FORGE.reads.status);
    w.engine("memory.settings", () => FORGE.reads.settings);
    w.engine("memory.buildEstimate", () => FORGE.reads.estimate);
    w.engine("memory.hint", () => null);
  }
}
