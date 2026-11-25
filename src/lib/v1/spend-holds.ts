import "server-only";

import { supabase } from "@/lib/supabase";

import type { DeviceAccount } from "./device-auth";
import { isUnknownFunction, readReservation, reserveArgs, settleArgs, wantsWorstOnly, worstOnlyArgs, type Reservation, type UsageShare } from "./hold-rules";
import { recordUsage } from "./meter";

export { HOLD_SECONDS, MAX_LIVE_HOLDS, OVERRUN_MICROS, type Reservation } from "./hold-rules";

/**
 * Spend reservations (docs/accounts.md 8.10). The gate's check reads only
 * spend already recorded, which lands after Anthropic answers, so one large
 * call, or many at once, could pass a limit by any amount. Each metered call
 * now holds its cost first (reserve_spend), and the hold is let go once the
 * call's real cost is recorded: for a message, by settle_call in the same
 * transaction as its usage rows (holdOutcome in hold-rules.ts says when). A hold outlives the function by a margin and
 * then simply stops counting, so a killed call never blocks for long.
 *
 * Each hold keeps the call's worst case and its expected cost. The limit is
 * weighed by the expected costs, and the worst cases bound how far the calls
 * in flight could pass it together (hold-rules.ts). With Sonnet at 16,000
 * max_tokens that bound is what binds: about 57 Sonnet calls fit the $10
 * first build at once before anything is spent (38 before), and fewer as the
 * build spends.
 */

export async function reserveSpend(userId: string, cost: { worstMicros: number; expectedMicros: number }, o: { batch: boolean }): Promise<Reservation> {
  const args = reserveArgs(userId, cost, o);
  const { data, error } = await supabase().rpc("reserve_spend", args);
  if (wantsWorstOnly(error)) return reserveWorstOnly(args);
  if (error) {
    console.error("reserve_spend failed", error.code);
    return { ok: false, refused: null };
  }
  return readReservation(data);
}

/**
 * The four argument reserve_spend, which holds the worst case alone, for the
 * minutes between this site deploying and the owner running migration
 * 20261124000000_build_lane_holds. Without it every metered call would fail.
 */
async function reserveWorstOnly(args: ReturnType<typeof reserveArgs>): Promise<Reservation> {
  console.error("reserve_spend has no expected cost yet, holding the worst case");
  const { data, error } = await supabase().rpc("reserve_spend", worstOnlyArgs(args));
  if (error) {
    console.error("reserve_spend failed", error.code);
    return { ok: false, refused: null };
  }
  return readReservation(data);
}

/** Lets a hold go once its call's cost is recorded, or the call failed. A failure only leaves it to run out. */
export async function releaseHold(holdId: string): Promise<void> {
  const { error } = await supabase().from("spend_holds").delete().eq("id", holdId);
  if (error) console.error("hold not released", error.code);
}

/**
 * Records a message's or a count's usage rows and lets its hold go, in one
 * settle_call: one round trip after the answer instead of two, and a failed
 * record keeps the hold by construction. Tried twice. False when both
 * failed, and the hold, if any, is left to run out at HOLD_SECONDS. A
 * retry after a first try that landed but whose answer was lost would
 * record the call twice; that over counts, and only in that rare case.
 */
export async function settleCall(
  account: Pick<DeviceAccount, "userId" | "deviceId">,
  holdId: string | null,
  kind: "message" | "count_tokens",
  rows: UsageShare[],
  o: { status: number; durationMs: number; requestId: string | null },
): Promise<boolean> {
  const args = settleArgs(account, holdId, kind, rows, o);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { error } = await supabase().rpc("settle_call", args);
      if (!error) return true;
      if (isUnknownFunction(error)) return settleApart(account, holdId, kind, rows, o);
      console.error("settle_call failed", error.code);
    } catch {
      console.error("settle_call failed");
    }
  }
  return false;
}

/**
 * The two calls settle_call replaced, for the minutes between this site
 * deploying and the owner running migration 20261125000000_proxy_settle:
 * a record_usage per row, then the delete, which happens only once every
 * row landed. Not retried, since a row that landed would be counted twice.
 */
async function settleApart(
  account: Pick<DeviceAccount, "userId" | "deviceId">,
  holdId: string | null,
  kind: "message" | "count_tokens",
  rows: UsageShare[],
  o: { status: number; durationMs: number; requestId: string | null },
): Promise<boolean> {
  console.error("settle_call is not there yet, recording apart");
  for (const r of rows) {
    const landed = await recordUsage(account, { kind, model: r.model || null, tokens: r.tokens, costMicros: r.costMicros, ...o });
    if (!landed) return false;
  }
  if (holdId) await releaseHold(holdId);
  return true;
}
