import { play, type Chapter } from "../../stage/player";
import type { DemoHost } from "../../stage/host";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";
import { extractAll } from "./batch";
import { FilmEngine, type PhaseOptions, type Tape } from "./engine";
import tape from "./data/tape.json";
import { script } from "./script";
import { hostCori } from "./cori";
import { voiceBackEnd, type VoiceBackEnd } from "./voice";
import { actionsWorld, type ActionsWorld } from "./actions";
import { workersBackEnd, type WorkersBackEnd } from "./workers";
import { DAYS } from "./days";

/**
 * The v2 film, "Coere v2: memory", played live (coere-v2
 * tools/demo-video/v2.demo.ts and v2/*.ts, beat by beat): Maya installs
 * Coere, saves her chats and builds her memory, takes Cori's tour, then
 * lives with it for twelve days. Every surface is Coere's own code:
 * onboarding, the dashboard, the content script on the replica sites and
 * Cori. What the engine and memory answer is what coere-v2's real engine
 * and memory core answered for Maya's chats (record/, data/tape.json).
 * The extension's own pages open in the film's tabs as console.html and
 * onboarding.html beside this page (pages/), with the film's clock.
 *
 * Beside the World stand the service worker's other parts, each coere-v2's
 * own code in the top page: Extract all's batch (batch.ts), Cori's host
 * (cori.ts), voice mode (voice.ts), Coere Actions' runs (actions.ts) and
 * the worker runs (workers.ts).
 *
 * Chapter ids and titles follow the film's chapters file
 * (public/preview/films/v2-chapters.vtt).
 */
export const CHAPTERS: Chapter[] = [
  { id: "install", title: "Install" },
  { id: "choose-your-ais", title: "Choose your AIs" },
  { id: "extract-all", title: "Extract all" },
  { id: "build-your-memory", title: "Build your memory" },
  { id: "the-graph-grows", title: "The graph grows" },
  { id: "your-memory-is-ready", title: "Your memory is ready" },
  { id: "coris-tour", title: "Cori's tour" },
  { id: "your-memory", title: "Your memory" },
  { id: "new-chats-come-in", title: "New chats come in" },
  { id: "context-as-you-type", title: "Context as you type" },
  { id: "voice-mode", title: "Voice mode" },
  { id: "ask-cori-to-act", title: "Ask Cori to act" },
  { id: "workers", title: "Workers" },
  { id: "statistics", title: "Statistics" },
  { id: "delete-a-topic", title: "Delete a topic" },
];

const params = new URLSearchParams(location.search);
const rec = params.get("rec");

/** What the script works with beyond the stage: the film's parts, its clock, and the engine's answers. */
export type Film = {
  phase(name: string, o?: PhaseOptions): Promise<void>;
  /** Puts the film's clock (every tab's Date) on one of its days. */
  day(at: number): void;
  now(): number;
  /** Follows a tab that navigates to a new page of its own. */
  follow(tab: Tab, go: () => Promise<void>): Promise<void>;
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

let engine: FilmEngine | null = null;
let voice: VoiceBackEnd | null = null;
let actions: ActionsWorld | null = null;
let workers: WorkersBackEnd | null = null;

function makeFilm(world: World): Film {
  const host = (window as unknown as { __demo: DemoHost }).__demo;
  const clock = { at: DAYS.start, from: Date.now() };
  host.extra.clock = clock;
  const now = () => clock.at + (Date.now() - clock.from);
  engine?.stop();
  engine = new FilmEngine(world, tape as unknown as Tape, rec, params.get("recFrom"));
  const film: Film = {
    phase: (name, o) => engine!.phase(name, o),
    day(at) {
      clock.at = at;
      clock.from = Date.now();
    },
    now,
    async follow(tab, go) {
      const loaded = new Promise<void>((done) => tab.frame.addEventListener("load", () => done(), { once: true }));
      await go();
      await loaded;
      tab.doc = tab.frame.contentDocument!;
      tab.win = tab.frame.contentWindow!;
      await tab.doc.fonts?.ready;
    },
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

/**
 * A page in a tab that scrolls an element into view (Cori's recipes in
 * Gmail do) also scrolls the frames' boxes in the top page, which never
 * scroll in a browser window; each such scroll is put back at once (as
 * the actions-gmail film does).
 */
let pinned = false;
function pinStage(): void {
  if (pinned) return;
  pinned = true;
  document.addEventListener(
    "scroll",
    (e) => {
      const el = e.target;
      if (el instanceof HTMLElement && (el.scrollLeft || el.scrollTop)) {
        el.scrollLeft = 0;
        el.scrollTop = 0;
      }
    },
    true,
  );
}

function setup(world: World): void {
  pinStage();
  guardListeners(world);
  const film = makeFilm(world);
  // The stage comes after the setup; these read it once the film starts.
  let stage = null as Stage | null;
  stages.push((s) => (stage = s));
  const fast = () => stage?.fast ?? false;
  engine!.fast = fast;
  // Voice mode, with the dashboard's question about its model packs answered as the offscreen document answers it.
  voice?.dispose();
  const back = (voice = voiceBackEnd(fast));
  const handle = world.handle.bind(world);
  world.handle = async (m, tab) => (m?.ch === "coere-voice" && m.to === "models" ? back.models(String(m.op), m.packs as string[] | undefined) : handle(m, tab));
  // Cori's worker runs, and Coere Actions' lone runs with Cori's Gmail tab as one of the film's tabs; the Actions messages reach the workers first.
  workers?.dispose();
  workers = workersBackEnd(world);
  actions = actionsWorld(world, engine!, () => stage !== null && !stage.fast, workers.runs);
  (window as unknown as { __demo: DemoHost }).__demo.extra.gmail = actions.bridge;
  hostCori(world, engine!, (tab) => stage?.sites.get(tab)?.host, film.now);
  // Extract all on Maya's three AIs: her 9 chats on ChatGPT, 22 on Claude and 18 on Gemini.
  extractAll(world, film.now, { chatgpt: { chats: 9, ms: 3400 }, claude: { chats: 22, ms: 5600 }, gemini: { chats: 18, ms: 4900 } }, fast);
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
    actions!.stage = s;
    await script(s, current!, REPLIES, voice!, actions!, workers!);
  } finally {
    current!.report();
  }
}

play({ title: "Coere v2: memory", chapters: CHAPTERS }, film, setup);
