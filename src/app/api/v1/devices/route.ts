import { listDevices } from "@/lib/account/devices";
import { devicesBody } from "@/lib/v1/devices-body";
import { gate } from "@/lib/v1/gate";
import { json, problem } from "@/lib/v1/http";
import { problemFor } from "@/lib/v1/refusals";

// GET /api/v1/devices (docs/accounts.md 8.12)
//
// The caller's connected browsers for the Settings Account card, newest
// first, with `current` on the browser that asked. A suspended account may
// still read them, so a person can always see where they are signed in.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const g = await gate(req, { metered: false, suspended: "allow" });
  if (!g.ok) return problemFor(g.refusal, g.retryAfter);
  try {
    return json(devicesBody(await listDevices(g.account.userId), g.account.deviceId));
  } catch {
    return problem("unavailable");
  }
}
