import "server-only";

import { parseLogin } from "@/lib/auth/identity";
import { supabase } from "@/lib/supabase";

import { personName } from "./memory-view";

/**
 * An existing account found by the email or username the operator typed,
 * the way the organization forms pick a person. Organizations hold only
 * existing accounts, so with no match nothing is made.
 */
export type FoundAccount = { ok: true; id: string; name: string } | { ok: false; error: string };

export async function findAccount(raw: unknown): Promise<FoundAccount> {
  const login = parseLogin(raw);
  if (!login) return { ok: false, error: "Type the email or username of an existing account." };
  const query = supabase().from("profiles").select("id, display_name, username, email");
  const { data, error } = await ("email" in login ? query.eq("email", login.email) : query.eq("username", login.username)).maybeSingle();
  if (error) throw new Error(`profiles read failed: ${error.code}`);
  if (!data) return { ok: false, error: "No account uses that email or username." };
  return { ok: true, id: data.id as string, name: personName(data) };
}
