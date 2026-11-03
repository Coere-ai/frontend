/**
 * What the sign in form shows, as the server action returns it. Shared by the
 * action and the client form, so it holds no server imports.
 */

export type SignInStep = "email" | "code" | "password";

export type SignInField = "email" | "code" | "login" | "password";

export interface SignInState {
  step: SignInStep;
  /** The address the code went to, kept for Verify and Resend, or what was typed when it was refused. */
  email: string;
  /** What was typed in the password way's first field, given back when the form resets. */
  login: string;
  /** Where to go after signing in, already checked by safeNext. */
  next: string;
  error: string | null;
  /** Which field the error belongs to; none means it is about the whole form. */
  field: SignInField | null;
  notice: string | null;
}

export function signInState(next: string, error: string | null = null): SignInState {
  return { step: "email", email: "", login: "", next, error, field: null, notice: null };
}
