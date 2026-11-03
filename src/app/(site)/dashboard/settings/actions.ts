"use server";

import { headers } from "next/headers";

import { getUser } from "@/lib/auth/user";
import { deleteMemory } from "@/lib/memory/user-memory";
import { readMembership } from "@/lib/org/membership";
import { logSecurityEvent } from "@/lib/security/events";
import { findEntry, fits, writeEntry } from "@/lib/settings/catalog";
import { readSettings, writeSettings } from "@/lib/settings/store";
import { validateSettings } from "@/lib/settings/synced-keys";
import { supabase, supabaseConfigured } from "@/lib/supabase";

/**
 * The Settings page's writes. Each checks the session again and touches
 * only the signed in person's own rows, through the secret key.
 */

export type SaveResult = { ok: true } | { ok: false; reason: "signed_out" | "bad_request" | "too_large" | "unavailable" };

/** One synced setting: the key's whole value is written, the version goes up, and `updated_by` says the site. */
export async function saveSetting(id: string, value: unknown): Promise<SaveResult> {
  const user = await getUser();
  if (!user) return { ok: false, reason: "signed_out" };
  if (!supabaseConfigured()) return { ok: false, reason: "unavailable" };
  const entry = findEntry(id);
  if (!entry || !fits(entry, value)) return { ok: false, reason: "bad_request" };
  const current = await readSettings(user.id);
  const change = validateSettings({ [entry.key]: writeEntry(current.settings, entry, value) });
  if (!change) return { ok: false, reason: "bad_request" };
  const written = await writeSettings(user.id, change, "site");
  return written.ok ? { ok: true } : { ok: false, reason: written.reason };
}

async function setProfile(userId: string, change: { memory_sync?: boolean; include_sensitive?: boolean }): Promise<boolean> {
  const { error } = await supabase()
    .from("profiles")
    .update({ ...change, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) console.error("profile update failed", error.code);
  return !error;
}

/**
 * "Back up memory to coere.ai". Off removes the stored file, its index and
 * the person's part of their organization's graph, and the extension stops
 * pushing (it reads the switch from the account). On lets the next push in.
 */
export async function setBackup(on: boolean): Promise<SaveResult> {
  const user = await getUser();
  if (!user) return { ok: false, reason: "signed_out" };
  if (typeof on !== "boolean") return { ok: false, reason: "bad_request" };
  if (!supabaseConfigured()) return { ok: false, reason: "unavailable" };
  if (!(await setProfile(user.id, { memory_sync: on }))) return { ok: false, reason: "unavailable" };
  if (!on) {
    try {
      const membership = await readMembership(user.id);
      await deleteMemory(user.id, membership?.orgId ?? null);
      await logSecurityEvent("memory_deleted", { userId: user.id, orgId: membership?.orgId ?? null, headers: await headers() });
    } catch {
      console.error("memory copy not deleted");
      return { ok: false, reason: "unavailable" };
    }
  }
  return { ok: true };
}

/** "Include sensitive memories" in the backup. The next push follows it; turning it off keeps them out from then on. */
export async function setIncludeSensitive(on: boolean): Promise<SaveResult> {
  const user = await getUser();
  if (!user) return { ok: false, reason: "signed_out" };
  if (typeof on !== "boolean") return { ok: false, reason: "bad_request" };
  if (!supabaseConfigured()) return { ok: false, reason: "unavailable" };
  return (await setProfile(user.id, { include_sensitive: on })) ? { ok: true } : { ok: false, reason: "unavailable" };
}
