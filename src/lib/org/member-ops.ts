import "server-only";

import { refreshMemberPart } from "@/lib/memory/org-index";
import { logSecurityEvent } from "@/lib/security/events";
import { supabase } from "@/lib/supabase";

import { dropMember } from "./drop-member";
import type { Membership } from "./membership";
import { done, refused, unavailable, type OrgOutcome } from "./outcome";
import { countAdmins } from "./queries";
import { mayLeave } from "./roles";

/**
 * What any person does about their own place in an organization
 * (docs/accounts.md 14.1): accept or decline an invite, share their memory
 * or not, and leave. Each acts on the person's own rows only, by the rules
 * the dashboard's actions had.
 */

const graphNote = () => console.error("organization graph not updated");

/** accept_org_invite raises these by name. */
const ACCEPT_REFUSED = new Set(["invite_not_found", "invite_expired", "already_in_org"] as const);

type AcceptRefusal = "invite_not_found" | "invite_expired" | "already_in_org";

export async function acceptInvite(userId: string, inviteId: string, headers: Headers): Promise<OrgOutcome> {
  const { data: orgId, error } = await supabase().rpc("accept_org_invite", { p_user: userId, p_invite: inviteId });
  if (error || typeof orgId !== "string") {
    const reason = error?.message ?? "";
    return ACCEPT_REFUSED.has(reason as AcceptRefusal) ? refused(reason as AcceptRefusal) : unavailable();
  }
  await logSecurityEvent("org_joined", { userId, orgId, headers });
  // Their shared sections go into the graph now, if they have a memory copy.
  await refreshMemberPart(orgId, userId).catch(graphNote);
  return done();
}

export async function declineInvite(userId: string, inviteId: string): Promise<OrgOutcome> {
  const { error } = await supabase()
    .from("org_invites")
    .update({ declined_at: new Date().toISOString() })
    .eq("id", inviteId)
    .eq("user_id", userId)
    .is("accepted_at", null)
    .is("declined_at", null)
    .is("revoked_at", null);
  return error ? unavailable() : done();
}

/** "Share my memory": off takes the person's part out of the graph, on puts it back from their index. */
export async function setShareMemory(userId: string, membership: Membership, on: boolean): Promise<OrgOutcome> {
  const { orgId } = membership;
  const { error } = await supabase().from("org_members").update({ share_memory: on }).eq("org_id", orgId).eq("user_id", userId);
  if (error) return unavailable();
  await refreshMemberPart(orgId, userId).catch(graphNote);
  return done(on ? "Your shared sections are in the organization's graph." : "Your memory is out of the organization's graph.");
}

export async function leaveOrganization(userId: string, membership: Membership, headers: Headers): Promise<OrgOutcome> {
  const { orgId, role } = membership;
  const onlyAdmin = "You are the only admin. Make another member an admin before you leave.";
  if (!mayLeave({ role, admins: role === "admin" ? await countAdmins(orgId) : 2 }).ok) return refused("last_admin", onlyAdmin);
  // Counted again under a lock, so two admins leaving at once cannot both pass.
  const dropped = await dropMember(orgId, userId, "remove");
  if (dropped === "last_admin") return refused("last_admin", onlyAdmin);
  if (dropped !== "ok") return unavailable();
  await refreshMemberPart(orgId, userId).catch(graphNote);
  await logSecurityEvent("org_left", { userId, orgId, headers });
  return done();
}
