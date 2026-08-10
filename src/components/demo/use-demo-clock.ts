"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMotionValue, type MotionValue } from "motion/react";
import {
  BEATS,
  DEMO_DURATION,
  beatAtTime,
  beatIndex,
  type BeatId,
} from "./timeline";

export type DemoClock = {
  /** Index of the beat currently playing. */
  beat: number;
  /** True once the named beat has started. */
  at: (id: BeatId) => boolean;
  /** Seconds elapsed, as a motion value so the scrubber never re-renders React. */
  progress: MotionValue<number>;
  playing: boolean;
  ended: boolean;
  toggle: () => void;
  restart: () => void;
  seek: (seconds: number) => void;
  /** Jump relative to the current position, for arrow keys. */
  nudge: (seconds: number) => void;
};

/**
 * Runs the film clock. React re-renders only when a beat boundary is crossed;
 * the smooth stuff is handed to the animation engine.
 */
export function useDemoClock(autoPlay: boolean, startAt = 0): DemoClock {
  const [playing, setPlaying] = useState(autoPlay);
  const [beat, setBeat] = useState(() => beatAtTime(startAt));
  const [ended, setEnded] = useState(false);

  const time = useRef(startAt);
  const progress = useMotionValue(startAt / DEMO_DURATION);

  useEffect(() => {
    progress.set(time.current / DEMO_DURATION);
  }, [progress]);

  useEffect(() => {
    if (!playing) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      time.current = Math.min(DEMO_DURATION, time.current + delta);
      progress.set(time.current / DEMO_DURATION);

      const next = beatAtTime(time.current);
      setBeat((current) => (current === next ? current : next));

      if (time.current >= DEMO_DURATION) {
        setPlaying(false);
        setEnded(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, progress]);

  return useMemo(
    () => ({
      beat,
      at: (id: BeatId) => beat >= beatIndex(id),
      progress,
      playing,
      ended,
      toggle: () => {
        if (time.current >= DEMO_DURATION) {
          time.current = 0;
          progress.set(0);
          setBeat(0);
          setEnded(false);
          setPlaying(true);
          return;
        }
        setPlaying((value) => !value);
      },
      restart: () => {
        time.current = 0;
        progress.set(0);
        setBeat(0);
        setEnded(false);
        setPlaying(true);
      },
      seek: (seconds: number) => {
        const clamped = Math.max(0, Math.min(DEMO_DURATION, seconds));
        time.current = clamped;
        progress.set(clamped / DEMO_DURATION);
        setBeat(beatAtTime(clamped));
        setEnded(false);
      },
      nudge: (seconds: number) => {
        const clamped = Math.max(
          0,
          Math.min(DEMO_DURATION, time.current + seconds),
        );
        time.current = clamped;
        progress.set(clamped / DEMO_DURATION);
        setBeat(beatAtTime(clamped));
        setEnded(false);
      },
    }),
    [beat, ended, playing, progress],
  );
}

export { BEATS, DEMO_DURATION };
