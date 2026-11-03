import { deleteMemory, downloadLink } from "@/lib/memory/user-memory";
import { logSecurityEvent } from "@/lib/security/events";
import { gate } from "@/lib/v1/gate";
import { json, noContent, problem } from "@/lib/v1/http";
import { problemFor } from "@/lib/v1/refusals";

// GET and DELETE /api/v1/memory (docs/accounts.md 8.6)
//
// GET answers a download link for the stored .coere file that lives 60
// seconds. DELETE removes the file, its index and its row.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const g = await gate(req, { metered: false });
  if (!g.ok) return problemFor(g.refusal, g.retryAfter);
  const url = await downloadLink(g.account.userId);
  return url ? json({ url }) : problem("not_found");
}

export async function DELETE(req: Request): Promise<Response> {
  const g = await gate(req, { metered: false });
  if (!g.ok) return problemFor(g.refusal, g.retryAfter);
  const { userId, orgId } = g.account;
  try {
    await deleteMemory(userId, orgId);
  } catch {
    return problem("unavailable");
  }
  void logSecurityEvent("memory_deleted", { userId, orgId, headers: req.headers });
  return noContent();
}
