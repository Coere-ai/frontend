import type { EmailOtpType } from "@supabase/supabase-js";

import { safeNext } from "./next-path";

/**
 * The parts of an emailed link that `/auth/confirm` passes on to the confirm
 * page, and that page's form posts back. Pure, so the checks are tested on
 * their own and shared by the route, the page and the action.
 */

const TYPES = new Set<EmailOtpType>(["email", "signup", "magiclink", "invite"]);

export interface EmailLink {
  tokenHash: string;
  type: EmailOtpType;
  next: string;
}

const isType = (value: unknown): value is EmailOtpType => typeof value === "string" && TYPES.has(value as EmailOtpType);

/** A token hash Supabase made: hex, or the url safe letters a newer version may use. */
const isTokenHash = (value: unknown): value is string => typeof value === "string" && /^[A-Za-z0-9_-]{8,128}$/.test(value);

/** The link's parts when they are well formed, else null. */
export function readEmailLink(tokenHash: unknown, type: unknown, next: unknown): EmailLink | null {
  if (!isTokenHash(tokenHash) || !isType(type)) return null;
  return { tokenHash, type, next: safeNext(typeof next === "string" ? next : null) };
}

/** The confirm page's address for a link. */
export function continuePath(link: EmailLink): string {
  const query = new URLSearchParams({ token_hash: link.tokenHash, type: link.type, next: link.next });
  return `/auth/continue?${query.toString()}`;
}

/** Where a link that did not work sends the person: sign in, which says so and keeps `next`. */
export function linkFailedPath(next: string): string {
  return `/sign-in?error=link&next=${encodeURIComponent(next)}`;
}
