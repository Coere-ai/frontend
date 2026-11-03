import "server-only";

import { cleanDeviceName } from "@/lib/connect/device-name";
import { logSecurityEvent } from "@/lib/security/events";
import { supabase } from "@/lib/supabase";

import { newDeviceToken, pkceMatches, sha256Hex, tokenHint } from "./token";
import { codeUsable, type TokenRequest } from "./token-request";

/**
 * The site half of connecting the extension (docs/accounts.md 4 step 9):
 * trade a connect code and its PKCE verifier for a device token. Every check
 * passes before the code is spent, and the spend is conditional on the code
 * still being unused, so two racing trades get one token between them.
 */

export interface Exchanged {
  token: string;
  device: { id: string; name: string };
  user: { id: string; email: string; username: string | null };
}

interface CodeRow {
  user_id: string;
  challenge: string;
  extension_id: string;
  device_name: string | null;
  expires_at: string;
  used_at: string | null;
}

export async function exchangeCode(req: TokenRequest, headers: Headers): Promise<Exchanged | null> {
  const db = supabase();
  const codeHash = sha256Hex(req.code);
  const { data: code } = await db
    .from("device_codes")
    .select("user_id, challenge, extension_id, device_name, expires_at, used_at")
    .eq("code_hash", codeHash)
    .maybeSingle<CodeRow>();
  if (!code || !codeUsable(code, req.extensionId) || !pkceMatches(req.verifier, code.challenge)) return null;

  const { data: spent } = await db
    .from("device_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("code_hash", codeHash)
    .is("used_at", null)
    .select("code_hash")
    .maybeSingle();
  if (!spent) return null;

  const { data: profile } = await db
    .from("profiles")
    .select("id, email, username")
    .eq("id", code.user_id)
    .maybeSingle<{ id: string; email: string | null; username: string | null }>();
  if (!profile?.email) return null;

  const token = newDeviceToken();
  const { data: device, error } = await db
    .from("devices")
    .insert({
      user_id: profile.id,
      name: cleanDeviceName(req.name ?? code.device_name),
      token_hash: sha256Hex(token),
      token_hint: tokenHint(token),
      extension_id: req.extensionId,
      extension_version: req.extensionVersion,
    })
    .select("id, name")
    .single<{ id: string; name: string }>();
  if (error || !device) {
    console.error("device not stored", error?.code);
    return null;
  }
  void logSecurityEvent("device_connected", { userId: profile.id, headers });
  return { token, device, user: { id: profile.id, email: profile.email, username: profile.username } };
}
