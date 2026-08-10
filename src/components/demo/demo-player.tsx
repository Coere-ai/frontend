"use client";

import { motion, useReducedMotion, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/logo";
import { SceneDashboard } from "./scene-dashboard";
import { SceneIntro } from "./scene-intro";
import { SceneOutro } from "./scene-outro";
import { SceneWorkspace } from "./scene-workspace";
import { CHAPTERS, DEMO_DURATION, EASE } from "./timeline";
import { useDemoClock, type DemoClock } from "./use-demo-clock";

/** The film is laid out on a fixed canvas and scaled, so it reads identically
 *  at any window size, the way a video would. */
const STAGE_W = 1280;
const STAGE_H = 720;

export function DemoPlayer({ startAt = 0 }: { startAt?: number }) {
  const reduceMotion = useReducedMotion();
  const clock = useDemoClock(!reduceMotion, startAt);

  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const fit = () => {
      const { width, height } = element.getBoundingClientRect();
      setScale(Math.min(width / STAGE_W, height / STAGE_H));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        clock.toggle();
      }
      if (event.key.toLowerCase() === "r") clock.restart();
      if (event.key === "ArrowLeft") clock.nudge(-5);
      if (event.key === "ArrowRight") clock.nudge(5);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clock]);

  return (
    <div className="flex min-h-dvh flex-col bg-[#f6f7fb] px-5 py-6">
      <div ref={frame} className="relative min-h-0 flex-1">
        <div
          className="absolute top-1/2 left-1/2"
          style={{
            width: STAGE_W,
            height: STAGE_H,
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
        >
          <div
            data-stage
            onClick={clock.toggle}
            className="relative h-full w-full overflow-hidden rounded-[20px] bg-white shadow-[0_50px_120px_-60px_rgb(8_14_36_/_0.5)] ring-1 ring-ink-900/8"
          >
            {/* one soft brand glow, the only background element in the film */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-40 left-1/2 h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--color-brand-50),transparent)]"
            />

            <SceneIntro clock={clock} />

            {/* the workspace carries the transfer, the montage and the zoom
                out, then blurs and stays as the backdrop */}
            {clock.at("stage-in") ? (
              <motion.div
                className="absolute inset-0"
                initial={false}
                animate={{
                  filter: clock.at("outro-blur") ? "blur(12px)" : "blur(0px)",
                  scale: clock.at("outro-blur") ? 1.05 : 1,
                }}
                transition={{ duration: 1.5, ease: EASE }}
              >
                <SceneWorkspace clock={clock} />
              </motion.div>
            ) : null}

            {/* the wall dims once it has been seen */}
            <motion.div
              className="pointer-events-none absolute inset-0 bg-white"
              initial={false}
              animate={{ opacity: clock.at("outro-blur") ? 0.62 : 0 }}
              transition={{ duration: 1.2, ease: EASE }}
            />

            {clock.at("dash-in") ? <SceneDashboard clock={clock} /> : null}

            {clock.at("outro-blur") ? <SceneOutro clock={clock} /> : null}

            {/* corner mark, the constant through every scene */}
            <motion.div
              className="absolute bottom-6 left-7 flex items-center gap-2"
              initial={false}
              animate={{
                opacity:
                  clock.at("stage-in") && !clock.at("outro-blur") ? 1 : 0,
              }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <LogoMark className="h-3.5 w-3.5 text-brand-500" />
              <span className="text-[11px] font-medium tracking-[-0.01em] text-ink-900/45">
                Coere
              </span>
            </motion.div>

            {/* paused: a quiet badge, nothing covering the frame */}
            <motion.div
              className="pointer-events-none absolute right-6 bottom-6 flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 shadow-[0_10px_30px_-14px_rgb(8_14_36_/_0.4)] ring-1 ring-ink-900/8"
              initial={false}
              animate={{
                opacity: clock.playing ? 0 : 1,
                y: clock.playing ? 6 : 0,
              }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand-600">
                <path d="M9 6.5 18 12l-9 5.5z" fill="currentColor" />
              </svg>
              <span className="text-[11px] font-medium text-ink-900/60">
                Paused
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      <Controls clock={clock} />
    </div>
  );
}

function Controls({ clock }: { clock: DemoClock }) {
  const bar = useRef<HTMLDivElement>(null);
  const [scrubbing, setScrubbing] = useState(false);

  const scaleX = useTransform(clock.progress, (value) => value);
  const knobX = useTransform(clock.progress, (value) => `${value * 100}%`);
  const elapsed = useTransform(clock.progress, (value) =>
    clockLabel(value * DEMO_DURATION),
  );

  const seekFromEvent = useCallback(
    (clientX: number) => {
      const rect = bar.current?.getBoundingClientRect();
      if (!rect) return;
      const ratio = (clientX - rect.left) / rect.width;
      clock.seek(Math.min(1, Math.max(0, ratio)) * DEMO_DURATION);
    },
    [clock],
  );

  // pointer capture keeps the drag alive even when you leave the bar
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setScrubbing(true);
    seekFromEvent(event.clientX);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!scrubbing) return;
    seekFromEvent(event.clientX);
  };

  const endScrub = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setScrubbing(false);
  };

  return (
    <div className="mx-auto mt-5 flex w-full max-w-[1280px] shrink-0 items-center gap-4">
      <button
        type="button"
        onClick={clock.toggle}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-900 text-white transition-opacity hover:opacity-85"
        aria-label={clock.playing ? "Pause" : "Play"}
      >
        {clock.playing ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <rect x="7" y="6" width="3.5" height="12" rx="1" />
            <rect x="13.5" y="6" width="3.5" height="12" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M9 6.5 18 12l-9 5.5z" />
          </svg>
        )}
      </button>

      <motion.span className="w-[38px] shrink-0 text-[12px] tabular-nums text-ink-900/50">
        {elapsed}
      </motion.span>

      <div
        ref={bar}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endScrub}
        onPointerCancel={endScrub}
        className="group relative h-9 flex-1 cursor-pointer touch-none select-none"
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={DEMO_DURATION}
        aria-valuenow={undefined}
        tabIndex={0}
      >
        <div className="absolute top-1/2 right-0 left-0 h-[4px] -translate-y-1/2 overflow-hidden rounded-full bg-ink-900/10">
          <motion.div
            className="h-full w-full origin-left rounded-full bg-brand-600"
            style={{ scaleX }}
          />
        </div>

        {CHAPTERS.map((chapter) => (
          <span
            key={chapter.label}
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[10px] whitespace-nowrap text-ink-900/40"
            style={{ left: `${(chapter.at / DEMO_DURATION) * 100}%` }}
          >
            <span className="absolute -top-[4px] left-0 block h-[8px] w-px bg-ink-900/20" />
            <span className="absolute top-3 left-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {chapter.label}
            </span>
          </span>
        ))}

        <motion.span
          className={`pointer-events-none absolute top-1/2 block h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600 shadow-[0_2px_8px_-2px_rgb(8_14_36_/_0.5)] transition-transform ${
            scrubbing ? "scale-125" : "scale-100 group-hover:scale-110"
          }`}
          style={{ left: knobX }}
        />
      </div>

      <span className="shrink-0 text-[12px] tabular-nums text-ink-900/35">
        1:00
      </span>

      <button
        type="button"
        onClick={clock.restart}
        className="shrink-0 text-[12.5px] text-ink-900/45 transition-colors hover:text-ink-900"
      >
        Restart
      </button>
    </div>
  );
}

function clockLabel(seconds: number) {
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
