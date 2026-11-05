import "server-only";

import { supabase } from "@/lib/supabase";

/**
 * Sets or changes a person's username, with the secret key: the owner may
 * update only `display_name` themselves (docs/accounts.md 10), so how an
 * account signs in changes only through the server. The column is unique,
 * so a name taken between the check and the write still fails as taken.
 */

export type UsernameResult = "set" | "unchanged" | "taken";

/** Takes a username already in stored form (identity.ts). Throws when Supabase fails. */
export async function setUsername(userId: string, username: string): Promise<UsernameResult> {
  const db = supabase();
  const { data: holder, error: readError } = await db.from("profiles").select("id").eq("username", username).maybeSingle();
  if (readError) throw new Error(`username lookup failed (${readError.code})`);
  if (holder) return holder.id === userId ? "unchanged" : "taken";
  const { data, error } = await db
    .from("profiles")
    .update({ username, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select("id");
  if (error?.code === "23505") return "taken";
  if (error) throw new Error(`username update failed (${error.code})`);
  if (!data?.length) throw new Error("username update found no profile");
  return "set";
}
