"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Cue } from "@/site/content/films";
import { CloseIcon } from "@/site/ui/icons/interface-icons";
import { clamp, clock } from "./format";

/**
 * The chapters drawer, sliding in from the right inside the frame. The
 * current chapter is marked and shows how far through it the film is.
 */
export function ChapterPanel({
  open,
  chapters,
  current,
  time,
  onPick,
  onClose,
}: {
  open: boolean;
  chapters: Cue[];
  current: number;
  time: number;
  onPick: (seconds: number) => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.nav
          aria-label="Chapters"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={(event) => event.stopPropagation()}
          className="absolute top-3 right-3 bottom-[76px] flex w-[min(300px,60%)] flex-col rounded-2xl bg-neutral-950/85 text-white shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <p className="text-[14px] font-medium">Chapters</p>
            <button type="button" aria-label="Close chapters" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10">
              <CloseIcon size={16} />
            </button>
          </div>
          <ol className="flex-1 overflow-y-auto px-1.5 pb-2">
            {chapters.map((chapter, index) => {
              const active = index === current;
              const progress = clamp((time - chapter.start) / (chapter.end - chapter.start), 0, 1);
              return (
                <li key={chapter.start}>
                  <button
                    type="button"
                    aria-current={active ? "true" : undefined}
                    onClick={() => onPick(chapter.start + 0.05)}
                    className={`relative flex w-full gap-3 overflow-hidden rounded-xl px-3 py-2 text-left text-[13px] transition-colors ${
                      active ? "bg-white/15" : "hover:bg-white/10"
                    }`}
                  >
                    <span className="w-9 shrink-0 text-white/60 tabular-nums">{clock(chapter.start)}</span>
                    <span className={active ? "font-medium" : "text-white/85"}>{chapter.text}</span>
                    {active ? <span className="absolute bottom-0 left-0 h-[2px] bg-white" style={{ width: `${progress * 100}%` }} /> : null}
                  </button>
                </li>
              );
            })}
          </ol>
        </motion.nav>
      ) : null}
    </AnimatePresence>
  );
}
