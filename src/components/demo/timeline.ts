/**
 * The demo is a 60 second film driven by named beats rather than a per frame
 * clock: React state changes only when a beat is crossed, and every scene
 * animates declaratively from there. Times are seconds from the start.
 */
export const BEATS = [
  // Act 1: the product
  { id: "intro-in", at: 0 },
  { id: "intro-tagline", at: 2.6 },
  { id: "intro-out", at: 5.4 },

  // Act 2: the transfer
  { id: "stage-in", at: 6.4 },
  { id: "left-thread", at: 8.2 },
  { id: "right-typing", at: 10.4 },
  { id: "coere-popup", at: 13.6 },
  { id: "cursor-move", at: 15.2 },
  { id: "cursor-yes", at: 16.8 },
  { id: "scan", at: 18.4 },
  { id: "compress", at: 21.2 },
  { id: "fly", at: 24.4 },
  { id: "sent", at: 26.4 },
  { id: "reply", at: 28.2 },

  // Act 3: every model, then everyone
  { id: "montage", at: 30.8 },
  { id: "wall", at: 37.8 },
  { id: "outro-blur", at: 44.6 },

  // Act 4: the record
  { id: "dash-in", at: 45.4 },
  { id: "dash-totals", at: 46.2 },
  { id: "dash-rows", at: 47.2 },
  { id: "dash-out", at: 51 },

  // Act 5: the line
  { id: "outro-line", at: 52 },
  { id: "outro-hold", at: 56 },
] as const;

export type BeatId = (typeof BEATS)[number]["id"];

export const DEMO_DURATION = 60;

const INDEX = new Map<BeatId, number>(
  BEATS.map((beat, index) => [beat.id, index]),
);

/** Index of a beat by id. */
export function beatIndex(id: BeatId) {
  return INDEX.get(id) ?? 0;
}

/** The beat playing at `time`. */
export function beatAtTime(time: number) {
  let index = 0;
  for (let i = 0; i < BEATS.length; i += 1) {
    if (time >= BEATS[i].at) index = i;
  }
  return index;
}

/** A long, even pull back: no snap at either end. */
export const EASE_PULL = [0.4, 0, 0.25, 1] as const;

/** Apple-ish easing: quick out, long settle. */
export const EASE = [0.22, 1, 0.36, 1] as const;
export const EASE_HERO = [0.16, 1, 0.3, 1] as const;

export const CHAPTERS = [
  { label: "Coere", at: 0 },
  { label: "The transfer", at: 6.4 },
  { label: "Any model", at: 30.8 },
  { label: "Everyone", at: 37.8 },
  { label: "Your record", at: 45.4 },
  { label: "The point", at: 52 },
] as const;
