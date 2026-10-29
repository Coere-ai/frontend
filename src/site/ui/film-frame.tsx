import { PREVIEW_START_SECONDS, type Film } from "@/site/content/films";

/**
 * Plays a film in its own HTML page, so it looks the same here as on the
 * coere-v2 demo pages: the browser's player at the film's full resolution.
 *
 * A preview is a silent loop past the title card that plays only on screen.
 * It ignores the pointer, so a preview inside a link or a menu behaves like
 * a picture. The full player takes clicks and can go fullscreen.
 */
export function FilmFrame({ film, preview = false, className }: { film: Film; preview?: boolean; className?: string }) {
  const src = preview ? `${film.page}?preview&start=${PREVIEW_START_SECONDS}` : film.page;
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
