import "server-only";

import { contributes, effectiveAccess } from "@/lib/org/access";
import { supabase } from "@/lib/supabase";

import { orgIndexPath, orgMemberPartPath, userIndexPath, type MemoryIndex } from "./index-types";
import { memberPart } from "./org-cut";
import { mergeParts, type MemberPart } from "./org-merge";
import { getJson, listFolder, putJson, removePaths } from "./storage";

/**
 * The organization's shared knowledge graph on the server (docs/accounts.md
 * 14.2). Each contributing member's part sits at
 * `org/<org id>/members/<user id>.json`; the merged graph at
 * `org/<org id>/index.json`, with its counts in `org_memory` and the
 * organization's totals set by `set_org_memory_totals`.
 *
 * The signatures are stable; the dashboard calls them too:
 *   writeMemberPart(orgId, userId, index)  cut and store one member's part
 *   removeMemberPart(orgId, userId)        drop one member's part
 *   rebuildOrgIndex(orgId)                 merge the parts into the graph
 *   refreshMemberPart(orgId, userId)       decide from the member's row, write or remove, then rebuild
 *   refreshOrgParts(orgId)                 re-cut every member's part (after shared sections change), then rebuild
 * Leave, remove and the share switch: change the row first, then call
 * refreshMemberPart, which removes the part of anyone no longer contributing.
 */

interface OrgRow {
  shared_sections: string[] | null;
  default_access: unknown;
}

interface MemberRow {
  user_id: string;
  access: unknown;
  share_memory: boolean;
}

async function readOrg(orgId: string): Promise<OrgRow | null> {
  const { data } = await supabase().from("organizations").select("shared_sections, default_access").eq("id", orgId).maybeSingle<OrgRow>();
  return data;
}

async function readMembers(orgId: string): Promise<MemberRow[]> {
  const { data, error } = await supabase().from("org_members").select("user_id, access, share_memory").eq("org_id", orgId);
  if (error) throw new Error(`org_members read failed: ${error.code}`);
  return (data ?? []) as MemberRow[];
}

const memberContributes = (m: MemberRow, org: OrgRow) => contributes(m.share_memory, effectiveAccess(m.access, org.default_access));

/** Cuts the member's index to the shared sections, drops every sensitive memory, and stores it. */
export async function writeMemberPart(orgId: string, userId: string, index: MemoryIndex): Promise<void> {
  const org = await readOrg(orgId);
  if (!org) return;
  await putJson(orgMemberPartPath(orgId, userId), memberPart(index, org.shared_sections ?? []));
}

export async function removeMemberPart(orgId: string, userId: string): Promise<void> {
  await removePaths([orgMemberPartPath(orgId, userId)]);
}

/**
 * Merges the parts of the members who contribute now. A part left by
 * someone who no longer does (they left, were removed or turned sharing
 * off) is deleted here, so the graph heals even if a removal was missed.
 */
export async function rebuildOrgIndex(orgId: string): Promise<void> {
  const db = supabase();
  const org = await readOrg(orgId);
  if (!org) return;
  const members = await readMembers(orgId);
  const live = new Set(members.filter((m) => memberContributes(m, org)).map((m) => m.user_id));
  const stored = await listFolder(`org/${orgId}/members`);
  const stale = stored.filter((name) => !live.has(name.replace(/\.json$/, "")));
  await removePaths(stale.map((name) => `org/${orgId}/members/${name}`));

  const parts: MemberPart[] = [];
  await Promise.all(
    [...live].map(async (userId) => {
      const index = await getJson<MemoryIndex>(orgMemberPartPath(orgId, userId));
      if (index && index.v === 1) parts.push({ userId, index });
    }),
  );

  const shared = org.shared_sections ?? [];
  let row: Record<string, unknown>;
  if (parts.length === 0) {
    await removePaths([orgIndexPath(orgId)]);
    row = { index_path: null, index_bytes: 0, entities: 0, facts: 0, relations: 0, sources: 0, contributors: 0 };
  } else {
    const merged = mergeParts(parts, shared);
    const bytes = await putJson(orgIndexPath(orgId), merged);
    row = {
      index_path: orgIndexPath(orgId),
      index_bytes: bytes,
      entities: merged.entities.length,
      facts: merged.facts.length,
      relations: merged.relations.length,
      sources: merged.sources.length,
      contributors: parts.length,
    };
  }
  const { error } = await db.from("org_memory").upsert({ org_id: orgId, ...row, updated_at: new Date().toISOString() }, { onConflict: "org_id" });
  if (error) console.error("org_memory write failed", error.code);
  const totals = await db.rpc("set_org_memory_totals", { p_org: orgId });
  if (totals.error) console.error("set_org_memory_totals failed", totals.error.code);
}

/** Writes or removes one member's part from their row and stored index, then merges. */
export async function refreshMemberPart(orgId: string, userId: string): Promise<void> {
  const org = await readOrg(orgId);
  if (!org) return;
  const { data: member } = await supabase()
    .from("org_members")
    .select("user_id, access, share_memory")
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .maybeSingle<MemberRow>();
  const index = member && memberContributes(member, org) ? await getJson<MemoryIndex>(userIndexPath(userId)) : null;
  if (index) await writeMemberPart(orgId, userId, index);
  else await removeMemberPart(orgId, userId);
  await rebuildOrgIndex(orgId);
}

/** Re-cuts every contributing member's part from their own index, then merges once. */
export async function refreshOrgParts(orgId: string): Promise<void> {
  const org = await readOrg(orgId);
  if (!org) return;
  const members = await readMembers(orgId);
  await Promise.all(
    members.map(async (m) => {
      const index = memberContributes(m, org) ? await getJson<MemoryIndex>(userIndexPath(m.user_id)) : null;
      if (index) await writeMemberPart(orgId, m.user_id, index);
      else await removeMemberPart(orgId, m.user_id);
    }),
  );
  await rebuildOrgIndex(orgId);
}

/** The merged graph, or null when there is none yet. */
export async function readOrgIndex(orgId: string): Promise<MemoryIndex | null> {
  return getJson<MemoryIndex>(orgIndexPath(orgId));
}
