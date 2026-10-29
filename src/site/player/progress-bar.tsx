"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Cue } from "@/site/content/films";
import { chapterIndexAt, clamp, clock } from "./format";

/**
 * The scrub bar. It is drawn as one segment per chapter with small gaps, and
 * each segment fills with what has downloaded and what has played. While
 * dragging, the bar follows the pointer at once instead of waiting for the
 * video to report back, so scrubbing feels direct.
 */
export function ProgressBar({
  time,
  duration,
  buffered,
  chapters,
  onSeek,
}: {
  time: number;
  duration: number;
  buffered: number;
  chapters: Cue[];
  onSeek: (seconds: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [drag, setDrag] = useState<number | null>(null);

  const shown = drag ?? time;
  const safeDuration = duration || 1;

  function timeAt(clientX: number): number {
    const box = track.current?.getBoundingClientRect();
    if (!box) return 0;
    return clamp((clientX - box.left) / box.width, 0, 1) * safeDuration;
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const at = timeAt(event.clientX);
    setDrag(at);
    onSeek(at);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const at = timeAt(event.clientX);
    setHover(at);
    if (drag !== null) {
      setDrag(at);
      onSeek(at);
    }
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDrag(null);
  }

  // The bar takes its own arrow keys, so they don't also reach the player.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.key === "ArrowLeft" ? -5 : event.key === "ArrowRight" ? 5 : 0;
    if (!step) return;
    event.preventDefault();
    event.stopPropagation();
    onSeek(clamp(time + step, 0, safeDuration));
  }

  const hoverChapter = hover === null ? null : chapters[chapterIndexAt(chapters, hover)];
  const current = chapters[chapterIndexAt(chapters, shown)];

  return (
    <div
      ref={track}
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.round(safeDuration)}
      aria-valuenow={Math.round(shown)}
      aria-valuetext={`${clock(shown)} of ${clock(safeDuration)}${current ? `, ${current.text}` : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={() => setHover(null)}
      onKeyDown={onKeyDown}
      className="group/bar relative flex h-5 cursor-pointer touch-none items-center outline-none"
    >
      <div className="flex w-full gap-[3px]">
        {chapters.map((chapter) => {
          const length = chapter.end - chapter.start;
          const fill = (until: number) => `${clamp((until - chapter.start) / length, 0, 1) * 100}%`;
          return (
            <div
              key={chapter.start}
              style={{ flexGrow: length }}
              className="relative h-[3px] basis-0 overflow-hidden rounded-full bg-white/25 transition-[height] duration-150 group-hover/bar:h-[5px] group-focus-visible/bar:h-[5px]"
            >
              <div className="absolute inset-y-0 left-0 bg-white/35" style={{ width: fill(buffered) }} />
              {hover !== null ? <div className="absolute inset-y-0 left-0 bg-white/45" style={{ width: fill(hover) }} /> : null}
              <div className="absolute inset-y-0 left-0 bg-white" style={{ width: fill(shown) }} />
            </div>
          );
        })}
      </div>

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow transition-transform duration-150 ${
          drag !== null ? "scale-100" : "scale-0 group-hover/bar:scale-100 group-focus-visible/bar:scale-100"
        }`}
        style={{ left: `${(shown / safeDuration) * 100}%` }}
      />

      {hover !== null && hoverChapter ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-full mb-3 -translate-x-1/2 rounded-lg bg-neutral-950/90 px-2.5 py-1.5 text-center whitespace-nowrap text-white shadow-lg"
          style={{ left: `clamp(70px, ${(hover / safeDuration) * 100}%, calc(100% - 70px))` }}
        >
          <span className="block text-[12px] font-medium">{hoverChapter.text}</span>
          <span className="block text-[12px] text-white/70 tabular-nums">{clock(hover)}</span>
        </div>
      ) : null}
    </div>
  );
}
