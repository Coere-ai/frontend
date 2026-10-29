"use client";

import type { Cue } from "@/site/content/films";
import {
  BackTenIcon,
  CaptionsIcon,
  ChaptersIcon,
  ExitFullscreenIcon,
  ForwardTenIcon,
  FullscreenIcon,
  PauseIcon,
  PlayIcon,
} from "@/site/ui/icons/player-icons";
import { ControlButton } from "./control-button";
import { clock } from "./format";
import { ProgressBar } from "./progress-bar";
import { SpeedMenu } from "./speed-menu";
import type { VideoState } from "./use-video-state";

export type ControlsProps = {
  state: VideoState;
  chapters: Cue[];
  chapter: Cue | undefined;
  captionsOn: boolean;
  chaptersOpen: boolean;
  speed: number;
  fullscreen: boolean;
  visible: boolean;
  onToggle: () => void;
  onSeek: (seconds: number) => void;
  onSkip: (seconds: number) => void;
  onCaptions: () => void;
  onChapters: () => void;
  onSpeed: (speed: number) => void;
  onFullscreen: () => void;
};

/**
 * The bar along the bottom of the frame: the scrub bar on top, then play,
 * skip, the time and the current chapter on the left, and captions, speed,
 * chapters and full screen on the right. There is no volume control because
 * the films are silent.
 */
export function Controls(props: ControlsProps) {
  const { state, chapter, visible } = props;
  return (
    <div
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/35 to-transparent px-3 pt-14 pb-2 transition-opacity duration-300 md:px-4 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ProgressBar time={state.time} duration={state.duration} buffered={state.buffered} chapters={props.chapters} onSeek={props.onSeek} />

      <div className="mt-1 flex items-center gap-0.5 text-white">
        <ControlButton label={state.playing ? "Pause" : "Play"} shortcut="k" onClick={props.onToggle}>
          {state.playing ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
        </ControlButton>
        <ControlButton label="Back 10 seconds" shortcut="j" onClick={() => props.onSkip(-10)}>
          <BackTenIcon size={21} />
        </ControlButton>
        <ControlButton label="Forward 10 seconds" shortcut="l" onClick={() => props.onSkip(10)}>
          <ForwardTenIcon size={21} />
        </ControlButton>

        <p className="ml-2 shrink-0 text-[13px] text-white/90 tabular-nums">
          {clock(state.time)} <span className="text-white/50">/ {clock(state.duration)}</span>
        </p>
        {chapter ? (
          <button
            type="button"
            onClick={props.onChapters}
            className="ml-3 hidden min-w-0 truncate rounded-full px-2.5 py-1 text-[13px] text-white/90 hover:bg-white/15 sm:block"
          >
            {chapter.text}
          </button>
        ) : null}

        <div className="ml-auto flex items-center gap-0.5">
          <ControlButton label="Captions" shortcut="c" pressed={props.captionsOn} onClick={props.onCaptions}>
            <span className="relative">
              <CaptionsIcon size={21} />
              <span className={`absolute -bottom-1 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-white transition-all ${props.captionsOn ? "w-4" : "w-0"}`} />
            </span>
          </ControlButton>
          <SpeedMenu speed={props.speed} onSpeed={props.onSpeed} />
          <ControlButton label="Chapters" shortcut="m" pressed={props.chaptersOpen} onClick={props.onChapters}>
            <ChaptersIcon size={21} />
          </ControlButton>
          <ControlButton label={props.fullscreen ? "Exit full screen" : "Full screen"} shortcut="f" onClick={props.onFullscreen}>
            {props.fullscreen ? <ExitFullscreenIcon size={21} /> : <FullscreenIcon size={21} />}
          </ControlButton>
        </div>
      </div>
    </div>
  );
}
