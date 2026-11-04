import "server-only";

import { supabase } from "@/lib/supabase";

import type { DeviceAccount } from "../device-auth";
import type { TokenCounts } from "../prices";

/**
 * Batch ownership (docs/accounts.md 8.4). Every batch runs under Coere's one
 * Anthropic key, so `ai_batches` is what keeps one account from listing,
 * reading or cancelling another's. `metered_at` makes reading the results
 * twice count once.
 */

/**
 * Stores a new batch as the caller's, with its worst case, which counts
 * against the limits until it is metered. Tried twice, since a batch that is
 * not stored can never be read through the proxy. False when both failed.
 */
export async function storeBatch(a: DeviceAccount, id: string, requestCount: number, reservedMicros: number): Promise<boolean> {
  const row = { id, user_id: a.userId, device_id: a.deviceId, request_count: requestCount, reserved_micros: Math.max(0, Math.ceil(reservedMicros)) };
  for (let attempt = 0; attempt < 2; attempt++) {
    const { error } = await supabase().from("ai_batches").upsert(row, { onConflict: "id", ignoreDuplicates: true });
    if (!error) return true;
    console.error("batch not stored", error.code);
  }
  return false;
}

/** Whether the batch is the caller's; null when the lookup failed, which must not read as a final 404. */
export async function ownsBatch(userId: string, id: string): Promise<boolean | null> {
  const { data, error } = await supabase().from("ai_batches").select("id").eq("id", id).eq("user_id", userId).maybeSingle();
  if (error) {
    console.error("batch lookup failed", error.code);
    return null;
  }
  return Boolean(data);
}

/** One model's share of a batch's results, as meter_batch takes it. */
export interface BatchRow {
  model: string;
  tokens: TokenCounts;
  costMicros: number;
}

/**
 * Meters a batch's results once. The claim and the usage rows are one
 * transaction (meter_batch), so a failed write leaves the batch unmetered
 * and the next full read of the results meters it again; two readers racing
 * to the end meter once between them.
 */
export async function meterBatch(
  a: Pick<DeviceAccount, "userId" | "deviceId">,
  id: string,
  rows: BatchRow[],
  o: { status: number; durationMs: number; requestId: string | null },
): Promise<void> {
  const { error } = await supabase().rpc("meter_batch", {
    p_user: a.userId,
    p_device: a.deviceId,
    p_batch: id,
    p_rows: rows.map((r) => ({ model: r.model, input: r.tokens.input, output: r.tokens.output, cacheWrite: r.tokens.cacheWrite, cacheRead: r.tokens.cacheRead, costMicros: r.costMicros })),
    p_status: o.status,
    p_duration_ms: Math.max(0, Math.round(o.durationMs)),
    p_request_id: o.requestId?.slice(0, 120) ?? null,
  });
  if (error) console.error("meter_batch failed", error.code);
}

/**
 * After a delete at Anthropic: a batch not yet metered is charged its worst
 * case, since its results can no longer be read, then its row goes, so the
 * caller's list stops naming it. The row stays when the charge failed, so
 * the reservation keeps counting rather than vanishing.
 */
export async function forgetBatch(userId: string, id: string): Promise<void> {
  const { error } = await supabase().rpc("charge_unmetered_batch", { p_user: userId, p_batch: id });
  if (error) {
    console.error("charge_unmetered_batch failed", error.code);
    return;
  }
  const { error: gone } = await supabase().from("ai_batches").delete().eq("id", id).eq("user_id", userId);
  if (gone) console.error("deleted batch row kept", gone.code);
}
