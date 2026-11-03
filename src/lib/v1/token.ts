import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { sha256Hex } from "@/lib/connect/code";

export { sha256Hex } from "@/lib/connect/code";

/**
 * Device tokens (docs/accounts.md section 2): `coere_dev_` and 32 random
 * bytes in base64url. The server keeps only the hex SHA-256 and the last 4
 * characters, so a leaked `devices` table connects nobody.
 */

export const DEVICE_TOKEN_PREFIX = "coere_dev_";

const TOKEN_SHAPE = /^coere_dev_[A-Za-z0-9_-]{43}$/;
const VERIFIER_SHAPE = /^[A-Za-z0-9_-]{43}$/;

export function newDeviceToken(): string {
  return `${DEVICE_TOKEN_PREFIX}${randomBytes(32).toString("base64url")}`;
}

/** The last 4 characters, which the device list shows so a person can tell their browsers apart. */
export function tokenHint(token: string): string {
  return token.slice(-4);
}

/**
 * The token in an `Authorization: Bearer` header, or null. A value that is
 * not a device token's shape is refused here, so the database is never asked
 * about a string that cannot be one.
 */
export function parseBearer(header: string | null): string | null {
  if (!header) return null;
  const match = /^Bearer[ ]+(\S+)\s*$/i.exec(header);
  const token = match?.[1] ?? "";
  return TOKEN_SHAPE.test(token) ? token : null;
}

/** The hash a token is stored under. */
export function tokenHash(token: string): string {
  return sha256Hex(token);
}

/**
 * Whether base64url(SHA-256(verifier)) equals the stored challenge (section
 * 4 step 9). Compared in constant time so the answer's timing says nothing
 * about how much of a guess was right.
 */
export function pkceMatches(verifier: string, challenge: string): boolean {
  if (!VERIFIER_SHAPE.test(verifier)) return false;
  const made = Buffer.from(createHash("sha256").update(verifier).digest("base64url"));
  const stored = Buffer.from(challenge);
  return made.length === stored.length && timingSafeEqual(made, stored);
}
