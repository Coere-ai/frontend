import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { accountBody, monthKey } from "./account-body";

describe("accountBody", () => {
  it("has the shape of 8.3", () => {
    const body = accountBody({
      month: "2026-11-01",
      profile: { id: "u1", email: "sam@example.com", username: null, created_at: "2026-11-01T00:00:00Z", memory_sync: true, include_sensitive: false },
      plan: { id: "free", name: "Free", storage_limit_bytes: "26214400" },
      limits: { monthlyMicros: 5000000, lifetimeMicros: null },
      usage: null,
      memory: null,
      device: { id: "d1", name: "Chrome on macOS" },
      org: { id: "o1", name: "Acme", role: "member" },
      totals: { tokens_saved: "12", input_tokens: 5, output_tokens: "7", cost_micros: 3, memories: 9, chats: 2 },
      settingsVersion: null,
    });
    assert.deepEqual(body, {
      user: { id: "u1", email: "sam@example.com", username: null, createdAt: "2026-11-01T00:00:00Z" },
      plan: { id: "free", name: "Free", monthlyLimitMicros: 5000000, lifetimeLimitMicros: null, storageLimitBytes: 26214400 },
      usage: { month: "2026-11-01", costMicros: 0, requests: 0, inputTokens: 0, outputTokens: 0 },
      memory: { sync: true, includeSensitive: false, uploadedAt: null, bytes: null, digest: null },
      device: { id: "d1", name: "Chrome on macOS" },
      org: { id: "o1", name: "Acme", role: "member" },
      totals: { tokensSaved: 12, tokensUsed: 12, costMicros: 3, memories: 9, chats: 2 },
      settingsVersion: 0,
    });
  });

  it("answers the person's own limits in place of the plan's", () => {
    const body = accountBody({
      month: "2026-11-01",
      profile: { id: "u1", email: null, username: null, created_at: "2026-11-01T00:00:00Z", memory_sync: false, include_sensitive: false },
      plan: { id: "plus", name: "Plus", storage_limit_bytes: 104857600 },
      limits: { monthlyMicros: 7000000, lifetimeMicros: 50000000 },
      usage: null,
      memory: null,
      device: { id: "d1", name: "Chrome" },
      org: null,
      totals: null,
      settingsVersion: 3,
    });
    assert.deepEqual(body.plan, { id: "plus", name: "Plus", monthlyLimitMicros: 7000000, lifetimeLimitMicros: 50000000, storageLimitBytes: 104857600 });
  });
});

describe("monthKey", () => {
  it("is the first of the month in UTC", () => {
    assert.equal(monthKey(new Date("2026-11-30T23:59:59Z")), "2026-11-01");
    assert.equal(monthKey(new Date("2027-01-01T00:00:00Z")), "2027-01-01");
  });
});
