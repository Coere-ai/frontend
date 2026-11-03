import "server-only";

import { supabase } from "@/lib/supabase";

import type { Audience } from "../types";
import { LEGACY_SECTION_COLUMNS, SECTION_COLUMNS, type SectionRow } from "./rows";

// Pulling rows out of Supabase.
//
// Every read pages through the table instead of trusting one response, and
// every failure carries Postgres's own code into the server log.

/** Supabase caps a single response; page through rather than silently truncate. */
const PAGE = 1000;
/** A hard ceiling so a runaway table can never exhaust the server's memory. */
const MAX_ROWS = 200_000;

type Table = "site_visits" | "site_events" | "site_section_views";

/** PostgREST returns code, details and hint alongside a message that is
 *  sometimes empty ("relation does not exist" arrives as a bare 42P01). */
function describe(
  where: string,
  error: { message?: string; code?: string; details?: string; hint?: string },
): Error {
  const parts = [error.code, error.message, error.details, error.hint].filter(
    (p) => p && String(p).trim(),
  );
  return new Error(`${where}: ${parts.join(" | ") || "unknown error"}`);
}

export async function fetchAll<T>(
  table: Table,
  columns: string,
  sinceIso: string,
  audience: Audience,
): Promise<T[]> {
  const db = supabase();
  const rows: T[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const base = db
      .from(table)
      .select(columns)
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: true })
      .range(from, from + PAGE - 1);

    // Only visits carry the bot flag; events and sections inherit their
    // visit's audience when the rollups join them back.
    const q =
      table === "site_visits" && audience !== "all"
        ? base.eq("is_bot", audience === "bot")
        : base;

    const { data, error } = await q;
    if (error) throw describe(table, error);
    const batch = (data ?? []) as unknown as T[];
    rows.push(...batch);
    if (batch.length < PAGE) break;
  }
  return rows;
}

/** True when an error means a table or column is not there yet. Code reaches
 *  production before a migration is applied, and a missing table must cost the
 *  dashboard its newest panel, not every number on the page. */
function isMissing(err: unknown, codes: string[]): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return codes.some((c) => message.includes(c));
}

/**
 * Section rows, degrading gracefully across two migrations.
 *
 * No table yet (42P01, or PGRST205 from PostgREST's cache): no sections.
 * Table without label and position (42703): read the old columns and leave
 * those two null, which the rollup already handles for old rows.
 */
export async function fetchSections(
  sinceIso: string,
  audience: Audience,
): Promise<SectionRow[]> {
  try {
    return await fetchAll<SectionRow>("site_section_views", SECTION_COLUMNS, sinceIso, audience);
  } catch (err) {
    if (isMissing(err, ["42P01", "PGRST205"])) {
      console.warn("[analytics] site_section_views is missing; skipping sections");
      return [];
    }
    if (!isMissing(err, ["42703", "PGRST204"])) throw err;
    console.warn("[analytics] section labels migration not applied; reading ids only");
    const rows = await fetchAll<Omit<SectionRow, "label" | "position">>(
      "site_section_views",
      LEGACY_SECTION_COLUMNS,
      sinceIso,
      audience,
    );
    return rows.map((r) => ({ ...r, label: null, position: null }));
  }
}

/**
 * Every view ever recorded in a scope, ignoring the day range.
 *
 * A HEAD request with an exact count: the headline is a lifetime number, so it
 * must not move when someone changes the range, and there is no reason to ship
 * the rows just to count them.
 */
export async function lifetimeViews(audience: Audience, path: string | null): Promise<number> {
  let q = supabase().from("site_visits").select("id", { count: "exact", head: true });
  if (audience !== "all") q = q.eq("is_bot", audience === "bot");
  if (path) q = q.eq("path", path);
  const { count, error } = await q;
  if (error) throw describe("site_visits count", error);
  return count ?? 0;
}
