import "server-only";

import { refreshMemberPart } from "@/lib/memory/org-index";
import { listFolder, removePaths } from "@/lib/memory/storage";
import { clearIncoming, deleteMemory } from "@/lib/memory/user-memory";
import { dropMember } from "@/lib/org/drop-member";
import { readMembership } from "@/lib/org/membership";
import { countAdmins } from "@/lib/org/queries";
import { mayLeave } from "@/lib/org/roles";
import { supabase } from "@/lib/supabase";

/**
 * Deleting an account (docs/accounts.md 7 and 14.4), in the order that
 * leaves nothing behind if a step fails part way: the person leaves their
 * organization and their part of its graph goes; their memory copy and
 * every other object in their folder go; their devices are revoked; then
 * Supabase Auth deletes the user, which removes their rows through the
 * foreign keys and cuts them off their usage rows. The last admin of an
 * organization is refused until another admin is named.
 */

export type DeleteResult = { ok: true } | { ok: false; reason: "last_admin" | "unavailable" };

export async function deleteAccount(userId: string): Promise<DeleteResult> {
  const db = supabase();
  const membership = await readMembership(userId);
  if (membership && !mayLeave({ role: membership.role, admins: membership.role === "admin" ? await countAdmins(membership.orgId) : 2 }).ok) {
    return { ok: false, reason: "last_admin" };
  }

  if (membership) {
    // Counted again under a lock, so two admins deleting their accounts at once cannot both pass.
    const dropped = await dropMember(membership.orgId, userId, "remove");
    if (dropped === "last_admin") return { ok: false, reason: "last_admin" };
    if (dropped !== "ok" && dropped !== "not_member") return { ok: false, reason: "unavailable" };
    await refreshMemberPart(membership.orgId, userId).catch(() => console.error("organization graph not updated"));
  }

  try {
    await deleteMemory(userId, null);
  } catch {
    console.error("memory copy not deleted");
  }
  const left = await listFolder(userId);
  await removePaths(left.map((n) => `${userId}/${n}`));
  await clearIncoming(userId);

  const revoked = await db.from("devices").update({ revoked_at: new Date().toISOString(), revoked_reason: "account" }).eq("user_id", userId).is("revoked_at", null);
  if (revoked.error) console.error("devices not revoked", revoked.error.code);

  const { error } = await db.auth.admin.deleteUser(userId);
  if (error) {
    console.error("auth user not deleted", error.status ?? "");
    return { ok: false, reason: "unavailable" };
  }
  return { ok: true };
}
