import "server-only";

import { createAttemptLimiter } from "@/lib/auth/attempts";
import { refreshMemberPart, refreshOrgParts } from "@/lib/memory/org-index";
import { logSecurityEvent } from "@/lib/security/events";
import { supabase } from "@/lib/supabase";

import { dropMember } from "./drop-member";
import { inviteByLogin } from "./invite";
import type { Membership } from "./membership";
import { done, refused, unavailable, type OrgOutcome } from "./outcome";
import { countAdmins, memberRole } from "./queries";
import { cleanAccess, cleanOrgName, cleanSections, mayChangeRole, mayManage, mayRemove, type Role } from "./roles";

/**
 * What an admin does for the organization (docs/accounts.md 14.1): invite
 * and revoke, change a role or a member's access, remove a member, and
 * change the settings. The caller has found the person and their own
 * membership; each action checks the admin role again and touches only
 * that organization. The rules are the ones the dashboard's actions had.
 */

export interface AdminContext {
  userId: string;
  membership: Membership;
  headers: Headers;
}

/** Finding accounts by username one guess at a time is slow work at this rate. */
const invites = createAttemptLimiter({ max: 30, windowMs: 60 * 60 * 1000 });

const graphNote = () => console.error("organization graph not updated");

export async function inviteMember(ctx: AdminContext, login: string, role: Role): Promise<OrgOutcome> {
  if (!mayManage(ctx.membership.role).ok) return refused("not_admin");
  if (invites.hit(ctx.userId)) return refused("too_many");
  const { orgId } = ctx.membership;
  const sent = await inviteByLogin({ orgId, invitedBy: ctx.userId, login, role });
  if (!sent.ok) {
    if (sent.reason === "unavailable") return unavailable();
    return sent.reason === "self" ? refused("self", "You are already in this organization.") : refused(sent.reason);
  }
  await logSecurityEvent("org_invite_sent", { userId: ctx.userId, orgId, headers: ctx.headers });
  return done(`Invited ${sent.name}. They accept it in Coere within 7 days.`);
}

export async function revokeInvite(ctx: AdminContext, inviteId: string): Promise<OrgOutcome> {
  if (!mayManage(ctx.membership.role).ok) return refused("not_admin");
  const { error } = await supabase()
    .from("org_invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", inviteId)
    .eq("org_id", ctx.membership.orgId)
    .is("accepted_at", null)
    .is("declined_at", null)
    .is("revoked_at", null);
  return error ? unavailable() : done();
}

export async function changeRole(ctx: AdminContext, userId: string, role: Role): Promise<OrgOutcome> {
  const { orgId } = ctx.membership;
  const target = await memberRole(orgId, userId);
  if (!target) return refused("not_member", "They are not in this organization.");
  const verdict = mayChangeRole({ actor: ctx.membership.role, target, to: role, admins: await countAdmins(orgId) });
  if (!verdict.ok) {
    if (verdict.reason === "same") return done();
    return refused(verdict.reason === "last_admin" ? "last_admin" : "not_admin");
  }
  if (role === "member") {
    // Counted again under a lock, so two admins demoting each other cannot both pass.
    const dropped = await dropMember(orgId, userId, "demote");
    return dropped === "ok" ? done() : dropped === "last_admin" ? refused("last_admin") : unavailable();
  }
  const { error } = await supabase().from("org_members").update({ role }).eq("org_id", orgId).eq("user_id", userId);
  return error ? unavailable() : done();
}

/** A member's own access, or null to go back to the organization's default. Their part of the graph follows. */
export async function setMemberAccess(ctx: AdminContext, userId: string, access: unknown): Promise<OrgOutcome> {
  if (!mayManage(ctx.membership.role).ok) return refused("not_admin");
  const { orgId, sharedSections } = ctx.membership;
  if (!(await memberRole(orgId, userId))) return refused("not_member", "They are not in this organization.");
  const clean = access === null ? null : cleanAccess(access, sharedSections);
  if (access !== null && !clean) return { ok: false, reason: "bad_request", message: "That access is not one Coere knows." };
  const { error } = await supabase().from("org_members").update({ access: clean }).eq("org_id", orgId).eq("user_id", userId);
  if (error) return unavailable();
  await refreshMemberPart(orgId, userId).catch(graphNote);
  return done();
}

export async function removeMember(ctx: AdminContext, userId: string): Promise<OrgOutcome> {
  const { orgId } = ctx.membership;
  const target = await memberRole(orgId, userId);
  if (!target) return refused("not_member", "They are not in this organization.");
  const verdict = mayRemove({ actor: ctx.membership.role, actorId: ctx.userId, targetId: userId, target, admins: await countAdmins(orgId) });
  if (!verdict.ok) return verdict.reason === "self" ? refused("self") : verdict.reason === "last_admin" ? refused("last_admin", "An organization needs an admin.") : refused("not_admin");
  const dropped = await dropMember(orgId, userId, "remove");
  if (dropped === "last_admin") return refused("last_admin", "An organization needs an admin.");
  if (dropped !== "ok") return unavailable();
  await refreshMemberPart(orgId, userId).catch(graphNote);
  await logSecurityEvent("org_member_removed", { userId, orgId, headers: ctx.headers });
  return done();
}

/** The organization's name, shared sections and default access. A change to what is shared re-cuts every member's part. */
export async function saveOrgSettings(ctx: AdminContext, input: { name: unknown; sections: unknown; defaultAccess: unknown }): Promise<OrgOutcome> {
  if (!mayManage(ctx.membership.role).ok) return refused("not_admin");
  const name = cleanOrgName(input.name);
  if (!name) return refused("bad_name");
  const sections = cleanSections(input.sections);
  if (!sections || sections.length === 0) return refused("no_sections");
  const access = cleanAccess(input.defaultAccess, sections);
  if (!access) return { ok: false, reason: "bad_request", message: "That access is not one Coere knows." };
  const { orgId, sharedSections } = ctx.membership;
  const { error } = await supabase()
    .from("organizations")
    .update({ name, shared_sections: sections, default_access: access, updated_at: new Date().toISOString() })
    .eq("id", orgId);
  if (error) return unavailable();
  const sameSections = sections.length === sharedSections.length && sections.every((k, i) => k === sharedSections[i]);
  await refreshOrgParts(orgId).catch(graphNote);
  return done(sameSections ? "Saved." : "Saved. The shared graph now holds these sections.");
}
