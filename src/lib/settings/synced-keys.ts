/**
 * The settings that sync between the extension and coere.ai
 * (docs/accounts.md 6.6, 8.8). Each is a `chrome.storage.local` key whose
 * value is a JSON object. Browser Use syncs its level, model and blocked
 * list, never `on` or `grantedAt`: turning it on stays something the person
 * does in each browser. Pure, so the API route, the dashboard's settings
 * page and the tests share one rule.
 */

export const SYNCED_KEYS = [
  "coere.prefs",
  "coere.run.settings",
  "coere.ais",
  "coere.memory.prefs",
  "coere.memory.capture",
  "coere.memory.corepack",
  "coere.memory.recall",
  "coere.memorylinks",
  "coere.stripdisplay",
  "coere.fileupload",
  "coere.devtools",
  "coere.voice",
  "coere.browser_use",
] as const;

export type SyncedKey = (typeof SYNCED_KEYS)[number];
export type SyncedSettings = Partial<Record<SyncedKey, Record<string, unknown>>>;

export const VALUE_MAX_BYTES = 8 * 1024;
export const RECORD_MAX_BYTES = 64 * 1024;

/** Browser Use fields that never leave the browser they were set in. */
const BROWSER_USE_LOCAL = ["on", "grantedAt"];

const KEYS: ReadonlySet<string> = new Set(SYNCED_KEYS);

export function isSyncedKey(key: string): key is SyncedKey {
  return KEYS.has(key);
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Bytes of a value as JSON text in UTF-8, the size Postgres checks with octet_length. */
export function jsonBytes(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}

/**
 * Checks a set of settings to store: only synced keys, each value an object
 * of at most 8 KiB, and no local Browser Use field. Answers the settings or
 * null, never a partly accepted set.
 */
export function validateSettings(input: unknown): SyncedSettings | null {
  if (!isObject(input)) return null;
  const out: SyncedSettings = {};
  for (const [key, value] of Object.entries(input)) {
    if (!isSyncedKey(key) || !isObject(value)) return null;
    if (jsonBytes(value) > VALUE_MAX_BYTES) return null;
    if (key === "coere.browser_use" && BROWSER_USE_LOCAL.some((f) => Object.hasOwn(value, f))) return null;
    out[key] = value;
  }
  return out;
}

/**
 * The stored record with a change laid over it, key by key (the newest
 * write of a key wins). Null when the result would pass 64 KiB. Keys that
 * are no longer synced are dropped from the stored side.
 */
export function mergeSettings(current: unknown, change: SyncedSettings): SyncedSettings | null {
  const base: SyncedSettings = {};
  if (isObject(current)) {
    for (const [key, value] of Object.entries(current)) if (isSyncedKey(key) && isObject(value)) base[key] = value;
  }
  const merged = { ...base, ...change };
  return jsonBytes(merged) > RECORD_MAX_BYTES ? null : merged;
}
