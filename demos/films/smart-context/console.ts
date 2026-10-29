import { fakeStatus } from "@v2/apps/extension/src/console/testing/fake-memory-status";
import type { World } from "../../stage/world";
import maya from "./data/maya.json";

/**
 * What the dashboard's Settings page asks the extension, answered for
 * Maya once her memory is built: her memory's status, with the counts her
 * memory core gave (bake.mts: 532 memories from 324 chats, ChatGPT 148,
 * Claude 102, Gemini 74), the library her three AIs filled, how long
 * Cori's chats are kept, and the library's size. Settings shows only the
 * cards; the counts stay off screen, and agree with the strip and the
 * sidebar.
 */
type Platform = "chatgpt" | "claude" | "gemini";
type Row = { id: string; platform: Platform; key: string; title: string; at: string; messages: number };
const BAKED = maya as unknown as { status: { counts: { memories: number; dueSoon: number; sourceChats: number; sourceChatsBy: Record<Platform, number> } }; chats: Row[] };
const DAY = 86_400_000;
const NOW = Date.parse("2026-10-29T15:00:00Z");
const PLATFORMS: Platform[] = ["chatgpt", "claude", "gemini"];
const counts = BAKED.status.counts;
const CHATS = BAKED.chats.length;

/** Her library, newest first: each chat with the size a chat of its length has. */
const rows = [...BAKED.chats].reverse().map((c, i) => {
  const at = Date.parse(c.at);
  return {
    id: c.id,
    platform: c.platform,
    platformConvId: c.key,
    title: c.title,
    created: at,
    updated: at + (i % 7) * 3_600_000,
    messageCount: 2 * c.messages + 2 + (i % 5) * 2,
    bytes: 2_400 + c.messages * 1_100 + (i % 9) * 380,
    hash: `h${i}`,
    archived: false,
    changedDuringRun: false,
  };
});
const bytesOf = (p?: Platform) => rows.filter((r) => !p || r.platform === p).reduce((n, r) => n + r.bytes, 0);

export function setupConsole(world: World): void {
  // She has opened the dashboard before, so Cori said his hello then (console/cori/hello.ts).
  world.write("local", { "coere.cori.hello": { at: NOW - 3 * DAY } });
  world
    .engine("memory.status", () =>
      fakeStatus("ready", {
        until: null,
        set: null,
        counts: { ...counts, review: 0, held: 0, chatsRead: CHATS, chatsInLibrary: CHATS, failedJobs: 0, refusedJobs: 0 },
        spend: { monthMicros: 1_840_000, capMicros: 20_000_000 },
        poolSlots: { used: 0, capacity: 6 },
      } as never),
    )
    // Her memory is built: nothing left to estimate.
    .engine("memory.buildEstimate", () => ({ chats: CHATS, seconds: 0, measured: true, progress: null }))
    // The voice models' status (a message with no type): Voice mode is not set up, so Settings offers it.
    .on("", () => null)
    .engine("memory.chat.keep", () => ({ keep: "forever", cleared: 0 }))
    // The library's pages, as the engine pages them (offset and limit, by AI and title).
    .engine("listConversations", (m) => {
      const a = (m.args ?? {}) as { platforms?: Platform[]; titleContains?: string; offset?: number; limit?: number };
      const needle = a.titleContains?.toLowerCase();
      const list = rows.filter((r) => (!a.platforms?.length || a.platforms.includes(r.platform)) && (!needle || r.title.toLowerCase().includes(needle)));
      const from = a.offset ?? 0;
      return { rows: list.slice(from, from + (a.limit ?? list.length)), total: list.length };
    })
    .engine("stats", () => ({
      conversations: CHATS,
      chunks: rows.reduce((n, r) => n + Math.ceil(r.bytes / 1_500), 0),
      projects: 0,
      textBytes: bytesOf(),
      dbBytes: Math.round(bytesOf() * 7.8),
      byPlatform: Object.fromEntries(PLATFORMS.map((p) => [p, { conversations: rows.filter((r) => r.platform === p).length, bytes: bytesOf(p) }])),
    }));
}
