import "server-only";

import { supabase } from "@/lib/supabase";

import { nameOf } from "./page-data";
import { parseRole, type Role } from "./roles";

/**
 * The signed in person's own pending invites, with the organization's name
 * and who invited them. Read with the secret key, scoped to the person's
 * own user id, since they cannot read an organization they are not in yet.
 */

export interface MyInvite {
  id: string;
  orgName: string;
  role: Role;
  invitedBy: string | null;
  expiresAt: string;
}

export async function readMyInvites(userId: string): Promise<MyInvite[]> {
  const db = supabase();
  const { data } = await db
    .from("org_invites")
    .select("id, org_id, role, invited_by, expires_at")
    .eq("user_id", userId)
    .is("accepted_at", null)
    .is("declined_at", null)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  const rows = data ?? [];
  if (rows.length === 0) return [];
  const [{ data: orgs }, { data: people }] = await Promise.all([
    db.from("organizations").select("id, name").in("id", [...new Set(rows.map((r) => r.org_id as string))]),
    db.from("profiles").select("id, username, display_name").in("id", rows.map((r) => r.invited_by as string).filter(Boolean)),
  ]);
  const org = new Map((orgs ?? []).map((o) => [o.id as string, o.name as string]));
  const who = new Map((people ?? []).map((p) => [p.id as string, p]));
  return rows
    .filter((r) => org.has(r.org_id))
    .map((r) => ({
      id: r.id,
      orgName: org.get(r.org_id)!,
      role: parseRole(r.role) ?? "member",
      invitedBy: r.invited_by ? nameOf(who.get(r.invited_by)) : null,
      expiresAt: r.expires_at,
    }));
}
