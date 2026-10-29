"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** What a live demo's page reports about itself (demos/stage/player.ts). */
export type DemoChapter = { id: string; title: string; seconds?: number };
export type DemoState = { chapters: DemoChapter[]; chapter: string | null; at: number; paused: boolean; covered: boolean };

/** A still of a film at its chapter, taken from the live demo itself (demos/tools/posters.mjs). */
export const posterOf = (film: string, chapter?: string | null) => `/preview/live/posters/${film}/${chapter ?? "start"}.webp`;

/**
 * A live demo: Coere's real code running in its own page (public/preview/live,
 * built by demos/build.mjs from the coere-v2 source), driven like a person
 * uses it. It starts when it comes near the screen and stops when it is far
 * off, so a page of demos only runs the ones in view. Until it is playing,
 * and while it skips ahead to its part on each loop, a still of that part
 * shows in its place, so it never shows a blank frame.
 *
 * `from` and `to` name chapters, to loop one part of a film, and `at` starts
 * that many seconds into `from`. A demo inside the site's own player takes
 * clicks; any other ignores the pointer, so inside a link or a menu it
 * behaves like a picture.
 */
export function LiveDemo({
  film,
  from,
  to,
  at,
  label,
  className,
  interactive = false,
  onState,
  frameRef,
}: {
  film: string;
  from?: string;
  to?: string;
  at?: number;
  label: string;
  className?: string;
  interactive?: boolean;
  onState?: (state: DemoState) => void;
  frameRef?: RefObject<HTMLIFrameElement | null>;
}) {
  const box = useRef<HTMLDivElement>(null);
  const ownFrame = useRef<HTMLIFrameElement>(null);
  const frame = frameRef ?? ownFrame;
  const [near, setNear] = useState(false);
  // The address whose run has lifted its cover; any other address is still loading or skipping ahead.
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const seen = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "300px 0px" });
    seen.observe(el);
    return () => seen.disconnect();
  }, []);

  const query = new URLSearchParams();
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  if (at) query.set("at", String(Math.round(at)));
  const src = `/preview/live/${film}/index.html${query.size ? `?${query}` : ""}`;

  const covered = playing !== src;
  // A film whose stills are not made yet shows the page itself instead of a broken picture.
  const [noPoster, setNoPoster] = useState<string | null>(null);
  const poster = posterOf(film, from);

  useEffect(() => {
    const listen = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.data?.coereDemo !== "state") return;
      const state = event.data as DemoState;
      setPlaying(state.covered ? null : src);
      onState?.(state);
    };
    addEventListener("message", listen);
    return () => removeEventListener("message", listen);
  }, [frame, onState, src]);

  return (
    <div ref={box} role={interactive ? undefined : "img"} aria-label={interactive ? undefined : label} className={`relative aspect-[1440/900] w-full overflow-hidden bg-neutral-100 ${className ?? ""}`}>
      {near ? (
        <iframe
          key={src}
          ref={frame}
          src={src}
          title={label}
          tabIndex={interactive ? undefined : -1}
          aria-hidden={interactive ? undefined : true}
          className={`absolute inset-0 h-full w-full border-0 bg-white ${interactive ? "" : "pointer-events-none"}`}
        />
      ) : null}
      {/* The still sits over the page until the part plays. */}
      {noPoster === poster ? null : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          onError={() => setNoPoster(poster)}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${covered ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
