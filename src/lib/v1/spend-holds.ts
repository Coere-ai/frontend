import "server-only";

import { supabase } from "@/lib/supabase";

import type { SpentLimit } from "./gate-types";

/**
 * Spend reservations (docs/accounts.md 8.10). The gate's check reads only
 * spend already recorded, which lands after Anthropic answers, so one large
 * call, or many at once, could pass a limit by any amount. Each metered call
 * now holds its worst case first (reserve_spend), and the hold is let go once
 * the call's real cost is recorded. A hold outlives the function by a margin
 * and then simply stops counting, so a killed call never blocks for long.
 */

/** Longer than the proxy's 800 second ceiling, so a hold never lapses while its call can still run. */
export const HOLD_SECONDS = 900;

export type Reservation = { ok: true; holdId: string } | { ok: false; refused: SpentLimit } | { ok: false; refused: null };

export async function reserveSpend(userId: string, amountMicros: number, o: { batch: boolean }): Promise<Reservation> {
  const { data, error } = await supabase().rpc("reserve_spend", {
    p_user: userId,
    p_amount: Math.max(0, Math.ceil(amountMicros)),
    p_ttl_seconds: HOLD_SECONDS,
    p_batch: o.batch,
  });
  if (error) {
    console.error("reserve_spend failed", error.code);
    return { ok: false, refused: null };
  }
  const row = (Array.isArray(data) ? data[0] : data) as { hold_id: string | null; refused: string | null } | undefined;
  if (row?.hold_id) return { ok: true, holdId: row.hold_id };
  return { ok: false, refused: row?.refused === "lifetime" ? "lifetime" : "monthly" };
}

/** Lets a hold go once its call's cost is recorded, or the call failed. A failure only leaves it to run out. */
export async function releaseHold(holdId: string): Promise<void> {
  const { error } = await supabase().from("spend_holds").delete().eq("id", holdId);
  if (error) console.error("hold not released", error.code);
}
