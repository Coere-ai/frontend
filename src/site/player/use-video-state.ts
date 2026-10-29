"use client";

import { useEffect, useState, type RefObject } from "react";

export type VideoState = {
  playing: boolean;
  /** True once the viewer has pressed play for the first time. */
  started: boolean;
  ended: boolean;
  /** True while the film stalls waiting for data. */
  waiting: boolean;
  time: number;
  duration: number;
  /** Seconds downloaded ahead of the playhead's range. */
  buffered: number;
};

function bufferedEnd(video: HTMLVideoElement): number {
  const ranges = video.buffered;
  for (let i = 0; i < ranges.length; i += 1) {
    if (ranges.start(i) <= video.currentTime + 0.5 && video.currentTime <= ranges.end(i)) {
      return ranges.end(i);
    }
  }
  return ranges.length ? ranges.end(ranges.length - 1) : 0;
}

/**
 * Mirrors a video element into React state. While the film plays it reads
 * the time every animation frame, because timeupdate only fires about four
 * times a second and the progress bar would visibly step. Until metadata
 * arrives, the length known from the cues stands in for the duration.
 */
export function useVideoState(ref: RefObject<HTMLVideoElement | null>, knownDuration: number): VideoState {
  const [state, setState] = useState<VideoState>({
    playing: false,
    started: false,
    ended: false,
    waiting: false,
    time: 0,
    duration: knownDuration,
    buffered: 0,
  });

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let frame = 0;

    const read = () =>
      setState((s) => ({
        ...s,
        time: video.currentTime,
        duration: Number.isFinite(video.duration) && video.duration > 0 ? video.duration : s.duration,
        buffered: bufferedEnd(video),
        playing: !video.paused && !video.ended,
        ended: video.ended,
      }));
    const tick = () => {
      read();
      frame = requestAnimationFrame(tick);
    };
    const onPlay = () => {
      setState((s) => ({ ...s, started: true, ended: false }));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };
    const onStop = () => {
      cancelAnimationFrame(frame);
      read();
    };
    const onWaiting = () => setState((s) => ({ ...s, waiting: true }));
    const onReady = () => setState((s) => ({ ...s, waiting: false }));

    const handlers: [string, () => void][] = [
      ["play", onPlay],
      ["pause", onStop],
      ["ended", onStop],
      ["seeked", read],
      ["timeupdate", read],
      ["loadedmetadata", read],
      ["progress", read],
      ["waiting", onWaiting],
      ["playing", onReady],
      ["canplay", onReady],
    ];
    handlers.forEach(([name, handler]) => video.addEventListener(name, handler));
    return () => {
      cancelAnimationFrame(frame);
      handlers.forEach(([name, handler]) => video.removeEventListener(name, handler));
    };
  }, [ref]);

  return state;
}
