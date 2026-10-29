/**
 * The film's clock in a tab, as the v2 film keeps it (demos/films/v2/pages/clock.ts)
 * and coere-v2's films set Playwright's clock on a page (tools/demo-video/stage/clock.ts):
 * the film is set on Wednesday, October 28, 2026, so every due date and
 * "in 7 days" reads as it did that morning, whenever the demo is watched.
 * The top page keeps the time in `extra.clock`; Date here reads it.
 * Imported first, before any of Coere's code reads the time.
 */
import type { DemoHost } from "../../stage/host";

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
