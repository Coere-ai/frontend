/**
 * The answer of `GET /api/v1/devices` (docs/accounts.md 8.12): the
 * person's connected browsers, newest first, each with a `current` flag on
 * the browser that asked. The token itself is never stored; `tokenHint` is
 * the few characters the connect step kept for telling browsers apart.
 * Pure, so the tests pin the shape.
 */

export interface DeviceRow {
  id: string;
  name: string;
  token_hint: string;
  extension_version: string | null;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

/** The most browsers a list holds, as the dashboard listed them. */
export const DEVICE_LIST_MAX = 50;

/**
 * The list from two reads, the newest live browsers and the newest revoked
 * ones: every live browser has a place first, the revoked fill the rest,
 * and the whole is newest first, at most 50. The 50 newest rows alone left
 * out a browser still connected once 50 later connects came after it, and
 * with those all revoked /account said no browser was connected and hid
 * Sign out every browser.
 */
export function deviceList(live: readonly DeviceRow[], revoked: readonly DeviceRow[]): DeviceRow[] {
  const newest = (rows: readonly DeviceRow[]) => [...rows].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  const kept = newest(live).slice(0, DEVICE_LIST_MAX);
  return newest([...kept, ...newest(revoked).slice(0, DEVICE_LIST_MAX - kept.length)]);
}

export interface DeviceItem {
  id: string;
  name: string;
  tokenHint: string;
  extensionVersion: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  current: boolean;
}

export function devicesBody(rows: readonly DeviceRow[], currentId: string): { devices: DeviceItem[] } {
  return {
    devices: rows.map((d) => ({
      id: d.id,
      name: d.name,
      tokenHint: d.token_hint,
      extensionVersion: d.extension_version,
      createdAt: d.created_at,
      lastUsedAt: d.last_used_at,
      revokedAt: d.revoked_at,
      current: d.id === currentId,
    })),
  };
}
