import { readMembership } from "@/lib/org/membership";
import { readMyInvites } from "@/lib/org/my-invites";
import { readOrgPage } from "@/lib/org/page-data";
import { gate } from "@/lib/v1/gate";
import { json, problem } from "@/lib/v1/http";
import { noOrgBody, orgPageBody } from "@/lib/v1/org-page";
import { problemFor } from "@/lib/v1/refusals";

// GET /api/v1/org/page (docs/accounts.md 8.11)
//
// What the Console's Organization section shows: the organization, the
// caller's place in it, its members and totals, and for an admin the open
// invites. With no organization, the invites waiting for the caller. Every
// read is scoped to the caller's own membership.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const g = await gate(req, { metered: false });
  if (!g.ok) return problemFor(g.refusal, g.retryAfter);
  const { userId } = g.account;
  try {
    const membership = await readMembership(userId);
    if (!membership) return json(noOrgBody(await readMyInvites(userId)));
    const data = await readOrgPage(membership);
    return data ? json(orgPageBody(userId, membership, data)) : problem("unavailable");
  } catch {
    return problem("unavailable");
  }
}
