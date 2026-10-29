"use client";

import { useEffect, useRef, useState } from "react";

/** Every saved screen was laid out in this window, as the films were. */
export const SCREEN = { width: 1440, height: 900 } as const;

/**
 * Shows a saved screen of the real app: an HTML file the coere-v2 demo
 * scripts wrote from the live page, with its own styles and fonts inside.
 * It is laid out at the window it was saved in and scaled to fit, so the
 * browser draws its text and lines sharp at any size. It takes no clicks.
 */
export function ScreenFrame({ src, title, className }: { src: string; title: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / SCREEN.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className={`relative overflow-hidden bg-white ${className ?? ""}`} style={{ aspectRatio: `${SCREEN.width} / ${SCREEN.height}` }}>
      {scale > 0 ? (
        <iframe
          src={src}
          title={title}
          tabIndex={-1}
          loading="lazy"
          className="pointer-events-none absolute top-0 left-0 origin-top-left border-0"
          style={{ width: SCREEN.width, height: SCREEN.height, transform: `scale(${scale})` }}
        />
      ) : null}
    </div>
  );
}
