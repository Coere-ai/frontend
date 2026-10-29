import type { CoriTurnBlock } from "@coere/memory/actions";
import { seedHistory } from "@v2/apps/extension/src/console/cori-page/testing/seed";
import { fakeHistory } from "@v2/apps/extension/src/cori/chat/history/testing/fake-history";
import type { World } from "../../stage/world";
import { MEMORY_NOW } from "./cori";

/**
 * Cori's one history (coere-actions.md 11): every surface writes its chat
 * to it through memory.chat.append, and the dashboard's Cori page lists,
 * searches and opens it. The history is coere-v2's own page fake of the
 * store, which keeps the store's rules, seeded with the Cori page's own
 * sample chats (console/cori-page/testing/seed.ts) as the film's boot did,
 * dated back from the moment the demo plays. A chat opened again reads its
 * memory cards as the store does, with the words memory holds now.
 */
export function coriHistory(world: World): Promise<void> {
  const history = fakeHistory({ now: () => Date.now() });
  const seeded = seedHistory(history, Date.now());
  const withNow = (blocks: CoriTurnBlock[]): CoriTurnBlock[] =>
    blocks.map((b) => (b.type === "memory" ? { ...b, facts: b.facts.map((f) => ({ id: f.id, path: [...f.path], now: (MEMORY_NOW[f.id] as never) ?? null })) } : b));
  for (const [name, fn] of Object.entries(history)) {
    if (typeof fn !== "function") continue;
    world.engine(name, async (m) => {
      await seeded;
      const answer = await (fn as (a: unknown) => Promise<unknown>)(m.args);
      if (name === "memory.chat.get" && answer) {
        const got = answer as { turns: Array<{ blocks: CoriTurnBlock[] }> };
        return { ...got, turns: got.turns.map((t) => ({ ...t, blocks: withNow(t.blocks) })) };
      }
      return answer;
    });
  }
  return seeded;
}
