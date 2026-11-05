import { setMemoryBackup } from "@/lib/account/memory-backup";
import { backupAfter, backupChange } from "@/lib/account/memory-backup-request";
import { logSecurityEventAfter } from "@/lib/security/events";
import { readJson } from "@/lib/v1/body";
import { gate } from "@/lib/v1/gate";
import { json, problem, refusal } from "@/lib/v1/http";
import { problemFor } from "@/lib/v1/refusals";
import { BACKUP_ON_WEB, turnsBackupOn } from "@/lib/v1/web-only";

// POST /api/v1/account/memory (docs/accounts.md 8.12)
//
// The Console's two memory backup switches, which the old dashboard's
// Settings page held: { sync } backs the memory up to coere.ai or stops
// it, and { includeSensitive } says whether sensitive memories go with
// it. A device token may only turn them off: a copy of one could
// otherwise make the person's own browser send its memory, sensitive
// memories too, for the copy to download. Turning one on is refused with
// the line that sends the person to coere.ai/account. Off removes the
// stored copy and writes memory_deleted. Answers the two switches as they
// now stand. A suspended account may still turn the backup off, since
// that removes its data.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const g = await gate(req, { metered: false, suspended: "allow" });
  if (!g.ok) return problemFor(g.refusal, g.retryAfter);
  const body = await readJson(req, 1024);
  if (!body.ok) return problem(body.reason);
  const change = backupChange(body.value);
  if (change === null) return problem("bad_request");
  if (turnsBackupOn(change)) return refusal("web_session", BACKUP_ON_WEB);
  const { userId, orgId } = g.account;
  try {
    await setMemoryBackup(userId, orgId, change);
  } catch {
    return problem("unavailable");
  }
  if (change.sync === false) logSecurityEventAfter("memory_deleted", { userId, orgId, headers: req.headers });
  return json({ memory: backupAfter(change, g.account) });
}
