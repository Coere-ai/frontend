import "server-only";

import { supabase } from "@/lib/supabase";

import { num, toTotals } from "./totals";
import type { UserDetailPayload } from "./types";
import { joinUsers, monthKey, type ProfileRow } from "./user-rows";
import { PROFILE_COLUMNS, readPlans } from "./users";

/**
 * One account for /admin/users/<id>: its row as the table shows it, its
 * running totals, this month, its memory file and every device. Null when
 * there is no such account. Every query names this one user id.
 */
export async function loadUser(id: string): Promise<UserDetailPayload | null> {
  const db = supabase();
  const { data: profile, error } = await db.from("profiles").select(`${PROFILE_COLUMNS}, display_name, memory_sync, include_sensitive`).eq("id", id).maybeSingle();
  if (error) throw new Error(`profiles read failed: ${error.code}`);
  if (!profile) return null;

  const [member, devices, month, totals, file, plans] = await Promise.all([
    db.from("org_members").select("user_id, org_id, role, organizations(name)").eq("user_id", id).maybeSingle(),
    db
      .from("devices")
      .select("id, name, token_hint, extension_version, created_at, last_used_at, revoked_at, revoked_reason")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(200),
    db.from("usage_monthly").select("user_id, requests, input_tokens, output_tokens, cost_micros").eq("user_id", id).eq("month", monthKey()).maybeSingle(),
    db.from("user_totals").select("*").eq("user_id", id).maybeSingle(),
    db.from("memory_files").select("user_id, bytes, memories, chats, uploaded_at").eq("user_id", id).maybeSingle(),
    readPlans(),
  ]);
  for (const r of [member, devices, month, totals, file]) if (r.error) throw new Error(`account read failed: ${r.error.code}`);

  const org = member.data ? (member.data.organizations as unknown as { name: string } | { name: string }[] | null) : null;
  const orgName = Array.isArray(org) ? (org[0]?.name ?? null) : (org?.name ?? null);
  const live = (devices.data ?? []).filter((d) => !d.revoked_at).map(() => ({ user_id: id }));
  const [row] = joinUsers([profile as unknown as ProfileRow], {
    members: member.data ? [{ user_id: id, org_id: member.data.org_id as string, role: member.data.role as string, org_name: orgName }] : [],
    devices: live,
    month: month.data ? [month.data as { user_id: string; requests: unknown; cost_micros: unknown }] : [],
    totals: totals.data ? [totals.data as { user_id: string; tokens_saved: unknown; cost_micros: unknown }] : [],
    files: file.data ? [file.data as { user_id: string; bytes: unknown }] : [],
  });
  if (!row) return null;

  return {
    user: {
      ...row,
      displayName: (profile.display_name as string | null) ?? null,
      memorySync: profile.memory_sync !== false,
      includeSensitive: profile.include_sensitive === true,
    },
    totals: toTotals(totals.data),
    month: {
      costMicros: num(month.data?.cost_micros),
      requests: num(month.data?.requests),
      inputTokens: num(month.data?.input_tokens),
      outputTokens: num(month.data?.output_tokens),
    },
    memory: file.data
      ? { bytes: num(file.data.bytes), memories: num(file.data.memories), chats: num(file.data.chats), uploadedAt: (file.data.uploaded_at as string | null) ?? null }
      : null,
    devices: (devices.data ?? []).map((d) => ({
      id: d.id as string,
      name: d.name as string,
      hint: d.token_hint as string,
      version: (d.extension_version as string | null) ?? null,
      createdAt: d.created_at as string,
      lastUsedAt: (d.last_used_at as string | null) ?? null,
      revokedAt: (d.revoked_at as string | null) ?? null,
      revokedReason: (d.revoked_reason as string | null) ?? null,
    })),
    plans,
  };
}
