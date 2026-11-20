"use client";

import { useEffect, useRef, useState } from "react";
import { backgrounds } from "@/site/content/backgrounds";
import { films } from "@/site/content/films";
import { FilmPlayer } from "@/site/ui/film-player";
import { CloseIcon, PlayIcon } from "@/site/ui/icons/interface-icons";
import { SizedPhoto } from "@/site/ui/sized-photo";
import { SoftButton } from "@/site/ui/soft-button";

/**
 * Watch demo: opens the home page's product film (the same one the demo
 * section plays) in a modal over the page. A native dialog gives focus
 * trapping, Escape and the page behind going inert for free. Close comes
 * first and takes focus, so Escape works before the film has been clicked.
 * The film is only built while the dialog is open, so it costs nothing
 * until asked for.
 */
export function DemoDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  // The film plays in a frame that focuses itself as it types, which would
  // swallow Escape and Tab. Focus is handed back to Close each time.
  useEffect(() => {
    if (!open) return;
    const onBlur = () => {
      window.setTimeout(() => {
        const active = document.activeElement;
        if (active instanceof HTMLIFrameElement && dialog.current?.contains(active)) closeButton.current?.focus();
      }, 0);
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [open]);

  function show() {
    setOpen(true);
    dialog.current?.showModal();
  }

  function close() {
    dialog.current?.close();
  }

  return (
    <>
      <SoftButton tone="outline" size="lg" onClick={show} aria-haspopup="dialog">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-neutral-950 text-white">
          <PlayIcon size={12} className="translate-x-[1px]" />
        </span>
        Watch demo
      </SoftButton>
      <dialog
        ref={dialog}
        aria-label={films.v2.title}
        onClose={() => setOpen(false)}
        // A click on the dimmed area outside the film closes it.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-auto w-[min(1180px,calc(100vw-24px))] max-w-none overflow-visible bg-transparent p-0 backdrop:bg-neutral-950/70 backdrop:backdrop-blur-sm"
      >
        <div className="relative overflow-hidden rounded-[24px] bg-neutral-950 md:rounded-[28px]">
          <button
            ref={closeButton}
            type="button"
            onClick={close}
            autoFocus
            aria-label="Close the demo"
            className="absolute top-3 right-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-neutral-950 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:top-4 md:right-4"
          >
            <CloseIcon size={18} />
          </button>
          <SizedPhoto src={backgrounds.ribbons.src} alt="" fill sizes="100vw" className="object-cover opacity-80" />
          <div className="relative px-3 pt-14 pb-5 sm:px-8 sm:pb-8 md:px-12 md:pt-16 md:pb-10">
            <div className="mx-auto w-full max-w-[calc((100svh-16rem)*1.6)]">{open ? <FilmPlayer film={films.v2} /> : null}</div>
          </div>
        </div>
      </dialog>
    </>
  );
}
