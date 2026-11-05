import { normalizeEmail } from "@/lib/auth/identity";
import { isRecord } from "@/lib/v1/body";

/**
 * The checks on `POST /api/v1/account/delete` (docs/accounts.md 8.12)
 * before anything is removed, the same the dashboard made: the body holds
 * the email the person typed, and it must be their account's own email,
 * compared as emails are stored (trimmed, lower case). Pure, so the tests
 * pin them.
 */

export const EMAIL_LINE = "Type your email exactly as it shows above.";
export const LAST_ADMIN_LINE = "You are the only admin of your organization. Make another member an admin first, then delete your account.";

/** The typed email from the body, or null when the body is not `{ email: string }`. */
export function typedEmail(body: unknown): string | null {
  return isRecord(body) && typeof body.email === "string" && body.email.length <= 320 ? body.email : null;
}

/** Whether the typed email is the account's own. */
export function emailMatches(typed: string, account: string | null | undefined): boolean {
  const email = normalizeEmail(typed);
  return Boolean(email && account && email === account.trim().toLowerCase());
}
