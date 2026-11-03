import "server-only";

import { supabase } from "@/lib/supabase";

import type { DeviceAccount } from "./device-auth";
import type { TokenCounts } from "./prices";

/**
 * Metering: one `record_usage` call per metered answer (docs/accounts.md
 * 8.4, 10), which logs the row and adds it to this month's spend and the
 * running totals in one statement. A failure is logged by its code and never
 * fails the answer the person already has.
 */

export type UsageKind = "message" | "count_tokens" | "batch_result" | "jev";

export interface UsageRow {
  kind: UsageKind;
  model: string | null;
  tokens: TokenCounts;
  costMicros: number;
  status: number;
  durationMs: number;
  requestId: string | null;
}

export async function recordUsage(account: Pick<DeviceAccount, "userId" | "deviceId">, row: UsageRow): Promise<void> {
  try {
    const { error } = await supabase().rpc("record_usage", {
      p_user: account.userId,
      p_device: account.deviceId,
      p_kind: row.kind,
      p_model: row.model,
      p_input: row.tokens.input,
      p_output: row.tokens.output,
      p_cache_write: row.tokens.cacheWrite,
      p_cache_read: row.tokens.cacheRead,
      p_cost_micros: row.costMicros,
      p_status: row.status,
      p_duration_ms: Math.max(0, Math.round(row.durationMs)),
      p_request_id: row.requestId?.slice(0, 120) ?? null,
    });
    if (error) console.error("record_usage failed", error.code);
  } catch {
    console.error("record_usage failed");
  }
}

export const NO_TOKENS: TokenCounts = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
