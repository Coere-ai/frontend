"use client";

import { useEffect, useRef, useState } from "react";
import { SCREEN } from "./screen-frame";

/** One moment of a scene: a saved screen, and the part of it to fill the frame with. */
export type SceneShot = {
  src: string;
  /** The window onto the 1440 by 900 screen, in its CSS pixels; its height follows the frame's shape. Whole screen when left out. */
  view?: { x: number; y: number; w: number };
  /** How long it holds, in ms. */
  hold?: number;
};

const HOLD = 3200;

/** The transform that fills the frame with `view`, kept inside the screen. */
function cameraFor(view: SceneShot["view"]): string {
  if (!view) return "scale(1) translate(0px, 0px)";
  const w = Math.min(SCREEN.width, Math.max(360, view.w));
  const h = (w * SCREEN.height) / SCREEN.width;
  const x = Math.min(Math.max(0, view.x), SCREEN.width - w);
  const y = Math.min(Math.max(0, view.y), SCREEN.height - h);
  return `scale(${SCREEN.width / w}) translate(${-x}px, ${-y}px)`;
}

/**
 * A feature shown on the real app: saved HTML screens from the coere-v2
 * demo scripts, played in a loop. Each shot fades in over the last and the
 * camera eases onto the part that matters, so the browser draws every
 * frame sharp. Screens load only once the scene is near the screen, and
 * only the shot on show and the one before it stay mounted.
 */
export function ScreenScene({ shots, label, className }: { shots: SceneShot[]; label: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [near, setNear] = useState(false);
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const resize = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / SCREEN.width));
    const seen = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "300px 0px" });
    resize.observe(el);
    seen.observe(el);
    return () => {
      resize.disconnect();
      seen.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!near || shots.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => {
      setPrevious(index);
      setIndex((index + 1) % shots.length);
    }, shots[index].hold ?? HOLD);
    return () => clearTimeout(timer);
  }, [near, index, shots]);

  return (
    <div ref={box} role="img" aria-label={label} className={`relative overflow-hidden bg-white ${className ?? ""}`} style={{ aspectRatio: `${SCREEN.width} / ${SCREEN.height}` }}>
      {near && scale > 0
        ? shots.map((shot, i) =>
            i === index || i === previous ? (
              <div
                key={`${i}-${shot.src}`}
                className="absolute top-0 left-0 origin-top-left"
                style={{ width: SCREEN.width, height: SCREEN.height, transform: `scale(${scale})`, zIndex: i === index ? 2 : 1 }}
              >
                <div
                  className={`h-full w-full origin-top-left transition-[transform,opacity] ease-[cubic-bezier(0.22,1,0.36,1)] ${i === index ? "animate-[scene-in_600ms_ease-out_both] duration-[1400ms]" : "duration-500"}`}
                  style={{ transform: cameraFor(shot.view) }}
                >
                  <iframe src={shot.src} title="" tabIndex={-1} aria-hidden="true" className="pointer-events-none h-full w-full border-0 bg-white" />
                </div>
              </div>
            ) : null,
          )
        : null}
    </div>
  );
}
