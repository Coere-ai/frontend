/**
 * The rules for what a person types to sign in or sign up: an email, a
 * username, a password, a code. Pure, so the server actions and the tests
 * share them.
 */

/** 3 to 24 of a to z, 0 to 9 and underscore, stored lowercase. */
const USERNAME = /^[a-z0-9_]{3,24}$/;

/** Enough to catch a typo; Supabase checks the address for real when it mails it. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN = 10;

/** Supabase refuses a password over 72 bytes, so the form stops there too. */
export const PASSWORD_MAX = 72;

/** The address in its stored form, or null when it is not one. */
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  return email.length <= 254 && EMAIL.test(email) ? email : null;
}

/** The username in its stored form, or null when it breaks the rule. */
export function normalizeUsername(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.trim().toLowerCase();
  return USERNAME.test(name) ? name : null;
}

/** Why a username will not do, in the words the sign up form shows, or null when it is fine. */
export function usernameProblem(raw: string): string | null {
  const name = raw.trim();
  if (name.length < 3) return "Use at least 3 characters.";
  if (name.length > 24) return "Use 24 characters or fewer.";
  if (!USERNAME.test(name.toLowerCase())) return "Use only letters, numbers and underscores.";
  return null;
}

/** Why a new password will not do, or null when it is fine. */
export function passwordProblem(raw: string): string | null {
  if (raw.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`;
  if (new TextEncoder().encode(raw).length > PASSWORD_MAX) return `Use at most ${PASSWORD_MAX} characters.`;
  return null;
}

/** The sign in box takes either, and an @ is what tells them apart: usernames cannot hold one. */
export type Login = { email: string } | { username: string } | null;

export function parseLogin(raw: unknown): Login {
  if (typeof raw !== "string") return null;
  if (raw.includes("@")) {
    const email = normalizeEmail(raw);
    return email ? { email } : null;
  }
  const username = normalizeUsername(raw);
  return username ? { username } : null;
}

/** The emailed code: 6 digits, with any spaces a person typed or pasted taken out. */
export function normalizeCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.replace(/\s+/g, "");
  return /^\d{6}$/.test(code) ? code : null;
}
