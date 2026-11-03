import "server-only";

import { cookies } from "next/headers";

import { SESSION_COOKIE, verifySessionToken } from "./session-token";

/**
 * The /statistics session, read from the request's cookies.
 *
 * The page and the data route both call isSignedIn() themselves even though
 * the proxy has already checked: the proxy is a second gate, never the only
 * one, and a matcher that changes later must not quietly open the dashboard.
 */
export async function isSignedIn(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

/** The cookie's flags. httpOnly so no script can read it, lax so a link from
 *  elsewhere still arrives signed in, and secure everywhere but localhost. */
export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
