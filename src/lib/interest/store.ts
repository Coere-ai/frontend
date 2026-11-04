import "server-only";

import { createAttemptLimiter } from "@/lib/auth/attempts";
import { addressOf, ipHash } from "@/lib/security/events";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { launchCopy, type LaunchProduct } from "@/site/content/launch";

/**
 * Stores an I'm interested sign up from a coming soon page
 * (docs/accounts.md section 16) with the secret key; the table is server
 * only. A repeat of the same address and product is ignored rather than
 * refused, so it answers the same thanks and never tells a stranger whether
 * an address is already on the list.
 */

/** 5 tries a minute for each network address and each email address. */
const limiter = createAttemptLimiter({ max: 5, windowMs: 60_000 });

export type InterestResult = "saved" | "too_many" | "unavailable";

export async function registerInterest(email: string, product: LaunchProduct, headers: Headers): Promise<InterestResult> {
  const keys = [`ip:${addressOf(headers) ?? "unknown"}`, `email:${email}`];
  // Every key is counted, so a refused try still uses up the others' budget.
  if (keys.map((key) => limiter.hit(key)).some(Boolean)) return "too_many";
  if (!supabaseConfigured()) {
    console.error("[interest] SUPABASE_URL and SUPABASE_SECRET_KEY must be set");
    return "unavailable";
  }
  try {
    const { error } = await supabase()
      .from("product_interest")
      .upsert({ email, product, source: launchCopy[product].path.slice(1), ip_hash: ipHash(headers) }, { onConflict: "email,product", ignoreDuplicates: true });
    if (!error) return "saved";
    console.error("[interest] sign up not stored", error.code);
  } catch {
    console.error("[interest] sign up not stored");
  }
  return "unavailable";
}
