"use client";

import { useEffect, useState } from "react";
import { films, type FilmKey } from "@/site/content/films";
import type { LivePart } from "@/site/content/live";
import { FilmFrame } from "@/site/ui/film-frame";
import { Underlined } from "@/site/ui/underlined";

/**
 * The actions Cori takes, each the part of its live film where Cori does
 * it: chapters of the film's script, played on Coere's real code.
 */
const reel: { key: string; label: string; film: FilmKey; part: LivePart }[] = [
  { key: "email", label: "Email", film: "actionsGmail", part: { from: "working", to: "draft" } },
  { key: "calendar", label: "Calendar", film: "actionsCalendar", part: { from: "saved", to: "memory" } },
  { key: "writing", label: "Writing", film: "coriRewrite", part: { from: "rewrite", to: "accept" } },
  { key: "forms", label: "Forms", film: "actionsAnywhere", part: { from: "form", to: "research" } },
  { key: "quiz", label: "Quizzes", film: "actionsAnywhere", part: { from: "answers", to: "form" } },
];

/** How long each action plays before the next, until one is picked: about one pass of its part. */
const ACTION_MS = 24000;

/** Coere Actions as a window with a tab per action, playing its film. */
export function ActionsReel() {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const item = reel[index];

  useEffect(() => {
    if (held) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % reel.length), ACTION_MS);
    return () => clearTimeout(timer);
  }, [index, held]);

  return (
    <div className="bg-[#0b1020]">
      <div role="tablist" aria-label="Coere Actions" className="flex gap-1 overflow-x-auto px-3">
        {reel.map((r, i) => (
          <button
            key={r.key}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => {
              setIndex(i);
              setHeld(true);
            }}
            className={`group h-10 shrink-0 px-3 text-[13px] ${i === index ? "text-white" : "text-white/55 hover:text-white"}`}
          >
            <Underlined light on={i === index}>{r.label}</Underlined>
          </button>
        ))}
      </div>
      <FilmFrame key={item.key} film={films[item.film]} preview part={item.part} />
    </div>
  );
}
