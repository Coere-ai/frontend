"use client";

import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { solves } from "@/site/content/solves";
import { lastStep, scenes } from "./scenes";
import { Swap } from "./swap";

/**
 * Where the row is. One scene plays at a time while the others hold their
 * still. `step` -1 is the scene whose turn is next, still on its still. A
 * scene goes from its still to its first step in place, each in its own
 * way (see scenes.tsx), so only one thing moves and nothing is drawn over
 * anything. `runs` counts each scene's showings: a new count is a new
 * layer, whole under the one before as that fades out (Layer). That is
 * only for the switch to the other side, and for a scene that leaves view
 * mid turn going back to its still.
 */
type Play = { coere: boolean; active: number; step: number; runs: number[] };

/** The fade from one side's showing of a scene to the other's, in s. */
const CROSS = 0.35;
/** The wait before the first scene in view starts, in ms. */
const START_MS = 400;
/** How long a scene holds its still before the next scene plays, in ms. It keeps showing it after. */
const HOLD_MS = 2400;

const words = solves.sides;
const keys = words.today.scenes.map((s) => s.key);

/** The first scene in view from index `from` on, going round, or -1 when none is. */
function nextInView(seen: boolean[], from: number): number {
  for (let k = 0; k < seen.length; k++) {
    const i = (from + k) % seen.length;
    if (seen[i]) return i;
  }
  return -1;
}

/** A new showing of scene `i` (or of every scene), so it fades into its next frame. */
const bump = (runs: number[], i?: number) => runs.map((r, j) => (i === undefined || i === j ? r + 1 : r));

/**
 * The next state, and how long the row stays in this one first, in ms.
 * Null while no scene is in view: the row waits.
 */
function next(play: Play, seen: boolean[]): { after: number; play: Play } | null {
  const first = nextInView(seen, play.active);
  if (first === -1) return null;
  // The scene whose turn it is went out of view: it settles on its still and the turn goes on.
  if (first !== play.active) return { after: 200, play: { ...play, active: first, step: -1, runs: play.step >= 0 ? bump(play.runs, play.active) : play.runs } };
  const times = scenes[keys[play.active]].steps(play.coere);
  if (play.step === -1) return { after: START_MS, play: { ...play, step: 0 } };
  if (play.step < times.length) return { after: times[play.step], play: { ...play, step: play.step + 1 } };
  const to = nextInView(seen, play.active + 1);
  return { after: HOLD_MS, play: { ...play, active: to, step: 0 } };
}

/**
 * One showing of a scene. A new showing is whole from its first frame,
 * under the one it replaces, which fades out on top of it. So however fast
 * the switch is flipped the window never thins towards empty. With reduced
 * motion it swaps at once.
 */
function Layer({ still, children }: { still: boolean; children: ReactNode }) {
  const present = useIsPresent();
  return (
    <motion.div className={`absolute inset-0 ${present ? "" : "z-10"}`} initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: still ? 0 : CROSS, ease: "easeInOut" }}>
      {children}
    </motion.div>
  );
}

const REDUCE = "(prefers-reduced-motion: reduce)";

/**
 * Whether the person asked for reduced motion, kept current if they change
 * it while the page is open (motion's own hook reads it once). The server
 * renders the stills either way.
 */
function useStill(): boolean {
  return useSyncExternalStore(
    (change) => {
      const query = matchMedia(REDUCE);
      query.addEventListener("change", change);
      return () => query.removeEventListener("change", change);
    },
    () => matchMedia(REDUCE).matches,
    () => false,
  );
}

/**
 * The row of three scenes for the side the switch is on, each a drawing
 * with its title and line under it. The page is served with every scene on
 * its still, which is also all that shows with reduced motion. The scenes
 * in view take turns: one plays its steps and holds its still, then the
 * next one plays, so only one thing moves. On a phone, where one scene
 * shows at a time, the one in sight is the one that plays, again and
 * again. When the switch flips, every scene fades to the new side and the
 * first scene in view plays at once.
 */
export function SceneRow({ coere }: { coere: boolean }) {
  const ref = useRef<HTMLUListElement>(null);
  const still = useStill();
  const [seen, setSeen] = useState<boolean[]>(() => keys.map(() => false));
  const [play, setPlay] = useState<Play>({ coere, active: 0, step: -1, runs: keys.map(() => 0) });

  // The switch flipped: every scene takes a new showing on the new side, and the turn starts again from the first scene in view.
  if (play.coere !== coere) {
    const first = nextInView(seen, 0);
    setPlay({ coere, active: Math.max(first, 0), step: first === -1 || still ? -1 : 0, runs: bump(play.runs) });
  }

  useEffect(() => {
    const items = Array.from(ref.current?.children ?? []);
    const observer = new IntersectionObserver(
      (entries) =>
        setSeen((prev) => {
          const now = [...prev];
          for (const entry of entries) now[items.indexOf(entry.target)] = entry.intersectionRatio >= 0.5;
          return now;
        }),
      { threshold: 0.5 },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (still) return;
    const move = next(play, seen);
    if (!move) return;
    const timer = setTimeout(() => setPlay(move.play), move.after);
    return () => clearTimeout(timer);
  }, [seen, still, play]);

  return (
    <ul ref={ref} className="mx-auto grid max-w-md gap-y-14 xl:max-w-none xl:grid-cols-3 xl:gap-x-8">
      {keys.map((key, i) => {
        const scene = scenes[key];
        const mine = !still && i === play.active && play.step >= 0;
        const step = mine ? play.step : lastStep(scene, coere);
        return (
          <li key={key}>
            <div aria-hidden="true" className="@container relative aspect-[6/5] sm:aspect-[4/3]">
              <AnimatePresence initial={false}>
                <Layer key={`${coere}-${play.runs[i]}`} still={still}>
                  <scene.Drawing step={step} coere={coere} live={mine} />
                </Layer>
              </AnimatePresence>
            </div>
            <h3 className="mt-6 text-[19px] font-medium tracking-[-0.02em] text-neutral-950">
              <Swap coere={coere} today={words.today.scenes[i].title} withCoere={words.coere.scenes[i].title} />
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-neutral-500 text-pretty">
              <Swap coere={coere} today={words.today.scenes[i].line} withCoere={words.coere.scenes[i].line} />
            </p>
          </li>
        );
      })}
    </ul>
  );
}
