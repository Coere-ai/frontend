import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { configuredCredentials } from "./credentials";

/**
 * The /statistics session token, as plain functions.
 *
 * Kept apart from session.ts, which reads the cookie jar, so the proxy can
 * verify the same token without pulling in anything that only works inside a
 * render. Proxy runs on Node in this Next version, so both use node:crypto.
 *
 * The token is `<payload>.<hmac>`: base64url JSON with the issue and expiry
 * times and a random id, signed with HMAC-SHA256. A signed cookie rather than a
 * session table, because there is one operator and one bit of state.
 *
 * The signing key is derived from USER and PASSWORD themselves, so there is no
 * third secret to set, and changing the password signs everyone out. The key
 * is an HMAC of the pair, never the pair itself, and the cookie carries no
 * secret: losing one costs the holder a session, not the password.
 */

export const SESSION_COOKIE = "coere_stats";
/** One working day, then sign in again. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

type Payload = {
  /** Issued at, epoch seconds. */
  iat: number;
  /** Expires at, epoch seconds. */
  exp: number;
  /** Random per-session id, so two sessions never share a cookie value. */
  jti: string;
};

/** The HMAC key, or null when sign-in is not configured. */
function signingKey(): Buffer | null {
  const creds = configuredCredentials();
  if (!creds) return null;
  return createHmac("sha256", "coere-statistics-session")
    .update(`${creds.user.normalize("NFKC")}\u0000${creds.password.normalize("NFKC")}`)
    .digest();
}

function sign(payload: string, key: Buffer): Buffer {
  return createHmac("sha256", key).update(payload).digest();
}

/** A fresh signed token. Throws when sign-in is not configured, which the
 *  sign-in action has already ruled out. */
export function issueSessionToken(): string {
  const key = signingKey();
  if (!key) throw new Error("USER and PASSWORD must both be set to sign in.");
  const now = Math.floor(Date.now() / 1000);
  const payload: Payload = {
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
    jti: randomBytes(16).toString("base64url"),
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encoded}.${sign(encoded, key).toString("base64url")}`;
}

/** True only for a well formed, correctly signed, unexpired token. */
export function verifySessionToken(value: string | undefined): boolean {
  const key = signingKey();
  if (!value || !key) return false;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return false;

  const encoded = value.slice(0, dot);
  const provided = Buffer.from(value.slice(dot + 1), "base64url");
  const expected = sign(encoded, key);
  // Compare before parsing: an unsigned payload should never be JSON.parse'd.
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return false;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Partial<Payload>;
    return typeof payload.exp === "number" && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
