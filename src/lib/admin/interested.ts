import "server-only";

import { supabase } from "@/lib/supabase";

import { countByDay } from "./by-day";
import { allCsv, INTEREST_LISTS, listCsv, type InterestList, type InterestRow } from "./interest-lists";
import { readAll } from "./read-all";
import { STAT_DAYS } from "./statistics";
import type { InterestedPayload } from "./types";

/**
 * Who is interested (docs/accounts.md 9 and 16): the developer waitlist,
 * and product_interest for Coere Connect and Coere for Teams, newest first.
 */

type Row = { email: string; source: string | null; created_at: string };

const MAX = 100_000;

function readRows(list: InterestList): Promise<InterestRow[]> {
  const read =
    list === "developers"
      ? readAll<Row>((a, b) => supabase().from("developer_waitlist").select("email, source, created_at").order("created_at", { ascending: false }).range(a, b), MAX)
      : readAll<Row>((a, b) => supabase().from("product_interest").select("email, source, created_at").eq("product", list).order("created_at", { ascending: false }).range(a, b), MAX);
  return read.then((rows) => rows.map((r) => ({ email: r.email, source: r.source, createdAt: r.created_at })));
}

async function countOf(list: InterestList): Promise<number> {
  const query =
    list === "developers"
      ? supabase().from("developer_waitlist").select("id", { count: "exact", head: true })
      : supabase().from("product_interest").select("id", { count: "exact", head: true }).eq("product", list);
  const { count, error } = await query;
  if (error) throw new Error(`count failed: ${error.code ?? "unknown"}`);
  return count ?? 0;
}

export async function loadInterested(list: InterestList): Promise<InterestedPayload> {
  const [rows, ...counts] = await Promise.all([readRows(list), ...INTEREST_LISTS.map(countOf)]);
  return {
    list,
    rows,
    total: rows.length,
    byDay: countByDay(
      rows.map((r) => r.createdAt),
      STAT_DAYS,
    ),
    counts: Object.fromEntries(INTEREST_LISTS.map((l, i) => [l, counts[i] ?? 0])) as Record<InterestList, number>,
  };
}

/** One list, or every list with a product column, as a CSV file. */
export async function interestedCsv(list: InterestList | "all"): Promise<string> {
  if (list !== "all") return listCsv(await readRows(list));
  const [developers, connect, teams] = await Promise.all(INTEREST_LISTS.map(readRows));
  return allCsv({ developers: developers ?? [], connect: connect ?? [], teams: teams ?? [] });
}
