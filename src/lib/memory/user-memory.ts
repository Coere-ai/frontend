import "server-only";

import { supabase } from "@/lib/supabase";

import { userIncomingPrefix, userIndexPath, userMemoryPath } from "./index-types";
import { refreshMemberPart } from "./org-index";
import { listFolder, removePaths, signedDownload, signedUpload } from "./storage";
import { stagedPath } from "./upload-rules";

/**
 * The person's memory copy outside the commit (docs/accounts.md 8.6): the
 * stored digest, a signed upload address, a short lived download link, and
 * deleting it all. Every query is scoped to the caller's own id.
 */

export async function storedDigest(userId: string): Promise<string | null> {
  const { data } = await supabase().from("memory_files").select("digest").eq("user_id", userId).maybeSingle<{ digest: string }>();
  return data?.digest ?? null;
}

/** Rounds of list and remove, at 1,000 names a list, before giving up on an absurd folder. */
const CLEAR_ROUNDS = 20;

/**
 * Empties the person's `incoming/` folder. A list answers at most 1,000
 * names, so it lists and removes until the folder is empty.
 */
export async function clearIncoming(userId: string): Promise<void> {
  const prefix = userIncomingPrefix(userId);
  for (let round = 0; round < CLEAR_ROUNDS; round++) {
    const names = await listFolder(prefix.slice(0, -1));
    if (names.length === 0) return;
    await removePaths(names.map((n) => `${prefix}${n}`));
  }
}

/**
 * A fresh staged path and its signed upload address. Anything staged
 * before is removed first, so an account holds at most one staged file: a
 * client that uploads and never commits cannot fill Storage outside its
 * plan's limit. A second device's upload in flight is lost too; its commit
 * answers not_found and it simply uploads again.
 */
export async function stageUpload(userId: string): Promise<{ path: string; url: string } | null> {
  await clearIncoming(userId);
  const path = stagedPath(userId);
  const url = await signedUpload(path);
  return url ? { path, url } : null;
}

/** A download link that lives 60 seconds, or null when there is no file. */
export async function downloadLink(userId: string): Promise<string | null> {
  const { data } = await supabase().from("memory_files").select("object_path").eq("user_id", userId).maybeSingle<{ object_path: string }>();
  if (!data) return null;
  return signedDownload(userMemoryPath(userId), 60, "memory.coere");
}

/**
 * Removes the file, its index, anything staged and the row, then sets the
 * totals and takes the person's part out of their organization's graph.
 * The dashboard's backup switch and account deletion call this too.
 */
export async function deleteMemory(userId: string, orgId: string | null): Promise<void> {
  await removePaths([userMemoryPath(userId), userIndexPath(userId)]);
  await clearIncoming(userId);
  const db = supabase();
  const { error } = await db.from("memory_files").delete().eq("user_id", userId);
  if (error) throw new Error(`memory_files delete failed: ${error.code}`);
  const totals = await db.rpc("set_memory_totals", { p_user: userId });
  if (totals.error) console.error("set_memory_totals failed", totals.error.code);
  if (orgId) await refreshMemberPart(orgId, userId).catch(() => console.error("organization graph not updated"));
}
