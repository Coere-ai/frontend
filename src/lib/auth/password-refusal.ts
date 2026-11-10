/**
 * What Supabase means when `auth.signInWithPassword` refuses. Only a wrong
 * username or password, and an account Supabase holds unconfirmed, are the
 * person's doing; anything else (Supabase's shared sign in limit, an outage)
 * is the operator's to see, so the caller logs its code. The person sees the
 * same words either way: a different line only for real usernames would say
 * which usernames exist. Pure, so the tests pin it.
 */

const EXPECTED = new Set(["invalid_credentials", "email_not_confirmed"]);

/** Whether the refusal is a wrong username or password, which is not logged. */
export function isWrongLogin(code: string | undefined): boolean {
  return code !== undefined && EXPECTED.has(code);
}
