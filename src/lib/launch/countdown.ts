/**
 * The countdown's arithmetic. Pure, so the timer, the admin preview and the
 * tests share it.
 */

export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the moment has come. Every part is then 0. */
  done: boolean;
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Whole days, hours, minutes and seconds from `now` until `target`, both in
 * milliseconds. A part second left counts as a whole one, so the timer
 * reads 00:00:00:01 for the last second and reaches 0 at the moment itself.
 * Past the moment, or with a target that is not a number, it stays at 0.
 */
export function timeLeft(target: number, now: number): TimeLeft {
  const left = Number.isFinite(target) && Number.isFinite(now) ? Math.ceil((target - now) / SECOND) * SECOND : 0;
  if (left <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days: Math.floor(left / DAY),
    hours: Math.floor((left % DAY) / HOUR),
    minutes: Math.floor((left % HOUR) / MINUTE),
    seconds: Math.floor((left % MINUTE) / SECOND),
    done: false,
  };
}

/** A part as the tile shows it: at least two digits, so 7 reads 07. */
export function digitsOf(value: number, min = 2): string[] {
  return String(Math.max(0, Math.floor(value))).padStart(min, "0").split("");
}
