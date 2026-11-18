"use server";

import { cookies, headers } from "next/headers";

import { getUser } from "@/lib/auth/user";
import { cleanDeviceName } from "@/lib/connect/device-name";
import { checkConnectParams } from "@/lib/connect/params";
import { storeConnectCode } from "@/lib/connect/store-code";
import { ipHash, logSecurityEvent } from "@/lib/security/events";
import { securityOnce } from "@/lib/security/once";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { EXTENSION_COOKIE, readableCookieOptions } from "@/lib/supabase/cookie-options";

export type ConnectResult = { ok: true; code: string } | { ok: false; reason: "signed_out" | "refused" | "unavailable" };

/**
 * Makes the one time connect code when the person presses Connect Coere
 * (docs/accounts.md section 4, step 5). The page's check is not trusted: the
 * session and the address are checked again here. Only the code's hash is
 * stored; the code itself goes back to this page alone, which hands it to
 * the extension. A refusal is logged once a minute per address, as the
 * page logs a bad link, since anyone signed in can call this in a loop.
 */
export async function connectExtension(input: { ext: string; state: string; challenge: string; deviceName: string }): Promise<ConnectResult> {
  const user = await getUser();
  if (!user) return { ok: false, reason: "signed_out" };

  const checked = checkConnectParams(
    { ext: input.ext, state: input.state, challenge: input.challenge },
    { extensionIds: process.env.COERE_EXTENSION_IDS, production: process.env.NODE_ENV === "production" },
  );
  if (!checked.ok) {
    const head = await headers();
    if (securityOnce.firstIn(`connect_refused:${ipHash(head) ?? "unknown"}`, 60_000)) await logSecurityEvent("connect_refused", { userId: user.id, headers: head });
    return { ok: false, reason: "refused" };
  }
  if (!supabaseConfigured()) return { ok: false, reason: "unavailable" };

  const stored = await storeConnectCode(supabase(), {
    userId: user.id,
    challenge: checked.params.challenge,
    extensionId: checked.params.ext,
    deviceName: cleanDeviceName(input.deviceName),
  });
  if (!stored.ok) return { ok: false, reason: "unavailable" };

  (await cookies()).set(EXTENSION_COOKIE, checked.params.ext, readableCookieOptions);
  return { ok: true, code: stored.code };
}
