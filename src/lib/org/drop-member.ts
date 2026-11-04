import "server-only";

import { supabase } from "@/lib/supabase";

/**
 * Demotes or removes a member through org_drop_member, which locks the
 * organization while it counts its admins. Counting here and writing in a
 * second request let two admins demote each other, or both leave, at the
 * same moment and leave the organization with none (docs/accounts.md 14.1).
 * The checks in roles.ts still run first, for their messages.
 */
export type DropResult = "ok" | "last_admin" | "not_member" | "unavailable";

export async function dropMember(orgId: string, userId: string, action: "demote" | "remove"): Promise<DropResult> {
  const { data, error } = await supabase().rpc("org_drop_member", { p_org: orgId, p_user: userId, p_action: action });
  if (error) {
    console.error("org_drop_member failed", error.code);
    return "unavailable";
  }
  return data === "ok" || data === "last_admin" || data === "not_member" ? data : "unavailable";
}
