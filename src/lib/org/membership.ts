import "server-only";

import { supabase } from "@/lib/supabase";

import { effectiveAccess, readableSections, type OrgAccess } from "./access";

/**
 * The caller's organization as the server sees it, read with the secret key
 * and scoped to their own user id: which organization, their role, the
 * shared sections and the access that applies to them.
 */

export interface Membership {
  orgId: string;
  name: string;
  role: "admin" | "member";
  sharedSections: string[];
  access: OrgAccess;
  shareMemory: boolean;
  /** The shared sections this person may read. */
  readable: string[];
}

interface Row {
  role: string;
  access: unknown;
  share_memory: boolean;
  organizations: { id: string; name: string; shared_sections: string[] | null; default_access: unknown } | null;
}

export async function readMembership(userId: string): Promise<Membership | null> {
  const { data, error } = await supabase()
    .from("org_members")
    .select("role, access, share_memory, organizations(id, name, shared_sections, default_access)")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`org_members read failed: ${error.code}`);
  const row = data as unknown as Row | null;
  const org = Array.isArray(row?.organizations) ? row?.organizations[0] : row?.organizations;
  if (!row || !org) return null;
  const role = row.role === "admin" ? "admin" : "member";
  const shared = org.shared_sections ?? [];
  const access = effectiveAccess(row.access, org.default_access);
  return {
    orgId: org.id,
    name: org.name,
    role,
    sharedSections: shared,
    access,
    shareMemory: row.share_memory,
    readable: readableSections(role, access, shared),
  };
}
