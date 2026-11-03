import { createHash, randomBytes } from "node:crypto";

/**
 * Connect codes (docs/accounts.md section 2): `coere_code_` and 32 random
 * bytes in base64url. Only the hash is stored, so a leaked table row cannot
 * be traded for a token.
 */

export const CONNECT_CODE_PREFIX = "coere_code_";

/** How long a code works. The extension trades it within a second or two. */
export const CONNECT_CODE_TTL_MS = 5 * 60_000;

export function newConnectCode(): string {
  return `${CONNECT_CODE_PREFIX}${randomBytes(32).toString("base64url")}`;
}

/** The lowercase hex SHA-256 of the whole string, the form every token and code is stored in. */
export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
