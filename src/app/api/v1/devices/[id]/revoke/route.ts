import { revokeDevice } from "@/lib/account/devices";
import { logSecurityEventAfter } from "@/lib/security/events";
import { isUuid } from "@/lib/uuid";
import { gate } from "@/lib/v1/gate";
import { noContent, problem } from "@/lib/v1/http";
import { problemFor } from "@/lib/v1/refusals";

// POST /api/v1/devices/{id}/revoke (docs/accounts.md 8.12)
//
// Revokes one of the caller's own browsers, as Revoke on the dashboard did.
// A browser already revoked answers 204 again; an id that is not one of
// the caller's answers 404. Revoking the calling browser itself signs it
// out, the same as POST /api/v1/auth/revoke.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = RouteContext<"/api/v1/devices/[id]/revoke">;

export async function POST(req: Request, ctx: Ctx): Promise<Response> {
  const g = await gate(req, { metered: false, suspended: "allow" });
  if (!g.ok) return problemFor(g.refusal, g.retryAfter);
  const { id } = await ctx.params;
  if (!isUuid(id)) return problem("not_found");
  const { userId, orgId } = g.account;
  try {
    const done = await revokeDevice(userId, id);
    if (done === "not_found") return problem("not_found");
    if (done === "revoked") logSecurityEventAfter("device_revoked", { userId, orgId, headers: req.headers });
    return noContent();
  } catch {
    return problem("unavailable");
  }
}
