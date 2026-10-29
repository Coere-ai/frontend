"use client";

import { useEffect, useRef } from "react";

/**
 * A silent, looping film that only downloads once it is near the screen and
 * only plays while it is on it. Until then the poster stands in, so a page of
 * many films stays light. Reduced motion keeps it on the poster.
 *
 * startAt skips a film's opening title card. Looping is done by hand so each
 * loop also goes back to startAt instead of to the very first frame.
 */
export function LazyVideo({
  src,
  poster,
  label,
  startAt = 0,
  className,
}: {
  src: string;
  poster: string;
  label: string;
  startAt?: number;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
          return;
        }
        // The source is set here, not in JSX, so nothing loads before this point.
        if (!video.getAttribute("src")) video.src = startAt > 0 ? `${src}#t=${startAt}` : src;
        if (!still) video.play().catch(() => {});
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src, startAt]);

  return (
    <video
      ref={ref}
      poster={poster}
      muted
      playsInline
      onEnded={(event) => {
        event.currentTarget.currentTime = startAt;
        event.currentTarget.play().catch(() => {});
      }}
      preload="none"
      aria-label={label}
      className={className}
    />
  );
}
