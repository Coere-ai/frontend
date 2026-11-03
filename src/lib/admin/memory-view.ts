import "server-only";

import { userIndexPath, type MemoryIndex } from "@/lib/memory/index-types";
import { readOrgIndex } from "@/lib/memory/org-index";
import { getJson } from "@/lib/memory/storage";
import { toView } from "@/lib/memory/view";
import { logSecurityEvent } from "@/lib/security/events";
import { supabase } from "@/lib/supabase";

import type { MemoryPayload } from "./types";

/**
 * A person's or an organization's knowledge graph for the operator, read
 * through the secret key (docs/accounts.md 9). Every read writes an
 * admin_viewed_memory event naming whose graph it was, before the graph
 * leaves the server, so no view goes unrecorded.
 */

/** Display name, then username, then email: what the operator knows a person by. */
export const personName = (p: { display_name?: string | null; username?: string | null; email?: string | null }): string =>
  p.display_name || p.username || p.email || "An account";

export async function loadUserMemory(userId: string, headers: Headers): Promise<MemoryPayload | null> {
  const { data: profile } = await supabase().from("profiles").select("display_name, username, email").eq("id", userId).maybeSingle();
  if (!profile) return null;
  await logSecurityEvent("admin_viewed_memory", { userId, headers });
  const index = await getJson<MemoryIndex>(userIndexPath(userId));
  return { center: personName(profile), names: {}, view: index && index.v === 1 ? toView(index) : null };
}

export async function loadOrgMemory(orgId: string, headers: Headers): Promise<MemoryPayload | null> {
  const db = supabase();
  const { data: org } = await db.from("organizations").select("name").eq("id", orgId).maybeSingle<{ name: string }>();
  if (!org) return null;
  await logSecurityEvent("admin_viewed_memory", { orgId, headers });
  const index = await readOrgIndex(orgId);
  const view = index && index.v === 1 ? toView(index) : null;

  const contributors = [...new Set((view?.facts ?? []).map((f) => f.contributor).filter((c): c is string => !!c))];
  const names: Record<string, string> = {};
  if (contributors.length) {
    const { data: people } = await db.from("profiles").select("id, display_name, username, email").in("id", contributors.slice(0, 1000));
    for (const p of people ?? []) names[p.id as string] = personName(p);
  }
  return { center: org.name, names, view };
}
