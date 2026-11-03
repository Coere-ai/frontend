/**
 * A fixed window attempt counter, held in memory.
 *
 * Per server instance, like the admin guard's: each guess already waits
 * 800 ms, and this caps how many one key gets at all. A shared store would be
 * a dependency bought for a limit that only has to be rough.
 */

export interface AttemptLimiter {
  /** Counts one attempt for the key and says whether it is over the limit. */
  hit(key: string, now?: number): boolean;
}

/** Past this many keys, expired windows are swept so the map cannot grow without end. */
const SWEEP_AT = 5000;

export function createAttemptLimiter({ max, windowMs }: { max: number; windowMs: number }): AttemptLimiter {
  const windows = new Map<string, { count: number; resetAt: number }>();
  return {
    hit(key, now = Date.now()) {
      const entry = windows.get(key);
      if (!entry || now >= entry.resetAt) {
        windows.set(key, { count: 1, resetAt: now + windowMs });
        if (windows.size > SWEEP_AT) {
          for (const [k, v] of windows) if (now >= v.resetAt) windows.delete(k);
        }
        return false;
      }
      entry.count += 1;
      return entry.count > max;
    },
  };
}
