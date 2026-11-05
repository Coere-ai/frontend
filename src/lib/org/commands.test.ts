import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isOrgAction, ORG_ACTIONS, readOrgCommand } from "./commands";

const ID = "0b4e5c1a-7d2f-4a9e-8c3b-1f2e3d4c5b6a";

describe("isOrgAction", () => {
  it("knows the ten actions of 8.11 and nothing else", () => {
    assert.deepEqual([...ORG_ACTIONS], ["invite", "revoke-invite", "accept", "decline", "role", "access", "remove", "leave", "share", "settings"]);
    for (const a of ORG_ACTIONS) assert.equal(isOrgAction(a), true);
    for (const a of ["index", "page", "create", "delete", "", "Invite", "__proto__"]) assert.equal(isOrgAction(a), false);
  });
});

describe("readOrgCommand", () => {
  it("refuses a body that is not an object", () => {
    for (const body of [null, "x", 1, [], undefined]) assert.equal(readOrgCommand("leave", body), null);
  });

  it("reads an invite, member by default", () => {
    assert.deepEqual(readOrgCommand("invite", { login: "sam@example.com" }), { action: "invite", login: "sam@example.com", role: "member" });
    assert.deepEqual(readOrgCommand("invite", { login: "sam", role: "admin" }), { action: "invite", login: "sam", role: "admin" });
    assert.equal(readOrgCommand("invite", { login: "sam", role: "owner" }), null);
    assert.equal(readOrgCommand("invite", { login: 5 }), null);
    assert.equal(readOrgCommand("invite", { login: "a".repeat(255) }), null);
  });

  it("takes only a uuid for an invite or a member", () => {
    for (const action of ["revoke-invite", "accept", "decline"] as const) {
      assert.deepEqual(readOrgCommand(action, { inviteId: ID }), { action, inviteId: ID });
      assert.equal(readOrgCommand(action, { inviteId: "1; drop table" }), null);
      assert.equal(readOrgCommand(action, {}), null);
    }
    assert.deepEqual(readOrgCommand("remove", { userId: ID }), { action: "remove", userId: ID });
    assert.equal(readOrgCommand("remove", { userId: "me" }), null);
  });

  it("reads a role change with a known role", () => {
    assert.deepEqual(readOrgCommand("role", { userId: ID, role: "admin" }), { action: "role", userId: ID, role: "admin" });
    assert.equal(readOrgCommand("role", { userId: ID, role: "boss" }), null);
  });

  it("passes access on for cleanAccess, null included, but needs the field", () => {
    assert.deepEqual(readOrgCommand("access", { userId: ID, access: null }), { action: "access", userId: ID, access: null });
    const access = { read: ["work"], contribute: true };
    assert.deepEqual(readOrgCommand("access", { userId: ID, access }), { action: "access", userId: ID, access });
    assert.equal(readOrgCommand("access", { userId: ID }), null);
  });

  it("reads share as a boolean only", () => {
    assert.deepEqual(readOrgCommand("share", { on: false }), { action: "share", on: false });
    assert.equal(readOrgCommand("share", { on: "yes" }), null);
  });

  it("hands the settings on for the action's own checks", () => {
    const body = { name: "Acme", sections: ["work"], defaultAccess: { read: "all", contribute: true } };
    assert.deepEqual(readOrgCommand("settings", body), { action: "settings", ...body });
    assert.deepEqual(readOrgCommand("leave", {}), { action: "leave" });
  });
});
