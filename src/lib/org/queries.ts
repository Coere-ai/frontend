import "server-only";

import { supabase } from "@/lib/supabase";

import { parseRole, type Role } from "./roles";

/**
 * Small reads of an organization's rows with the secret key. Every caller
 * has already found the organization from the signed in person's own
 * membership, so these never reach across organizations.
 */

/** How many admins the organization has now. */
export async function countAdmins(orgId: string): Promise<number> {
  const { count, error } = await supabase().from("org_members").select("user_id", { count: "exact", head: true }).eq("org_id", orgId).eq("role", "admin");
  if (error) throw new Error(`org_members count failed: ${error.code}`);
  return count ?? 0;
}

/** One member's role in this organization, or null when they are not in it. */
export async function memberRole(orgId: string, userId: string): Promise<Role | null> {
  const { data } = await supabase().from("org_members").select("role").eq("org_id", orgId).eq("user_id", userId).maybeSingle<{ role: string }>();
  return data ? parseRole(data.role) : null;
}
