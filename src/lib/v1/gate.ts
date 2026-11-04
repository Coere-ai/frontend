import "server-only";

import { logSecurityEventAfter } from "@/lib/security/events";

import { authenticateDevice, type DeviceAccount } from "./device-auth";
import type { GateRefusal, SpentLimit } from "./gate-types";
import { deviceLimiter } from "./limiter";
import { spendRetryAfter, spentLimit } from "./spend";

export type { GateRefusal, SpentLimit } from "./gate-types";

/**
 * The checks every bearer route makes before it does anything, in order:
 * the token, a suspended account, the device's per minute limit and, for a
 * metered call, the lifetime and monthly spend limits. The route turns a
 * refusal into its own error shape (problem details, or Anthropic's on the
 * proxy); `limit` says which spend limit a `usage_limit` is about.
 *
 * `rate_limited` and `usage_limited` are logged once per device per window,
 * so a runaway loop does not write a security row per request.
 */

export type GateResult =
  | { ok: true; account: DeviceAccount }
  | { ok: false; refusal: GateRefusal; retryAfter?: number; limit?: SpentLimit };

const lastLogged = new Map<string, number>();

/** True the first time a key is seen in `ms`; the map is swept when it grows. */
function firstIn(key: string, ms: number, now = Date.now()): boolean {
  const at = lastLogged.get(key);
  if (at !== undefined && now - at < ms) return false;
  lastLogged.set(key, now);
  if (lastLogged.size > 10_000) for (const [k, t] of lastLogged) if (now - t >= ms) lastLogged.delete(k);
  return true;
}

export async function gate(req: Request, o: { metered: boolean }): Promise<GateResult> {
  const auth = await authenticateDevice(req);
  if (!auth.ok) return { ok: false, refusal: auth.reason };
  const account = auth.account;
  const who = { userId: account.userId, orgId: account.orgId, headers: req.headers };
  if (account.status === "suspended") return { ok: false, refusal: "suspended" };

  const limit = deviceLimiter.hit(account.deviceId, account.requestsPerMinute);
  if (!limit.ok) {
    if (firstIn(`rate:${account.deviceId}`, 60_000)) logSecurityEventAfter("rate_limited", who);
    return { ok: false, refusal: "rate_limited", retryAfter: limit.retryAfterSeconds };
  }

  const spent = o.metered ? spentLimit(account) : null;
  if (spent) {
    if (firstIn(`usage:${account.deviceId}`, 3_600_000)) logSecurityEventAfter("usage_limited", who);
    return { ok: false, refusal: "usage_limit", retryAfter: spendRetryAfter(spent), limit: spent };
  }
  return { ok: true, account };
}
