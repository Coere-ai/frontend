import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Membership } from "@/lib/org/membership";
import type { OrgPageData } from "@/lib/org/page-data";

import { noOrgBody, orgPageBody } from "./org-page";

const access = { read: "all" as const, contribute: true };

function data(): OrgPageData {
  return {
    id: "org1",
    name: "Acme",
    plan: "team",
    sharedSections: ["work"],
    defaultAccess: access,
    totals: { tokensSaved: 10, memories: 2, chats: 1, members: 2, costMicros: 5, monthCostMicros: 1 },
    members: [
      { userId: "u1", name: "Sam", username: "sam", email: null, role: "member", access: null, effective: access, shareMemory: false, joinedAt: "2026-11-01", tokensSaved: 3, memoriesShared: 1 },
      { userId: "u2", name: "Ada", username: "ada", email: null, role: "admin", access: null, effective: access, shareMemory: true, joinedAt: "2026-11-01", tokensSaved: 7, memoriesShared: 1 },
    ],
    invites: [{ id: "i1", name: "new_person", role: "member", createdAt: "2026-11-02", expiresAt: "2026-11-09" }],
    sections: [{ key: "work", name: "Work" }],
  };
}

const membership = (role: "admin" | "member"): Membership => ({ orgId: "org1", name: "Acme", role, sharedSections: ["work"], access, shareMemory: true, readable: ["work"] });

describe("orgPageBody", () => {
  it("has the six fields of 8.11 and leaves the graph to /org/index", () => {
    const body = orgPageBody("u1", membership("member"), data());
    assert.deepEqual(Object.keys(body), ["org", "me", "members", "invites", "totals", "myInvites"]);
    assert.equal("view" in body, false);
    assert.deepEqual(body.org, { id: "org1", name: "Acme", plan: "team", sharedSections: ["work"], defaultAccess: access, sections: [{ key: "work", name: "Work" }] });
    assert.deepEqual(body.myInvites, []);
  });

  it("describes the caller from their own member row", () => {
    const body = orgPageBody("u1", membership("member"), data());
    assert.deepEqual(body.me, { userId: "u1", role: "member", shareMemory: false, access, readable: ["work"] });
  });

  it("names each member by username and carries no email", () => {
    const members = orgPageBody("u2", membership("admin"), data()).members;
    assert.deepEqual(members.map((m) => [m.username, m.email]), [["sam", null], ["ada", null]]);
  });

  it("shows the open invites to an admin only", () => {
    assert.equal(orgPageBody("u2", membership("admin"), data()).invites.length, 1);
    assert.deepEqual(orgPageBody("u1", membership("member"), data()).invites, []);
  });
});

describe("noOrgBody", () => {
  it("is null for the organization and carries the person's invites", () => {
    const mine = [{ id: "i9", orgName: "Acme", role: "member" as const, invitedBy: "Ada", expiresAt: "2026-11-09" }];
    assert.deepEqual(noOrgBody(mine), { org: null, me: null, members: [], invites: [], totals: null, myInvites: mine });
  });
});
