import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { orgNeedsWeb, turnsBackupOn } from "./web-only";

const ID = "5d1c0e4a-7b2f-4c11-9a3e-2f4b8c6d1e09";

describe("turnsBackupOn", () => {
  it("is true when either switch goes on", () => {
    assert.equal(turnsBackupOn({ sync: true }), true);
    assert.equal(turnsBackupOn({ includeSensitive: true }), true);
    assert.equal(turnsBackupOn({ sync: false, includeSensitive: true }), true);
  });

  it("is false when every switch named goes off", () => {
    assert.equal(turnsBackupOn({ sync: false }), false);
    assert.equal(turnsBackupOn({ includeSensitive: false }), false);
    assert.equal(turnsBackupOn({ sync: false, includeSensitive: false }), false);
  });
});

describe("orgNeedsWeb", () => {
  it("holds back invites of either role and making an admin", () => {
    assert.equal(orgNeedsWeb({ action: "invite", login: "sam", role: "member" }), true);
    assert.equal(orgNeedsWeb({ action: "invite", login: "sam", role: "admin" }), true);
    assert.equal(orgNeedsWeb({ action: "role", userId: ID, role: "admin" }), true);
  });

  it("lets every other action through", () => {
    assert.equal(orgNeedsWeb({ action: "role", userId: ID, role: "member" }), false);
    assert.equal(orgNeedsWeb({ action: "remove", userId: ID }), false);
    assert.equal(orgNeedsWeb({ action: "accept", inviteId: ID }), false);
    assert.equal(orgNeedsWeb({ action: "share", on: true }), false);
    assert.equal(orgNeedsWeb({ action: "leave" }), false);
    assert.equal(orgNeedsWeb({ action: "revoke-invite", inviteId: ID }), false);
  });
});
