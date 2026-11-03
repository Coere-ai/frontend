import "server-only";

import { supabase } from "@/lib/supabase";

import type { DeviceAccount } from "../device-auth";

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

/**
 * Marks the batch metered, and says whether this call was the one that did
 * it. The update only matches a row not yet metered, so two readers racing
 * to the end of the results meter once between them.
 */
export async function claimMetering(userId: string, id: string): Promise<boolean> {
  const { data, error } = await supabase()
    .from("ai_batches")
    .update({ metered_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .is("metered_at", null)
    .select("id")
    .maybeSingle();
  if (error) console.error("batch metering claim failed", error.code);
  return Boolean(data);
}
