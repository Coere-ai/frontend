import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

import { sessionCookie, sessionCookieOptions } from "./cookie-options";

/**
 * The @supabase/ssr session refresh, for the proxy.
 *
 * An access token lives an hour, so a returning person's cookie is usually
 * stale. `auth.getUser()` trades the refresh token for a new pair before the
 * page renders. The new cookies go onto the request, so the page reads the
 * fresh session in the same request, and onto the response, so the browser
 * keeps them. Refresh tokens work once: a page that tried to refresh on its
 * own would race the next one and sign the person out.
 */

type Written = { name: string; value: string; options: Record<string, unknown> };

export interface Refreshed {
  /** Copies the refreshed cookies and Supabase's no-cache headers onto the answer. */
  apply(response: NextResponse): NextResponse;
}

const NOTHING: Refreshed = { apply: (response) => response };

export async function refreshSession(request: NextRequest): Promise<Refreshed> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NOTHING;

  const written: Written[] = [];
  const extraHeaders: Record<string, string> = {};
  const client = createServerClient(url, key, {
    cookieOptions: sessionCookieOptions,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list, headers) => {
        for (const { name, value, options } of list) {
          request.cookies.set(name, value);
          written.push({ name, value, options: sessionCookie(options) });
        }
        Object.assign(extraHeaders, headers);
      },
    },
  });

  try {
    await client.auth.getUser();
  } catch {
    // Supabase unreachable: the page checks the session itself and shows signed out.
    return NOTHING;
  }

  return {
    apply(response) {
      for (const { name, value, options } of written) response.cookies.set(name, value, options);
      for (const [name, value] of Object.entries(extraHeaders)) response.headers.set(name, value);
      return response;
    },
  };
}
