"use client";

import { useRef, useState } from "react";
import { posterOf } from "./live-demo";

/** One chapter on the line: where it starts and how long it runs, in seconds. */
export type Span = { id: string; title: string; start: number; seconds: number };

/** 83 seconds as "1:23". */
export const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

/**
 * The film's line below it: one segment per chapter, filled as far as the
 * film has played. Hovering or dragging along it shows a still of the
 * chapter under the pointer with its name and time, and letting go plays
 * from there, as a video's line does.
 */
export function FilmTimeline({ film, spans, now, onSeek }: { film: string; spans: Span[]; now: number; onSeek: (seconds: number) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const total = spans.reduce((sum, s) => sum + s.seconds, 0) || 1;

  /** The film time under a pointer, from its place on the track. */
  const timeAt = (clientX: number) => {
    const box = track.current!.getBoundingClientRect();
    return Math.min(total - 0.5, Math.max(0, ((clientX - box.left) / box.width) * total));
  };
  const spanAt = (t: number) => spans.find((s) => t < s.start + s.seconds) ?? spans[spans.length - 1];

  const shown = dragging && hover !== null ? hover : now;
  const pick = hover !== null ? spanAt(hover) : null;

  return (
    <div className="relative flex-1 select-none">
      {pick && hover !== null ? (
        <div
          className="pointer-events-none absolute bottom-6 z-10 w-52 -translate-x-1/2 overflow-hidden rounded-xl bg-neutral-950 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] ring-1 ring-white/15"
          style={{ left: `clamp(104px, ${(hover / total) * 100}%, calc(100% - 104px))` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={posterOf(film, pick.id)} alt="" className="aspect-[1440/900] w-full object-cover" />
          <div className="flex items-baseline justify-between gap-3 px-3 py-2 text-[12px] text-white">
            <span className="truncate font-medium">{pick.title}</span>
            <span className="shrink-0 text-white/60 tabular-nums">{clock(hover)}</span>
          </div>
        </div>
      ) : null}
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label="Film position"
        aria-valuemin={0}
        aria-valuemax={Math.round(total)}
        aria-valuenow={Math.round(now)}
        aria-valuetext={`${clock(now)} of ${clock(total)}`}
        className="group relative flex h-6 cursor-pointer items-center gap-1 touch-none outline-none"
        onPointerMove={(e) => setHover(timeAt(e.clientX))}
        onPointerLeave={() => !dragging && setHover(null)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          setHover(timeAt(e.clientX));
        }}
        onPointerUp={(e) => {
          if (!dragging) return;
          setDragging(false);
          onSeek(timeAt(e.clientX));
          setHover(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") onSeek(Math.min(total - 0.5, now + 5));
          if (e.key === "ArrowLeft") onSeek(Math.max(0, now - 5));
        }}
      >
        {spans.map((s) => {
          const fill = Math.min(1, Math.max(0, (shown - s.start) / s.seconds));
          return (
            <div key={s.id} className="relative h-1 overflow-hidden rounded-full bg-white/25 transition-[height] group-hover:h-1.5" style={{ flexGrow: s.seconds, flexBasis: 0 }}>
              <div className="absolute inset-y-0 left-0 rounded-full bg-white" style={{ width: `${fill * 100}%` }} />
            </div>
          );
        })}
        <div
          aria-hidden="true"
          className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow transition-transform ${dragging || hover !== null ? "scale-100" : "scale-0 group-focus-visible:scale-100"}`}
          style={{ left: `${(shown / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
