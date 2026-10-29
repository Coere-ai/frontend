/**
 * The film's day: Wednesday, October 28, 2026, early in the morning at
 * the plant in Monterrey, three days before the root cause report is due
 * to Corvane. Every date the real code reads (due soon, overdue, Cori's
 * answers) is worked out from now, so the dashboard and Cori read the
 * clock from here, and the film shows the same day whenever it plays.
 * Time still moves, from that morning on (as demos/films/industry-legal).
 */
export const FILM_NOW = Date.UTC(2026, 9, 28, 14, 40);
export const ZONE = "America/Monterrey";

const Real = Date;
const offset = FILM_NOW - Real.now();

class FilmDate extends Real {
  constructor(...args: unknown[]) {
    if (args.length === 0) super(Real.now() + offset);
    else super(...(args as [number]));
  }
  static override now(): number {
    return Real.now() + offset;
  }
}

if (!(Date as unknown as { __film?: boolean }).__film) {
  Object.defineProperty(FilmDate, "__film", { value: true });
  globalThis.Date = FilmDate as DateConstructor;
}
