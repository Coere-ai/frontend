/**
 * "Only the first time in a while", per key, in this instance's memory. The
 * security log uses it so a loop (a runaway device, or someone sending junk
 * tokens or connect links) writes one row per window rather than one per
 * request. Instances do not share it, which is fine for that.
 */

const SWEEP_AT = 10_000;

export interface Once {
  /** True the first time `key` is seen in `ms`. */
  firstIn(key: string, ms: number): boolean;
}

export function createOnce(now: () => number = Date.now): Once {
  const lastSeen = new Map<string, number>();
  return {
    firstIn(key, ms) {
      const t = now();
      const at = lastSeen.get(key);
      if (at !== undefined && t - at < ms) return false;
      lastSeen.set(key, t);
      // Drop old keys once the map grows, so it cannot grow without end.
      if (lastSeen.size > SWEEP_AT) for (const [k, s] of lastSeen) if (t - s >= ms) lastSeen.delete(k);
      return true;
    },
  };
}

/** The one the security log shares. */
export const securityOnce = createOnce();
