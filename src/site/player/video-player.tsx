"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { filmLength, type Film } from "@/site/content/films";
import { ChapterPanel } from "./chapter-panel";
import { Captions } from "./captions";
import { Controls } from "./controls";
import { captionAt, chapterIndexAt, clamp } from "./format";
import { actionForKey } from "./keyboard";
import { EndOverlay, Spinner, StartOverlay, ToggleFlash } from "./overlays";
import { SPEEDS } from "./speed-menu";
import { useFullscreen } from "./use-fullscreen";
import { useIdle } from "./use-idle";
import { useVideoState } from "./use-video-state";

/**
 * A full video player for one film: chapters on the scrub bar and in a
 * drawer, captions drawn in the site's own style, speed, full screen, and
 * the familiar keyboard shortcuts once the player has focus. Clicking the
 * picture plays and pauses; a double click goes full screen.
 */
export function VideoPlayer({ film, className }: { film: Film; className?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const state = useVideoState(video, filmLength(film));
  const fullscreen = useFullscreen(frame, video);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [flash, setFlash] = useState({ id: 0, playing: false });
  const { idle, poke } = useIdle(state.playing && !chaptersOpen);

  const chapterIndex = chapterIndexAt(film.chapters, state.time);
  const caption = state.started && captionsOn ? captionAt(film.captions, state.time) : null;
  const controlsVisible = state.started && !idle;

  function play() {
    video.current?.play().catch(() => {});
    poke();
  }

  function toggle() {
    const v = video.current;
    if (!v) return;
    const resume = v.paused || v.ended;
    if (resume) v.play().catch(() => {});
    else v.pause();
    setFlash((f) => ({ id: f.id + 1, playing: resume }));
    poke();
  }

  function seek(seconds: number) {
    const v = video.current;
    if (!v) return;
    v.currentTime = clamp(seconds, 0, state.duration);
    poke();
  }

  function changeSpeed(next: number) {
    if (video.current) video.current.playbackRate = next;
    setSpeed(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // Space and Enter on a focused button press that button, not the player.
    if ((event.key === " " || event.key === "Enter") && (event.target as HTMLElement).closest("button")) return;
    const action = actionForKey(event);
    if (!action) return;
    event.preventDefault();
    switch (action.type) {
      case "toggle":
        return toggle();
      case "seekBy":
        return seek(state.time + action.seconds);
      case "seekTo":
        return seek(action.fraction * state.duration);
      case "speedStep": {
        const index = SPEEDS.indexOf(speed as (typeof SPEEDS)[number]);
        return changeSpeed(SPEEDS[clamp(index + action.step, 0, SPEEDS.length - 1)]);
      }
      case "fullscreen":
        return void fullscreen.toggle();
      case "captions":
        return setCaptionsOn((on) => !on);
      case "chapters":
        return setChaptersOpen((open) => !open);
    }
  }

  return (
    <div
      ref={frame}
      tabIndex={0}
      role="region"
      aria-label={`Video player: ${film.title}`}
      onKeyDown={onKeyDown}
      onPointerMove={poke}
      onClick={() => state.started && toggle()}
      onDoubleClick={() => void fullscreen.toggle()}
      className={`relative isolate overflow-hidden bg-neutral-950 outline-none select-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        fullscreen.active ? "flex h-screen w-screen items-center" : "aspect-[1440/900] w-full rounded-2xl"
      } ${state.playing && idle ? "cursor-none" : ""} ${className ?? ""}`}
    >
      <video
        ref={video}
        src={film.src}
        poster={film.poster}
        preload="metadata"
        playsInline
        className="block h-full w-full object-contain"
      />

      <Captions cue={caption} raised={controlsVisible} />
      {state.waiting && state.playing ? <Spinner /> : null}
      <ToggleFlash id={flash.id} playing={flash.playing} />

      {state.started ? (
        <Controls
          state={state}
          chapters={film.chapters}
          chapter={film.chapters[chapterIndex]}
          captionsOn={captionsOn}
          chaptersOpen={chaptersOpen}
          speed={speed}
          fullscreen={fullscreen.active}
          visible={controlsVisible}
          onToggle={toggle}
          onSeek={seek}
          onSkip={(by) => seek(state.time + by)}
          onCaptions={() => setCaptionsOn((on) => !on)}
          onChapters={() => setChaptersOpen((open) => !open)}
          onSpeed={changeSpeed}
          onFullscreen={() => void fullscreen.toggle()}
        />
      ) : (
        <StartOverlay title={film.title} duration={state.duration} onPlay={play} />
      )}

      {state.ended ? (
        <EndOverlay
          onReplay={() => {
            seek(0);
            play();
          }}
        />
      ) : null}

      <ChapterPanel
        open={chaptersOpen}
        chapters={film.chapters}
        current={chapterIndex}
        time={state.time}
        onPick={(seconds) => {
          seek(seconds);
          if (!state.playing) play();
        }}
        onClose={() => setChaptersOpen(false)}
      />
    </div>
  );
}
