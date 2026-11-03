import { createHash, timingSafeEqual } from "node:crypto";

/**
 * The one sign-in for /admin: the `USER` and `PASSWORD` set in the deploy.
 *
 * The owner chose plain values over a stored hash, so the defence is in how
 * they are compared. Each side is hashed to a fixed-length digest first:
 * timingSafeEqual throws when lengths differ, and that throw would itself
 * leak the length of the real value. Both halves are always checked, so a
 * wrong username and a wrong password take the same time. With either value
 * unset, nothing matches and nobody can sign in.
 */

/** The configured pair, or null when either half is missing. */
export function configuredCredentials(): { user: string; password: string } | null {
  const user = process.env.USER;
  const password = process.env.PASSWORD;
  if (!user || !password) return null;
  return { user, password };
}

const digest = (value: string) => createHash("sha256").update(value.normalize("NFKC")).digest();

/** Constant-time compare over two fixed-length digests. */
export function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(digest(a), digest(b));
}

/** True only when both halves match a fully configured pair. */
export function credentialsMatch(username: string, password: string): boolean {
  const expected = configuredCredentials();
  // Compared against a throwaway value when unconfigured, so the time taken
  // does not say whether sign-in is set up at all.
  const userOk = safeEqual(username, expected?.user ?? "\u0000unset");
  const passOk = safeEqual(password, expected?.password ?? "\u0000unset");
  return expected !== null && userOk && passOk;
}

/** How long a wrong guess waits before it is answered. Enough to make a
 *  guessing run slow, short enough that a typo costs the owner nothing. */
export const WRONG_GUESS_DELAY_MS = 800;

export function wrongGuessDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, WRONG_GUESS_DELAY_MS));
}
