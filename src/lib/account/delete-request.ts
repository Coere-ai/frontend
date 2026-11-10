import { normalizeUsername } from "@/lib/auth/identity";
import { isRecord } from "@/lib/v1/body";

/**
 * The checks before an account is deleted. On /account the person types
 * their own username, compared as usernames are stored (trimmed, lower
 * case). `POST /api/v1/account/delete` (docs/accounts.md 8.12) keeps its
 * body, `{ email: string }`, only to check its shape before refusing: a
 * device token never deletes the account. Pure, so the tests pin them.
 */

export const USERNAME_LINE = "Type your username exactly as it shows above.";
export const LAST_ADMIN_LINE = "You are the only admin of your organization. Make another member an admin first, then delete your account.";

/** The typed email from the API's body, or null when the body is not `{ email: string }`. */
export function typedEmail(body: unknown): string | null {
  return isRecord(body) && typeof body.email === "string" && body.email.length <= 320 ? body.email : null;
}

/** Whether the typed username is the account's own. */
export function usernameMatches(typed: string, account: string | null | undefined): boolean {
  const name = normalizeUsername(typed);
  return Boolean(name && account && name === account);
}
