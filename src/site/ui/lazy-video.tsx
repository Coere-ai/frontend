"use client";

import { useEffect, useRef } from "react";

/**
 * A silent, looping film that only downloads once it is near the screen and
 * only plays while it is on it. Until then the poster stands in, so a page of
 * many films stays light. Reduced motion keeps it on the poster.
 */
export function LazyVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster: string;
  label: string;
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
        if (video.getAttribute("src") !== src) video.src = src;
        if (!still) video.play().catch(() => {});
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      className={className}
    />
  );
}
