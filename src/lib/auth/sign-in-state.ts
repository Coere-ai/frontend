/**
 * What the sign in form shows, as the server action returns it. Shared by the
 * action and the client form, so it holds no server imports.
 */

export type SignInField = "username" | "password";

export interface SignInState {
  /** What was typed in the username box, given back when the form resets. */
  username: string;
  /** Where to go after signing in, already checked by safeNext. */
  next: string;
  error: string | null;
  /** Which field the error belongs to; none means it is about the whole form. */
  field: SignInField | null;
}

export function signInState(next: string): SignInState {
  return { username: "", next, error: null, field: null };
}
