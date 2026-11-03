import { EXTENSION_COOKIE } from "@/lib/supabase/cookie-options";

/**
 * Which extension ids a page should try, best first: the one this browser
 * connected (the `coere_ext` cookie), then each id the server allows
 * (COERE_EXTENSION_IDS, passed down by the page). Only well formed ids, each
 * once. Pure, so it is tested without a browser.
 */

/** A Chrome extension id: 32 letters from a to p. */
const EXTENSION_ID = /^[a-p]{32}$/;

/** The `coere_ext` value in a cookie header, or null. */
export function cookieExtensionId(cookie: string): string | null {
  for (const part of cookie.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name !== EXTENSION_COOKIE) continue;
    const value = decodeURIComponent(rest.join("="));
    return EXTENSION_ID.test(value) ? value : null;
  }
  return null;
}

export function candidateIds(cookie: string, allowed: readonly string[]): string[] {
  const out: string[] = [];
  for (const id of [cookieExtensionId(cookie), ...allowed.map((a) => a.trim())]) {
    if (id && EXTENSION_ID.test(id) && !out.includes(id)) out.push(id);
  }
  return out;
}

/** The server's list, as the page passes it down: comma separated and trimmed. */
export const allowedIds = (list: string | undefined): string[] =>
  (list ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => EXTENSION_ID.test(s));
