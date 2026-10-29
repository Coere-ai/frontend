"use client";

import { useEffect, useRef, useState } from "react";
import { planShot } from "./motion/plan";
import { prepare } from "./motion/play";
import { SCREEN } from "./screen-frame";

/** One moment of a scene: a saved screen, and the part of it to fill the frame with. */
export type SceneShot = {
  src: string;
  /** The window onto the 1440 by 900 screen, in its CSS pixels; its height follows the frame's shape. Whole screen when left out. */
  view?: { x: number; y: number; w: number };
  /** The least time it holds, in ms; a screen with more motion holds until its motion ends and a beat after. */
  hold?: number;
};

const HOLD = 2600;
const AFTER = 1700;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** The transform that fills the frame with `view`, pushed in by `zoom` around its middle. */
function cameraFor(view: SceneShot["view"], zoom = 1): string {
  const w0 = view ? Math.min(SCREEN.width, Math.max(360, view.w)) : SCREEN.width;
  const h0 = (w0 * SCREEN.height) / SCREEN.width;
  const x0 = view ? Math.min(Math.max(0, view.x), SCREEN.width - w0) : 0;
  const y0 = view ? Math.min(Math.max(0, view.y), SCREEN.height - h0) : 0;
  const w = w0 / zoom;
  const h = h0 / zoom;
  return `scale(${SCREEN.width / w}) translate(${-(x0 + (w0 - w) / 2)}px, ${-(y0 + (h0 - h) / 2)}px)`;
}

/**
 * A feature played on the real app: saved HTML screens from the coere-v2
 * demo scripts, brought to life so it reads like the film. Each screen is
 * compared with the one before: on the same page only what changed moves
 * (the pointer travels and clicks, text is typed, new pieces slide in, an
 * answer streams in), and a new page fades in and writes its answer. The
 * camera eases onto the part that matters and drifts slowly while it holds.
 * Everything is drawn by the browser, so it stays sharp at any size.
 */
export function ScreenScene({ shots, label, className }: { shots: SceneShot[]; label: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const frames = useRef(new Map<number, HTMLIFrameElement>());
  const layers = useRef(new Map<number, HTMLDivElement>());
  const cameras = useRef(new Map<number, HTMLDivElement>());
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scale, setScale] = useState(0);
  const [near, setNear] = useState(false);
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  // Counts each step, so a screen that comes round again mounts fresh and plays again.
  const [run, setRun] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const resize = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / SCREEN.width));
    const seen = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "200px 0px" });
    resize.observe(el);
    seen.observe(el);
    return () => {
      resize.disconnect();
      seen.disconnect();
    };
  }, []);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  /** Runs when the shot on show has loaded: plan it against the last one, show it, play it, and queue the next. */
  const start = (i: number) => {
    const frame = frames.current.get(i);
    const layer = layers.current.get(i);
    const camera = cameras.current.get(i);
    const doc = frame?.contentDocument;
    if (!frame || !layer || !camera || !doc?.body || layer.dataset.started) return;
    layer.dataset.started = "1";
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prevDoc = previous !== null ? frames.current.get(previous)?.contentDocument ?? null : null;
    const plan = planShot(doc, prevDoc);
    const ready = still ? null : prepare(doc, plan);

    const shot = shots[i];
    const from = previous !== null ? cameraFor(shots[previous].view, 1.035) : cameraFor(shot.view);
    layer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: plan.cut ? 650 : 260, easing: "ease-out", fill: "forwards" });
    camera.animate([{ transform: from }, { transform: cameraFor(shot.view) }], { duration: still ? 0 : 1200, easing: EASE, fill: "forwards" });
    const motion = ready ? ready.play(plan.cut ? null : lastPoint.current) : 0;
    if (plan.point) lastPoint.current = plan.point;
    const hold = Math.max(shot.hold ?? HOLD, motion + AFTER);
    if (!still) camera.animate([{ transform: cameraFor(shot.view) }, { transform: cameraFor(shot.view, 1.035) }], { duration: hold, delay: 1200, easing: "linear", fill: "forwards" });
    if (still) return;
    // A scene of one screen plays it again from the start: it mounts fresh and fades back in.
    timer.current = setTimeout(() => {
      setPrevious(shots.length < 2 ? null : i);
      setIndex((i + 1) % shots.length);
      setRun((r) => r + 1);
    }, hold);
  };

  // A screen that loaded before its handler was attached still starts.
  useEffect(() => {
    if (!near || scale === 0) return;
    const doc = frames.current.get(index)?.contentDocument;
    if (doc?.readyState === "complete" && doc.body?.childElementCount) start(index);
  });

  return (
    <div ref={box} role="img" aria-label={label} className={`relative overflow-hidden bg-white ${className ?? ""}`} style={{ aspectRatio: `${SCREEN.width} / ${SCREEN.height}` }}>
      {near && scale > 0
        ? shots.map((shot, i) =>
            i === index || i === previous ? (
              <div
                key={`${i}:${i === index ? run : run - 1}`}
                ref={(el) => void (el ? layers.current.set(i, el) : layers.current.delete(i))}
                className="absolute top-0 left-0 origin-top-left opacity-0"
                style={{ width: SCREEN.width, height: SCREEN.height, transform: `scale(${scale})`, zIndex: i === index ? 2 : 1 }}
              >
                <div ref={(el) => void (el ? cameras.current.set(i, el) : cameras.current.delete(i))} className="h-full w-full origin-top-left" style={{ transform: cameraFor(shot.view) }}>
                  <iframe
                    ref={(el) => void (el ? frames.current.set(i, el) : frames.current.delete(i))}
                    src={shot.src}
                    title=""
                    tabIndex={-1}
                    aria-hidden="true"
                    onLoad={() => i === index && start(i)}
                    className="pointer-events-none h-full w-full border-0 bg-white"
                  />
                </div>
              </div>
            ) : null,
          )
        : null}
    </div>
  );
}
