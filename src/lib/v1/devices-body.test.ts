import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { devicesBody } from "./devices-body";

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
