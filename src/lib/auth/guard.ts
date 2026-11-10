import "server-only";

import { addressOf, logSecurityEvent } from "@/lib/security/events";

import { createSignInLimiter } from "./attempts";
import { WRONG_GUESS_DELAY_MS } from "./credentials";

/**
 * The limits on every sign in path and every check of a current password
 * (docs/accounts.md section 3.1): 10 tries in 15 minutes for each network
 * address, and 50 for each username, counted only from addresses still
 * within their own 10. One machine gets 10 guesses and cannot lock anyone
 * out; many machines aimed at one account get 50.
 */
const limiter = createSignInLimiter({ perAddress: 10, perUsername: 50, windowMs: 15 * 60_000 });

/** Counts one attempt; true, and a `rate_limited` event, when a limit is spent. */
export async function overLimit(headers: Headers, username: string | null): Promise<boolean> {
  const spent = limiter.hit(`ip:${addressOf(headers) ?? "unknown"}`, username ? `username:${username}` : null);
  if (spent) await logSecurityEvent("rate_limited", { headers });
  return spent;
}

/**
 * The wait before a wrong answer. At least 800 ms, and long enough that every
 * wrong answer takes about the same total time, so a username that does not
 * exist (no Supabase Auth call) answers no faster than a wrong password (one call).
 */
const FLOOR_MS = 1500;

export function wrongAnswerDelay(startedAt: number): Promise<void> {
  const wait = Math.max(WRONG_GUESS_DELAY_MS, FLOOR_MS - (Date.now() - startedAt));
  return new Promise((resolve) => setTimeout(resolve, wait));
}
