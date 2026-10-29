import { films, PREVIEW_START_SECONDS, type Film, type FilmKey } from "@/site/content/films";
import { liveFilms, type LivePart } from "@/site/content/live";
import { scenes, sceneOfFilm } from "@/site/content/scenes";
import { LiveDemo } from "./live-demo";
import { ScreenScene } from "./screen-scene";

/**
 * Plays a film in its own HTML page, so it looks the same here as on the
 * coere-v2 demo pages: the browser's player at the film's full resolution.
 *
 * A preview is a silent loop past the title card that plays only on screen.
 * It ignores the pointer, so a preview inside a link or a menu behaves like
 * a picture. The full player takes clicks and can go fullscreen.
 *
 * `from` and `to` loop just one part of a film, in seconds, for a film
 * that shows two things. A film that plays live (content/live.ts) runs
 * Coere's real code instead, and `part` names the chapters to loop.
 */
export function FilmFrame({ film, preview = false, from = film.previewFrom ?? PREVIEW_START_SECONDS, to, part, className }: { film: Film; preview?: boolean; from?: number; to?: number; part?: LivePart; className?: string }) {
  const key = (Object.keys(films) as FilmKey[]).find((k) => films[k] === film);
  const live = key ? liveFilms[key] : undefined;
  if (live) {
    const loop = preview ? (part ?? live.showcase) : {};
    return <LiveDemo film={live.slug} from={loop.from} to={loop.to} controls={!preview} label={preview ? `${film.title}, shown live on the app` : film.title} className={className} />;
  }
  // A preview of a feature that has HTML screens plays those instead, sharp at any size.
  const scene = preview && to === undefined && key ? sceneOfFilm[key] : undefined;
  if (scene) return <ScreenScene shots={scenes[scene]} label={`${film.title}, shown on the app`} className={className} />;
  const src = preview ? `${film.page}?preview&start=${from}${to ? `&end=${to}` : ""}` : film.page;
  return (
    <iframe
      src={src}
      title={preview ? `${film.title}, preview` : film.title}
      loading="lazy"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      tabIndex={preview ? -1 : undefined}
      aria-hidden={preview || undefined}
      className={`block aspect-[1440/900] w-full border-0 bg-neutral-950 ${preview ? "pointer-events-none" : ""} ${className ?? ""}`}
    />
  );
}
