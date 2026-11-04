import { normalizeEmail } from "@/lib/auth/identity";
import { isLaunchProduct, type LaunchProduct } from "@/site/content/launch";

/**
 * The I'm interested form on the coming soon pages: its state and the one
 * check it makes. Pure, so the server action, the form and the tests share
 * them.
 */

/** What the form shows: the field and its error, or the thank you once stored. */
export type InterestState = {
  saved: boolean;
  /** What the person typed, kept so a refused try does not empty the field. */
  email: string;
  error: string | null;
};

export const interestStart: InterestState = { saved: false, email: "", error: null };

export const INTEREST_ERRORS = {
  email: "Enter your email address.",
  product: "This page cannot take sign ups. Reload it and try again.",
  tooMany: "Too many tries. Wait a minute and try again.",
  unavailable: "We could not save that right now. Try again later.",
} as const;

/** The address in its stored form (trimmed, lowercase) and the product, or the error to show. */
export function readInterest(rawEmail: unknown, rawProduct: unknown): { email: string; product: LaunchProduct } | { error: string } {
  if (!isLaunchProduct(rawProduct)) return { error: INTEREST_ERRORS.product };
  const email = normalizeEmail(rawEmail);
  return email ? { email, product: rawProduct } : { error: INTEREST_ERRORS.email };
}
