"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { logSecurityEvent } from "@/lib/security/events";
import { accountsConfigured, sessionClient } from "@/lib/supabase/server";

import { clearSignedIn } from "./hint-cookie";
import { safeNext } from "./next-path";

/**
 * Signs this browser out, then goes to the form's `next` field or home. Only
 * this browser: `scope: "local"` leaves the person's other browsers signed
 * in, and the extension's device token is a separate thing, revoked from the
 * account page.
 */
export async function signOut(form?: FormData): Promise<void> {
  if (accountsConfigured()) {
    const client = await sessionClient();
    const { data } = await client.auth.getUser();
    await client.auth.signOut({ scope: "local" });
    if (data.user) await logSecurityEvent("sign_out", { userId: data.user.id, headers: await headers() });
  }
  await clearSignedIn();
  const next = form?.get("next");
  redirect(safeNext(typeof next === "string" ? next : null, "/"));
}
