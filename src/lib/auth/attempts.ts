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

/**
 * The sign in limits: one budget for each network address and a larger one
 * for each username. A try from an address whose own budget is spent is
 * refused there and never reaches the username's, so one address cannot
 * spend a username's budget and lock its owner out. Locking a username out
 * takes `perUsername` tries from at least `perUsername / perAddress`
 * addresses in one window, and many addresses aimed at one account still
 * get no more than `perUsername` guesses in it.
 */
export function createSignInLimiter({ perAddress, perUsername, windowMs }: { perAddress: number; perUsername: number; windowMs: number }) {
  const addresses = createAttemptLimiter({ max: perAddress, windowMs });
  const usernames = createAttemptLimiter({ max: perUsername, windowMs });
  return {
    /** Counts one try; true when it is over either limit. */
    hit(address: string, username: string | null, now = Date.now()): boolean {
      if (addresses.hit(address, now)) return true;
      return username !== null && usernames.hit(username, now);
    },
  };
}
