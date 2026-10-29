import { BATCH_KEY, progressKey } from "@v2/apps/extension/src/lib/batch-types";
import type { World } from "../../stage/world";

/**
 * Extract all as the service worker runs it, for onboarding to follow:
 * batch.start makes the batch in session storage, a tab per AI (in the
 * background, never filmed, as in coere-v2's film), and each tab's run
 * reports its counts through the worker's relay until every chat is
 * saved. The shapes are coere-v2's lib/batch-types.ts, which onboarding's
 * parsers check field by field. Each AI holds Maya's chats on it
 * (bake.mts counts them: 148, 102 and 74).
 */
type Plan = Record<string, { chats: number; ms: number }>;

const HOSTS: Record<string, string> = { chatgpt: "chatgpt.com", claude: "claude.ai", gemini: "gemini.google.com" };

export function extractAll(world: World, plan: Plan, fast: () => boolean): void {
  const tabs = new Map<number, string>();
  const live = new Map<string, { runId: string; tabId: number; done: number; total: number; phase: string }>();
  let batch: Record<string, unknown> | null = null;
  const now = () => Date.now();

  const counts = (p: string) => {
    const r = live.get(p)!;
    const rate = plan[p]!.chats / (plan[p]!.ms / 1000);
    return {
      runId: r.runId,
      platform: p,
      phase: r.phase,
      foundChats: r.total,
      foundProjects: 0,
      total: r.total,
      done: r.done,
      indexed: r.done,
      errors: 0,
      bytes: r.done * 21_000,
      chatsPerSec: rate,
      etaSec: r.phase === "done" ? 0 : Math.round((r.total - r.done) / rate),
      skipped: 0,
    };
  };

  const report = (p: string) => {
    const r = live.get(p)!;
    const progress = counts(p);
    world.write("session", { [progressKey(p)]: { tabId: r.tabId, at: now(), progress } });
    world.tell({ ch: "coere", type: "run.progress", via: "worker", tabId: r.tabId, progress });
  };

  world.on("batch.start", (m) => {
    const platforms = (m.platforms as string[]) ?? [];
    const at = now();
    const id = (s: string) => `${s}-${at.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const entries = platforms.map((platform, i) => {
      const tabId = 4201 + i;
      const runId = id(`run-${platform}`);
      tabs.set(tabId, platform);
      live.set(platform, { runId, tabId, done: 0, total: plan[platform]?.chats ?? 0, phase: "extracting" });
      return { platform, step: "running", tabId, openedByUs: true, openedAt: at, helloAt: at, pending: null, deliveredAt: at, runId, autoResumes: 0, stopReason: null, lastOutcome: "started", unheld: false, reopens: [] };
    });
    batch = { v: 1, batchId: id("batch"), startedAt: at, settings: m.settings, hold: "none", groupId: 7, entries };
    world.write("session", { [BATCH_KEY]: batch });
    const begun = performance.now();
    const step = () => {
      const elapsed = performance.now() - begun;
      let running = false;
      for (const p of platforms) {
        const r = live.get(p)!;
        if (r.phase === "done") continue;
        const ms = plan[p]?.ms ?? 5000;
        r.done = fast() ? r.total : Math.min(r.total, Math.floor((elapsed / ms) * r.total));
        if (r.done >= r.total) r.phase = "done";
        else running = true;
        report(p);
        // The tab says its run is over, and the worker marks the entry done.
        if (r.phase === "done" && batch) {
          batch = { ...batch, entries: (batch.entries as Record<string, unknown>[]).map((e) => (e.platform === p ? { ...e, step: "stopped", stopReason: "done" } : e)) };
          world.write("session", { [BATCH_KEY]: batch });
        }
      }
      if (running) setTimeout(step, fast() ? 30 : 280);
    };
    setTimeout(step, fast() ? 30 : 400);
    return { batchId: batch.batchId };
  });

  world.on("batch.action", (m) => {
    if (m.action === "clear" && batch) {
      world.remove("session", [BATCH_KEY, ...[...live.keys()].map(progressKey)]);
      batch = null;
    }
    return { applied: true };
  });
  world.on("demo.tab", (m) => {
    const p = tabs.get(Number(m.tabId));
    return p ? { id: m.tabId, windowId: 1, url: `https://${HOSTS[p]}/`, status: "complete", discarded: false, frozen: false, active: false } : null;
  });
}

/** Puts a finished Extract all away, as Clear on the dashboard's dock does. */
export function clearBatch(world: World): void {
  world.remove("session", [BATCH_KEY, ...["chatgpt", "claude", "gemini"].map(progressKey)]);
}
