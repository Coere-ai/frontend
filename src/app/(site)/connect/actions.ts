"use server";

import { cookies, headers } from "next/headers";

import { getUser } from "@/lib/auth/user";
import { CONNECT_CODE_TTL_MS, newConnectCode, sha256Hex } from "@/lib/connect/code";
import { cleanDeviceName } from "@/lib/connect/device-name";
import { checkConnectParams } from "@/lib/connect/params";
import { logSecurityEvent } from "@/lib/security/events";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { EXTENSION_COOKIE, readableCookieOptions } from "@/lib/supabase/cookie-options";

export type ConnectResult = { ok: true; code: string } | { ok: false; reason: "signed_out" | "refused" | "unavailable" };

/**
 * Makes the one time connect code when the person presses Connect Coere
 * (docs/accounts.md section 4, step 5). The page's check is not trusted: the
 * session and the address are checked again here. Only the code's hash is
 * stored; the code itself goes back to this page alone, which hands it to
 * the extension.
 */
export async function connectExtension(input: { ext: string; state: string; challenge: string; deviceName: string }): Promise<ConnectResult> {
  const user = await getUser();
  if (!user) return { ok: false, reason: "signed_out" };

  const checked = checkConnectParams(
    { ext: input.ext, state: input.state, challenge: input.challenge },
    { extensionIds: process.env.COERE_EXTENSION_IDS, production: process.env.NODE_ENV === "production" },
  );
  if (!checked.ok) {
    await logSecurityEvent("connect_refused", { userId: user.id, headers: await headers() });
    return { ok: false, reason: "refused" };
  }
  if (!supabaseConfigured()) return { ok: false, reason: "unavailable" };

  const code = newConnectCode();
  const { error } = await supabase()
    .from("device_codes")
    .insert({
      code_hash: sha256Hex(code),
      user_id: user.id,
      challenge: checked.params.challenge,
      extension_id: checked.params.ext,
      device_name: cleanDeviceName(input.deviceName),
      expires_at: new Date(Date.now() + CONNECT_CODE_TTL_MS).toISOString(),
    });
  if (error) {
    console.error("connect code not stored", error.code);
    return { ok: false, reason: "unavailable" };
  }

  (await cookies()).set(EXTENSION_COOKIE, checked.params.ext, readableCookieOptions);
  return { ok: true, code };
}
