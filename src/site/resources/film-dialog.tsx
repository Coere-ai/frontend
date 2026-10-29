"use client";

import { useEffect, useRef } from "react";
import type { Film } from "@/site/content/films";
import { FilmFrame } from "@/site/ui/film-frame";
import { CloseIcon } from "@/site/ui/icons/interface-icons";

/**
 * Plays one film in a native modal dialog, which brings focus trapping,
 * Escape to close and an inert page behind it for free. The player remounts
 * per film, so each one starts fresh.
 */
export function FilmDialog({ film, onClose }: { film: Film | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (film && !node.open) node.showModal();
    if (!film && node.open) node.close();
  }, [film]);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(event) => {
        // A click on the backdrop lands on the dialog element itself.
        if (event.target === event.currentTarget) onClose();
      }}
      aria-label={film?.title}
      className="m-auto w-[min(1200px,94vw)] overflow-visible bg-transparent p-0 backdrop:bg-neutral-950/70 backdrop:backdrop-blur-sm"
    >
      {film ? (
        <div className="relative">
          <div className="mb-3 flex items-center justify-between text-white">
            <p className="text-lg font-medium">{film.title}</p>
            <button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20">
              <CloseIcon size={18} />
            </button>
          </div>
          <FilmFrame key={film.slug} film={film} className="rounded-2xl" />
        </div>
      ) : null}
    </dialog>
  );
}
