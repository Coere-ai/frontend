import { FakeEngine } from "@v2/apps/extension/src/console/testing/fake-engine";
import { fakeMemoryDeps } from "@v2/apps/extension/src/console/testing/fake-memory-deps";
import { fakeStatus } from "@v2/apps/extension/src/console/testing/fake-memory-status";
import type { World } from "../../stage/world";

/**
 * The rest of what the dashboard and the toolbar popup ask the extension,
 * as the console's own fakes answer it (apps/extension/src/console/testing):
 * an empty library and a memory that is ready. The film shows only the
 * Cori page and the popup's Cori, so none of this is on screen; it keeps
 * the pages from waiting on a worker that never answers.
 */
export function consoleWorld(world: World): void {
  const engine = new FakeEngine();
  const proto = Object.getPrototypeOf(engine) as Record<string, unknown>;
  for (const name of Object.getOwnPropertyNames(proto)) {
    const fn = proto[name];
    if (name === "constructor" || name === "seed" || name === "store" || typeof fn !== "function") continue;
    world.engine(name, (m) => (fn as (a: unknown) => unknown).call(engine, m.args));
  }
  const api = fakeMemoryDeps({ status: fakeStatus("ready", { held: null }) }).deps.api as unknown as Record<string, (a: unknown) => unknown>;
  for (const [name, fn] of Object.entries(api)) world.engine(name, (m) => fn(m.args));
}
