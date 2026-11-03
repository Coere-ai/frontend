import { readMembership } from "@/lib/org/membership";
import { gate } from "@/lib/v1/gate";
import { json, problem } from "@/lib/v1/http";
import { problemFor } from "@/lib/v1/refusals";

// GET /api/v1/org (docs/accounts.md 8.11)
//
// The caller's organization, or null: its name, their role, the shared
// sections and the access that applies to them.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const g = await gate(req, { metered: false });
  if (!g.ok) return problemFor(g.refusal, g.retryAfter);
  try {
    const m = await readMembership(g.account.userId);
    if (!m) return json({ org: null });
    return json({ org: { id: m.orgId, name: m.name, role: m.role, sharedSections: m.sharedSections, access: m.access } });
  } catch {
    return problem("unavailable");
  }
}
