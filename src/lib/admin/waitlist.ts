import "server-only";

import { supabase } from "@/lib/supabase";

import { countByDay } from "./by-day";
import { toCsv } from "./csv";
import { readAll } from "./read-all";
import { STAT_DAYS } from "./statistics";
import type { WaitlistPayload } from "./types";

/** The developer waitlist (docs/accounts.md 16), newest first. */

type Row = { email: string; source: string | null; created_at: string };

const readRows = () =>
  readAll<Row>((a, b) => supabase().from("developer_waitlist").select("email, source, created_at").order("created_at", { ascending: false }).range(a, b), 100_000);

export async function loadWaitlist(): Promise<WaitlistPayload> {
  const rows = await readRows();
  return {
    rows: rows.map((r) => ({ email: r.email, source: r.source, createdAt: r.created_at })),
    total: rows.length,
    byDay: countByDay(
      rows.map((r) => r.created_at),
      STAT_DAYS,
    ),
  };
}

/** The whole list as a CSV file: email, source, joined (UTC). */
export async function waitlistCsv(): Promise<string> {
  const rows = await readRows();
  return toCsv(
    ["email", "source", "joined_utc"],
    rows.map((r) => [r.email, r.source, r.created_at]),
  );
}
