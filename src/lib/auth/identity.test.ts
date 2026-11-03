import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizeCode, normalizeEmail, normalizeUsername, parseLogin, passwordProblem, usernameProblem } from "./identity";

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

describe("parseLogin", () => {
  it("tells an email from a username by the @", () => {
    assert.deepEqual(parseLogin("Ada@Example.com"), { email: "ada@example.com" });
    assert.deepEqual(parseLogin("Ada_L"), { username: "ada_l" });
  });

  it("answers null for neither", () => {
    assert.equal(parseLogin("ada@"), null);
    assert.equal(parseLogin("x"), null);
    assert.equal(parseLogin(undefined), null);
  });
});

describe("normalizeCode", () => {
  it("takes 6 digits with spaces removed", () => {
    assert.equal(normalizeCode("123 456"), "123456");
    assert.equal(normalizeCode("12345"), null);
    assert.equal(normalizeCode("12345a"), null);
    assert.equal(normalizeCode("1234567"), null);
  });
});
