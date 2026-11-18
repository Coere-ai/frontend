import { deleteMemory } from "@/lib/memory/user-memory";
import { supabase } from "@/lib/supabase";

import { removesCopy, type BackupChange } from "./memory-backup-request";

/**
 * Writes the memory backup switches on the person's profile, as the old
 * dashboard's Settings page did. Turning the backup off also removes the
 * stored file, its index and the person's part of their organization's
 * graph, so nothing of their memory stays on coere.ai; the extension
 * stops pushing once it reads the switch. Turning sensitive memories off
 * removes a stored file that holds some, and the extension sends one
 * without them. The flag is written first, so a commit already under way
 * sees it off and removes its own file. Throws when a step fails.
 */
export async function setMemoryBackup(userId: string, orgId: string | null, change: BackupChange): Promise<void> {
  const row: { memory_sync?: boolean; include_sensitive?: boolean; updated_at: string } = { updated_at: new Date().toISOString() };
  if (change.sync !== undefined) row.memory_sync = change.sync;
  if (change.includeSensitive !== undefined) row.include_sensitive = change.includeSensitive;
  const db = supabase();
  const { error } = await db.from("profiles").update(row).eq("id", userId);
  if (error) throw new Error(`profile update failed: ${error.code}`);
  if (removesCopy(change, await storedCopy(userId, change))) await deleteMemory(userId, orgId);
}

/** Whether the stored file holds sensitive memories, read only when that decides anything. */
async function storedCopy(userId: string, change: BackupChange): Promise<{ includesSensitive: boolean } | null> {
  if (change.sync === false || change.includeSensitive !== false) return null;
  const { data, error } = await supabase()
    .from("memory_files")
    .select("includes_sensitive")
    .eq("user_id", userId)
    .maybeSingle<{ includes_sensitive: boolean }>();
  if (error) throw new Error(`memory_files read failed: ${error.code}`);
  return data ? { includesSensitive: data.includes_sensitive } : null;
}
