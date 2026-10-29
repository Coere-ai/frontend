/**
 * The film's day: Wednesday, October 28, 2026, early in the morning in
 * California, the week before the turbine 14 gearbox job at Altamont.
 * Every date the real code reads (due soon, overdue, a catch up's last
 * meeting) is worked out from now, so the dashboard and Cori read the
 * clock from here, and the film shows the same day whenever it plays.
 * Time still moves, from that morning on.
 */
export const FILM_NOW = Date.parse("2026-10-28T14:20:00Z");
export const ZONE = "America/Los_Angeles";

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
