import type { BuildPhase, BuildProgress, MemorySettings } from "@coere/memory";
import { SOLUTION_DEFAULT_SCOPE } from "@v2/apps/extension/src/solution/checklist/rows";
import type { World } from "../../stage/world";
import type { Mem } from "./memory";
import { pace } from "./pace";
import * as v from "./views";

/**
 * Building the company's memory (memory-v2-2.md 4.13, 10.3 to 10.6): the
 * build step's settings, Build my memory, and the build going through its
 * phases, writing the memories a few at a time, with the progress, status
 * and change events the engine posts, until it says it is built.
 */

/** Each phase's share of a watched build, in ms. */
const PHASES: ReadonlyArray<[BuildPhase, number]> = [
  ["sorting", 1800],
  ["keeping", 900],
  ["building", 9500],
  ["linking", 1000],
];
const TICK_MS = 280;

type Args = Record<string, unknown>;
const args = (m: { args?: unknown }): Args => (m.args ?? {}) as Args;

export function answerBuild(world: World, mem: Mem): void {
  // A Teams install builds everything for work until the person changes it (solution/checklist/rows.ts).
  let settings: MemorySettings = { ...v.settings(mem), extractScope: SOLUTION_DEFAULT_SCOPE };
  let progress: BuildProgress | null = null;
  const event = (e: unknown) => world.tell({ ch: "coere", type: "engine.event", event: e });

  world
    .engine("memory.settings", () => settings)
    .engine("memory.setSettings", (m) => (settings = { ...settings, ...(args(m) as Partial<MemorySettings>) }))
    .engine("memory.buildEstimate", () => ({ chats: mem.chats.length, seconds: 540, measured: false, progress }))
    .engine("memory.status", () => v.status(mem, { state: progress ? "running" : "ready" }))
    .engine("memory.control", (m) => {
      if (args(m).action === "build" && progress === null) start(args(m).from === "onboarding");
      return v.status(mem, { state: "running" });
    });

  function start(fromOnboarding: boolean): void {
    const total = mem.facts.size;
    const chats = mem.chats.length;
    const startedAt = Date.now();
    mem.written = 0;
    const span = PHASES.reduce((n, [, ms]) => n + ms, 0);
    const tick = () => {
      const scale = pace.fast() ? 0.02 : 1;
      const at = (Date.now() - startedAt) / scale;
      let before = 0;
      let phase: BuildPhase | null = null;
      let into = 0;
      for (const [p, ms] of PHASES) {
        if (at < before + ms) {
          phase = p;
          into = (at - before) / ms;
          break;
        }
        before += ms;
      }
      if (phase === null) return finish();
      const building = phase === "building" ? into : phase === "linking" ? 1 : 0;
      const written = Math.round(total * building);
      const changed = written !== mem.written;
      mem.written = written;
      const shown = v.overview(mem);
      progress = {
        phase,
        chats,
        chatsDone: phase === "sorting" ? Math.round(chats * into) : chats,
        pieces: total,
        piecesDone: written,
        memories: written,
        sections: shown.nodes.filter((n) => n.kind === "section").length,
        folders: shown.nodes.filter((n) => n.kind !== "section" && n.kind !== "self").length,
        // The time left, at the engine's starting rates for a library of this size.
        secondsLeft: Math.max(20, Math.round(540 * (1 - at / span))),
        startedAt,
        fromOnboarding,
      };
      event({ name: "memory.build", progress });
      if (changed) event({ name: "memory.changed", all: true });
      event({ name: "memory.status", status: v.status(mem, { state: "running" }) });
      timer = window.setTimeout(tick, pace.fast() ? 10 : TICK_MS);
    };
    const finish = () => {
      mem.written = null;
      progress = null;
      event({ name: "memory.changed", all: true });
      event({ name: "memory.status", status: v.status(mem) });
      event({ name: "memory.built", fromOnboarding });
    };
    let timer = window.setTimeout(tick, 0);
    void timer;
  }
}
