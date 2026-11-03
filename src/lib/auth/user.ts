import "server-only";

import { redirect } from "next/navigation";

import { accountsConfigured, sessionClient } from "@/lib/supabase/server";

import { safeNext } from "./next-path";

export { safeNext } from "./next-path";

/**
 * The signed in account, checked on the server.
 *
 * Every page, action and route that acts for a person calls one of these
 * itself, even behind the proxy: the proxy refreshes the session but is never
 * the only gate. `getUser` asks Supabase Auth to vouch for the token rather
 * than trusting the cookie's contents.
 */

export interface AccountUser {
  id: string;
  email: string;
}

export async function getUser(): Promise<AccountUser | null> {
  if (!accountsConfigured()) return null;
  const client = await sessionClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user || !data.user.email) return null;
  return { id: data.user.id, email: data.user.email };
}

/**
 * The account, or a redirect to sign in that comes back to `next`. `next`
 * must be a path on this site; anything else falls back to the dashboard.
 */
export async function requireUser(next = "/dashboard"): Promise<AccountUser> {
  const user = await getUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(safeNext(next))}`);
  return user;
}
