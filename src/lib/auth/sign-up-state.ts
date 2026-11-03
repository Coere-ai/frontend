/** What the sign up form shows, as its server action returns it. No server imports, so the client form shares it. */

export type SignUpField = "email" | "username" | "password";

export interface SignUpState {
  next: string;
  /** The email the confirmation went to, once it has gone. */
  sent: string | null;
  values: { email: string; username: string };
  errors: Partial<Record<SignUpField, string>>;
  error: string | null;
}

export function signUpState(next: string): SignUpState {
  return { next, sent: null, values: { email: "", username: "" }, errors: {}, error: null };
}
