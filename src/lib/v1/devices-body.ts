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
