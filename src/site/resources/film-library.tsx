"use client";

import Image from "next/image";
import { useState } from "react";
import { filmLength, films, type Film } from "@/site/content/films";
import { clock } from "@/site/player/format";
import { PlayIcon } from "@/site/ui/icons/player-icons";
import { FilmDialog } from "./film-dialog";

/** Full demos first, then one film per feature. */
const order: (keyof typeof films)[] = [
  "v2", "teams", "v3", "memory", "extraction", "smartContext", "voiceMode",
  "coriChat", "actionsGmail", "coriRewrite", "actionsAnywhere", "workers", "benchmarksEvals",
];

/** Every film as a card; pressing one plays it in a dialog. */
export function FilmLibrary() {
  const [open, setOpen] = useState<Film | null>(null);
  return (
    <>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {order.map((key) => {
          const film = films[key];
          return (
            <li key={key}>
              <button type="button" onClick={() => setOpen(film)} className="group block w-full text-left">
                <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
                  <Image src={film.still} alt="" width={960} height={600} unoptimized className="aspect-[1440/900] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                  <span className="absolute inset-0 grid place-items-center bg-neutral-950/0 transition-colors group-hover:bg-neutral-950/15">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-neutral-950 shadow-lg transition-transform group-hover:scale-105">
                      <PlayIcon size={22} className="translate-x-px" />
                    </span>
                  </span>
                  <span className="absolute right-3 bottom-3 rounded-md bg-neutral-950/75 px-1.5 py-0.5 text-[12px] text-white tabular-nums">
                    {clock(filmLength(film))}
                  </span>
                </div>
                <p className="mt-4 text-[17px] font-medium text-neutral-950">{film.title}</p>
                <p className="mt-1 text-[14px] text-neutral-500">
                  {film.chapters.length} chapters, with captions
                </p>
              </button>
            </li>
          );
        })}
      </ul>
      <FilmDialog film={open} onClose={() => setOpen(null)} />
    </>
  );
}
