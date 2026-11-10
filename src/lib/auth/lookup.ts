import "server-only";

import { supabase } from "@/lib/supabase";

/**
 * What sign in and sign up need the secret key for: turning a username into
 * its account's placeholder email, checking a username is free, and reading
 * the username a page shows. Each reads only `profiles`, and no email ever
 * leaves the server.
 */

/** The email of the account with this username, or null. Takes a username already in stored form. */
export async function emailForUsername(username: string): Promise<string | null> {
  const { data, error } = await supabase().from("profiles").select("email").eq("username", username).maybeSingle();
  if (error) throw new Error(`profile lookup failed (${error.code})`);
  return typeof data?.email === "string" ? data.email : null;
}

export async function usernameTaken(username: string): Promise<boolean> {
  const { count, error } = await supabase()
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("username", username);
  if (error) throw new Error(`profile lookup failed (${error.code})`);
  return (count ?? 0) > 0;
}

/** The account's username, the name the site shows it by, or null when it has none. */
export async function usernameOf(userId: string): Promise<string | null> {
  const { data, error } = await supabase().from("profiles").select("username").eq("id", userId).maybeSingle();
  if (error) throw new Error(`profile lookup failed (${error.code})`);
  return typeof data?.username === "string" ? data.username : null;
}
