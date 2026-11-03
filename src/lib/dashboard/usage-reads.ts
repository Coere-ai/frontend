import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { UsageRow } from "./usage";

/** Supabase answers at most 1,000 rows a request, so the rows come a page at a time. */
const PAGE = 1000;
/** Enough for a heavy month; past it the charts show what was read. */
const MOST_PAGES = 30;

/**
 * The person's usage rows since a moment, newest first, read through their
 * own session so Row Level Security keeps them to their own rows.
 */
export async function readUsageEvents(db: SupabaseClient, userId: string, since: string): Promise<UsageRow[]> {
  const out: UsageRow[] = [];
  for (let page = 0; page < MOST_PAGES; page++) {
    const { data, error } = await db
      .from("usage_events")
      .select("created_at, model, kind, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, cost_micros")
      .eq("user_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(page * PAGE, page * PAGE + PAGE - 1);
    if (error || !data) break;
    out.push(...(data as UsageRow[]));
    if (data.length < PAGE) break;
  }
  return out;
}
