import type { Film } from "@/site/content/films";
import { FilmFrame } from "./film-frame";
import { Reveal } from "./reveal";

/**
 * A film on its own on the white page, with its player. The player's width
 * is capped by the screen's height, so the whole thing always fits in view
 * below the navbar.
 */
export function FilmShowcase({ film }: { film: Film }) {
  return (
    <Reveal className="mx-auto w-full max-w-[calc((100svh-13rem)*1.6)]">
      <FilmFrame film={film} />
    </Reveal>
  );
}
