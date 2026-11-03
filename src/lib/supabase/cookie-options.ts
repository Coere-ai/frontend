/**
 * The account cookies' names and flags, in one place with no server imports,
 * so the proxy, the server actions and the session client all write the same
 * thing.
 */

/** 400 days, Chrome's ceiling, so a session outlives any browser cookie rule. */
export const SESSION_COOKIE_MAX_AGE = 400 * 24 * 60 * 60;

/** The session cookies' flags: unreadable by scripts, secure outside localhost. */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_COOKIE_MAX_AGE,
};

/**
 * Supabase hands each cookie its own options. Ours win, except a maxAge of 0,
 * which is how Supabase deletes a stale chunk and must stay a delete.
 */
export function sessionCookie(options: { maxAge?: number }) {
  return { ...options, ...sessionCookieOptions, maxAge: options.maxAge === 0 ? 0 : SESSION_COOKIE_MAX_AGE };
}

/** Holds "1" while this browser is signed in. Scripts read it; it grants nothing. */
export const SIGNED_IN_COOKIE = "coere_signed_in";

/** The extension id this browser connected, so the dashboard can message it later. */
export const EXTENSION_COOKIE = "coere_ext";

/** Flags for the two cookies scripts may read. */
export const readableCookieOptions = { ...sessionCookieOptions, httpOnly: false };
