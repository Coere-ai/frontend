import { NOW } from "./memory";

/**
 * The film's day in a dashboard tab, as coere-v2's films set a tab's clock
 * with Playwright (tools/demo-video/stage/clock.ts): the page reads
 * Wednesday, October 28, 2026, running at the real pace from when it
 * opened, so "Next", "Due in 2 days" and the dates read the same on any
 * day the demo is watched. Imported before the dashboard's own code.
 */
const Real = Date;
const start = Real.now();
const now = () => NOW + (Real.now() - start);

class FilmDate extends Real {
  constructor(...args: unknown[]) {
    if (args.length === 0) super(now());
    else super(...(args as [string]));
  }
  static now(): number {
    return now();
  }
}

globalThis.Date = FilmDate as DateConstructor;
