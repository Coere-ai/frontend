"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { deleteAccount } from "@/lib/account/delete-account";
import { LAST_ADMIN_LINE, USERNAME_LINE, usernameMatches } from "@/lib/account/delete-request";
import { revokeAllDevices, revokeDevice } from "@/lib/account/devices";
import { setMemoryBackup } from "@/lib/account/memory-backup";
import { clearSignedIn } from "@/lib/auth/hint-cookie";
import { usernameOf } from "@/lib/auth/lookup";
import { getUser, signedInJustNow } from "@/lib/auth/user";
import { readMembership } from "@/lib/org/membership";
import { parseRole } from "@/lib/org/roles";
import { runOrgCommand } from "@/lib/org/run-command";
import { logSecurityEvent } from "@/lib/security/events";
import { supabaseConfigured } from "@/lib/supabase";
import { sessionClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";

/**
 * The writes of /account, the page for what a device token may not do
 * (docs/accounts.md 7). Each checks the web session again and acts only on
 * the signed in person's own rows. Deleting the account also needs a sign
 * in from the last few minutes.
 */

export interface FormState {
  error: string | null;
  notice: string | null;
}

const UNAVAILABLE = "That did not work. Try again in a minute.";
const SIGNED_OUT = "You were signed out. Reload the page to sign in again.";
const failed = (error: string): FormState => ({ error, notice: null });

/** Revokes one browser. Coere there is signed out on its next request. */
export async function revokeBrowser(form: FormData): Promise<void> {
  const user = await getUser();
  const id = form.get("deviceId");
  if (!user || !isUuid(id) || !supabaseConfigured()) return;
  const done = await revokeDevice(user.id, id).catch(() => "failed" as const);
  if (done === "revoked") await logSecurityEvent("device_revoked", { userId: user.id, headers: await headers() });
  revalidatePath("/account");
}

/** Revokes every connected browser at once, for a lost or stolen one. */
export async function revokeAllBrowsers(): Promise<void> {
  const user = await getUser();
  if (!user || !supabaseConfigured()) return;
  const count = await revokeAllDevices(user.id).catch(() => 0);
  if (count > 0) await logSecurityEvent("device_revoked", { userId: user.id, headers: await headers() });
  revalidatePath("/account");
}

/**
 * Sets one memory backup switch from the form's `sync` or `includeSensitive`
 * field ("on" or "off"). Turning one on writes memory_backup_on, so the
 * admin panel shows when memory started leaving a browser; off writes
 * memory_deleted when the copy goes.
 */
export async function setBackupSwitch(form: FormData): Promise<void> {
  const user = await getUser();
  if (!user || !supabaseConfigured()) return;
  const sync = form.get("sync");
  const sensitive = form.get("includeSensitive");
  const change = sync === "on" || sync === "off" ? { sync: sync === "on" } : sensitive === "on" || sensitive === "off" ? { includeSensitive: sensitive === "on" } : null;
  if (!change) return;
  try {
    const membership = await readMembership(user.id);
    await setMemoryBackup(user.id, membership?.orgId ?? null, change);
    const on = Object.values(change).includes(true);
    if (on || change.sync === false) {
      await logSecurityEvent(on ? "memory_backup_on" : "memory_deleted", { userId: user.id, orgId: membership?.orgId ?? null, headers: await headers() });
    }
  } catch {
    console.error("memory backup switch not saved");
  }
  revalidatePath("/account");
}

/** Invites a coworker's existing account to the person's organization, by the organization's own rules. */
export async function inviteToOrg(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return failed(SIGNED_OUT);
  const login = String(form.get("login") ?? "").slice(0, 254);
  const role = parseRole(form.get("role")) ?? "member";
  const done = await runOrgCommand(user.id, await headers(), { action: "invite", login, role }).catch(() => null);
  if (!done) return failed(UNAVAILABLE);
  if (!done.ok) return failed(done.message);
  revalidatePath("/account");
  return { error: null, notice: done.notice ?? "Invite sent. They accept it in Coere." };
}

/** Makes a member an admin. Taking admin away again works from Coere as well. */
export async function makeAdmin(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return failed(SIGNED_OUT);
  const userId = form.get("userId");
  if (!isUuid(userId)) return failed(UNAVAILABLE);
  const done = await runOrgCommand(user.id, await headers(), { action: "role", userId, role: "admin" }).catch(() => null);
  if (!done) return failed(UNAVAILABLE);
  if (!done.ok) return failed(done.message);
  revalidatePath("/account");
  return { error: null, notice: done.notice };
}

/** Deletes the account once the person signed in moments ago and typed their own username, then signs this browser out. */
export async function deleteAccountAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return failed(SIGNED_OUT);
  if (!(await signedInJustNow())) return failed("Sign in again first, then delete your account within ten minutes.");
  if (!supabaseConfigured()) return failed(UNAVAILABLE);
  const username = await usernameOf(user.id).catch(() => undefined);
  if (username === undefined) return failed(UNAVAILABLE);
  if (!usernameMatches(String(form.get("username") ?? ""), username)) return failed(USERNAME_LINE);
  const done = await deleteAccount(user.id).catch(() => ({ ok: false as const, reason: "unavailable" as const }));
  if (!done.ok) return failed(done.reason === "last_admin" ? LAST_ADMIN_LINE : UNAVAILABLE);
  const hdrs = await headers();
  await (await sessionClient()).auth.signOut({ scope: "local" }).catch(() => undefined);
  await clearSignedIn();
  await logSecurityEvent("account_deleted", { headers: hdrs });
  redirect("/");
}
