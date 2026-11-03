import { normalizeEmail } from "@/lib/auth/identity";

/**
 * The developer waitlist form's state and the one check it makes. Pure, so
 * the server action, the form and the tests share them.
 */

/** What the form shows: the field and its error, or the thank you once joined. */
export type WaitlistState = {
  joined: boolean;
  /** What the person typed, kept so a refused try does not empty the field. */
  email: string;
  error: string | null;
};

export const waitlistStart: WaitlistState = { joined: false, email: "", error: null };

export const WAITLIST_ERRORS = {
  email: "Enter your email address.",
  tooMany: "Too many tries. Wait a minute and try again.",
  unavailable: "The waitlist is not taking sign ups right now. Try again later.",
} as const;

/** The address in its stored form (trimmed, lowercase), or the error to show. */
export function readWaitlistEmail(raw: unknown): { email: string } | { error: string } {
  const email = normalizeEmail(raw);
  return email ? { email } : { error: WAITLIST_ERRORS.email };
}
