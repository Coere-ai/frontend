import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizeEmail, normalizeUsername, passwordProblem, placeholderEmail, usernameProblem } from "./identity";

describe("usernames", () => {
  it("stores them lowercase", () => {
    assert.equal(normalizeUsername("  Ada_Lovelace "), "ada_lovelace");
  });

  it("keeps the length and character rules", () => {
    assert.equal(normalizeUsername("ab"), null);
    assert.equal(normalizeUsername("a".repeat(24)), "a".repeat(24));
    assert.equal(normalizeUsername("a".repeat(25)), null);
    assert.equal(normalizeUsername("ada.l"), null);
    assert.equal(normalizeUsername("ada-l"), null);
    assert.equal(normalizeUsername("ädä"), null);
    assert.equal(normalizeUsername(42), null);
  });

  it("says what is wrong", () => {
    assert.equal(usernameProblem("ab"), "Use at least 3 characters.");
    assert.equal(usernameProblem("a".repeat(25)), "Use 24 characters or fewer.");
    assert.equal(usernameProblem("no spaces"), "Use only letters, numbers and underscores.");
    assert.equal(usernameProblem("Fine_1"), null);
  });
});

describe("emails", () => {
  it("trims and lowercases", () => {
    assert.equal(normalizeEmail(" Ada@Example.COM "), "ada@example.com");
  });

  it("refuses what is not an address", () => {
    for (const bad of ["", "ada", "ada@", "@example.com", "ada@example", "a b@example.com", null]) {
      assert.equal(normalizeEmail(bad), null);
    }
  });
});

describe("passwords", () => {
  it("asks for 10 characters", () => {
    assert.equal(passwordProblem("123456789"), "Use at least 10 characters.");
    assert.equal(passwordProblem("1234567890"), null);
  });

  it("stops at 72 bytes", () => {
    assert.equal(passwordProblem("a".repeat(72)), null);
    assert.equal(passwordProblem("a".repeat(73)), "Use at most 72 characters.");
  });
});

describe("placeholderEmail", () => {
  it("puts the username at the placeholder domain", () => {
    assert.equal(placeholderEmail("ada_l"), "ada_l@users.coere.ai");
  });

  it("adds a suffix when asked, so the address stays unique", () => {
    assert.equal(placeholderEmail("ada_l", "k3x9"), "ada_l.k3x9@users.coere.ai");
  });

  it("makes an address the email rule accepts", () => {
    assert.equal(normalizeEmail(placeholderEmail("ada_l", "k3x9")), "ada_l.k3x9@users.coere.ai");
  });
});
