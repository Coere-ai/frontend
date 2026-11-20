"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { films, type Film } from "@/site/content/films";
import type { ReelPart } from "@/site/content/pages/agents";
import { LiveDemo, posterOf, type DemoState } from "@/site/ui/live-demo";

/** How long a part's last frame holds before the next one fades in, and the fade, in ms. */
const HOLD = 900;
const FADE = 0.45;
/** The longest a part plays before the next comes in, in ms, should its film stall on a slow machine. */
const CAP = 150_000;
/** How long a chapter is taken to run when its film does not say, in seconds, for the line under the tab. */
const GUESS = 14;

const REDUCE = "(prefers-reduced-motion: reduce)";
const watchMotion = (change: () => void) => {
  const query = matchMedia(REDUCE);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
};

/**
 * The Agents hero's app: every part of Coere Agents playing live on
 * Coere's real code, one after another, in a frame near 4:3. Each part is
 * its film's own showcase. When a part reaches the chapter its showcase
 * stops at, the film pauses there, holds, and the next part's still fades
 * in over it; the next film starts under that still, so only one live demo
 * runs at a time and the change never shows a blank frame. The tabs along
 * the top say which part plays and jump to any of them. With reduced
 * motion the reel stays on one part, looping it, until a tab is picked.
 */
export function AgentsReel({ parts, label }: { parts: ReelPart[]; label: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [shown, setShown] = useState(0);
  // The part whose still is fading in over the one playing, or sits there until its film reports in.
  const [incoming, setIncoming] = useState<number | null>(null);
  const [state, setState] = useState<DemoState | null>(null);
  const [ended, setEnded] = useState(false);
  const hold = useRef<number | undefined>(undefined);
  // The part whose film has been on screen, so a cover coming back up means its run started over.
  // By part, since the film going out can still report once after the next one is picked.
  const played = useRef<number | null>(null);
  const auto = !useSyncExternalStore(watchMotion, () => matchMedia(REDUCE).matches, () => false);

  const part = parts[shown];
  const film: Film = films[part.film];
  const { from, to } = film.showcase;

  const go = useCallback((next: number) => {
    clearTimeout(hold.current);
    setIncoming(next);
  }, []);
  useEffect(() => () => clearTimeout(hold.current), []);
  useEffect(() => {
    if (!auto) return;
    const cap = window.setTimeout(() => go((shown + 1) % parts.length), CAP);
    return () => clearTimeout(cap);
  }, [auto, go, shown]);

  const onState = useCallback(
    (next: DemoState) => {
      setState(next);
      // The new film has reported, so its own still is up under the one faded in.
      setIncoming((now) => (now === shown ? null : now));
      if (!auto || ended || incoming !== null) return;
      // A run that starts over before its last chapter (a film with no end chapter, or one that stumbled) moves on at once.
      if (next.covered && played.current === shown) {
        played.current = null;
        setEnded(true);
        go((shown + 1) % parts.length);
        return;
      }
      if (!next.covered) played.current = shown;
      if (next.covered || next.chapter !== to) return;
      // The showcase is done: stop the film on its last frame, hold, then bring in the next part.
      frame.current?.contentWindow?.postMessage({ coereDemo: "pause" }, location.origin);
      setEnded(true);
      hold.current = window.setTimeout(() => go((shown + 1) % parts.length), HOLD);
    },
    [auto, ended, go, incoming, shown, to],
  );

  // The faded in still now covers the frame: start the next film beneath it.
  const arrive = (next: number) => {
    if (next === shown) return;
    setShown(next);
    setState(null);
    setEnded(false);
    played.current = null;
  };

  // How far the part has run, from its chapters: the ones done, and the time spent in the one playing.
  const chapters = state?.chapters ?? [];
  const first = Math.max(0, chapters.findIndex((c) => c.id === from));
  const last = to ? chapters.findIndex((c) => c.id === to) : chapters.length;
  const span = chapters.slice(first, last < 0 ? undefined : last);
  const index = span.findIndex((c) => c.id === state?.chapter);
  const playing = span[index];
  const progress = ended ? 1 : !state || state.covered || !playing ? 0 : (index + Math.min(state.at / (playing.seconds ?? GUESS), 0.95)) / span.length;

  return (
    <div className="bg-white">
      <div
        role="tablist"
        aria-label={label}
        className="grid grid-cols-6 border-b border-neutral-950/[0.07]"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go((shown + 1) % parts.length);
          if (e.key === "ArrowLeft") go((shown - 1 + parts.length) % parts.length);
        }}
      >
        {parts.map((p, i) => {
          const on = i === (incoming ?? shown);
          return (
            <button
              key={p.name}
              type="button"
              role="tab"
              id={`reel-tab-${i}`}
              aria-selected={on}
              aria-controls="reel-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => (i === shown && incoming === null ? undefined : go(i))}
              className={`relative px-1 py-3.5 text-center text-[12px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 sm:text-[13px] ${on ? "text-neutral-950" : "text-neutral-400 hover:text-neutral-700"}`}
            >
              {p.name}
              {/* The part playing fills a line along its foot as it runs. */}
              <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-[2px] overflow-hidden">
                {on ? <span className="block h-full bg-brand-500 transition-[width] duration-300 ease-linear" style={{ width: `${(incoming === null ? progress : 0) * 100}%` }} /> : null}
              </span>
            </button>
          );
        })}
      </div>

      <div id="reel-panel" role="tabpanel" aria-labelledby={`reel-tab-${shown}`} className="relative">
        <LiveDemo key={`demo-${shown}`} film={film.slug} from={from} to={auto ? undefined : to} label={`${part.name}: ${film.title}, shown live on the app`} frameRef={frame} onState={onState} />
        {incoming === null ? null : (
          <motion.img
            key={`still-${incoming}`}
            src={posterOf(films[parts[incoming].film].slug, films[parts[incoming].film].showcase.from)}
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: auto ? FADE : 0 }}
            onAnimationComplete={() => arrive(incoming)}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-neutral-950/[0.07] px-4 py-3.5 sm:px-5 sm:py-4">
        <p className="text-[14px] font-medium tracking-[-0.01em] text-neutral-950 sm:text-[15px]">{parts[incoming ?? shown].line}</p>
        <p aria-live="off" className="text-[13px] text-neutral-500">
          {incoming === null && playing ? playing.title : " "}
        </p>
      </div>
    </div>
  );
}
