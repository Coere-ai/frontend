import { passwordProblem } from "@/lib/auth/identity";

/**
 * Setting or changing a password on /account, through the person's own
 * session with `auth.updateUser`. With Supabase's Secure password change
 * on, a session older than a day must first prove the person is there: an
 * emailed code (`auth.reauthenticate`) goes in as the update's `nonce`.
 * Pure, so the tests pin every answer the form can show.
 */

export const UNAVAILABLE = "That did not work. Try again in a minute.";

/** Why the two new passwords will not do, or null when they will. */
export function newPasswordProblem(password: string, again: string): string | null {
  return passwordProblem(password) ?? (password === again ? null : "The two passwords are not the same.");
}

export interface PasswordRefusal {
  message: string;
  /** Whether the form should ask for an emailed code next. */
  needsCode: boolean;
}

const RECENT =
  "Changing your password needs a sign in from the last day. Ask for a code by email, then type it here with your new password.";

/** What the form says for each error code Supabase answers `updateUser` with. */
export function passwordRefusal(code: string | undefined): PasswordRefusal {
  switch (code) {
    case "reauthentication_needed":
    case "reauth_nonce_missing":
      return { message: RECENT, needsCode: true };
    case "reauthentication_not_valid":
      return { message: "That code did not work. Check the newest email, or ask for another code.", needsCode: true };
    case "otp_expired":
      return { message: "That code has expired. Ask for another one.", needsCode: true };
    case "same_password":
      return { message: "That is already your password.", needsCode: false };
    case "weak_password":
      return { message: "Choose a password that is harder to guess.", needsCode: false };
    case "over_request_rate_limit":
      return { message: "Too many tries. Wait a few minutes, then try again.", needsCode: false };
    default:
      return { message: UNAVAILABLE, needsCode: false };
  }
}

/** What the form says when the emailed code could not be sent. */
export function codeSendRefusal(code: string | undefined): string {
  return code === "over_email_send_rate_limit" || code === "over_request_rate_limit"
    ? "A code went out a moment ago. Wait a minute before you ask for another."
    : UNAVAILABLE;
}
