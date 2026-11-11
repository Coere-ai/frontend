import "server-only";

import { logSecurityEventAfter } from "@/lib/security/events";
import { securityOnce } from "@/lib/security/once";

import { authenticateDevice, type DeviceAccount } from "./device-auth";
import type { GateRefusal, SpentLimit } from "./gate-types";
import { laneBucket, rateRetryAfter, type Lane } from "./lanes";
import { deviceLimiter } from "./limiter";
import { spendRetryAfter, spentLimit } from "./spend";

export type { GateRefusal, SpentLimit } from "./gate-types";

/**
 * The checks every bearer route makes before it does anything, in order:
 * the token, a suspended account, the device's per minute limit and, for a
 * metered call, the spend limits: lifetime always, then the first build
 * allowance until the first memory build finishes, and after it the monthly
 * limit and the daily one when set (spend.ts). The route turns a refusal
 * into its own error shape (problem details, or Anthropic's on the proxy);
 * `limit` says which spend limit a `usage_limit` is about.
 *
 * `rate_limited` and `usage_limited` are logged once per device per window,
 * so a runaway loop does not write a security row per request.
 */

export type GateResult =
  | { ok: true; account: DeviceAccount }
  | { ok: false; refusal: GateRefusal; retryAfter?: number; limit?: SpentLimit };

/**
 * `suspended: "allow"` lets a suspended account through, for what a person
 * may always do about their own account: see and revoke their browsers,
 * and delete the account.
 */
export async function gate(req: Request, o: { metered: boolean; lane?: Lane | "later"; suspended?: "allow" }): Promise<GateResult> {
  const auth = await authenticateDevice(req);
  if (!auth.ok) return { ok: false, refusal: auth.reason };
  const account = auth.account;
  if (account.status === "suspended" && o.suspended !== "allow") return { ok: false, refusal: "suspended" };

  if (o.lane !== "later") {
    const rate = hitRate(account, o.lane ?? "default", req.headers);
    if (rate) return rate;
  }

  const spent = o.metered ? spentLimit(account) : null;
  if (spent) {
    noteUsageLimited(account, req.headers);
    return { ok: false, refusal: "usage_limit", retryAfter: spendRetryAfter(spent), limit: spent };
  }
  return { ok: true, account };
}

/**
 * The per minute check on its own, for a route that knows its lane only
 * once it has read the body: the proxy counts a Haiku message in its own
 * bucket (lanes.ts), and calls the gate with `lane: "later"`. Null when
 * the call may go on.
 */
export function hitRate(account: DeviceAccount, lane: Lane, headers: Headers): Extract<GateResult, { ok: false }> | null {
  const bucket = laneBucket(lane, account.deviceId, account.requestsPerMinute);
  const limit = deviceLimiter.hit(bucket.key, bucket.limit);
  if (limit.ok) return null;
  if (securityOnce.firstIn(`rate:${bucket.key}`, 60_000)) logSecurityEventAfter("rate_limited", { userId: account.userId, orgId: account.orgId, headers });
  return { ok: false, refusal: "rate_limited", retryAfter: rateRetryAfter(limit.retryAfterSeconds) };
}

/** Logs `usage_limited` once an hour per device, for the gate and for a refused spend reservation alike. */
export function noteUsageLimited(account: DeviceAccount, headers: Headers): void {
  if (securityOnce.firstIn(`usage:${account.deviceId}`, 3_600_000)) {
    logSecurityEventAfter("usage_limited", { userId: account.userId, orgId: account.orgId, headers });
  }
}
