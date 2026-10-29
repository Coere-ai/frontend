"use client";

import { AnimatePresence, motion } from "motion/react";
import { PauseIcon, PlayIcon, ReplayIcon } from "@/site/ui/icons/player-icons";
import { clock } from "./format";

/** Before the first play: a big play button over the poster, with the title and length. */
export function StartOverlay({ title, duration, onPlay }: { title: string; duration: number; onPlay: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onPlay();
      }}
      aria-label={`Play ${title}`}
      className="group absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-neutral-950/55 via-neutral-950/10 to-transparent"
    >
      <span className="grid h-20 w-20 place-items-center rounded-full bg-white text-neutral-950 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105 md:h-24 md:w-24">
        <PlayIcon size={34} className="translate-x-0.5" />
      </span>
      <span className="absolute bottom-6 left-6 text-left text-white md:bottom-8 md:left-8">
        <span className="block text-lg font-medium md:text-2xl">{title}</span>
        <span className="mt-1 block text-[14px] text-white/75 tabular-nums">{clock(duration)}</span>
      </span>
    </button>
  );
}

/** After the last frame: replay. */
export function EndOverlay({ onReplay }: { onReplay: () => void }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-neutral-950/40">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onReplay();
        }}
        className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[15px] font-medium text-neutral-950 shadow-xl transition-transform hover:scale-105"
      >
        <ReplayIcon size={18} />
        Watch again
      </button>
    </div>
  );
}

/** Shown while the film waits for data. */
export function Spinner() {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center" role="status" aria-label="Loading">
      <span className="h-12 w-12 animate-spin rounded-full border-[3px] border-white/25 border-t-white" />
    </div>
  );
}

/**
 * A quick play or pause mark in the middle of the frame after each toggle,
 * so a click on the picture visibly did something. `id` changes per toggle.
 */
export function ToggleFlash({ id, playing }: { id: number; playing: boolean }) {
  return (
    <AnimatePresence>
      {id > 0 ? (
        <motion.span
          key={id}
          initial={{ opacity: 0.9, scale: 0.8 }}
          animate={{ opacity: 0, scale: 1.4 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="pointer-events-none absolute top-1/2 left-1/2 -mt-8 -ml-8 grid h-16 w-16 place-items-center rounded-full bg-neutral-950/50 text-white"
        >
          {playing ? <PlayIcon size={28} /> : <PauseIcon size={28} />}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}
