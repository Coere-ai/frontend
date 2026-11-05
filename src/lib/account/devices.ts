import "server-only";

import { supabase } from "@/lib/supabase";
import type { DeviceRow } from "@/lib/v1/devices-body";

/**
 * The person's connected browsers, read and revoked with the secret key
 * and always scoped to their own user id, so a device id from someone
 * else's account reads as not there.
 */

/** The 50 newest, as the dashboard listed them. The token hash is never asked for. */
export async function listDevices(userId: string): Promise<DeviceRow[]> {
  const { data, error } = await supabase()
    .from("devices")
    .select("id, name, token_hint, extension_version, created_at, last_used_at, revoked_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(`devices read failed: ${error.code}`);
  return (data ?? []) as DeviceRow[];
}

/**
 * Revokes one of the person's own browsers. `revoked` when this call
 * revoked it, `already` when it was revoked before, `not_found` when no
 * browser of theirs has that id.
 */
export async function revokeDevice(userId: string, deviceId: string): Promise<"revoked" | "already" | "not_found"> {
  const db = supabase();
  const { data, error } = await db
    .from("devices")
    .update({ revoked_at: new Date().toISOString(), revoked_reason: "user" })
    .eq("id", deviceId)
    .eq("user_id", userId)
    .is("revoked_at", null)
    .select("id");
  if (error) throw new Error(`device revoke failed: ${error.code}`);
  if (data && data.length > 0) return "revoked";
  const { data: row, error: readError } = await db.from("devices").select("id").eq("id", deviceId).eq("user_id", userId).maybeSingle();
  if (readError) throw new Error(`devices read failed: ${readError.code}`);
  return row ? "already" : "not_found";
}
