import "server-only";

import { addressOf, logSecurityEvent } from "@/lib/security/events";

import { createAttemptLimiter } from "./attempts";
import { WRONG_GUESS_DELAY_MS } from "./credentials";

/**
 * The limits on every sign in path (docs/accounts.md section 3.1): 10 tries
 * in 15 minutes for each network address and for each account address, so
 * neither one machine nor many machines aimed at one email get more than 10
 * guesses at a code or a password.
 */
const limiter = createAttemptLimiter({ max: 10, windowMs: 15 * 60_000 });

/** Counts one attempt against each key; true, and a `rate_limited` event, when any is spent. */
export async function overLimit(headers: Headers, email: string | null): Promise<boolean> {
  const keys = [`ip:${addressOf(headers) ?? "unknown"}`];
  if (email) keys.push(`email:${email}`);
  // Every key is counted, so a refused try still uses up the others' budget.
  const spent = keys.map((key) => limiter.hit(key)).some(Boolean);
  if (spent) await logSecurityEvent("rate_limited", { headers });
  return spent;
}

/**
 * The wait before a wrong answer. At least 800 ms, and long enough that every
 * wrong answer takes about the same total time, so a username that does not
 * exist (no Supabase call) answers no faster than a wrong password (one call).
 */
const FLOOR_MS = 1500;

export function wrongAnswerDelay(startedAt: number): Promise<void> {
  const wait = Math.max(WRONG_GUESS_DELAY_MS, FLOOR_MS - (Date.now() - startedAt));
  return new Promise((resolve) => setTimeout(resolve, wait));
}
