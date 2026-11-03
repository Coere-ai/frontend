import { siteConfig } from "@/lib/site";

/**
 * This site's origin as the request reached it, for the address Supabase
 * puts in an emailed link. A server action's POST always carries `origin`,
 * and Next has already checked it against the host. Supabase also checks the
 * address against its own allow list, so a forged value only falls back to
 * the Site URL.
 */
export function requestOrigin(headers: Headers): string {
  const origin = headers.get("origin");
  if (origin && /^https?:\/\/[A-Za-z0-9.-]+(:\d+)?$/.test(origin)) return origin;
  return new URL(siteConfig.url).origin;
}

/** The origins an emailed link may send a person back to: where it landed, and the canonical site. */
export function siteOrigins(landedOn: string): string[] {
  return [...new Set([landedOn, new URL(siteConfig.url).origin])];
}
