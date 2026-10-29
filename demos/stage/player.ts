import { ASSETS, type DemoHost } from "./host";
import { CSS, STAGE, stageHtml } from "./look";
import { Stage } from "./stage";
import { World } from "./world";

/**
 * Plays one film's script live in its page, over and over. The address
 * picks what plays: `from` and `to` name chapters (the site's short
 * showcases play one part this way, skipping to it unseen), `captions=1`
 * shows the caption line, `controls=1` adds chapter buttons and pause for
 * the full film, and `loop=0` stops at the end. The stage is the films'
 * 1440 by 900 window, scaled to fit whatever frame the page sits in.
 */
export type Chapter = { id: string; title: string };
export type FilmMeta = { title: string; chapters: Chapter[] };
export type Film = (stage: Stage) => Promise<void>;
/** Fills the World with the film's answers; runs before every play, on a fresh World. */
export type Setup = (world: World) => void;

/** Thrown to end a run at the `to` chapter. */
class Stop extends Error {}

export function play(meta: FilmMeta, film: Film, setup: Setup): void {
  const params = new URLSearchParams(location.search);
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.append(style);
  document.title = meta.title;
  document.body.innerHTML = stageHtml();
  const $ = (id: string) => document.getElementById(id)!;
  if (params.get("captions") === "1") $("caption").classList.add("on");

  const fit = () => {
    const scale = Math.min(innerWidth / STAGE.width, innerHeight / STAGE.height);
    $("stage").style.transform = `scale(${scale})`;
  };
  addEventListener("resize", fit);
  fit();

  let from = params.get("from");
  const to = params.get("to");
  const loop = params.get("loop") !== "0";
  let skipping = Boolean(from);
  let paused = false;
  let resume: (() => void) | null = null;
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

  let stage = makeStage();
  function makeStage(): Stage {
    return new Stage(world.now, { tabs: $("tabs"), card: $("card"), pointer: $("pointer"), caption: $("caption"), camera: $("camera") }, {
      fast: () => skipping,
      chapter(id) {
        if (to && id === to && !skipping) throw new Stop();
        if (skipping && id === from) {
          skipping = false;
          $("cover").classList.add("off");
        }
        controls?.mark(id);
      },
      gate: () => (paused ? new Promise<void>((done) => (resume = done)) : Promise.resolve()),
    });
  }

  const controls = params.get("controls") === "1" ? makeControls(meta, {
    jump(id) {
      from = id;
      restart();
    },
    toggle() {
      paused = !paused;
      if (!paused) resume?.();
      return paused;
    },
  }) : null;

  let run = 0;
  function restart(): void {
    run++;
    paused = false;
    resume?.();
    void go(run);
  }

  async function go(mine: number): Promise<void> {
    for (;;) {
      $("cover").classList.remove("off");
      $("tabs").replaceChildren();
      $("card").classList.remove("on");
      $("camera").style.transform = "";
      world.now = new World();
      setup(world.now);
      stage = makeStage();
      skipping = Boolean(from);
      if (!skipping) setTimeout(() => $("cover").classList.add("off"), 50);
      try {
        await film(stage);
      } catch (error) {
        if (!(error instanceof Stop) && mine === run) console.error(error);
      }
      if (mine !== run) return;
      await new Promise((r) => setTimeout(r, 900));
      if (!loop || mine !== run) return;
      // A full film jumped to a chapter plays from the start when it comes round again.
      if (controls) from = null;
    }
  }

  void go(run);
}

/** The full film's bar: pause, and a button per chapter that plays from there. */
function makeControls(meta: FilmMeta, on: { jump(id: string): void; toggle(): boolean }) {
  const bar = document.createElement("nav");
  bar.setAttribute("aria-label", "Chapters");
  bar.style.cssText = "position:fixed;left:50%;bottom:14px;transform:translateX(-50%);display:flex;gap:6px;align-items:center;padding:6px;border-radius:999px;background:rgba(8,14,36,.78);backdrop-filter:blur(10px);font:500 13px/1 Geist,system-ui,sans-serif;z-index:20;max-width:calc(100% - 28px);overflow-x:auto;opacity:0;transition:opacity .25s";
  const button = (label: string, onClick: () => void) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.style.cssText = "flex:none;border:0;border-radius:999px;padding:8px 12px;background:transparent;color:rgba(255,255,255,.75);font:inherit;cursor:pointer;white-space:nowrap";
    b.addEventListener("click", onClick);
    bar.append(b);
    return b;
  };
  const pause = button("Pause", () => (pause.textContent = on.toggle() ? "Play" : "Pause"));
  const marks = new Map(meta.chapters.map((c) => [c.id, button(c.title, () => on.jump(c.id))]));
  document.body.append(bar);
  addEventListener("mousemove", () => {
    bar.style.opacity = "1";
    clearTimeout((bar as unknown as { t?: number }).t);
    (bar as unknown as { t?: number }).t = window.setTimeout(() => (bar.style.opacity = "0"), 2500);
  });
  return {
    mark(id: string) {
      for (const [key, b] of marks) {
        b.style.background = key === id ? "#fff" : "transparent";
        b.style.color = key === id ? "#080e24" : "rgba(255,255,255,.75)";
      }
    },
  };
}
