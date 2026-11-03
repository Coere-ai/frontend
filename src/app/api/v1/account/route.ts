import { readAccount } from "@/lib/v1/account";
import { gate } from "@/lib/v1/gate";
import { json, problem } from "@/lib/v1/http";
import { problemFor } from "@/lib/v1/refusals";

// GET /api/v1/account (docs/accounts.md 8.3)
//
// The account, its plan, this month's usage, the memory copy, the calling
// device, the organization, the running totals and the settings version.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const g = await gate(req, { metered: false });
  if (!g.ok) return problemFor(g.refusal, g.retryAfter);
  try {
    const body = await readAccount(g.account);
    return body ? json(body) : problem("signed_out");
  } catch {
    return problem("unavailable");
  }
}
