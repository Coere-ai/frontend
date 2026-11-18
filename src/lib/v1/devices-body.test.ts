import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEVICE_LIST_MAX, deviceList, devicesBody } from "./devices-body";

const row = (id: string, revoked: string | null = null) => ({
  id,
  name: "Chrome on macOS",
  token_hint: "ab12",
  extension_version: "1.1.3",
  created_at: "2026-11-01T00:00:00Z",
  last_used_at: null,
  revoked_at: revoked,
});

describe("devicesBody", () => {
  it("names the fields of 8.12 and marks the calling browser", () => {
    assert.deepEqual(devicesBody([row("d1"), row("d2", "2026-11-03T00:00:00Z")], "d1"), {
      devices: [
        { id: "d1", name: "Chrome on macOS", tokenHint: "ab12", extensionVersion: "1.1.3", createdAt: "2026-11-01T00:00:00Z", lastUsedAt: null, revokedAt: null, current: true },
        { id: "d2", name: "Chrome on macOS", tokenHint: "ab12", extensionVersion: "1.1.3", createdAt: "2026-11-01T00:00:00Z", lastUsedAt: null, revokedAt: "2026-11-03T00:00:00Z", current: false },
      ],
    });
  });

  it("answers an empty list as one", () => {
    assert.deepEqual(devicesBody([], "d1"), { devices: [] });
  });
});

describe("deviceList", () => {
  const at = (n: number) => new Date(Date.UTC(2026, 0, 1) + n * 60_000).toISOString();
  const made = (id: string, n: number, revoked: string | null = null) => ({ ...row(id, revoked), created_at: at(n) });

  it("keeps a live browser older than the newest 50 rows, so it can still be revoked", () => {
    const old = made("old", 0);
    const revoked = Array.from({ length: 60 }, (_, i) => made(`r${i}`, i + 1, at(i + 2)));
    const list = deviceList([old], revoked);
    assert.equal(list.length, DEVICE_LIST_MAX);
    assert.ok(list.some((d) => d.id === "old"));
    assert.equal(list.at(-1)?.id, "old");
    assert.equal(list[0].id, "r59");
  });

  it("is newest first and at most 50, live ones first in line for a place", () => {
    const live = Array.from({ length: 55 }, (_, i) => made(`l${i}`, i));
    const list = deviceList(live, [made("gone", 100, at(101))]);
    assert.equal(list.length, DEVICE_LIST_MAX);
    assert.equal(list[0].id, "l54");
    assert.ok(!list.some((d) => d.id === "gone"));
  });

  it("answers both kinds newest first when they fit", () => {
    assert.deepEqual(deviceList([made("a", 1)], [made("b", 2, at(3)), made("c", 0, at(4))]).map((d) => d.id), ["b", "a", "c"]);
  });
});
