import { play, type Chapter } from "../../stage/player";
import type { DemoHost } from "../../stage/host";
import type { Stage } from "../../stage/stage";
import type { World } from "../../stage/world";
import { extractAll } from "./batch";
import { FilmEngine, type PhaseOptions, type Tape } from "./engine";
import tape from "./data/tape.json";
import { script } from "./script";
import { hostCori } from "./cori";
import { DAYS } from "./days";

/**
 * The v2 film, "Coere v2: memory", played live: Maya installs Coere and
 * picks her AIs, Extract all saves her 324 chats and new ones save by
 * themselves, Coere builds her memory and she looks through it, and in a
 * new chat her memory goes in as she types. Every surface is Coere's own
 * code: onboarding, the dashboard and the content script on the replica
 * sites. What the engine and memory answer is what coere-v2's real engine
 * and memory core answered for her chats (record/, data/tape.json). The
 * extension's own pages open in the film's tabs as console.html and
 * onboarding.html beside this page (pages/), with the film's clock.
 *
 * Beside the World stand the service worker's other parts, each coere-v2's
 * own code in the top page: Extract all's batch (batch.ts) and Cori's host
 * (cori.ts).
 *
 * The seconds are each chapter's length in a full run (measured with
 * `?debug=1`, which logs each chapter as it starts).
 */
export const CHAPTERS: Chapter[] = [
  { id: "onboarding", title: "Onboarding", seconds: 9 },
  { id: "import", title: "Import", seconds: 15 },
  { id: "memory", title: "Memory", seconds: 43 },
  { id: "features", title: "Features", seconds: 31 },
];

const params = new URLSearchParams(location.search);
const rec = params.get("rec");

/** What the script works with beyond the stage: the film's parts, its clock, and the engine's answers. */
export type Film = {
  phase(name: string, o?: PhaseOptions): Promise<void>;
  now(): number;
  /** Whether calls go to the recorder (`?rec=`), where the real build takes its own time. */
  recording: boolean;
  report(): void;
};

/** What ChatGPT answers when Maya sends her draft (coere-v2 tools/demo-video/v2/data.ts REPLIES). */
const REPLIES: readonly string[] = [
  [
    "Here is a plan for your PearX interview, built on the prep you already did.",
    "",
    "1. Open with traction. Lead with the numbers from your answer, then say why now.",
    "2. Practice the hard questions. I will ask the partners’ likely questions one at a time.",
    "3. Tighten each answer. Aim for under a minute each, and end on the ask.",
    "",
    "Ready for the first question?",
  ].join("\n"),
];

/** What Extract all finds on each AI (record/corpus.mts SPLIT), and how long each row takes to fill. */
const EXTRACT = { chatgpt: { chats: 148, ms: 7400 }, claude: { chats: 102, ms: 6200 }, gemini: { chats: 74, ms: 5000 } };

let engine: FilmEngine | null = null;

function makeFilm(world: World): Film {
  const host = (window as unknown as { __demo: DemoHost }).__demo;
  const clock = { at: DAYS.today, from: Date.now() };
  host.extra.clock = clock;
  const now = () => clock.at + (Date.now() - clock.from);
  engine?.stop();
  engine = new FilmEngine(world, tape as unknown as Tape, rec, params.get("recFrom"));
  const film: Film = {
    phase: (name, o) => engine!.phase(name, o),
    now,
    recording: Boolean(rec),
    report() {
      const lines = { unanswered: [...new Set(world.unanswered.map((u) => `${u.tab}: ${u.type}`))], misses: [...new Set(engine?.misses ?? [])] };
      console.log("REPORT", JSON.stringify(lines));
      if (rec) void fetch(`${rec}/log`, { method: "POST", body: JSON.stringify(lines) }).then(() => fetch(`${rec}/save`));
    },
  };
  current = film;
  return film;
}

let current: Film | null = null;

/**
 * A closed tab's listeners stay with the World, and calling into a page
 * that is gone throws, which would stop every listener after it. Each one
 * is guarded here, so a closed tab is passed over (a shared fix belongs in
 * stage/world.ts: Stage.close dropping the tab's listeners).
 */
function guardListeners(world: World): void {
  const guard = <F extends (...a: never[]) => unknown>(fn: F): F =>
    ((...a: Parameters<F>) => {
      try {
        return fn(...a);
      } catch {
        return undefined;
      }
    }) as F;
  const watch = world.watchStorage.bind(world);
  world.watchStorage = (fn) => watch(guard(fn));
  const listen = world.listen.bind(world);
  world.listen = (tab, fn) => listen(tab, guard(fn));
}

function setup(world: World): void {
  guardListeners(world);
  const film = makeFilm(world);
  // The stage comes after the setup; these read it once the film starts.
  let stage = null as Stage | null;
  stages.push((s) => (stage = s));
  const fast = () => stage?.fast ?? false;
  engine!.fast = fast;
  hostCori(world, engine!, (tab: string) => stage?.sites.get(tab)?.host, film.now);
  // Voice mode stays off in this film, so onboarding's question about its models gets no state, as in the v3 film.
  const handle = world.handle.bind(world);
  world.handle = async (m, tab) => (m?.ch === "coere-voice" ? { ok: true, result: null } : handle(m, tab));
  // Cori's tip on a site shows once per install; Maya has seen it, so the visit to Claude stays on her chats.
  world.write("local", { "coere.cori.hint": { v: 1, seen: true, at: DAYS.today - 3_600_000 } });
  extractAll(world, film.now, EXTRACT, fast);
}

const stages: ((s: Stage) => void)[] = [];

async function film(s: Stage): Promise<void> {
  stages.splice(0).forEach((f) => f(s));
  // An empty caption clears the line, as the films' director does, so no empty bar is left on screen.
  const say0 = s.say.bind(s);
  s.say = (line) => {
    const bar = document.getElementById("caption");
    if (bar) bar.style.visibility = line ? "" : "hidden";
    say0(line);
  };
  // `?debug=1` logs each chapter and caption as the script reaches it.
  if (params.get("debug") === "1") {
    const [say, chapter] = [s.say.bind(s), s.chapter.bind(s)];
    const t0 = performance.now();
    const at = () => ((performance.now() - t0) / 1000).toFixed(1);
    s.say = (line) => (console.log(at(), "say", line), say(line));
    s.chapter = (id) => (console.log(at(), "chapter", id), chapter(id));
  }
  try {
    await script(s, current!, REPLIES);
  } finally {
    current!.report();
    if (params.get("debug") === "1") console.log("end");
  }
}

play({ title: "Coere v2: memory", chapters: CHAPTERS }, film, setup);

