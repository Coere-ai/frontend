import { effectiveAccess, parseAccess } from "@/lib/org/access";
import { parseRole } from "@/lib/org/roles";

import { num } from "./totals";
import type { OrgMemberRow, OrgRow } from "./types";

/**
 * The organization tables, put together from rows the loaders read apart.
 * Pure, so the tests pin how a missing totals row and a member with no
 * own access read.
 */

export interface OrgDbRow {
  id: string;
  name: string;
  slug: string;
  plan_id: string;
  created_at: string;
}

export interface OrgTotalsRow {
  org_id: string;
  members?: unknown;
  tokens_saved?: unknown;
  memories?: unknown;
  chats?: unknown;
  cost_micros?: unknown;
}

export function joinOrgs(orgs: readonly OrgDbRow[], totals: readonly OrgTotalsRow[]): OrgRow[] {
  const byOrg = new Map(totals.map((t) => [t.org_id, t]));
  return orgs.map((o) => {
    const t = byOrg.get(o.id);
    return {
      id: o.id,
      name: o.name,
      slug: o.slug,
      plan: o.plan_id,
      members: num(t?.members),
      tokensSaved: num(t?.tokens_saved),
      memories: num(t?.memories),
      chats: num(t?.chats),
      costMicros: num(t?.cost_micros),
      createdAt: o.created_at,
    };
  });
}

export interface MemberDbRow {
  user_id: string;
  role: string;
  access: unknown;
  share_memory: boolean;
  added_by: string;
  joined_at: string;
  profile: { display_name?: string | null; username?: string | null; email?: string | null } | null;
  totals: { tokens_saved?: unknown; memories?: unknown; cost_micros?: unknown } | null;
}

/** Admins first, then by name, so the people who run it head the list. */
export function toMemberRows(rows: readonly MemberDbRow[], defaultAccess: unknown): OrgMemberRow[] {
  return rows
    .map((m) => ({
      userId: m.user_id,
      name: m.profile?.display_name || m.profile?.username || m.profile?.email || "An account",
      email: m.profile?.email ?? null,
      role: parseRole(m.role) ?? "member",
      access: parseAccess(m.access),
      effective: effectiveAccess(m.access, defaultAccess),
      shareMemory: m.share_memory,
      addedBy: m.added_by,
      joinedAt: m.joined_at,
      tokensSaved: num(m.totals?.tokens_saved),
      memories: num(m.totals?.memories),
      costMicros: num(m.totals?.cost_micros),
    }))
    .sort((a, b) => (a.role === b.role ? a.name.localeCompare(b.name) : a.role === "admin" ? -1 : 1));
}
