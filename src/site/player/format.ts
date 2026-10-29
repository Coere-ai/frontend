import type { Cue } from "@/site/content/films";

/** Seconds as a clock: "3:34", or "1:02:09" past an hour. */
export function clock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = String(total % 60).padStart(2, "0");
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
}

/**
 * The chapter playing at a time. Chapters run back to back, so this is the
 * last one that has started. Lists are short, so a backwards scan is plenty.
 */
export function chapterIndexAt(chapters: Cue[], time: number): number {
  for (let i = chapters.length - 1; i >= 0; i -= 1) {
    if (time >= chapters[i].start) return i;
  }
  return 0;
}

/** The caption on screen at a time, or null in the gaps between lines. */
export function captionAt(captions: Cue[], time: number): Cue | null {
  return captions.find((cue) => time >= cue.start && time < cue.end) ?? null;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
