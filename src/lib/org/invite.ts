import "server-only";

import { normalizeUsername } from "@/lib/auth/identity";
import { supabase } from "@/lib/supabase";

import type { Role } from "./roles";

/**
 * Inviting a coworker (docs/accounts.md 14.1). Invites go only to existing
 * accounts, found by username; nothing is stored for a name with no
 * account, and nothing is ever emailed. Someone already in an organization,
 * or with an invite here still open, is not invited again.
 */

export type InviteOutcome =
  | { ok: true; name: string }
  | { ok: false; reason: "bad_login" | "no_account" | "self" | "in_org" | "pending" | "unavailable" };

export async function inviteByLogin(o: { orgId: string; invitedBy: string; login: unknown; role: Role }): Promise<InviteOutcome> {
  const username = normalizeUsername(o.login);
  if (!username) return { ok: false, reason: "bad_login" };
  const db = supabase();
  const { data: person, error } = await db.from("profiles").select("id, username").eq("username", username).maybeSingle();
  if (error) return { ok: false, reason: "unavailable" };
  if (!person) return { ok: false, reason: "no_account" };
  if (person.id === o.invitedBy) return { ok: false, reason: "self" };

  const { data: member } = await db.from("org_members").select("org_id").eq("user_id", person.id).maybeSingle();
  if (member) return { ok: false, reason: "in_org" };
  const { data: open } = await db
    .from("org_invites")
    .select("id")
    .eq("org_id", o.orgId)
    .eq("user_id", person.id)
    .is("accepted_at", null)
    .is("declined_at", null)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .limit(1);
  if (open && open.length > 0) return { ok: false, reason: "pending" };

  const { error: insertError } = await db.from("org_invites").insert({ org_id: o.orgId, user_id: person.id, role: o.role, invited_by: o.invitedBy });
  if (insertError) return { ok: false, reason: "unavailable" };
  return { ok: true, name: person.username ?? "your coworker" };
}
