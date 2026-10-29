import { ACCESS_TTL_SECONDS } from "./constants";

/**
 * A pass is "v1.<expires ms>.<hmac hex>". It holds no secret and no user
 * data, only when it ends and a signature over that. It uses Web Crypto so the
 * same code runs in the proxy and in route handlers.
 */
const VERSION = "v1";
const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

/** SHA-256 of a string, as hex. Used to compare values of different lengths safely. */
export async function digest(value: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

/**
 * Compares two strings in time that depends only on their length, so a
 * guess learns nothing from how long the check took. Callers pass digests,
 * which always share a length.
 */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Signs a new pass that ends ACCESS_TTL_SECONDS from now. */
export async function issuePass(secret: string, now = Date.now()): Promise<string> {
  const expires = String(now + ACCESS_TTL_SECONDS * 1000);
  const payload = `${VERSION}.${expires}`;
  return `${payload}.${await hmac(payload, secret)}`;
}

/**
 * Returns when a pass ends, in ms since the epoch, or null when the pass is
 * missing, malformed, forged or already over.
 */
export async function passExpiry(
  pass: string | undefined,
  secret: string,
  now = Date.now(),
): Promise<number | null> {
  if (!pass) return null;
  const [version, expires, signature, ...rest] = pass.split(".");
  if (version !== VERSION || !expires || !signature || rest.length > 0) return null;

  const endsAt = Number(expires);
  if (!Number.isSafeInteger(endsAt) || endsAt <= now) return null;
  // A pass can never last longer than one sign in, whatever its date says.
  if (endsAt > now + ACCESS_TTL_SECONDS * 1000) return null;

  const expected = await hmac(`${VERSION}.${expires}`, secret);
  return safeEqual(signature, expected) ? endsAt : null;
}
