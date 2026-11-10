import "server-only";

import { parseAccess, DEFAULT_ACCESS } from "@/lib/org/access";
import { sectionChoices } from "@/lib/org/sections";
import { supabase } from "@/lib/supabase";

import { personName } from "./memory-view";
import { joinOrgs, toMemberRows, type MemberDbRow, type OrgDbRow } from "./org-rows";
import { num, toTotals } from "./totals";
import type { OrgDetailPayload } from "./types";
import { readPlans } from "./users";

/**
 * One organization for /admin/organizations/<id>: its settings, totals,
 * members with their roles, access and totals, and its open invites. Null
 * when there is no such organization. Every query names this one org id,
 * and the members' totals only their user ids.
 */
export async function loadOrg(id: string): Promise<OrgDetailPayload | null> {
  const db = supabase();
  const { data: org, error } = await db.from("organizations").select("id, name, slug, plan_id, created_at, shared_sections, default_access").eq("id", id).maybeSingle();
  if (error) throw new Error(`organizations read failed: ${error.code}`);
  if (!org) return null;

  const [totals, members, invites, plans] = await Promise.all([
    db.from("org_totals").select("*").eq("org_id", id).maybeSingle(),
    db.from("org_members").select("user_id, role, access, share_memory, added_by, joined_at").eq("org_id", id),
    db
      .from("org_invites")
      .select("id, user_id, role, created_at, expires_at")
      .eq("org_id", id)
      .is("accepted_at", null)
      .is("declined_at", null)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString()),
    readPlans(),
  ]);
  for (const r of [totals, members, invites]) if (r.error) throw new Error(`organization read failed: ${r.error.code}`);

  const memberRows = (members.data ?? []) as Array<Omit<MemberDbRow, "profile" | "totals">>;
  const inviteRows = (invites.data ?? []) as Array<{ id: string; user_id: string; role: string; created_at: string; expires_at: string }>;
  const ids = memberRows.map((m) => m.user_id);
  const people = [...new Set([...ids, ...inviteRows.map((i) => i.user_id)])];
  const [profiles, userTotals] = await Promise.all([
    people.length ? db.from("profiles").select("id, display_name, username").in("id", people) : Promise.resolve({ data: [], error: null }),
    ids.length ? db.from("user_totals").select("user_id, tokens_saved, memories, cost_micros").in("user_id", ids) : Promise.resolve({ data: [], error: null }),
  ]);
  for (const r of [profiles, userTotals]) if (r.error) throw new Error(`member read failed: ${r.error.code}`);
  const profileOf = new Map((profiles.data ?? []).map((p) => [p.id as string, p as NonNullable<MemberDbRow["profile"]>]));
  const totalsOf = new Map((userTotals.data ?? []).map((t) => [t.user_id as string, t]));

  const shared = (org.shared_sections as string[] | null) ?? [];
  const defaultAccess = parseAccess(org.default_access) ?? DEFAULT_ACCESS;
  const [row] = joinOrgs([org as OrgDbRow], totals.data ? [{ org_id: id, ...totals.data }] : []);
  if (!row) return null;

  return {
    org: { ...row, sharedSections: shared, defaultAccess },
    totals: { ...toTotals(totals.data), members: num(totals.data?.members) },
    members: toMemberRows(
      memberRows.map((m) => ({ ...m, profile: profileOf.get(m.user_id) ?? null, totals: totalsOf.get(m.user_id) ?? null })),
      org.default_access,
    ),
    invites: inviteRows.map((i) => ({
      id: i.id,
      name: personName(profileOf.get(i.user_id) ?? {}),
      role: i.role,
      createdAt: i.created_at,
      expiresAt: i.expires_at,
    })),
    sections: sectionChoices(shared),
    plans,
  };
}
