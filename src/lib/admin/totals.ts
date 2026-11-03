import { dayKeys } from "./by-day";

/**
 * The product's running totals (docs/accounts.md 15) as the Statistics page
 * reads them: daily_totals rows turned into a zero filled series and added
 * up into lifetime figures. Tokens used are input plus output; cache tokens
 * are counted apart, as the contract says. Pure.
 */

/** One daily_totals row as Supabase answers it. bigint columns may arrive as strings. */
export interface DailyTotalsRow {
  day: string;
  new_users?: number | string | null;
  new_orgs?: number | string | null;
  requests?: number | string | null;
  input_tokens?: number | string | null;
  output_tokens?: number | string | null;
  cost_micros?: number | string | null;
  tokens_saved?: number | string | null;
  context_imports?: number | string | null;
  transfers?: number | string | null;
}

export interface DayTotals {
  date: string;
  newUsers: number;
  newOrgs: number;
  requests: number;
  tokensUsed: number;
  costMicros: number;
  tokensSaved: number;
  contextImports: number;
  transfers: number;
}

export type FlowKey = Exclude<keyof DayTotals, "date">;

export const num = (v: unknown): number => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

function fromRow(date: string, r: DailyTotalsRow | undefined): DayTotals {
  return {
    date,
    newUsers: num(r?.new_users),
    newOrgs: num(r?.new_orgs),
    requests: num(r?.requests),
    tokensUsed: num(r?.input_tokens) + num(r?.output_tokens),
    costMicros: num(r?.cost_micros),
    tokensSaved: num(r?.tokens_saved),
    contextImports: num(r?.context_imports),
    transfers: num(r?.transfers),
  };
}

/** The last `days` days, one entry each, oldest first. A day with no row reads zero. */
export function dailySeries(rows: readonly DailyTotalsRow[], days: number, now: number = Date.now()): DayTotals[] {
  const byDay = new Map(rows.map((r) => [String(r.day).slice(0, 10), r]));
  return dayKeys(days, now).map((d) => fromRow(d, byDay.get(d)));
}

/** Every row added up: the product's lifetime flows, deleted accounts included. */
export function sumDaily(rows: readonly DailyTotalsRow[]): Omit<DayTotals, "date"> {
  const total = fromRow("", undefined);
  for (const r of rows) {
    const d = fromRow("", r);
    for (const k of Object.keys(d) as Array<keyof DayTotals>) if (k !== "date") total[k] += d[k];
  }
  const { date: _date, ...flows } = total;
  void _date;
  return flows;
}

/** The `n` rows with the largest value, largest first, ties by name so the order is stable. */
export function topBy<T extends { name: string }>(rows: readonly T[], value: (r: T) => number, n = 10): T[] {
  return [...rows].filter((r) => value(r) > 0).sort((a, b) => value(b) - value(a) || a.name.localeCompare(b.name)).slice(0, n);
}
