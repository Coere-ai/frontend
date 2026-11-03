"use server";

import { getUser } from "@/lib/auth/user";
import { downloadLink } from "@/lib/memory/user-memory";
import { supabaseConfigured } from "@/lib/supabase";

/**
 * A link to download the person's own `.coere` file, which lives 60
 * seconds. The session is checked here again, and the link is made for the
 * signed in account's own folder only.
 */
export async function memoryDownload(): Promise<{ ok: true; url: string } | { ok: false; reason: "signed_out" | "none" | "unavailable" }> {
  const user = await getUser();
  if (!user) return { ok: false, reason: "signed_out" };
  if (!supabaseConfigured()) return { ok: false, reason: "unavailable" };
  const url = await downloadLink(user.id);
  return url ? { ok: true, url } : { ok: false, reason: "none" };
}
