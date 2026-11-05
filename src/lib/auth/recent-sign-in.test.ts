import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { lastSignInMs, RECENT_SIGN_IN_MS, signedInRecently } from "./recent-sign-in";

const NOW = Date.UTC(2026, 10, 5, 12, 0, 0);
const at = (ms: number) => [{ method: "otp", timestamp: Math.floor(ms / 1000) }];

describe("lastSignInMs", () => {
  it("takes the latest timestamp", () => {
    assert.equal(lastSignInMs([{ method: "password", timestamp: 100 }, { method: "otp", timestamp: 300 }, { method: "x", timestamp: 200 }]), 300_000);
  });

  it("is null for a claim with no usable time", () => {
    assert.equal(lastSignInMs(undefined), null);
    assert.equal(lastSignInMs([]), null);
    assert.equal(lastSignInMs([{ method: "otp" }, null, { timestamp: "9" }]), null);
  });
});

describe("signedInRecently", () => {
  it("is true inside the window", () => {
    assert.equal(signedInRecently(at(NOW - 60_000), NOW), true);
    assert.equal(signedInRecently(at(NOW - RECENT_SIGN_IN_MS), NOW), true);
  });

  it("is false once the window has passed, or with no claim", () => {
    assert.equal(signedInRecently(at(NOW - RECENT_SIGN_IN_MS - 1000), NOW), false);
    assert.equal(signedInRecently(undefined, NOW), false);
  });

  it("is false for a time far ahead of the clock", () => {
    assert.equal(signedInRecently(at(NOW + 5 * 60_000), NOW), false);
  });
});
