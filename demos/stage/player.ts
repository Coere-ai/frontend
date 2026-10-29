import { ASSETS, type DemoHost } from "./host";
import { CSS, STAGE, stageHtml } from "./look";
import { Stage } from "./stage";
import { World } from "./world";

/**
 * Plays one film's script live in its page, over and over. The address
 * picks what plays: `from` and `to` name chapters (the site's short
 * showcases play one part this way, skipping to it unseen), `at` starts
 * that many seconds into `from`, `captions=1` shows the caption line, and
 * `loop=0` stops at the end. The stage is the films' 1440 by 900 window,
 * scaled to fit whatever frame the page sits in.
 *
 * The page tells the site around it how it is doing, by message: which
 * chapter plays and how far in, whether it is paused, and whether the cover
 * is up (loading or skipping ahead), so the site can draw a play bar below
 * it and show a still of the film over it until it plays. The site sends
 * back pause and play.
 */
export type Chapter = { id: string; title: string; seconds?: number };
export type FilmMeta = { title: string; chapters: Chapter[] };
export type Film = (stage: Stage) => Promise<void>;
/** Fills the World with the film's answers; runs before every play, on a fresh World. */
export type Setup = (world: World) => void;

/** What the page tells the site around it, a few times a second. */
export type DemoState = { coereDemo: "state"; chapters: Chapter[]; chapter: string | null; at: number; paused: boolean; covered: boolean };

/** Thrown to end a run at the `to` chapter. */
class Stop extends Error {}

export function play(meta: FilmMeta, film: Film, setup: Setup): void {
  const params = new URLSearchParams(location.search);
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.append(style);
  document.title = meta.title;
  document.body.innerHTML = stageHtml();
  Object.assign(window, { __demoMeta: meta });
  const $ = (id: string) => document.getElementById(id)!;
  if (params.get("captions") === "1") $("caption").classList.add("on");

  // A tab scrolling something into view must not move the stage around it.
  for (const id of ["view", "stage", "camera", "tabs"])
    $(id).addEventListener("scroll", (event) => {
      const el = event.currentTarget as HTMLElement;
      el.scrollTop = 0;
      el.scrollLeft = 0;
    });

  const fit = () => {
    const scale = Math.min(innerWidth / STAGE.width, innerHeight / STAGE.height);
    $("stage").style.transform = `translate(-50%, -50%) scale(${scale})`;
  };
  addEventListener("resize", fit);
  fit();

  let from = params.get("from");
  let startAt = Math.max(0, Number(params.get("at") ?? 0)) * 1000;
  const to = params.get("to");
  const loop = params.get("loop") !== "0";
  let skipping = Boolean(from);
  let waitingFor = 0;
  let reached = false;
  let paused = false;
  let resume: (() => void) | null = null;
  let chapter: string | null = null;
  let elapsed = 0;
  let spent = 0;
  const world = { now: new World() };

  const host: DemoHost = {
    get world() {
      return world.now;
    },
    assets: ASSETS,
    site: (tab) => stage.sites.get(tab)!,
    ready: (tab) => stage.started(tab),
    extra: {},
  };
  Object.assign(window, { __demo: host });

  /** Lifts the cover: the run has reached what should be seen. */
  const reveal = () => {
    skipping = false;
    waitingFor = 0;
    reached = false;
    $("cover").classList.add("off");
    tell();
  };
  /** Reveals a part played alone once it is really there: its chapter reached, a tab on screen, `at` spent. */
  const settle = () => {
    if (skipping && reached && spent >= waitingFor && stage?.filming) {
      // One frame later, so the tab has drawn.
      requestAnimationFrame(() => skipping && reveal());
    }
  };

  let stage = makeStage();
  function makeStage(): Stage {
    return new Stage(world.now, { tabs: $("tabs"), card: $("card"), pointer: $("pointer"), caption: $("caption"), camera: $("camera") }, {
      fast: () => skipping,
      chapter(id) {
        if (to && id === to && !skipping) throw new Stop();
        chapter = id;
        elapsed = 0;
        spent = 0;
        if (skipping && id === from) {
          // A part played alone shows once a tab is on screen and the script has spent `at` in it, never on a blank stage.
          reached = true;
          waitingFor = startAt;
          elapsed = startAt / 1000;
          settle();
        }
        tell();
      },
      spend(ms) {
        spent += ms;
        settle();
      },
      cards: () => !from,
      filmed() {
        settle();
      },
      gate: () => (paused ? new Promise<void>((done) => (resume = done)) : Promise.resolve()),
    });
  }

  /** Sends the site the film's state. */
  function tell(): void {
    if (parent === window) return;
    const state: DemoState = { coereDemo: "state", chapters: meta.chapters, chapter, at: elapsed, paused, covered: skipping || !$("cover").classList.contains("off") };
    parent.postMessage(state, location.origin);
  }
  setInterval(() => {
    if (!paused && !skipping) elapsed += 0.25;
    tell();
  }, 250);
  addEventListener("message", (event) => {
    if (event.origin !== location.origin || event.source !== parent) return;
    const ask = (event.data as { coereDemo?: string })?.coereDemo;
    if (ask === "pause") paused = true;
    if (ask === "play") {
      paused = false;
      resume?.();
    }
    tell();
  });

  const run = 0;

  async function go(mine: number): Promise<void> {
    for (;;) {
      // The cover is up at once when a run starts over, so the last frame never shows through.
      $("cover").style.transition = "none";
      $("cover").classList.remove("off");
      void $("cover").offsetWidth;
      $("cover").style.transition = "";
      $("tabs").replaceChildren();
      $("card").classList.remove("on");
      $("camera").style.transform = "";
      // The dashboard keeps its view and scope in the site's storage, which every tab shares; each run starts as a fresh install.
      try {
        for (const key of Object.keys(localStorage)) if (key.startsWith("coere")) localStorage.removeItem(key);
      } catch {
        // Storage can be off; the run still plays.
      }
      world.now = new World();
      setup(world.now);
      stage = makeStage();
      skipping = Boolean(from);
      waitingFor = 0;
      reached = false;
      chapter = null;
      tell();
      if (!skipping) setTimeout(reveal, 50);
      try {
        await film(stage);
      } catch (error) {
        if (!(error instanceof Stop) && mine === run) console.error(error);
      }
      if (mine !== run) return;
      await new Promise((r) => setTimeout(r, 900));
      if (!loop || mine !== run) return;
      // A film started partway (a seek on its play bar) plays from the start when it comes round again;
      // a short showcase (`to` set) keeps looping its own part.
      if (!to && from) {
        from = null;
        startAt = 0;
        const url = new URL(location.href);
        url.searchParams.delete("from");
        url.searchParams.delete("at");
        history.replaceState(null, "", url);
      }
    }
  }

  void go(run);
}
