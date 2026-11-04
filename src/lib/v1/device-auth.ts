import "server-only";

import { supabase, supabaseConfigured } from "@/lib/supabase";
import { ipHash, logSecurityEventAfter } from "@/lib/security/events";
import { securityOnce } from "@/lib/security/once";

import { parseBearer, tokenHash } from "./token";

/**
 * Who is calling: one `device_auth(token_hash)` call (docs/accounts.md 8,
 * 10) checks the bearer token and returns the account, its limits (already
 * resolved: the person's own when the operator set one, else the plan's),
 * this month's and the lifetime spend, and the organization. A refused
 * token writes `token_rejected` with the address hash, never the token.
 */

export interface DeviceAccount {
  deviceId: string;
  userId: string;
  status: "active" | "suspended";
  planId: string;
  monthlyLimitMicros: number;
  /** Null means no lifetime limit. */
  lifetimeLimitMicros: number | null;
  storageLimitBytes: number;
  requestsPerMinute: number;
  monthCostMicros: number;
  lifetimeCostMicros: number;
  memorySync: boolean;
  includeSensitive: boolean;
  orgId: string | null;
}

export type DeviceAuth = { ok: true; account: DeviceAccount } | { ok: false; reason: "signed_out" | "unavailable" };

interface DeviceAuthRow {
  device_id: string;
  user_id: string;
  status: string;
  plan_id: string;
  monthly_limit_micros: number | string;
  lifetime_limit_micros: number | string | null;
  storage_limit_bytes: number | string;
  requests_per_minute: number;
  month_cost_micros: number | string;
  lifetime_cost_micros: number | string;
  memory_sync: boolean;
  include_sensitive: boolean;
  org_id: string | null;
}

function toAccount(r: DeviceAuthRow): DeviceAccount {
  return {
    deviceId: r.device_id,
    userId: r.user_id,
    status: r.status === "suspended" ? "suspended" : "active",
    planId: r.plan_id,
    monthlyLimitMicros: Number(r.monthly_limit_micros),
    lifetimeLimitMicros: r.lifetime_limit_micros === null ? null : Number(r.lifetime_limit_micros),
    storageLimitBytes: Number(r.storage_limit_bytes),
    requestsPerMinute: Number(r.requests_per_minute),
    monthCostMicros: Number(r.month_cost_micros),
    lifetimeCostMicros: Number(r.lifetime_cost_micros),
    memorySync: r.memory_sync,
    includeSensitive: r.include_sensitive,
    orgId: r.org_id,
  };
}

/**
 * Logs a refused token once a minute per address. Anyone can send junk
 * tokens before any limit applies, so a row per request would let one loop
 * grow the security log without end and bury the panel that should show it.
 */
function noteRejected(headers: Headers): void {
  if (securityOnce.firstIn(`token_rejected:${ipHash(headers) ?? "unknown"}`, 60_000)) logSecurityEventAfter("token_rejected", { headers });
}

export async function authenticateDevice(req: Request): Promise<DeviceAuth> {
  if (!supabaseConfigured()) return { ok: false, reason: "unavailable" };
  const header = req.headers.get("authorization");
  const token = parseBearer(header);
  if (!token) {
    // No header is the extension's signed out state and says nothing; a header that is not a token is worth noting.
    if (header) noteRejected(req.headers);
    return { ok: false, reason: "signed_out" };
  }
  const { data, error } = await supabase().rpc("device_auth", { p_token_hash: tokenHash(token) });
  if (error) {
    console.error("device_auth failed", error.code);
    return { ok: false, reason: "unavailable" };
  }
  const row = (Array.isArray(data) ? data[0] : data) as DeviceAuthRow | undefined;
  if (!row) {
    noteRejected(req.headers);
    return { ok: false, reason: "signed_out" };
  }
  return { ok: true, account: toAccount(row) };
}
