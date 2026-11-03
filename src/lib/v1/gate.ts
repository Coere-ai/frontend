import "server-only";

import { logSecurityEvent } from "@/lib/security/events";

import { authenticateDevice, type DeviceAccount } from "./device-auth";
import type { GateRefusal } from "./gate-types";
import { deviceLimiter } from "./limiter";

export type { GateRefusal } from "./gate-types";

/**
 * The checks every bearer route makes before it does anything, in order:
 * the token, a suspended account, the device's per minute limit and, for a
 * metered call, the plan's monthly limit. The route turns a refusal into its
 * own error shape (problem details, or Anthropic's on the proxy).
 *
 * `rate_limited` and `usage_limited` are logged once per device per window,
 * so a runaway loop does not write a security row per request.
 */

export type GateResult =
  | { ok: true; account: DeviceAccount }
  | { ok: false; refusal: GateRefusal; retryAfter?: number };

const lastLogged = new Map<string, number>();

/** True the first time a key is seen in `ms`; the map is swept when it grows. */
function firstIn(key: string, ms: number, now = Date.now()): boolean {
  const at = lastLogged.get(key);
  if (at !== undefined && now - at < ms) return false;
  lastLogged.set(key, now);
  if (lastLogged.size > 10_000) for (const [k, t] of lastLogged) if (now - t >= ms) lastLogged.delete(k);
  return true;
}

/** Seconds until the first day of next month in UTC, for a spent month's retry-after. */
export function secondsToNextMonth(now = new Date()): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000));
}

export async function gate(req: Request, o: { metered: boolean }): Promise<GateResult> {
  const auth = await authenticateDevice(req);
  if (!auth.ok) return { ok: false, refusal: auth.reason };
  const account = auth.account;
  const who = { userId: account.userId, orgId: account.orgId, headers: req.headers };
  if (account.status === "suspended") return { ok: false, refusal: "suspended" };

  const limit = deviceLimiter.hit(account.deviceId, account.requestsPerMinute);
  if (!limit.ok) {
    if (firstIn(`rate:${account.deviceId}`, 60_000)) void logSecurityEvent("rate_limited", who);
    return { ok: false, refusal: "rate_limited", retryAfter: limit.retryAfterSeconds };
  }

  if (o.metered && account.monthCostMicros >= account.monthlyLimitMicros) {
    if (firstIn(`usage:${account.deviceId}`, 3_600_000)) void logSecurityEvent("usage_limited", who);
    return { ok: false, refusal: "usage_limit", retryAfter: secondsToNextMonth() };
  }
  return { ok: true, account };
}
