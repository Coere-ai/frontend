"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { configuredCredentials, credentialsMatch, wrongGuessDelay } from "@/lib/auth/credentials";
import { cookieOptions } from "@/lib/auth/session";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, issueSessionToken } from "@/lib/auth/session-token";

// Sign in and out of /statistics.
//
// One operator, one pair of values from the deploy. The form posts to a server
// action, so the password never travels through a URL, a query string or a
// log line.

/** The same words for a wrong username, a wrong password and a deploy with no
 *  sign-in set up: telling them apart would say which half was right. */
const REJECTED = "Those details were not recognised.";

/**
 * Per-IP attempt budget.
 *
 * The 800 ms wait already makes each guess slow; this caps how many one
 * address gets at all. In memory and per instance, which is the right shape
 * for a site with one operator: a shared store would be a dependency bought
 * for nothing.
 */
const ATTEMPTS = { windowMs: 15 * 60_000, max: 10 };
const attempts = new Map<string, { count: number; resetAt: number }>();

function tooManyAttempts(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now >= entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + ATTEMPTS.windowMs });
    if (attempts.size > 5000) {
      for (const [k, v] of attempts) if (now >= v.resetAt) attempts.delete(k);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > ATTEMPTS.max;
}

export type SignInState = { error: string | null };

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const head = await headers();
  const ip = head.get("x-forwarded-for")?.split(",")[0]?.trim() || head.get("x-real-ip") || "unknown";

  if (tooManyAttempts(ip)) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!configuredCredentials()) {
    // Said in the server log, where the owner looks, and not on the page.
    console.error("[statistics] USER and PASSWORD must both be set for sign-in");
  }
  if (!credentialsMatch(username, password)) {
    await wrongGuessDelay();
    return { error: REJECTED };
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, issueSessionToken(), cookieOptions(SESSION_MAX_AGE_SECONDS));
  redirect("/statistics");
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", cookieOptions(0));
  redirect("/");
}
