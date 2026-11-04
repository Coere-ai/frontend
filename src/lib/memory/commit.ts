import "server-only";

import { supabase } from "@/lib/supabase";
import type { DeviceAccount } from "@/lib/v1/device-auth";

import { buildIndex } from "./build-index";
import { COERE_MIMETYPE, openCoere } from "./coere-zip";
import { countsFromManifest, type MemoryCounts } from "./counts";
import { userIndexPath, userMemoryPath } from "./index-types";
import { refreshMemberPart } from "./org-index";
import { getBytes, objectSize, putFile, putJson, removePaths } from "./storage";
import { fileLimit } from "./upload-rules";
import { deleteMemory } from "./user-memory";

/**
 * Committing an uploaded memory file (docs/accounts.md 8.6, 8.7, 14.2): read
 * the staged file, check it, build the index, put both in place, record the
 * row and the totals, then update the organization graph. The staged file
 * is removed whether it passes or fails a check.
 */

export type Committed =
  | { ok: true; bytes: number; digest: string; uploadedAt: string; counts: MemoryCounts }
  | { ok: false; reason: "not_found" | "too_large" | "bad_request" | "memory_sync_off" | "sensitive_off" | "unavailable" };

/** Whether the person still wants a backup, read fresh: on, off, gone (no profile), or unknown when the read failed. */
async function backupWanted(userId: string): Promise<"on" | "off" | "gone" | "unknown"> {
  const { data, error } = await supabase().from("profiles").select("memory_sync").eq("id", userId).maybeSingle<{ memory_sync: boolean }>();
  if (error) return "unknown";
  if (!data) return "gone";
  return data.memory_sync ? "on" : "off";
}

export async function commitMemory(a: DeviceAccount, staged: string): Promise<Committed> {
  if (!a.memorySync) {
    await removePaths([staged]);
    return { ok: false, reason: "memory_sync_off" };
  }
  const size = await objectSize(staged);
  if (size === null) return { ok: false, reason: "not_found" };
  if (size > fileLimit(a.storageLimitBytes)) {
    await removePaths([staged]);
    return { ok: false, reason: "too_large" };
  }
  const bytes = await getBytes(staged);
  if (!bytes) return { ok: false, reason: "not_found" };
  const opened = openCoere(bytes);
  if (!opened.ok) {
    await removePaths([staged]);
    return { ok: false, reason: opened.reason === "too_large" ? "too_large" : "bad_request" };
  }
  const { manifest, files } = opened;
  const built = buildIndex(manifest, files, { includeSensitive: a.includeSensitive });
  const counts = countsFromManifest(manifest);
  // The person turned sensitive memories off, but this file was exported
  // with them (an extension with an older copy of the setting, or a push
  // already under way). The file is what is stored and served, so it is
  // refused rather than kept with what the person opted out of.
  if (!a.includeSensitive && built.includesSensitive) {
    await removePaths([staged]);
    return { ok: false, reason: "sensitive_off" };
  }

  // The bytes are already here, so they are written over the stored copy
  // directly: a failed write leaves the old copy, where a move would first
  // have to delete it. Only this commit's own staged file goes afterwards, so
  // another device's upload in flight is left alone.
  if (!(await putFile(userMemoryPath(a.userId), bytes, COERE_MIMETYPE))) return { ok: false, reason: "unavailable" };
  const indexBytes = await putJson(userIndexPath(a.userId), built.index);
  await removePaths([staged]);

  const uploadedAt = new Date().toISOString();
  const db = supabase();
  const { error } = await db.from("memory_files").upsert(
    {
      user_id: a.userId,
      object_path: userMemoryPath(a.userId),
      index_path: userIndexPath(a.userId),
      bytes: bytes.byteLength,
      index_bytes: indexBytes,
      digest: manifest.digest,
      format_version: manifest.version,
      generator_version: manifest.generator?.version ?? null,
      ...counts,
      includes_quotes: built.includesQuotes,
      includes_sensitive: built.includesSensitive,
      device_id: a.deviceId,
      uploaded_at: uploadedAt,
    },
    { onConflict: "user_id" },
  );
  if (error) {
    console.error("memory_files write failed", error.code);
    // The account was deleted while this ran: what was just written belongs to nobody.
    if ((await backupWanted(a.userId)) === "gone") await removePaths([userMemoryPath(a.userId), userIndexPath(a.userId)]);
    return { ok: false, reason: "unavailable" };
  }
  // The backup was turned off while this ran. Checked after the writes, not
  // before: setBackup writes the flag before it deletes, so either this sees
  // it off and cleans up itself, or its own delete runs after these writes.
  const wanted = await backupWanted(a.userId);
  if (wanted === "off" || wanted === "gone") {
    await deleteMemory(a.userId, a.orgId);
    return { ok: false, reason: "memory_sync_off" };
  }
  const totals = await db.rpc("set_memory_totals", { p_user: a.userId });
  if (totals.error) console.error("set_memory_totals failed", totals.error.code);

  if (a.orgId) {
    try {
      await refreshMemberPart(a.orgId, a.userId, built.index);
    } catch {
      console.error("organization graph not updated");
    }
  }
  return { ok: true, bytes: bytes.byteLength, digest: manifest.digest, uploadedAt, counts };
}
