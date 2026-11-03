/**
 * The checks `/connect` makes on the address the extension opened
 * (docs/accounts.md section 4). Pure, so the page, its server action and the
 * tests agree on them.
 */

/** `chrome.runtime.id`: 32 letters a to p. */
const EXTENSION_ID = /^[a-p]{32}$/;
/** 16 random bytes, base64url. */
const STATE = /^[A-Za-z0-9_-]{22}$/;
/** base64url(SHA-256(verifier)) with no padding. */
const CHALLENGE = /^[A-Za-z0-9_-]{43}$/;

export interface ConnectParams {
  ext: string;
  state: string;
  challenge: string;
  /** The extension's version, kept only to rebuild the address. */
  v: string | null;
}

export type ConnectRefusal = "extension" | "state" | "challenge";

/** COERE_EXTENSION_IDS as a list: comma separated, spaces ignored, empty entries dropped. */
export function parseExtensionIds(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

/**
 * Whether this extension may connect. An unset list lets any well formed id
 * through outside production, so a developer's unpacked build works, and
 * none through in production, so a forgotten setting fails closed.
 */
export function extensionAllowed(id: string, raw: string | undefined, production: boolean): boolean {
  if (!EXTENSION_ID.test(id)) return false;
  const list = parseExtensionIds(raw);
  if (list.length === 0) return !production;
  return list.includes(id);
}

/** The query's value as one string; a repeated key counts as malformed. */
function one(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export function checkConnectParams(
  query: Record<string, string | string[] | undefined>,
  env: { extensionIds: string | undefined; production: boolean },
): { ok: true; params: ConnectParams } | { ok: false; reason: ConnectRefusal } {
  const ext = one(query.ext);
  const state = one(query.state);
  const challenge = one(query.challenge);
  if (!extensionAllowed(ext, env.extensionIds, env.production)) return { ok: false, reason: "extension" };
  if (!STATE.test(state)) return { ok: false, reason: "state" };
  if (!CHALLENGE.test(challenge)) return { ok: false, reason: "challenge" };
  const v = one(query.v);
  return { ok: true, params: { ext, state, challenge, v: /^[0-9A-Za-z._ -]{1,40}$/.test(v) ? v : null } };
}

/** The `/connect` address for these params, to come back to after signing in. */
export function connectPath(params: ConnectParams): string {
  const query = new URLSearchParams({ ext: params.ext, state: params.state, challenge: params.challenge });
  if (params.v) query.set("v", params.v);
  return `/connect?${query.toString()}`;
}
