"use client";

import { useEffect, useState } from "react";
import { films, type FilmKey } from "@/site/content/films";
import { FilmFrame } from "@/site/ui/film-frame";
import { Underlined } from "@/site/ui/underlined";

/**
 * The actions Cori takes, one film each. Forms and quizzes share the Any
 * site film, so each loops only its own part (its chapters' times).
 */
const reel: { key: string; label: string; film: FilmKey; from?: number; to?: number }[] = [
  { key: "email", label: "Email", film: "actionsGmail" },
  { key: "calendar", label: "Calendar", film: "actionsCalendar" },
  { key: "writing", label: "Writing", film: "coriRewrite" },
  { key: "forms", label: "Forms", film: "actionsAnywhere", from: 38.7, to: 72.2 },
  { key: "quiz", label: "Quizzes", film: "actionsAnywhere", from: 3, to: 38.6 },
];

/** How long each action plays before the next, until one is picked. */
const ACTION_MS = 12000;

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
      <FilmFrame key={item.key} film={films[item.film]} preview from={item.from} to={item.to} />
    </div>
  );
}
