import type { Film } from "@/site/content/films";
import type { LivePart } from "@/site/content/live";
import { LiveDemo } from "./live-demo";

/**
 * A film, played live on Coere's real code. A preview loops one part
 * (`part`, or the film's own showcase) and ignores the pointer, so inside a
 * link or a menu it behaves like a picture; the full film plays from the
 * start with pause and its chapters.
 */
export function FilmFrame({ film, preview = false, part, className }: { film: Film; preview?: boolean; part?: LivePart; className?: string }) {
  const loop = preview ? (part ?? film.showcase) : {};
  return <LiveDemo film={film.slug} from={loop.from} to={loop.to} controls={!preview} label={preview ? `${film.title}, shown live on the app` : film.title} className={className} />;
}
