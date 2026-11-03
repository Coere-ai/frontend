import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * The signed in person's Supabase client, made fresh for each request.
 *
 * It holds the publishable key and the person's session cookies, so every
 * read it makes runs under Row Level Security as that person. The secret key
 * client in `src/lib/supabase.ts` is for the server's own writes.
 *
 * Setting a cookie throws while a Server Component renders. The proxy
 * refreshes the session before render on the private paths, so a failed set
 * there loses nothing.
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

/** True when the server has what a session client needs. */
export function accountsConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
}

export async function sessionClient(): Promise<SupabaseClient> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set. See the README.");
  const jar = await cookies();
  return createServerClient(url, key, {
    cookieOptions: sessionCookieOptions,
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) jar.set(name, value, { ...options, ...sessionCookieOptions, maxAge: options.maxAge === 0 ? 0 : SESSION_COOKIE_MAX_AGE });
        } catch {
          // A Server Component render cannot set cookies; the proxy already refreshed them.
        }
      },
    },
  });
}
