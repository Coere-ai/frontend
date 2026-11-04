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

export async function storeBatch(a: DeviceAccount, id: string, requestCount: number): Promise<void> {
  const { error } = await supabase()
    .from("ai_batches")
    .upsert({ id, user_id: a.userId, device_id: a.deviceId, request_count: requestCount }, { onConflict: "id", ignoreDuplicates: true });
  if (error) console.error("batch not stored", error.code);
}

export async function ownsBatch(userId: string, id: string): Promise<boolean> {
  const { data, error } = await supabase().from("ai_batches").select("id").eq("id", id).eq("user_id", userId).maybeSingle();
  if (error) console.error("batch lookup failed", error.code);
  return Boolean(data);
}

/** Which of these batch ids are the caller's. */
export async function ownedBatchIds(userId: string, ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const { data, error } = await supabase().from("ai_batches").select("id").eq("user_id", userId).in("id", ids);
  if (error) console.error("batch lookup failed", error.code);
  return new Set((data ?? []).map((r: { id: string }) => r.id));
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
