/**
 * Where to send a person after they sign in. Pure, so it is tested on its own
 * and shared by the pages and the actions.
 */

/** A stand in origin, so a `next` can be read the way a browser reads a relative address. */
const HERE = "https://here.invalid";

/**
 * A path on this site, never another origin. A string check alone is not
 * enough: browsers drop tabs and newlines from an address, so "/\t/evil.com"
 * goes to evil.com. So `next` is parsed the way a browser would read it, and
 * only the path of a same origin result is kept, percent encoded, which also
 * keeps characters a header cannot carry out of the redirect.
 */
export function safeNext(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/") || /[\u0000-\u001f\u007f\\]/.test(next)) return fallback;
  let url: URL;
  try {
    url = new URL(next, HERE);
  } catch {
    return fallback;
  }
  if (url.origin !== HERE || url.pathname.startsWith("//")) return fallback;
  return `${url.pathname}${url.search}${url.hash}`;
}
