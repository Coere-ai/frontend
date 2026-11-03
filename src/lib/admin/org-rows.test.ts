import assert from "node:assert/strict";
import { test } from "node:test";

import { orgDbRefusal } from "./org-errors";
import { joinOrgs, toMemberRows } from "./org-rows";

test("an organization with no totals row reads zero", () => {
  const [row] = joinOrgs([{ id: "o1", name: "Acme", slug: "acme", plan_id: "team", created_at: "2026-11-03T00:00:00Z" }], []);
  assert.equal(row?.members, 0);
  assert.equal(row?.costMicros, 0);
  const [withTotals] = joinOrgs([{ id: "o1", name: "Acme", slug: "acme", plan_id: "team", created_at: "" }], [{ org_id: "o1", members: 3, tokens_saved: "900", cost_micros: "12" }]);
  assert.equal(withTotals?.members, 3);
  assert.equal(withTotals?.tokensSaved, 900);
});

test("members list admins first, with their own access or the default", () => {
  const rows = toMemberRows(
    [
      { user_id: "u2", role: "member", access: { read: ["work"], contribute: false }, share_memory: true, added_by: "invite", joined_at: "", profile: { username: "bea" }, totals: { memories: 4 } },
      { user_id: "u1", role: "admin", access: null, share_memory: true, added_by: "operator", joined_at: "", profile: { email: "zed@example.com" }, totals: null },
    ],
    { read: "all", contribute: true },
  );
  assert.deepEqual(
    rows.map((r) => r.userId),
    ["u1", "u2"],
  );
  assert.equal(rows[0]?.access, null);
  assert.deepEqual(rows[0]?.effective, { read: "all", contribute: true });
  assert.deepEqual(rows[1]?.effective, { read: ["work"], contribute: false });
  assert.equal(rows[0]?.name, "zed@example.com");
  assert.equal(rows[1]?.memories, 4);
});

test("database refusals are read by name", () => {
  assert.equal(orgDbRefusal(null), null);
  assert.equal(orgDbRefusal({ code: "P0001", message: "already_in_org" }), "already_in_org");
  assert.equal(orgDbRefusal({ code: "P0001", message: "invite_expired" }), "invite_expired");
  assert.equal(orgDbRefusal({ code: "23505", message: 'duplicate key value violates unique constraint "organizations_slug_key"' }), "slug_taken");
  assert.equal(orgDbRefusal({ code: "23505", message: 'duplicate key value violates unique constraint "org_members_user_id_key"' }), "unknown");
  assert.equal(orgDbRefusal({ code: "42501", message: "permission denied" }), "unknown");
});
