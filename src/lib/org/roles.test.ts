import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { cleanAccess, cleanOrgName, cleanSections, mayChangeRole, mayLeave, mayManage, mayRemove, parseRole } from "./roles";
import { slugify, uniqueSlug } from "./slug";

describe("organization roles", () => {
  it("lets only admins manage", () => {
    assert.deepEqual(mayManage("admin"), { ok: true });
    assert.deepEqual(mayManage("member"), { ok: false, reason: "not_admin" });
    assert.equal(parseRole("owner"), null);
    assert.equal(parseRole("member"), "member");
  });

  it("never leaves an organization without an admin", () => {
    assert.deepEqual(mayChangeRole({ actor: "admin", target: "admin", to: "member", admins: 1 }), { ok: false, reason: "last_admin" });
    assert.deepEqual(mayChangeRole({ actor: "admin", target: "admin", to: "member", admins: 2 }), { ok: true });
    assert.deepEqual(mayChangeRole({ actor: "admin", target: "member", to: "admin", admins: 1 }), { ok: true });
    assert.deepEqual(mayChangeRole({ actor: "member", target: "member", to: "admin", admins: 1 }), { ok: false, reason: "not_admin" });
    assert.deepEqual(mayChangeRole({ actor: "admin", target: "member", to: "member", admins: 1 }), { ok: false, reason: "same" });
    assert.deepEqual(mayLeave({ role: "admin", admins: 1 }), { ok: false, reason: "last_admin" });
    assert.deepEqual(mayLeave({ role: "admin", admins: 2 }), { ok: true });
    assert.deepEqual(mayLeave({ role: "member", admins: 1 }), { ok: true });
  });

  it("removes others only, and only as an admin", () => {
    const base = { actor: "admin" as const, actorId: "a", targetId: "b", target: "member" as const, admins: 1 };
    assert.deepEqual(mayRemove(base), { ok: true });
    assert.deepEqual(mayRemove({ ...base, targetId: "a" }), { ok: false, reason: "self" });
    assert.deepEqual(mayRemove({ ...base, actor: "member" }), { ok: false, reason: "not_admin" });
    assert.deepEqual(mayRemove({ ...base, target: "admin", admins: 2 }), { ok: true });
  });

  it("cleans names, sections and access from a form", () => {
    assert.equal(cleanOrgName("  Acme   Labs "), "Acme Labs");
    assert.equal(cleanOrgName("   "), null);
    assert.equal(cleanOrgName("x".repeat(81)), null);
    assert.deepEqual(cleanSections(["work", "work", "projects"]), ["work", "projects"]);
    assert.equal(cleanSections(["Work!"]), null);
    assert.equal(cleanSections("work"), null);
    assert.deepEqual(cleanAccess({ read: "all", contribute: false }, ["work"]), { read: "all", contribute: false });
    assert.deepEqual(cleanAccess({ read: ["work", "personal"], contribute: true }, ["work", "projects"]), { read: ["work"], contribute: true });
    assert.equal(cleanAccess({ read: "some", contribute: true }, ["work"]), null);
    assert.equal(cleanAccess({ read: "all" }, ["work"]), null);
  });
});

describe("organization slugs", () => {
  it("makes a slug the database accepts", () => {
    assert.equal(slugify("Acme Labs, Inc."), "acme-labs-inc");
    assert.equal(slugify("Café & Co"), "cafe-and-co");
    assert.equal(slugify("  --  "), "org");
    assert.equal(slugify("日本"), "org");
    const long = slugify("a ".repeat(80));
    assert.ok(long.length <= 63 && /^[a-z0-9][a-z0-9-]{0,62}$/.test(long));
  });

  it("adds a number past the slugs already taken", () => {
    assert.equal(uniqueSlug("Acme", []), "acme");
    assert.equal(uniqueSlug("Acme", ["acme"]), "acme-2");
    assert.equal(uniqueSlug("Acme", ["acme", "acme-2"]), "acme-3");
    const long = uniqueSlug("b".repeat(70), ["b".repeat(63)]);
    assert.equal(long, `${"b".repeat(61)}-2`);
  });
});
