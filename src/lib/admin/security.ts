import "server-only";

import { supabase } from "@/lib/supabase";

import { windowStart } from "./by-day";
import { readTableStats } from "./database";
import { personName } from "./memory-view";
import { readAll } from "./read-all";
import { summarizeSecurity, type SecurityEventRow } from "./security-summary";
import type { SecurityPayload } from "./types";

/**
 * /admin/security: the security log over the last `days` days, the tables
 * with Row Level Security off, and the operator's own recent memory views
 * with whose memory each was. The log holds no address, only its hash.
 */

const MAX_EVENTS = 200_000;
const RECENT_VIEWS = 50;

export async function loadSecurity(days: number): Promise<SecurityPayload> {
  const db = supabase();
  const [events, tables, views] = await Promise.all([
    readAll<SecurityEventRow>((a, b) => db.from("security_events").select("kind, created_at").gte("created_at", windowStart(days)).order("created_at").range(a, b), MAX_EVENTS),
    readTableStats(),
    db.from("security_events").select("user_id, org_id, created_at").eq("kind", "admin_viewed_memory").order("created_at", { ascending: false }).limit(RECENT_VIEWS),
  ]);
  if (views.error) throw new Error(`security_events read failed: ${views.error.code}`);

  const rows = (views.data ?? []) as Array<{ user_id: string | null; org_id: string | null; created_at: string }>;
  const userIds = [...new Set(rows.map((r) => r.user_id).filter((v): v is string => !!v))];
  const orgIds = [...new Set(rows.map((r) => r.org_id).filter((v): v is string => !!v))];
  const [people, orgs] = await Promise.all([
    userIds.length ? db.from("profiles").select("id, display_name, username").in("id", userIds) : Promise.resolve({ data: [] }),
    orgIds.length ? db.from("organizations").select("id, name").in("id", orgIds) : Promise.resolve({ data: [] }),
  ]);
  const person = new Map((people.data ?? []).map((p) => [p.id as string, p.username ?? personName(p)]));
  const org = new Map((orgs.data ?? []).map((o) => [o.id as string, o.name as string]));

  const { daily, counts } = summarizeSecurity(events, days);
  return {
    days,
    daily,
    counts,
    rlsOff: tables.filter((t) => !t.rls),
    memoryViews: rows.map((r) => ({
      at: r.created_at,
      label: r.org_id ? `Organization ${org.get(r.org_id) ?? "since deleted"}` : r.user_id ? (person.get(r.user_id) ?? "A deleted account") : "A deleted account or organization",
    })),
  };
}
