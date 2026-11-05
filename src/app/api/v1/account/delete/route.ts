import { typedEmail } from "@/lib/account/delete-request";
import { readJson } from "@/lib/v1/body";
import { gate } from "@/lib/v1/gate";
import { problem, refusal } from "@/lib/v1/http";
import { problemFor } from "@/lib/v1/refusals";
import { DELETE_ON_WEB } from "@/lib/v1/web-only";

// POST /api/v1/account/delete (docs/accounts.md 7, 8.12)
//
// A device token never deletes the account. A copy of one, taken from a
// browser, could read the email from GET /api/v1/account and type it, so
// the typed email proves nothing. The route checks the token and the body,
// then refuses with the line that sends the person to coere.ai/account,
// where deleting needs a fresh sign in (src/app/(site)/account).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const g = await gate(req, { metered: false, suspended: "allow" });
  if (!g.ok) return problemFor(g.refusal, g.retryAfter);
  const body = await readJson(req, 4096);
  if (!body.ok) return problem(body.reason);
  const typed = typedEmail(body.value);
  if (typed === null) return problem("bad_request");
  return refusal("web_session", DELETE_ON_WEB);
}
