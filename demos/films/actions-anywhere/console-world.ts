import { FakeEngine } from "@v2/apps/extension/src/console/testing/fake-engine";
import { fakeMemoryDeps } from "@v2/apps/extension/src/console/testing/fake-memory-deps";
import { fakeStatus } from "@v2/apps/extension/src/console/testing/fake-memory-status";
import { fakeHistory } from "@v2/apps/extension/src/cori/chat/history/testing/fake-history";
import type { World } from "../../stage/world";

/**
 * The toolbar popup's engine and memory, as the dashboard's own fakes
 * answer them (apps/extension/src/console/testing): a library, a memory
 * that is ready, and Cori's history held in the page, which the popup's
 * chat writes each turn to.
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
  const history = fakeHistory({ now: () => Date.now() }) as unknown as Record<string, (a: unknown) => unknown>;
  for (const [name, fn] of Object.entries(api)) world.engine(name, (m) => fn(m.args));
  for (const [name, fn] of Object.entries(history)) if (typeof fn === "function") world.engine(name, (m) => fn(m.args));
}
