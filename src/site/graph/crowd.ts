/**
 * The points a branch must keep clear of while the layout gives lines
 * room (stretch.ts): its parent, its parent's chats and the siblings
 * already settled. They sit in a grid of cells as wide as the biggest two
 * points side by side, so each point is checked only against the few
 * near it, which keeps five thousand chats quick.
 */

/** The least world gap kept between two points that are not linked. */
export const CLEAR = 2;

/** A point as the crowd sees it: where it is and how big it is drawn, in world units. */
export interface Dot {
  x: number;
  y: number;
  r: number;
}

export interface Crowd {
  add(points: Iterable<Dot>): void;
  /**
   * How far the points must move along (ux, uy) so that none comes nearer
   * than CLEAR to a point in the crowd, or 0 when none does.
   */
  pushFor(points: Iterable<Dot>, ux: number, uy: number): number;
}

export function createCrowd(biggest: number): Crowd {
  const cell = biggest * 2 + CLEAR;
  const grid = new Map<number, Dot[]>();
  const key = (gx: number, gy: number): number => gx * 1_000_003 + gy;
  return {
    add(points) {
      for (const p of points) {
        const k = key(Math.floor(p.x / cell), Math.floor(p.y / cell));
        const list = grid.get(k);
        if (list) list.push(p);
        else grid.set(k, [p]);
      }
    },
    pushFor(points, ux, uy) {
      let push = 0;
      for (const q of points) {
        const [gx, gy] = [Math.floor(q.x / cell), Math.floor(q.y / cell)];
        for (let x = gx - 1; x <= gx + 1; x++)
          for (let y = gy - 1; y <= gy + 1; y++)
            for (const o of grid.get(key(x, y)) ?? []) {
              const want = q.r + o.r + CLEAR;
              const [dx, dy] = [q.x - o.x, q.y - o.y];
              const now2 = dx * dx + dy * dy;
              if (now2 >= want * want) continue;
              // The least t that puts q + t u at `want` from o.
              const b = ux * dx + uy * dy;
              push = Math.max(push, -b + Math.sqrt(Math.max(0, b * b - now2 + want * want)));
            }
      }
      return push;
    },
  };
}
