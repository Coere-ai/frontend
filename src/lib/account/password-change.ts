import type { CurrentPassword } from "@/lib/auth/current-password";
import { passwordProblem } from "@/lib/auth/identity";

/**
 * Changing a password on /account, through the person's own session with
 * `auth.updateUser`, after the current password is typed again (a
 * browser left signed in is not enough). Supabase's Secure password change
 * must be off (it would email a code, and coere.ai sends no email). Should
 * Supabase still ask for a recent sign in, the form says to sign in again.
 * Pure, so the tests pin every answer the form can show.
 */

export const UNAVAILABLE = "That did not work. Try again in a minute.";

export const SIGN_IN_AGAIN = "Sign in again, then change your password.";

/** What the form says when the current password, asked before a change, does not pass (current-password.ts). Null when it passes. */
export function currentPasswordRefusal(result: CurrentPassword): string | null {
  switch (result) {
    case "ok":
      return null;
    case "wrong":
      return "Your current password is wrong.";
    case "limited":
      return "Too many tries. Wait a few minutes, then try again.";
    default:
      return UNAVAILABLE;
  }
}

/** Why the two new passwords will not do, or null when they will. */
export function newPasswordProblem(password: string, again: string): string | null {
  return passwordProblem(password) ?? (password === again ? null : "The two passwords are not the same.");
}

/** What the form says for each error code Supabase answers `updateUser` with. */
export function passwordRefusal(code: string | undefined): string {
  switch (code) {
    case "reauthentication_needed":
    case "reauth_nonce_missing":
    case "reauthentication_not_valid":
      return SIGN_IN_AGAIN;
    case "same_password":
      return "That is already your password.";
    case "weak_password":
      return "Choose a password that is harder to guess.";
    case "over_request_rate_limit":
      return "Too many tries. Wait a few minutes, then try again.";
    default:
      return UNAVAILABLE;
  }
}
