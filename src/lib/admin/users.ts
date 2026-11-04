import "server-only";

import { supabase } from "@/lib/supabase";

import { countByDay } from "./by-day";
import { readAll } from "./read-all";
import { STAT_DAYS } from "./statistics";
import type { UsersPayload } from "./types";
import { joinUsers, monthKey, toPlans, type ProfileRow } from "./user-rows";

/**
 * Every account for /admin/users, newest first, with what the table shows
 * beside each one. The panel draws at most MAX_USERS; past that it says the
 * list is cut, and the sign ups by day still count every account read.
 */
const MAX_USERS = 5000;

export const PROFILE_COLUMNS =
  "id, email, username, plan_id, status, created_at, last_seen_at, monthly_limit_micros, lifetime_limit_micros, daily_limit_micros, first_build_limit_micros, first_build_at";

export async function readPlans() {
  const { data, error } = await supabase()
    .from("plans")
    .select("id, name, monthly_limit_micros, lifetime_limit_micros, daily_limit_micros, first_build_limit_micros")
    .order("monthly_limit_micros");
  if (error) throw new Error(`plans read failed: ${error.code}`);
  return toPlans(data ?? []);
}

export async function loadUsers(): Promise<UsersPayload> {
  const db = supabase();
  const profiles = await readAll<ProfileRow>((a, b) => db.from("profiles").select(PROFILE_COLUMNS).order("created_at", { ascending: false }).range(a, b), MAX_USERS + 1);
  const [members, devices, month, totals, files, plans] = await Promise.all([
    readAll<{ user_id: string; org_id: string; role: string; organizations: { name: string } | { name: string }[] | null }>((a, b) =>
      db.from("org_members").select("user_id, org_id, role, organizations(name)").range(a, b),
    ),
    readAll<{ user_id: string }>((a, b) => db.from("devices").select("user_id").is("revoked_at", null).range(a, b), 200_000),
    readAll<{ user_id: string; requests: unknown; cost_micros: unknown }>((a, b) =>
      db.from("usage_monthly").select("user_id, requests, cost_micros").eq("month", monthKey()).range(a, b),
    ),
    readAll<{ user_id: string; tokens_saved: unknown; cost_micros: unknown }>((a, b) => db.from("user_totals").select("user_id, tokens_saved, cost_micros").range(a, b)),
    readAll<{ user_id: string; bytes: unknown }>((a, b) => db.from("memory_files").select("user_id, bytes").range(a, b)),
    readPlans(),
  ]);

  const shown = profiles.slice(0, MAX_USERS);
  return {
    rows: joinUsers(shown, {
      members: members.map((m) => {
        const org = Array.isArray(m.organizations) ? m.organizations[0] : m.organizations;
        return { user_id: m.user_id, org_id: m.org_id, role: m.role, org_name: org?.name ?? null };
      }),
      devices,
      month,
      totals,
      files,
    }),
    capped: profiles.length > MAX_USERS,
    signups: countByDay(
      profiles.map((p) => p.created_at),
      STAT_DAYS,
    ),
    plans,
  };
}
