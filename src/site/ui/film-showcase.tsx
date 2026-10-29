import type { Background } from "@/site/content/backgrounds";
import type { Film } from "@/site/content/films";
import { FilmFrame } from "./film-frame";
import { Reveal } from "./reveal";
import { SizedPhoto } from "./sized-photo";

/**
 * A film set like a product shot: the player floats over artwork inside one
 * large rounded frame. The player's width is capped by the screen's height,
 * so the whole thing always fits in view below the navbar.
 */
export function FilmShowcase({ film, backdrop }: { film: Film; backdrop: Background }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-neutral-950 md:rounded-[36px]">
      <SizedPhoto src={backdrop.src} alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/0 to-neutral-950/35" />
      <div className="relative px-3 py-6 sm:px-8 sm:py-10 md:px-[7%] md:py-[5.5%]">
        <Reveal className="mx-auto w-full max-w-[calc((100svh-13rem)*1.6)]">
          <FilmFrame film={film} className="rounded-2xl shadow-[0_50px_120px_-30px_rgba(0,0,0,0.75)] ring-1 ring-white/10" />
        </Reveal>
      </div>
    </div>
  );
}
