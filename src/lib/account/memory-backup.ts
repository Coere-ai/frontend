import { deleteMemory } from "@/lib/memory/user-memory";
import { supabase } from "@/lib/supabase";

import type { BackupChange } from "./memory-backup-request";

/**
 * Writes the memory backup switches on the person's profile, as the old
 * dashboard's Settings page did. Turning the backup off also removes the
 * stored file, its index and the person's part of their organization's
 * graph, so nothing of their memory stays on coere.ai; the extension
 * stops pushing once it reads the switch. Throws when a step fails.
 */
export async function setMemoryBackup(userId: string, orgId: string | null, change: BackupChange): Promise<void> {
  const row: { memory_sync?: boolean; include_sensitive?: boolean; updated_at: string } = { updated_at: new Date().toISOString() };
  if (change.sync !== undefined) row.memory_sync = change.sync;
  if (change.includeSensitive !== undefined) row.include_sensitive = change.includeSensitive;
  const { error } = await supabase().from("profiles").update(row).eq("id", userId);
  if (error) throw new Error(`profile update failed: ${error.code}`);
  if (change.sync === false) await deleteMemory(userId, orgId);
}
