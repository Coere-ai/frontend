"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Cue } from "@/site/content/films";

/**
 * The caption line. It sits low in the frame and rises when the controls are
 * showing, so the two never overlap. Each new line fades in over the last.
 */
export function Captions({ cue, raised }: { cue: Cue | null; raised: boolean }) {
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none absolute inset-x-0 flex justify-center px-[8%] transition-[bottom] duration-300 ${
        raised ? "bottom-[88px]" : "bottom-[5%]"
      }`}
    >
      <AnimatePresence mode="wait">
        {cue ? (
          <motion.p
            key={cue.start}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="max-w-3xl rounded-xl bg-neutral-950/80 px-3.5 py-2 text-center text-[clamp(13px,1.55vw,20px)] leading-snug text-white backdrop-blur-sm"
          >
            {cue.text}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
