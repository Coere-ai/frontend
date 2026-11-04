"use server";

import { headers } from "next/headers";

import { getUser } from "@/lib/auth/user";
import { refreshMemberPart } from "@/lib/memory/org-index";
import { failed, isUuid, memberContext, SIGNED_OUT, UNAVAILABLE, type OrgResult } from "@/lib/org/action-context";
import { dropMember } from "@/lib/org/drop-member";
import { countAdmins } from "@/lib/org/queries";
import { mayLeave } from "@/lib/org/roles";
import { logSecurityEvent } from "@/lib/security/events";
import { supabase, supabaseConfigured } from "@/lib/supabase";

/**
 * What any person does about their own place in an organization: accept
 * or decline an invite, share their memory or not, and leave. Each checks
 * the session again and acts on the person's own rows only.
 */

const REFUSED: Record<string, string> = {
  invite_not_found: "That invite is no longer open.",
  invite_expired: "That invite has expired. Ask an admin to invite you again.",
  already_in_org: "You are already in an organization. Leave it first.",
};

export async function acceptInvite(inviteId: string): Promise<OrgResult> {
  const user = await getUser();
  if (!user) return failed(SIGNED_OUT);
  if (!supabaseConfigured() || !isUuid(inviteId)) return failed(UNAVAILABLE);
  const { data: orgId, error } = await supabase().rpc("accept_org_invite", { p_user: user.id, p_invite: inviteId });
  if (error || typeof orgId !== "string") return failed(REFUSED[error?.message ?? ""] ?? UNAVAILABLE);
  await logSecurityEvent("org_joined", { userId: user.id, orgId, headers: await headers() });
  // Their shared sections go into the graph now, if they have a memory copy.
  await refreshMemberPart(orgId, user.id).catch(() => console.error("organization graph not updated"));
  return { ok: true };
}

export async function declineInvite(inviteId: string): Promise<OrgResult> {
  const user = await getUser();
  if (!user) return failed(SIGNED_OUT);
  if (!supabaseConfigured() || !isUuid(inviteId)) return failed(UNAVAILABLE);
  const { error } = await supabase()
    .from("org_invites")
    .update({ declined_at: new Date().toISOString() })
    .eq("id", inviteId)
    .eq("user_id", user.id)
    .is("accepted_at", null)
    .is("declined_at", null)
    .is("revoked_at", null);
  return error ? failed(UNAVAILABLE) : { ok: true };
}

/** "Share my memory": off takes the person's part out of the graph, on puts it back from their index. */
export async function setShareMemory(on: boolean): Promise<OrgResult> {
  const ctx = await memberContext();
  if (!ctx.ok) return ctx.result;
  if (typeof on !== "boolean") return failed(UNAVAILABLE);
  const { orgId } = ctx.membership;
  const { error } = await supabase().from("org_members").update({ share_memory: on }).eq("org_id", orgId).eq("user_id", ctx.user.id);
  if (error) return failed(UNAVAILABLE);
  await refreshMemberPart(orgId, ctx.user.id).catch(() => console.error("organization graph not updated"));
  return { ok: true, notice: on ? "Your shared sections are in the organization's graph." : "Your memory is out of the organization's graph." };
}

export async function leaveOrganization(): Promise<OrgResult> {
  const ctx = await memberContext();
  if (!ctx.ok) return ctx.result;
  const { orgId, role } = ctx.membership;
  const onlyAdmin = "You are the only admin. Make another member an admin before you leave.";
  if (!mayLeave({ role, admins: role === "admin" ? await countAdmins(orgId) : 2 }).ok) return failed(onlyAdmin);
  // Counted again under a lock, so two admins leaving at once cannot both pass.
  const dropped = await dropMember(orgId, ctx.user.id, "remove");
  if (dropped === "last_admin") return failed(onlyAdmin);
  if (dropped !== "ok") return failed(UNAVAILABLE);
  await refreshMemberPart(orgId, ctx.user.id).catch(() => console.error("organization graph not updated"));
  await logSecurityEvent("org_left", { userId: ctx.user.id, orgId, headers: await headers() });
  return { ok: true };
}
