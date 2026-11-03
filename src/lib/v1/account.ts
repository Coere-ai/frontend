import "server-only";

import { supabase } from "@/lib/supabase";

import { accountBody, monthKey, type AccountRows } from "./account-body";
import type { DeviceAccount } from "./device-auth";

/**
 * Reads everything `GET /api/v1/account` answers, with the secret key and
 * every query scoped to the calling account's own id.
 */
export async function readAccount(a: DeviceAccount): Promise<ReturnType<typeof accountBody> | null> {
  const db = supabase();
  const month = monthKey();
  const [profile, plan, usage, memory, device, member, totals, settings] = await Promise.all([
    db.from("profiles").select("id, email, username, created_at, memory_sync, include_sensitive").eq("id", a.userId).maybeSingle(),
    db.from("plans").select("id, name, monthly_limit_micros, storage_limit_bytes").eq("id", a.planId).maybeSingle(),
    db.from("usage_monthly").select("requests, input_tokens, output_tokens, cost_micros").eq("user_id", a.userId).eq("month", month).maybeSingle(),
    db.from("memory_files").select("uploaded_at, bytes, digest").eq("user_id", a.userId).maybeSingle(),
    db.from("devices").select("id, name").eq("id", a.deviceId).eq("user_id", a.userId).maybeSingle(),
    db.from("org_members").select("role, organizations(id, name)").eq("user_id", a.userId).maybeSingle(),
    db.from("user_totals").select("tokens_saved, input_tokens, output_tokens, cost_micros, memories, chats").eq("user_id", a.userId).maybeSingle(),
    db.from("user_settings").select("version").eq("user_id", a.userId).maybeSingle(),
  ]);
  if (!profile.data || !device.data) return null;
  const orgRow = member.data as { role: string; organizations: { id: string; name: string } | { id: string; name: string }[] | null } | null;
  const org = Array.isArray(orgRow?.organizations) ? orgRow?.organizations[0] : orgRow?.organizations;
  const rows: AccountRows = {
    month,
    profile: profile.data as AccountRows["profile"],
    plan: plan.data as AccountRows["plan"],
    usage: usage.data as AccountRows["usage"],
    memory: memory.data as AccountRows["memory"],
    device: device.data as AccountRows["device"],
    org: org && orgRow ? { id: org.id, name: org.name, role: orgRow.role } : null,
    totals: totals.data as AccountRows["totals"],
    settingsVersion: (settings.data as { version: number | string } | null)?.version ?? null,
  };
  return accountBody(rows);
}
