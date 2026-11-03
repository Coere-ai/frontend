import "server-only";

import { createAttemptLimiter } from "@/lib/auth/attempts";
import { addressOf, ipHash } from "@/lib/security/events";
import { supabase, supabaseConfigured } from "@/lib/supabase";

/**
 * Stores a developer waitlist sign up (docs/accounts.md section 16) with the
 * secret key; the table is server only. A repeat address is ignored rather
 * than refused, so joining twice answers the same thanks and never tells a
 * stranger whether an address is already on the list.
 */

/** 5 tries a minute for each network address and each email address. */
const limiter = createAttemptLimiter({ max: 5, windowMs: 60_000 });

export type JoinResult = "joined" | "too_many" | "unavailable";

export async function joinWaitlist(email: string, headers: Headers): Promise<JoinResult> {
  const keys = [`ip:${addressOf(headers) ?? "unknown"}`, `email:${email}`];
  // Every key is counted, so a refused try still uses up the others' budget.
  if (keys.map((key) => limiter.hit(key)).some(Boolean)) return "too_many";
  if (!supabaseConfigured()) {
    console.error("[waitlist] SUPABASE_URL and SUPABASE_SECRET_KEY must be set");
    return "unavailable";
  }
  try {
    const { error } = await supabase()
      .from("developer_waitlist")
      .upsert({ email, source: "site", ip_hash: ipHash(headers) }, { onConflict: "email", ignoreDuplicates: true });
    if (!error) return "joined";
    console.error("[waitlist] sign up not stored", error.code);
  } catch {
    console.error("[waitlist] sign up not stored");
  }
  return "unavailable";
}
