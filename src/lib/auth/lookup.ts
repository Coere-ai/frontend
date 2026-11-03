import "server-only";

import { supabase } from "@/lib/supabase";

/**
 * The two things sign in needs the secret key for: turning a username into
 * its account's email, and checking a username is free. Both read only
 * `profiles`, and neither answer leaves the server.
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
