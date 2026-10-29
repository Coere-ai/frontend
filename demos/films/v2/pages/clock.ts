/**
 * The film's clock in a tab: the days pass in seconds, as coere-v2's films
 * set Playwright's clock on a tab (tools/demo-video/stage/clock.ts). The
 * top page keeps the film's time in `extra.clock`; Date here reads it, so
 * the dashboard says "yesterday" of the chats the way it did on that day.
 * Imported first, before any of Coere's code reads the time.
 */
import type { DemoHost } from "../../../stage/host";

const host = (parent as unknown as { __demo: DemoHost }).__demo;
const Real = Date;
const offset = (): number => {
  const c = host.extra.clock as { at: number; from: number } | undefined;
  return c ? c.at - c.from : 0;
};

class FilmDate extends Real {
  constructor(...a: ConstructorParameters<DateConstructor> | []) {
    if (a.length === 0) super(Real.now() + offset());
    else super(...(a as [string]));
  }
  static now(): number {
    return Real.now() + offset();
  }
}
Object.assign(window, { Date: FilmDate });
