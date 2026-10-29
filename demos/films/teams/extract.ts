import type { PlatformId } from "@coere/core";
import { BATCH_KEY, progressKey, type Batch, type BatchEntry, type BatchStart, type StoredProgress } from "@v2/apps/extension/src/lib/batch-types";
import type { World } from "../../stage/world";
import type { Mem } from "./memory";
import { pace } from "./pace";

/**
 * Extract all as the service worker runs it (docs/design/dashboard.md 7):
 * `batch.start` opens a tab per AI, each tab's run saves its chats and
 * reports its progress, and the worker keeps the batch and the latest
 * progress of each AI in session storage and relays it to the pages. Here
 * the AIs' runs are the agency's chats on each site, saved at a site's pace.
 */

/** How long one AI's run takes, in ms, from its first chat to done. */
const RUN_MS = 3800;
const TICK_MS = 250;

const id = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function answerExtract(world: World, mem: Mem): void {
  world.on("batch.start", (m) => {
    const body = m as unknown as BatchStart;
    const now = Date.now();
    const batchId = id("batch");
    const entry = (platform: PlatformId, i: number): BatchEntry => ({
      platform,
      step: "running",
      tabId: 2000 + i,
      openedByUs: true,
      openedAt: now,
      helloAt: now,
      pending: null,
      deliveredAt: now,
      runId: id("run"),
      autoResumes: 0,
      stopReason: null,
      lastOutcome: "started",
      unheld: false,
      reopens: [],
    });
    const batch: Batch = {
      v: 1,
      batchId,
      startedAt: now,
      settings: body.settings,
      hold: "none",
      groupId: null,
      entries: [...body.platforms.map(entry), ...body.unavailable.map((p, i) => ({ ...entry(p, 100 + i), step: "unavailable" as const, tabId: null, runId: null }))],
    };
    world.write("session", { [BATCH_KEY]: batch });
    run(world, mem, batch);
    return { batchId };
  });
  world.on("batch.action", (m) => {
    // Clear puts a finished batch away: the worker drops it and each AI's last progress.
    if ((m as { action?: string }).action === "clear") {
      const batch = world.stores.session?.[BATCH_KEY] as Batch | undefined;
      world.remove("session", [BATCH_KEY, ...(batch?.entries ?? []).map((e) => progressKey(e.platform))]);
    }
    return { ok: true };
  });
}

/** Each AI's run, saving its chats a few at a time, relayed as the worker relays a tab's progress. */
function run(world: World, mem: Mem, batch: Batch): void {
  const start = Date.now();
  const runs = batch.entries
    .filter((e) => e.step === "running")
    .map((e, i) => {
      const chats = mem.chats.filter((c) => c.platform === e.platform);
      const projects = new Set(chats.map((c) => c.project).filter(Boolean)).size;
      // The AIs start a moment apart and run at their own pace, as separate tabs do.
      // A bigger library takes a little longer, within the few seconds a viewer waits.
      return { e, chats: chats.length, projects, delay: 250 + i * 180, ms: RUN_MS * (0.75 + Math.min(chats.length, 80) / 80) * 0.75 };
    });
  const timer = setInterval(() => {
    const now = Date.now();
    let left = false;
    for (const r of runs) {
      const t = pace.fast() ? 1 : Math.min(1, Math.max(0, (now - start - r.delay) / r.ms));
      const done = Math.round(r.chats * t);
      const finished = t >= 1;
      if (!finished) left = true;
      const progress = {
        runId: r.e.runId!,
        platform: r.e.platform,
        phase: finished ? ("done" as const) : t === 0 ? ("ready" as const) : ("extracting" as const),
        foundChats: r.chats,
        foundProjects: r.projects,
        total: t === 0 ? 0 : r.chats,
        done,
        indexed: done,
        errors: 0,
        bytes: done * 14_200,
        chatsPerSec: finished ? 0 : r.chats / (r.ms / 1000),
        etaSec: finished ? null : Math.max(1, Math.round(((1 - t) * r.ms) / 1000)),
        listingDone: true,
        skipped: 0,
      };
      const stored: StoredProgress = { tabId: r.e.tabId!, at: now, progress };
      world.write("session", { [progressKey(r.e.platform)]: stored });
      world.tell({ ch: "coere", type: "run.progress", via: "worker", tabId: r.e.tabId, progress });
    }
    if (!left) {
      clearInterval(timer);
      // Each tab said its run ended; the worker marks the entries and lets the tabs go.
      const ended: Batch = { ...batch, entries: batch.entries.map((e) => (e.step === "running" ? { ...e, step: "stopped" as const, stopReason: "done" as const, lastOutcome: "over" as const } : e)) };
      world.write("session", { [BATCH_KEY]: ended });
    }
  }, TICK_MS);
}
