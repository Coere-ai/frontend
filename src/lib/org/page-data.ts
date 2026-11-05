import "server-only";

import { readOrgIndex } from "@/lib/memory/org-index";
import { supabase } from "@/lib/supabase";

import { effectiveAccess, parseAccess, type OrgAccess } from "./access";
import type { Membership } from "./membership";
import { parseRole, type Role } from "./roles";
import { sectionChoices } from "./sections";

/**
 * Everything the Console's Organization section shows a member
 * (GET /api/v1/org/page), read with the secret key for the organization
 * the person belongs to (found from their own membership first), so
 * nothing reaches another organization. The graph itself comes from
 * GET /api/v1/org/index, cut to the sections this person may read; here the
 * index is read only to count what each member brought.
 */

export interface OrgMember {
  userId: string;
  name: string;
  email: string | null;
  role: Role;
  /** Their own access object, or null when the organization's default applies. */
  access: OrgAccess | null;
  effective: OrgAccess;
  shareMemory: boolean;
  joinedAt: string;
  tokensSaved: number;
  memoriesShared: number;
}

export interface OrgInvite {
  id: string;
  name: string;
  role: Role;
  createdAt: string;
  expiresAt: string;
}

export interface OrgPageData {
  id: string;
  name: string;
  plan: string;
  sharedSections: string[];
  defaultAccess: OrgAccess;
  totals: { tokensSaved: number; memories: number; chats: number; members: number; costMicros: number; monthCostMicros: number };
  members: OrgMember[];
  invites: OrgInvite[];
  /** Every section an admin may share: the base ones, then any the graph or the settings name. */
  sections: Array<{ key: string; name: string }>;
}

const n = (v: unknown): number => Number(v ?? 0) || 0;

/** The first day of this month in UTC, as usage_monthly keys months. */
const thisMonth = (now = new Date()): string => `${now.toISOString().slice(0, 7)}-01`;

/** A person as the page names them: their display name, else username, else email. */
export const nameOf = (p: { display_name?: string | null; username?: string | null; email?: string | null } | undefined): string =>
  p?.display_name || p?.username || p?.email || "A member";

export async function readOrgPage(m: Membership): Promise<OrgPageData | null> {
  const db = supabase();
  const [{ data: org }, { data: totals }, { data: rows }] = await Promise.all([
    db.from("organizations").select("id, name, plan_id, shared_sections, default_access").eq("id", m.orgId).maybeSingle(),
    db.from("org_totals").select("tokens_saved, memories, chats, members, cost_micros").eq("org_id", m.orgId).maybeSingle(),
    db.from("org_members").select("user_id, role, access, share_memory, joined_at").eq("org_id", m.orgId).order("joined_at"),
  ]);
  if (!org) return null;
  const ids = (rows ?? []).map((r) => r.user_id as string);
  const [{ data: profiles }, { data: userTotals }, { data: months }, index] = await Promise.all([
    db.from("profiles").select("id, email, username, display_name").in("id", ids),
    db.from("user_totals").select("user_id, tokens_saved").in("user_id", ids),
    db.from("usage_monthly").select("cost_micros").in("user_id", ids).eq("month", thisMonth()),
    readOrgIndex(m.orgId),
  ]);
  const profile = new Map((profiles ?? []).map((p) => [p.id as string, p]));
  const saved = new Map((userTotals ?? []).map((t) => [t.user_id as string, n(t.tokens_saved)]));
  const brought = new Map<string, number>();
  for (const f of index?.facts ?? []) if (f.contributor) brought.set(f.contributor, (brought.get(f.contributor) ?? 0) + 1);

  const members: OrgMember[] = (rows ?? []).map((r) => ({
    userId: r.user_id,
    name: nameOf(profile.get(r.user_id)),
    email: m.role === "admin" ? (profile.get(r.user_id)?.email ?? null) : null,
    role: parseRole(r.role) ?? "member",
    access: parseAccess(r.access),
    effective: effectiveAccess(r.access, org.default_access),
    shareMemory: r.share_memory,
    joinedAt: r.joined_at,
    tokensSaved: saved.get(r.user_id) ?? 0,
    memoriesShared: brought.get(r.user_id) ?? 0,
  }));

  let invites: OrgInvite[] = [];
  if (m.role === "admin") {
    const { data } = await db
      .from("org_invites")
      .select("id, user_id, role, created_at, expires_at")
      .eq("org_id", m.orgId)
      .is("accepted_at", null)
      .is("declined_at", null)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    const invited = (data ?? []).map((i) => i.user_id as string);
    const { data: people } = invited.length ? await db.from("profiles").select("id, email, username, display_name").in("id", invited) : { data: [] };
    const who = new Map((people ?? []).map((p) => [p.id as string, p]));
    invites = (data ?? []).map((i) => ({ id: i.id, name: who.get(i.user_id)?.email ?? nameOf(who.get(i.user_id)), role: parseRole(i.role) ?? "member", createdAt: i.created_at, expiresAt: i.expires_at }));
  }

  return {
    id: org.id,
    name: org.name,
    plan: org.plan_id,
    sharedSections: org.shared_sections ?? [],
    defaultAccess: effectiveAccess(null, org.default_access),
    totals: {
      tokensSaved: n(totals?.tokens_saved),
      memories: n(totals?.memories),
      chats: n(totals?.chats),
      members: n(totals?.members) || members.length,
      costMicros: n(totals?.cost_micros),
      monthCostMicros: (months ?? []).reduce((s, r) => s + n(r.cost_micros), 0),
    },
    members,
    invites,
    sections: sectionChoices(index?.sections ?? [], org.shared_sections ?? []),
  };
}
