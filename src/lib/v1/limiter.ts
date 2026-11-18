/**
 * A fixed one minute window per key, held in this server instance's memory
 * (docs/accounts.md 8.10). Used per device with the plan's
 * requests_per_minute, and per address for /auth/token. Instances do not
 * share it, so the true ceiling is the limit times the instances; that is
 * fine for a guard against a runaway loop, which is what it is for.
 */

const WINDOW_MS = 60_000;
const SWEEP_AT = 10_000;

export type LimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export interface Limiter {
  hit(key: string, limit: number): LimitResult;
}

export function createLimiter(now: () => number = Date.now): Limiter {
  const windows = new Map<string, { count: number; resetAt: number }>();
  let sweepAt = SWEEP_AT;

  // Drop ended windows once the map grows, so it cannot grow without end. A
  // sweep that frees little waits for the map to double before the next.
  const sweep = (t: number) => {
    if (windows.size <= sweepAt) return;
    for (const [k, w] of windows) if (t >= w.resetAt) windows.delete(k);
    sweepAt = Math.max(SWEEP_AT, windows.size * 2);
  };

  return {
    hit(key, limit) {
      const t = now();
      const w = windows.get(key);
      if (!w || t >= w.resetAt) {
        windows.set(key, { count: 1, resetAt: t + WINDOW_MS });
        sweep(t);
        return limit >= 1 ? { ok: true } : { ok: false, retryAfterSeconds: 60 };
      }
      w.count += 1;
      if (w.count <= limit) return { ok: true };
      return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((w.resetAt - t) / 1000)) };
    },
  };
}

/** The per device limiter every bearer route shares. */
export const deviceLimiter = createLimiter();
/** /auth/token: 20 a minute per address. */
export const tokenLimiter = createLimiter();
export const TOKEN_TRIES_PER_MINUTE = 20;
