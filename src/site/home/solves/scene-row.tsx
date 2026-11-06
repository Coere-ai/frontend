"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { SceneWords } from "@/site/content/solves";
import { LAST, sceneDrawings, STEP_MS } from "./scenes";

/**
 * Where the row is in its loop. One scene plays at a time while the others
 * hold their last step, so only one thing moves. A scene's turn starts by
 * fading out its still, going back to step 0 while it cannot be seen, and
 * fading in again; nothing ever rewinds in sight.
 */
type Phase = "rest" | "hide" | "rewind" | "play";
type Play = { active: number; phase: Phase; step: number };

/** How long the row stays in a state before the next, in ms. */
function stay(play: Play): number {
  if (play.phase === "rest") return 600;
  if (play.phase === "hide") return 450;
  if (play.phase === "rewind") return 700;
  return play.step < LAST ? STEP_MS[play.step] : 3200;
}

/** The first scene in view from index `from` on, going round, or -1 when none is. */
function nextInView(seen: boolean[], from: number): number {
  for (let k = 0; k < seen.length; k++) {
    const i = (from + k) % seen.length;
    if (seen[i]) return i;
  }
  return -1;
}

/**
 * The next state. A turn goes to the next scene in view, so on a phone,
 * where one scene shows at a time, the one in sight is the one that plays.
 */
function advance(play: Play, seen: boolean[]): Play {
  if (play.phase === "rest") return { ...play, phase: "hide" };
  if (play.phase === "hide") return { ...play, phase: "rewind", step: 0 };
  if (play.phase === "rewind") return { ...play, phase: "play" };
  if (play.step < LAST) return { ...play, step: play.step + 1 };
  return { active: nextInView(seen, play.active + 1), phase: "hide", step: LAST };
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
 * A row of the three scenes, each a drawing with its title and line under
 * it. The page is served with every scene on its still, which is also all
 * that shows with reduced motion. The scenes in view take turns playing;
 * with none in view, the row waits where it is, and a scene that leaves
 * view mid turn settles on its still and hands the turn on.
 */
export function SceneRow({ scenes, coere }: { scenes: SceneWords[]; coere: boolean }) {
  const ref = useRef<HTMLUListElement>(null);
  const still = useStill();
  const [seen, setSeen] = useState<boolean[]>(() => scenes.map(() => false));
  const [play, setPlay] = useState<Play>({ active: 0, phase: "rest", step: LAST });

  useEffect(() => {
    const items = Array.from(ref.current?.children ?? []);
    const observer = new IntersectionObserver(
      (entries) =>
        setSeen((prev) => {
          const next = [...prev];
          for (const entry of entries) next[items.indexOf(entry.target)] = entry.intersectionRatio >= 0.5;
          return next;
        }),
      { threshold: 0.5 },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (still) return;
    const first = nextInView(seen, play.active);
    if (first === -1) return;
    // The scene whose turn it is went out of view: settle it and pass the turn on.
    const move = first !== play.active;
    const timer = setTimeout(() => setPlay((p) => (move ? { active: first, phase: "rest", step: LAST } : advance(p, seen))), move ? 200 : stay(play));
    return () => clearTimeout(timer);
  }, [seen, still, play]);

  return (
    <ul ref={ref} className="grid gap-x-8 gap-y-14 md:grid-cols-3">
      {scenes.map((scene, i) => {
        const Drawing = sceneDrawings[scene.key];
        const mine = i === play.active && !still;
        const hidden = mine && (play.phase === "hide" || play.phase === "rewind");
        return (
          <li key={scene.key}>
            <div aria-hidden="true" className="relative aspect-square overflow-hidden rounded-[28px] bg-neutral-50 sm:aspect-[5/4]">
              <motion.div className="absolute inset-0" initial={false} animate={{ opacity: hidden ? 0 : 1 }} transition={{ duration: 0.4 }}>
                <Drawing step={mine ? play.step : LAST} coere={coere} />
              </motion.div>
            </div>
            <h3 className="mt-6 text-[19px] font-medium tracking-[-0.02em] text-neutral-950">{scene.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-neutral-500 text-pretty">{scene.line}</p>
          </li>
        );
      })}
    </ul>
  );
}
