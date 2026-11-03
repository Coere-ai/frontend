import { isRecord } from "./body";

/**
 * The body of `POST /api/v1/auth/token` (docs/accounts.md 4, 8.1), checked
 * before any database call. A body that fails here gets the same
 * `invalid_grant` as a code that fails later, so a caller learns nothing
 * from which check refused it.
 */

export interface TokenRequest {
  code: string;
  verifier: string;
  extensionId: string;
  extensionVersion: string | null;
  name: string | null;
}

const CODE = /^coere_code_[A-Za-z0-9_-]{43}$/;
const VERIFIER = /^[A-Za-z0-9_-]{43}$/;
const EXTENSION_ID = /^[a-p]{32}$/;
const VERSION = /^[0-9A-Za-z._ -]{1,40}$/;

export function parseTokenRequest(body: unknown): TokenRequest | null {
  if (!isRecord(body)) return null;
  const { code, verifier, extensionId, extensionVersion, name } = body;
  if (typeof code !== "string" || !CODE.test(code)) return null;
  if (typeof verifier !== "string" || !VERIFIER.test(verifier)) return null;
  if (typeof extensionId !== "string" || !EXTENSION_ID.test(extensionId)) return null;
  return {
    code,
    verifier,
    extensionId,
    extensionVersion: typeof extensionVersion === "string" && VERSION.test(extensionVersion) ? extensionVersion : null,
    name: typeof name === "string" ? name : null,
  };
}

/** A stored code the exchange may use: unused, unexpired and made for this extension. */
export function codeUsable(
  row: { used_at: string | null; expires_at: string; extension_id: string },
  extensionId: string,
  now = Date.now(),
): boolean {
  return row.used_at === null && Date.parse(row.expires_at) > now && row.extension_id === extensionId;
}
