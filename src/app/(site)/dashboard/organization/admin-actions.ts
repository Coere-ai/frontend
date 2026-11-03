"use server";

import { headers } from "next/headers";

import { createAttemptLimiter } from "@/lib/auth/attempts";
import { refreshMemberPart, refreshOrgParts } from "@/lib/memory/org-index";
import { adminContext, failed, isUuid, UNAVAILABLE, type OrgResult } from "@/lib/org/action-context";
import { inviteByLogin } from "@/lib/org/invite";
import { countAdmins, memberRole } from "@/lib/org/queries";
import { cleanAccess, cleanOrgName, cleanSections, mayChangeRole, mayRemove, parseRole } from "@/lib/org/roles";
import { logSecurityEvent } from "@/lib/security/events";
import { supabase } from "@/lib/supabase";

/**
 * What an admin does for the organization: invite and revoke, change a
 * role or a member's access, remove a member, and change the settings.
 * Each checks the session and the admin role again, and touches only the
 * admin's own organization.
 */

/** Finding accounts by email or username one guess at a time is slow work at this rate. */
const invites = createAttemptLimiter({ max: 30, windowMs: 60 * 60 * 1000 });

export interface InviteState {
  error: string | null;
  notice: string | null;
  /** Set when the coworker has no account yet: the page shows the sign up link to send them. */
  signUp: boolean;
}

const INVITE_REFUSED = {
  bad_login: "Type the email or username of your coworker's Coere account.",
  no_account: "No Coere account uses that. Your coworker needs to make one first; send them the sign up link below.",
  self: "You are already in this organization.",
  in_org: "They are already in an organization.",
  pending: "They already have an invite waiting.",
  unavailable: UNAVAILABLE,
} as const;

export async function inviteMember(_prev: InviteState, form: FormData): Promise<InviteState> {
  const ctx = await adminContext();
  if (!ctx.ok) return { error: ctx.result.ok ? null : ctx.result.error, notice: null, signUp: false };
  if (invites.hit(ctx.user.id)) return { error: "That is a lot of invites at once. Try again in an hour.", notice: null, signUp: false };
  const role = parseRole(form.get("role")) ?? "member";
  const done = await inviteByLogin({ orgId: ctx.membership.orgId, invitedBy: ctx.user.id, login: form.get("login"), role });
  if (!done.ok) return { error: INVITE_REFUSED[done.reason], notice: null, signUp: done.reason === "no_account" };
  await logSecurityEvent("org_invite_sent", { userId: ctx.user.id, orgId: ctx.membership.orgId, headers: await headers() });
  return { error: null, notice: `Invited ${done.name}. They accept it on their dashboard within 7 days.`, signUp: false };
}

export async function revokeInvite(inviteId: string): Promise<OrgResult> {
  const ctx = await adminContext();
  if (!ctx.ok) return ctx.result;
  if (!isUuid(inviteId)) return failed(UNAVAILABLE);
  const { error } = await supabase()
    .from("org_invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", inviteId)
    .eq("org_id", ctx.membership.orgId)
    .is("accepted_at", null)
    .is("declined_at", null)
    .is("revoked_at", null);
  return error ? failed(UNAVAILABLE) : { ok: true };
}

export async function changeRole(userId: string, to: string): Promise<OrgResult> {
  const ctx = await adminContext();
  if (!ctx.ok) return ctx.result;
  const role = parseRole(to);
  const { orgId } = ctx.membership;
  const target = isUuid(userId) ? await memberRole(orgId, userId) : null;
  if (!role || !target) return failed(UNAVAILABLE);
  const verdict = mayChangeRole({ actor: ctx.membership.role, target, to: role, admins: await countAdmins(orgId) });
  if (!verdict.ok) return verdict.reason === "last_admin" ? failed("An organization needs an admin. Make someone else an admin first.") : { ok: true };
  const { error } = await supabase().from("org_members").update({ role }).eq("org_id", orgId).eq("user_id", userId);
  return error ? failed(UNAVAILABLE) : { ok: true };
}

/** A member's own access, or null to go back to the organization's default. Their part of the graph follows. */
export async function setMemberAccess(userId: string, access: unknown): Promise<OrgResult> {
  const ctx = await adminContext();
  if (!ctx.ok) return ctx.result;
  const { orgId, sharedSections } = ctx.membership;
  if (!isUuid(userId) || !(await memberRole(orgId, userId))) return failed(UNAVAILABLE);
  const clean = access === null ? null : cleanAccess(access, sharedSections);
  if (access !== null && !clean) return failed(UNAVAILABLE);
  const { error } = await supabase().from("org_members").update({ access: clean }).eq("org_id", orgId).eq("user_id", userId);
  if (error) return failed(UNAVAILABLE);
  await refreshMemberPart(orgId, userId).catch(() => console.error("organization graph not updated"));
  return { ok: true };
}

export async function removeMember(userId: string): Promise<OrgResult> {
  const ctx = await adminContext();
  if (!ctx.ok) return ctx.result;
  const { orgId } = ctx.membership;
  const target = isUuid(userId) ? await memberRole(orgId, userId) : null;
  if (!target) return failed(UNAVAILABLE);
  const verdict = mayRemove({ actor: ctx.membership.role, actorId: ctx.user.id, targetId: userId, target, admins: await countAdmins(orgId) });
  if (!verdict.ok) return failed(verdict.reason === "self" ? "To remove yourself, leave the organization." : "An organization needs an admin.");
  const { error } = await supabase().from("org_members").delete().eq("org_id", orgId).eq("user_id", userId);
  if (error) return failed(UNAVAILABLE);
  await refreshMemberPart(orgId, userId).catch(() => console.error("organization graph not updated"));
  await logSecurityEvent("org_member_removed", { userId, orgId, headers: await headers() });
  return { ok: true };
}

/** The organization's name, shared sections and default access. A change to what is shared re-cuts every member's part. */
export async function saveOrgSettings(input: { name: unknown; sections: unknown; defaultAccess: unknown }): Promise<OrgResult> {
  const ctx = await adminContext();
  if (!ctx.ok) return ctx.result;
  const name = cleanOrgName(input.name);
  if (!name) return failed("Give the organization a name of up to 80 characters.");
  const sections = cleanSections(input.sections);
  if (!sections || sections.length === 0) return failed("Share at least one section.");
  const access = cleanAccess(input.defaultAccess, sections);
  if (!access) return failed(UNAVAILABLE);
  const { orgId, sharedSections } = ctx.membership;
  const { error } = await supabase()
    .from("organizations")
    .update({ name, shared_sections: sections, default_access: access, updated_at: new Date().toISOString() })
    .eq("id", orgId);
  if (error) return failed(UNAVAILABLE);
  const sameSections = sections.length === sharedSections.length && sections.every((k, i) => k === sharedSections[i]);
  await refreshOrgParts(orgId).catch(() => console.error("organization graph not updated"));
  return { ok: true, notice: sameSections ? "Saved." : "Saved. The shared graph now holds these sections." };
}
