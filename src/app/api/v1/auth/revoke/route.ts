import { logSecurityEventAfter } from "@/lib/security/events";
import { supabase } from "@/lib/supabase";
import { authenticateDevice } from "@/lib/v1/device-auth";
import { noContent, problem } from "@/lib/v1/http";

// POST /api/v1/auth/revoke (docs/accounts.md 8.2)
//
// Revokes the calling token, as the extension's Disconnect does. It skips
// the per minute limit and works for a suspended account, so a person can
// always sign a browser out.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const auth = await authenticateDevice(req);
  if (!auth.ok) return problem(auth.reason);
  const { deviceId, userId, orgId } = auth.account;
  const { error } = await supabase()
    .from("devices")
    .update({ revoked_at: new Date().toISOString(), revoked_reason: "signed_out" })
    .eq("id", deviceId)
    .eq("user_id", userId)
    .is("revoked_at", null);
  if (error) {
    console.error("revoke failed", error.code);
    return problem("unavailable");
  }
  logSecurityEventAfter("device_revoked", { userId, orgId, headers: req.headers });
  return noContent();
}
