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

export async function stageUpload(userId: string): Promise<{ path: string; url: string } | null> {
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
  const prefix = userIncomingPrefix(userId);
  const staged = (await listFolder(prefix.slice(0, -1))).map((n) => `${prefix}${n}`);
  await removePaths([userMemoryPath(userId), userIndexPath(userId), ...staged]);
  const db = supabase();
  const { error } = await db.from("memory_files").delete().eq("user_id", userId);
  if (error) throw new Error(`memory_files delete failed: ${error.code}`);
  const totals = await db.rpc("set_memory_totals", { p_user: userId });
  if (totals.error) console.error("set_memory_totals failed", totals.error.code);
  if (orgId) await refreshMemberPart(orgId, userId).catch(() => console.error("organization graph not updated"));
}
