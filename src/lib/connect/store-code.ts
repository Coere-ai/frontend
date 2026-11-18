import type { SupabaseClient } from "@supabase/supabase-js";

import { createAttemptLimiter, type AttemptLimiter } from "@/lib/auth/attempts";

import { CONNECT_CODE_TTL_MS, newConnectCode, sha256Hex } from "./code";

/**
 * Stores a new connect code when the person presses Connect Coere
 * (docs/accounts.md section 4, step 5). Each press wrote a row that stayed
 * for good, and nothing capped the presses, so a signed in loop could fill
 * the database. Codes past their 5 minutes can never be traded, so each new
 * code first clears every expired one, and one account makes at most
 * `CODES_PER_ACCOUNT` codes in 15 minutes, far more than any person
 * pressing the button needs. Takes the database client, so the tests hand
 * it a stand in.
 */

export const CODES_PER_ACCOUNT = 20;

const accountCodes = createAttemptLimiter({ max: CODES_PER_ACCOUNT, windowMs: 15 * 60_000 });

export interface CodeRequest {
  userId: string;
  challenge: string;
  extensionId: string;
  deviceName: string;
}

export type StoredCode = { ok: true; code: string } | { ok: false; reason: "limited" | "unavailable" };

type Db = Pick<SupabaseClient, "from">;

export async function storeConnectCode(db: Db, r: CodeRequest, o: { limiter?: AttemptLimiter; now?: number } = {}): Promise<StoredCode> {
  const now = o.now ?? Date.now();
  if ((o.limiter ?? accountCodes).hit(r.userId, now)) return { ok: false, reason: "limited" };

  const cleared = await db.from("device_codes").delete().lt("expires_at", new Date(now).toISOString());
  if (cleared.error) console.error("expired connect codes not cleared", cleared.error.code);

  const code = newConnectCode();
  const { error } = await db.from("device_codes").insert({
    code_hash: sha256Hex(code),
    user_id: r.userId,
    challenge: r.challenge,
    extension_id: r.extensionId,
    device_name: r.deviceName,
    expires_at: new Date(now + CONNECT_CODE_TTL_MS).toISOString(),
  });
  if (error) {
    console.error("connect code not stored", error.code);
    return { ok: false, reason: "unavailable" };
  }
  return { ok: true, code };
}
