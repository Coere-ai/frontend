/**
 * Where to send a person after they sign in. Pure, so it is tested on its own
 * and shared by the pages, the actions and the emailed link's handler.
 */

/** A path on this site, never another origin: it starts with one slash, not two, and holds no backslash. */
export function safeNext(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}

/**
 * The `next` of an emailed link, as `/auth/confirm` receives it.
 *
 * The email templates end the link with `next={{ .RedirectTo }}`, and
 * RedirectTo is the full address the server passed as `emailRedirectTo`
 * (or the Site URL when that address is not on the allow list). Supabase
 * may or may not encode it, so an unencoded RedirectTo spills its own query
 * into the link's query. `next` is always last in the template, so the whole
 * rest of the query after `next=` is the address. It counts only when it is
 * on one of this site's origins; the bare origin means the dashboard.
 */
export function nextFromLink(search: string, origins: string[], fallback = "/dashboard"): string {
  const query = search.startsWith("?") ? search.slice(1) : search;
  const at = query.startsWith("next=") ? 0 : query.indexOf("&next=") + 1;
  if (at === 0 && !query.startsWith("next=")) return fallback;
  let raw = query.slice(at + "next=".length);
  if (/^(https?%3A|%2F)/i.test(raw)) {
    try {
      raw = decodeURIComponent(raw);
    } catch {
      return fallback;
    }
  }
  if (raw.startsWith("/")) return raw === "/" ? fallback : safeNext(raw, fallback);
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return fallback;
  }
  if (!origins.includes(url.origin)) return fallback;
  const path = `${url.pathname}${url.search}`;
  return path === "/" ? fallback : safeNext(path, fallback);
}
