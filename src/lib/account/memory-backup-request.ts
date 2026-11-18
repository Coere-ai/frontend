import { isRecord } from "@/lib/v1/body";

/**
 * The body of `POST /api/v1/account/memory` (docs/accounts.md 8.12): the
 * memory backup switch, the sensitive memories switch, or both. Each is a
 * boolean when it is there, at least one must be, and nothing else may
 * come along. Pure, so the tests pin it.
 */

export interface BackupChange {
  sync?: boolean;
  includeSensitive?: boolean;
}

const FIELDS = new Set(["sync", "includeSensitive"]);

/** The change the body asks for, or null when it is not one. */
export function backupChange(body: unknown): BackupChange | null {
  if (!isRecord(body)) return null;
  const keys = Object.keys(body);
  if (keys.length === 0 || keys.some((k) => !FIELDS.has(k))) return null;
  const change: BackupChange = {};
  for (const k of keys) {
    const v = body[k];
    if (typeof v !== "boolean") return null;
    change[k as keyof BackupChange] = v;
  }
  return change;
}

/** The two switches as they stand after the change, from the values the caller's row held. */
export function backupAfter(change: BackupChange, before: { memorySync: boolean; includeSensitive: boolean }): { sync: boolean; includeSensitive: boolean } {
  return { sync: change.sync ?? before.memorySync, includeSensitive: change.includeSensitive ?? before.includeSensitive };
}

/**
 * Whether the change removes the stored copy. Turning the backup off
 * always does. Turning sensitive memories off does when the stored file
 * holds some, since that copy would otherwise keep what the person opted
 * out of until the extension next pushes (docs/accounts.md 8.6); the
 * extension sends a copy without them soon after.
 */
export function removesCopy(change: BackupChange, stored: { includesSensitive: boolean } | null): boolean {
  if (change.sync === false) return true;
  return change.includeSensitive === false && stored?.includesSensitive === true;
}
