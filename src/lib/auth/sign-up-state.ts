/** What the sign up form shows, as its server action returns it. No server imports, so the client form shares it. */

export type SignUpField = "username" | "password" | "confirm";

export interface SignUpState {
  next: string;
  /** What was typed in the username box, given back since React resets the form after each submit. */
  username: string;
  errors: Partial<Record<SignUpField, string>>;
  error: string | null;
}

export function signUpState(next: string): SignUpState {
  return { next, username: "", errors: {}, error: null };
}
