import "server-only";

import { supabase } from "@/lib/supabase";

import { readAll } from "./read-all";
import { memoryBytes, readStorageUsage } from "./storage-usage";
import { dailySeries, num, sumDaily, topBy, type DailyTotalsRow } from "./totals";
import type { StatisticsPayload } from "./types";

/**
 * The Statistics page: the product's running totals (docs/accounts.md 15).
 * Flows come from daily_totals, which keeps a deleted account's numbers in
 * the days they happened. Memories and chats are levels, so they are the
 * sum of today's user_totals. Storage is the memory bucket's own size.
 */

/** About thirteen months, so the year view has every day of twelve calendar months. */
export const STAT_DAYS = 400;

export async function loadStatistics(): Promise<StatisticsPayload> {
  const db = supabase();
  const [daily, levels, accounts, orgs, storage, topUsers, topOrgs] = await Promise.all([
    readAll<DailyTotalsRow>((a, b) => db.from("daily_totals").select("*").order("day").range(a, b), 20_000),
    readAll<{ memories: unknown; chats: unknown }>((a, b) => db.from("user_totals").select("memories, chats").range(a, b), 200_000),
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("organizations").select("id", { count: "exact", head: true }),
    readStorageUsage(),
    db.from("user_totals").select("user_id, tokens_saved").order("tokens_saved", { ascending: false }).limit(10),
    db.from("org_totals").select("org_id, tokens_saved").order("tokens_saved", { ascending: false }).limit(10),
  ]);
  for (const r of [accounts, orgs, topUsers, topOrgs]) if (r.error) throw new Error(`statistics read failed: ${r.error.code}`);

  const userIds = (topUsers.data ?? []).map((r) => r.user_id as string);
  const orgIds = (topOrgs.data ?? []).map((r) => r.org_id as string);
  const [people, names] = await Promise.all([
    userIds.length ? db.from("profiles").select("id, email, username").in("id", userIds) : Promise.resolve({ data: [] as { id: string; email: string | null; username: string | null }[] }),
    orgIds.length ? db.from("organizations").select("id, name").in("id", orgIds) : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);
  const person = new Map((people.data ?? []).map((p) => [p.id as string, (p.email as string | null) ?? (p.username as string | null) ?? "An account"]));
  const orgName = new Map((names.data ?? []).map((o) => [o.id as string, o.name as string]));

  const flows = sumDaily(daily);
  return {
    totals: {
      accounts: accounts.count ?? 0,
      organizations: orgs.count ?? 0,
      costMicros: flows.costMicros,
      tokensUsed: flows.tokensUsed,
      tokensSaved: flows.tokensSaved,
      memories: levels.reduce((s, r) => s + num(r.memories), 0),
      chats: levels.reduce((s, r) => s + num(r.chats), 0),
      contextImports: flows.contextImports,
      transfers: flows.transfers,
      storageBytes: memoryBytes(storage),
      requests: flows.requests,
    },
    daily: dailySeries(daily, STAT_DAYS),
    topAccounts: topBy(
      (topUsers.data ?? []).map((r) => ({ id: r.user_id as string, name: person.get(r.user_id as string) ?? "A deleted account", tokensSaved: num(r.tokens_saved) })),
      (r) => r.tokensSaved,
    ),
    topOrgs: topBy(
      (topOrgs.data ?? []).map((r) => ({ id: r.org_id as string, name: orgName.get(r.org_id as string) ?? "An organization", tokensSaved: num(r.tokens_saved) })),
      (r) => r.tokensSaved,
    ),
  };
}
