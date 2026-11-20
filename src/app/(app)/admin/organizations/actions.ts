"use server";

import { headers } from "next/headers";

import { adminAction, check, done, refused, type AdminResult } from "@/lib/admin/action";
import { findAccount } from "@/lib/admin/find-account";
import { isUuid } from "@/lib/admin/http";
import { ORG_REFUSAL_WORDS, orgDbRefusal } from "@/lib/admin/org-errors";
import { orgIndexPath } from "@/lib/memory/index-types";
import { refreshMemberPart, refreshOrgParts } from "@/lib/memory/org-index";
import { listFolder, removePaths } from "@/lib/memory/storage";
import { cleanAccess, cleanOrgName, cleanSections } from "@/lib/org/roles";
import { slugify, uniqueSlug } from "@/lib/org/slug";
import { logSecurityEvent } from "@/lib/security/events";
import { supabase } from "@/lib/supabase";

/**
 * Making, changing and deleting organizations. Only the operator makes
 * one (docs/accounts.md 14.1), so these live here and nowhere on the
 * dashboard. Each re-checks the admin session.
 */

const GONE = "That organization is gone. Reload the page.";

async function planExists(plan: string): Promise<boolean> {
  if (!/^[a-z0-9_-]{1,40}$/.test(plan)) return false;
  const { data } = await supabase().from("plans").select("id").eq("id", plan).maybeSingle();
  return !!data;
}

/** A free slug for the name: the slugs that start the same way are read and stepped past. */
async function freeSlug(name: string): Promise<string> {
  const { data, error } = await supabase().from("organizations").select("slug").like("slug", `${slugify(name)}%`).limit(1000);
  check(error, "organizations slug read");
  return uniqueSlug(name, (data ?? []).map((r) => r.slug as string));
}

/** Name, plan (team by default) and the first admin, an existing account. */
export async function createOrganization(form: FormData): Promise<AdminResult> {
  return adminAction("createOrganization", async () => {
    const name = cleanOrgName(form.get("name"));
    if (!name) return refused("Give the organization a name of up to 80 characters.");
    const plan = String(form.get("plan") || "team");
    if (!(await planExists(plan))) return refused("That plan does not exist.");
    const admin = await findAccount(form.get("admin"));
    if (!admin.ok) return refused(admin.error);

    const db = supabase();
    // A slug taken between the read and the insert gets one more try.
    for (let attempt = 0; attempt < 2; attempt++) {
      const { data: orgId, error } = await db.rpc("create_organization", { p_name: name, p_slug: await freeSlug(name), p_admin: admin.id, p_plan: plan });
      const refusal = orgDbRefusal(error);
      if (refusal === "slug_taken" && attempt === 0) continue;
      if (refusal && refusal !== "unknown") return refused(ORG_REFUSAL_WORDS[refusal]);
      check(error, "create_organization");
      const id = String(orgId);
      await logSecurityEvent("org_created", { userId: admin.id, orgId: id, headers: await headers() });
      await refreshMemberPart(id, admin.id).catch(() => console.error("organization graph not built"));
      return { ok: true, notice: `Made ${name} with ${admin.name} as its admin.`, id };
    }
    return refused(ORG_REFUSAL_WORDS.slug_taken);
  });
}

/** Name, plan, shared sections and default access. A change to what is shared re-cuts every member's part. */
export async function saveOrgSettings(orgId: string, input: { name: unknown; plan: unknown; sections: unknown; defaultAccess: unknown }): Promise<AdminResult> {
  return adminAction("saveOrgSettings", async () => {
    if (!isUuid(orgId)) return refused(GONE);
    const name = cleanOrgName(input.name);
    if (!name) return refused("Give the organization a name of up to 80 characters.");
    const plan = String(input.plan ?? "");
    if (!(await planExists(plan))) return refused("That plan does not exist.");
    const sections = cleanSections(input.sections);
    if (!sections || sections.length === 0) return refused("Share at least one section.");
    const access = cleanAccess(input.defaultAccess, sections);
    if (!access) return refused("That default access is not one the organization can hold.");

    const db = supabase();
    const { data: before } = await db.from("organizations").select("shared_sections, default_access").eq("id", orgId).maybeSingle();
    if (!before) return refused(GONE);
    const { error } = await db
      .from("organizations")
      .update({ name, plan_id: plan, shared_sections: sections, default_access: access, updated_at: new Date().toISOString() })
      .eq("id", orgId);
    check(error, "organizations update");
    const reshare = JSON.stringify(before.shared_sections) !== JSON.stringify(sections) || JSON.stringify(before.default_access) !== JSON.stringify(access);
    if (reshare) await refreshOrgParts(orgId).catch(() => console.error("organization graph not rebuilt"));
    return done(reshare ? "Saved. The shared graph was built again from these settings." : "Saved.");
  });
}

/**
 * Deletes the organization: its org/ folder in Storage first, then the
 * row, which takes its members, invites, graph counts and totals with it.
 * Members keep their own accounts and memory.
 */
export async function deleteOrganization(orgId: string): Promise<AdminResult> {
  return adminAction("deleteOrganization", async () => {
    if (!isUuid(orgId)) return refused(GONE);
    const db = supabase();
    const { data: org } = await db.from("organizations").select("name").eq("id", orgId).maybeSingle<{ name: string }>();
    if (!org) return refused(GONE);
    const parts = (await listFolder(`org/${orgId}/members`)).map((n) => `org/${orgId}/members/${n}`);
    const top = (await listFolder(`org/${orgId}`)).map((n) => `org/${orgId}/${n}`);
    await removePaths([...new Set([orgIndexPath(orgId), ...top, ...parts])]);
    // Logged before the row goes: security_events.org_id must name a live organization.
    await logSecurityEvent("org_deleted", { orgId, headers: await headers() });
    const { error } = await db.from("organizations").delete().eq("id", orgId);
    check(error, "organizations delete");
    return done(`Deleted ${org.name}.`);
  });
}
