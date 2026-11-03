"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Film } from "@/site/content/films";
import { PauseIcon, PlayIcon } from "./icons/interface-icons";
import { clock, FilmTimeline, type Span } from "./film-timeline";
import { LiveDemo, type DemoChapter, type DemoState } from "./live-demo";
import { Underlined } from "./underlined";

/** How long a chapter is taken to run before the film says, in seconds. */
const GUESS = 20;

/**
 * A whole film, live on Coere's real code, with a player below it as a
 * video has: pause, the time, a line to drag along with a still and the
 * name of each part, and the parts listed underneath to jump to. A jump
 * starts the film again at that point; it skips there unseen behind the
 * part's still, and until it shows, the line holds the point that was
 * picked rather than following the skip. Meant for dark artwork.
 */
export function FilmPlayer({ film, className }: { film: Film; className?: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [start, setStart] = useState<{ from?: string; at?: number }>({});
  const [chapters, setChapters] = useState<DemoChapter[]>([]);
  const [state, setState] = useState<DemoState | null>(null);
  const [lengths, setLengths] = useState<Record<string, number>>({});
  // The point last picked on the line, held until the film shows it, and a count of jumps so picking the same point twice still starts again.
  const [target, setTarget] = useState<number | null>(null);
  const [jumps, setJumps] = useState(0);
  const covered = useRef(false);

  const onState = useCallback((next: DemoState) => {
    setChapters((now) => (now.length ? now : next.chapters));
    // The jump is done once the new run has been under its cover and come out.
    if (next.covered) covered.current = true;
    else if (covered.current) {
      covered.current = false;
      setTarget(null);
    }
    setState((before) => {
      // A part that played through to the next tells its real length, for films that do not say it.
      if (before?.chapter && next.chapter && before.chapter !== next.chapter && !next.covered && before.at > 2) {
        const done = before.chapter;
        setLengths((l) => (l[done] ? l : { ...l, [done]: before.at }));
      }
      return next;
    });
  }, []);

  const spans: Span[] = useMemo(
    () =>
      chapters.reduce<Span[]>((list, c) => {
        const last = list[list.length - 1];
        return [...list, { id: c.id, title: c.title, start: last ? last.start + last.seconds : 0, seconds: c.seconds ?? lengths[c.id] ?? GUESS }];
      }, []),
    [chapters, lengths],
  );

  const current = spans.find((s) => s.id === state?.chapter);
  const now = target ?? (current ? current.start + Math.min(state?.at ?? 0, current.seconds - 0.25) : 0);
  const showing = target === null ? current : spans.find((s) => target < s.start + s.seconds);
  const total = spans.reduce((sum, s) => sum + s.seconds, 0);
  const paused = state?.paused ?? false;

  const seek = (seconds: number) => {
    const span = spans.find((s) => seconds < s.start + s.seconds) ?? spans[0];
    if (!span) return;
    const offset = Math.max(0, seconds - span.start);
    covered.current = false;
    setTarget(seconds);
    setJumps((n) => n + 1);
    setStart(span === spans[0] && offset < 1 ? {} : { from: span.id, at: offset >= 1 ? offset : undefined });
  };
  const toggle = () => frame.current?.contentWindow?.postMessage({ coereDemo: paused ? "play" : "pause" }, location.origin);

  return (
    <div className={className}>
      <LiveDemo key={jumps} film={film.slug} from={start.from} at={start.at} label={film.title} frameRef={frame} onState={onState} className="rounded-2xl shadow-[0_50px_120px_-30px_rgba(0,0,0,0.75)] ring-1 ring-white/10" />
      <div className="mt-5 flex items-center gap-4 text-white">
        <button type="button" onClick={toggle} aria-label={paused ? "Play" : "Pause"} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-neutral-950">
          {paused ? <PlayIcon size={18} /> : <PauseIcon size={18} />}
        </button>
        <span className="w-[92px] shrink-0 text-[13px] text-white/80 tabular-nums">
          {clock(now)} / {clock(total)}
        </span>
        <FilmTimeline film={film.slug} spans={spans} now={now} onSeek={seek} />
      </div>
      {/* The parts arrive once the film reports them; the row keeps their height from the start so nothing below it moves. */}
      <nav aria-label="Parts of the film" className="mt-4 flex min-h-[43px] gap-6 overflow-x-auto pb-1 md:justify-center">
        {spans.map((s) => (
          <button key={s.id} type="button" onClick={() => seek(s.start)} aria-current={s.id === showing?.id} className="group shrink-0 text-left text-[14px] text-white/70 hover:text-white aria-[current=true]:text-white">
            <span className="block text-[12px] text-white/45 tabular-nums">{clock(s.start)}</span>
            <Underlined light on={s.id === showing?.id}>
              {s.title}
            </Underlined>
          </button>
        ))}
      </nav>
    </div>
  );
}
