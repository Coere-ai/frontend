/**
 * Whether this session signed in a moment ago, for the one step on the
 * site that cannot be undone: deleting the account at /account. A session
 * cookie lives 400 days (docs/accounts.md 3.2), so a browser left signed in
 * is not proof the person is at it. The access token's `amr` claim lists
 * when this session last proved who it was (a code, a password or a link),
 * in seconds. Pure, so the tests pin it.
 */

/** How fresh the sign in must be. */
export const RECENT_SIGN_IN_MS = 10 * 60 * 1000;

/** The latest `amr` timestamp, in milliseconds, or null when the claim holds none. */
export function lastSignInMs(amr: unknown): number | null {
  if (!Array.isArray(amr)) return null;
  let latest: number | null = null;
  for (const entry of amr) {
    const t = (entry as { timestamp?: unknown } | null)?.timestamp;
    if (typeof t === "number" && Number.isFinite(t) && (latest === null || t * 1000 > latest)) latest = t * 1000;
  }
  return latest;
}

/** Whether the session signed in within the window. A time ahead of the clock counts, by a minute at most. */
export function signedInRecently(amr: unknown, now = Date.now()): boolean {
  const at = lastSignInMs(amr);
  return at !== null && now - at <= RECENT_SIGN_IN_MS && at - now <= 60_000;
}
