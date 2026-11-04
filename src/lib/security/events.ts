import "server-only";

import { createHmac } from "node:crypto";

import { after } from "next/server";

import { supabase, supabaseConfigured } from "@/lib/supabase";

/**
 * Security events: who signed in, who failed, which token was refused.
 *
 * Each is one `security_events` row with an account or organization id where
 * there is one, and the address only as a keyed hash, so the admin panel can
 * see that one address failed ten times without the address ever being
 * stored. Logging never throws and never delays the answer it describes.
 */

export type SecurityKind =
  | "sign_in"
  | "sign_in_failed"
  | "code_sent"
  | "sign_up"
  | "password_set"
  | "username_set"
  | "sign_out"
  | "device_connected"
  | "device_revoked"
  | "token_rejected"
  | "rate_limited"
  | "usage_limited"
  | "connect_refused"
  | "memory_deleted"
  | "account_deleted"
  | "org_created"
  | "org_deleted"
  | "org_invite_sent"
  | "org_joined"
  | "org_left"
  | "org_member_removed"
  | "admin_sign_in"
  | "admin_sign_in_failed"
  | "admin_viewed_memory";

/** The caller's address as the platform reports it. */
export function addressOf(headers: Headers): string | null {
  const fwd = headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || headers.get("x-real-ip") || null;
}

/** The first 16 hex characters of HMAC-SHA256(address, SECURITY_SALT). Null with no address. */
export function ipHash(headers: Headers): string | null {
  const address = addressOf(headers);
  if (!address) return null;
  const salt = process.env.SECURITY_SALT || process.env.SUPABASE_SECRET_KEY || "coere";
  return createHmac("sha256", salt).update(address).digest("hex").slice(0, 16);
}

export async function logSecurityEvent(
  kind: SecurityKind,
  o: { userId?: string | null; orgId?: string | null; headers?: Headers } = {},
): Promise<void> {
  if (!supabaseConfigured()) return;
  try {
    const { error } = await supabase()
      .from("security_events")
      .insert({
        kind,
        user_id: o.userId ?? null,
        org_id: o.orgId ?? null,
        ip_hash: o.headers ? ipHash(o.headers) : null,
        country: o.headers?.get("x-vercel-ip-country") ?? null,
      });
    if (error) console.error("security event not stored", kind, error.code);
  } catch {
    console.error("security event not stored", kind);
  }
}

/**
 * Logs once the answer is sent, for the API routes that must not wait on
 * the write. A bare unawaited promise can be lost on Vercel, which may freeze
 * the function as soon as the response is out; `after` keeps it alive until
 * the row is written. Outside a request (a script) it simply writes.
 */
export function logSecurityEventAfter(kind: SecurityKind, o: { userId?: string | null; orgId?: string | null; headers?: Headers } = {}): void {
  try {
    after(() => logSecurityEvent(kind, o));
  } catch {
    void logSecurityEvent(kind, o);
  }
}
