import { num } from "./totals";
import type { PlanRow, UserRow } from "./types";

/**
 * The Users table, put together from the rows of six tables the loader
 * reads apart (PostgREST cannot join tables that share only a user id).
 * Pure, so the tests pin how each column is filled and what a missing row
 * reads as.
 */

export interface ProfileRow {
  id: string;
  email: string | null;
  username: string | null;
  plan_id: string;
  status: string;
  created_at: string;
  last_seen_at: string | null;
  monthly_limit_micros?: number | string | null;
  lifetime_limit_micros?: number | string | null;
}

export interface UserParts {
  members: { user_id: string; org_id: string; role: string; org_name: string | null }[];
  /** One entry per live device; revoked ones are left out by the query. */
  devices: { user_id: string }[];
  month: { user_id: string; requests: unknown; cost_micros: unknown }[];
  totals: { user_id: string; tokens_saved: unknown; cost_micros: unknown }[];
  files: { user_id: string; bytes: unknown }[];
}

/** A nullable bigint column: null stays null, anything else is a number. */
export const numOrNull = (v: unknown): number | null => (v === null || v === undefined || v === "" ? null : num(v));

export function joinUsers(profiles: readonly ProfileRow[], parts: UserParts): UserRow[] {
  const byUser = <T extends { user_id: string }>(rows: readonly T[]) => new Map(rows.map((r) => [r.user_id, r]));
  const members = byUser(parts.members);
  const month = byUser(parts.month);
  const totals = byUser(parts.totals);
  const files = byUser(parts.files);
  const devices = new Map<string, number>();
  for (const d of parts.devices) devices.set(d.user_id, (devices.get(d.user_id) ?? 0) + 1);

  return profiles.map((p) => {
    const m = members.get(p.id);
    return {
      id: p.id,
      email: p.email,
      username: p.username,
      plan: p.plan_id,
      status: p.status,
      org: m ? { id: m.org_id, name: m.org_name ?? "An organization", role: m.role } : null,
      createdAt: p.created_at,
      lastSeenAt: p.last_seen_at,
      devices: devices.get(p.id) ?? 0,
      monthCostMicros: num(month.get(p.id)?.cost_micros),
      monthRequests: num(month.get(p.id)?.requests),
      lifetimeCostMicros: num(totals.get(p.id)?.cost_micros),
      monthlyLimitMicros: numOrNull(p.monthly_limit_micros),
      lifetimeLimitMicros: numOrNull(p.lifetime_limit_micros),
      tokensSaved: num(totals.get(p.id)?.tokens_saved),
      memoryBytes: num(files.get(p.id)?.bytes),
    };
  });
}

/** The plans table as the forms show it. */
export function toPlans(rows: readonly { id: string; name: string; monthly_limit_micros: unknown; lifetime_limit_micros?: unknown }[]): PlanRow[] {
  return rows.map((r) => ({ id: r.id, name: r.name, monthlyLimitMicros: num(r.monthly_limit_micros), lifetimeLimitMicros: numOrNull(r.lifetime_limit_micros) }));
}

/** The first day of this month in UTC, as usage_monthly keys it. */
export function monthKey(now: number = Date.now()): string {
  const d = new Date(now);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString().slice(0, 10);
}
