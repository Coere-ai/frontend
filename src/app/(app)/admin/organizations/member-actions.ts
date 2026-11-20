"use server";

import { headers } from "next/headers";

import { adminAction, check, done, refused, type AdminResult } from "@/lib/admin/action";
import { findAccount } from "@/lib/admin/find-account";
import { isUuid } from "@/lib/admin/http";
import { refreshMemberPart, rebuildOrgIndex, removeMemberPart } from "@/lib/memory/org-index";
import { cleanAccess, parseRole } from "@/lib/org/roles";
import { logSecurityEvent } from "@/lib/security/events";
import { supabase } from "@/lib/supabase";

/**
 * The operator's changes to an organization's people: add an existing
 * account, change a role or a member's access, remove a member, revoke an
 * invite. Unlike an organization's own admins, the operator may demote or
 * remove the last admin (docs/accounts.md 14.1). Each re-checks the admin
 * session and names the organization in every write.
 */

const GONE = "That member or organization is gone. Reload the page.";

async function sharedSections(orgId: string): Promise<string[] | null> {
  const { data } = await supabase().from("organizations").select("shared_sections").eq("id", orgId).maybeSingle<{ shared_sections: string[] | null }>();
  return data ? (data.shared_sections ?? []) : null;
}

export async function addMember(orgId: string, form: FormData): Promise<AdminResult> {
  return adminAction("addMember", async () => {
    if (!isUuid(orgId) || !(await sharedSections(orgId))) return refused(GONE);
    const role = parseRole(form.get("role")) ?? "member";
    const person = await findAccount(form.get("login"));
    if (!person.ok) return refused(person.error);
    const db = supabase();
    const { error } = await db.from("org_members").insert({ org_id: orgId, user_id: person.id, role, added_by: "operator" });
    if (error?.code === "23505") return refused("That account is already in an organization. A person can be in one at a time.");
    check(error, "org_members insert");
    const totals = await db.rpc("set_org_memory_totals", { p_org: orgId });
    if (totals.error) console.error("set_org_memory_totals failed", totals.error.code);
    // Writes their part when they have a memory index and may contribute, then merges.
    await refreshMemberPart(orgId, person.id).catch(() => console.error("organization graph not updated"));
    await logSecurityEvent("org_joined", { userId: person.id, orgId, headers: await headers() });
    return done(`Added ${person.name} as ${role === "admin" ? "an admin" : "a member"}.`);
  });
}

export async function setMemberRole(orgId: string, userId: string, to: string): Promise<AdminResult> {
  return adminAction("setMemberRole", async () => {
    const role = parseRole(to);
    if (!isUuid(orgId) || !isUuid(userId) || !role) return refused(GONE);
    const { data, error } = await supabase().from("org_members").update({ role }).eq("org_id", orgId).eq("user_id", userId).select("user_id");
    check(error, "org_members update");
    return data?.length ? done(role === "admin" ? "Made an admin." : "Made a member.") : refused(GONE);
  });
}

/** A member's own access, or null for the organization's default. Their part of the graph follows. */
export async function setMemberAccess(orgId: string, userId: string, access: unknown): Promise<AdminResult> {
  return adminAction("setMemberAccess", async () => {
    const shared = isUuid(orgId) && isUuid(userId) ? await sharedSections(orgId) : null;
    if (!shared) return refused(GONE);
    const clean = access === null ? null : cleanAccess(access, shared);
    if (access !== null && !clean) return refused("That access is not one a member can hold.");
    const { data, error } = await supabase().from("org_members").update({ access: clean }).eq("org_id", orgId).eq("user_id", userId).select("user_id");
    check(error, "org_members update");
    if (!data?.length) return refused(GONE);
    await refreshMemberPart(orgId, userId).catch(() => console.error("organization graph not updated"));
    return done(clean ? "Access saved." : "Back to the organization's default access.");
  });
}

export async function removeMember(orgId: string, userId: string): Promise<AdminResult> {
  return adminAction("removeMember", async () => {
    if (!isUuid(orgId) || !isUuid(userId)) return refused(GONE);
    const db = supabase();
    const { data, error } = await db.from("org_members").delete().eq("org_id", orgId).eq("user_id", userId).select("user_id");
    check(error, "org_members delete");
    if (!data?.length) return refused(GONE);
    await removeMemberPart(orgId, userId).catch(() => console.error("member part not removed"));
    await rebuildOrgIndex(orgId).catch(() => console.error("organization graph not rebuilt"));
    const totals = await db.rpc("set_org_memory_totals", { p_org: orgId });
    if (totals.error) console.error("set_org_memory_totals failed", totals.error.code);
    await logSecurityEvent("org_member_removed", { userId, orgId, headers: await headers() });
    return done("Removed from the organization.");
  });
}

export async function revokeInvite(orgId: string, inviteId: string): Promise<AdminResult> {
  return adminAction("revokeInvite", async () => {
    if (!isUuid(orgId) || !isUuid(inviteId)) return refused(GONE);
    const { error } = await supabase()
      .from("org_invites")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", inviteId)
      .eq("org_id", orgId)
      .is("accepted_at", null)
      .is("declined_at", null)
      .is("revoked_at", null);
    check(error, "org_invites update");
    return done("Invite revoked.");
  });
}
