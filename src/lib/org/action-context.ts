import "server-only";

import { getUser, type AccountUser } from "@/lib/auth/user";
import { supabaseConfigured } from "@/lib/supabase";

import { readMembership, type Membership } from "./membership";
import { mayManage } from "./roles";

/**
 * The first lines of every organization action: the session is checked
 * again, the person's own membership is read, and for the admin actions
 * their role. Each action then touches only that organization.
 */

export type OrgResult = { ok: true; notice?: string } | { ok: false; error: string };

export const SIGNED_OUT = "You were signed out. Reload the page to sign in again.";
export const UNAVAILABLE = "That did not work. Try again in a minute.";
export const failed = (error: string): OrgResult => ({ ok: false, error });

type Context = { ok: true; user: AccountUser; membership: Membership } | { ok: false; result: OrgResult };

/** The signed in member and their organization, or the answer to give instead. */
export async function memberContext(): Promise<Context> {
  const user = await getUser();
  if (!user) return { ok: false, result: failed(SIGNED_OUT) };
  if (!supabaseConfigured()) return { ok: false, result: failed(UNAVAILABLE) };
  const membership = await readMembership(user.id).catch(() => null);
  if (!membership) return { ok: false, result: failed("You are not in an organization. Reload the page.") };
  return { ok: true, user, membership };
}

/** As memberContext, and refused unless the person is an admin. */
export async function adminContext(): Promise<Context> {
  const ctx = await memberContext();
  if (!ctx.ok) return ctx;
  if (!mayManage(ctx.membership.role).ok) return { ok: false, result: failed("Only an admin can do that.") };
  return ctx;
}

/** A row id from a form or a call: a uuid, nothing else. */
export const isUuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
