import { readOrgIndex } from "@/lib/memory/org-index";
import { capForAnswer } from "@/lib/memory/org-answer";
import { cutToSections } from "@/lib/memory/org-cut";
import { readMembership } from "@/lib/org/membership";
import { gate } from "@/lib/v1/gate";
import { json, problem } from "@/lib/v1/http";
import { problemFor } from "@/lib/v1/refusals";

// GET /api/v1/org/index (docs/accounts.md 8.11, 14.2)
//
// The organization's merged graph, cut to the sections the caller may read.
// Membership is checked here, with the caller's own id, before any read:
// Storage lets nobody signed in read the org/ folder directly.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const g = await gate(req, { metered: false });
  if (!g.ok) return problemFor(g.refusal, g.retryAfter);
  try {
    const m = await readMembership(g.account.userId);
    if (!m) return problem("not_found");
    const index = await readOrgIndex(m.orgId);
    if (!index) return problem("not_found");
    // At most the facts that fit one answer under Vercel's 4.5 MB ceiling, with `truncated` set.
    return json(capForAnswer(cutToSections(index, m.readable, { dropSensitive: true })));
  } catch {
    return problem("unavailable");
  }
}
