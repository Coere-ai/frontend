// The film's day for the recorder: Date reads 2026-10-29 17:00 UTC (or FILM_NOW) and runs on from there.
const FIXED = Date.parse(process.env.FILM_NOW ?? '2026-10-29T17:00:00Z');
const RealDate = Date;
const offset = FIXED - RealDate.now();
class FilmDate extends RealDate {
  constructor(...a) { if (a.length === 0) super(RealDate.now() + offset); else super(...a); }
  static now() { return RealDate.now() + offset; }
}
globalThis.Date = FilmDate;
