import { deleteAccount } from "@/lib/account/delete-account";
import { EMAIL_LINE, emailMatches, LAST_ADMIN_LINE, typedEmail } from "@/lib/account/delete-request";
import { logSecurityEventAfter } from "@/lib/security/events";
import { supabase } from "@/lib/supabase";
import { readJson } from "@/lib/v1/body";
import { gate } from "@/lib/v1/gate";
import { noContent, problem, refusal } from "@/lib/v1/http";
import { problemFor } from "@/lib/v1/refusals";

// POST /api/v1/account/delete (docs/accounts.md 7, 8.12)
//
// Deletes the caller's account once they typed its email, by the same
// steps the dashboard took (src/lib/account/delete-account.ts): the last
// admin of an organization is refused, Storage goes first, then
// auth.admin.deleteUser. Answers 204, and the extension then clears its
// account. A suspended account may still delete itself.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const g = await gate(req, { metered: false, suspended: "allow" });
  if (!g.ok) return problemFor(g.refusal, g.retryAfter);
  const body = await readJson(req, 4096);
  if (!body.ok) return problem(body.reason);
  const typed = typedEmail(body.value);
  if (typed === null) return problem("bad_request");
  const { userId } = g.account;
  try {
    const { data, error } = await supabase().auth.admin.getUserById(userId);
    if (error || !data.user) return problem("unavailable");
    if (!emailMatches(typed, data.user.email)) return refusal("email", EMAIL_LINE);
    const done = await deleteAccount(userId);
    if (!done.ok) return done.reason === "last_admin" ? refusal("last_admin", LAST_ADMIN_LINE) : problem("unavailable");
  } catch {
    return problem("unavailable");
  }
  logSecurityEventAfter("account_deleted", { headers: req.headers });
  return noContent();
}
