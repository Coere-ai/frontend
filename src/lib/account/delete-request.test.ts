import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { emailMatches, typedEmail } from "./delete-request";

describe("typedEmail", () => {
  it("takes a string email from the body and nothing else", () => {
    assert.equal(typedEmail({ email: "sam@example.com" }), "sam@example.com");
    for (const body of [null, {}, { email: 1 }, { email: "a".repeat(321) }, "sam@example.com"]) assert.equal(typedEmail(body), null);
  });
});

describe("emailMatches", () => {
  it("matches the account's own email as stored, ignoring case and spaces", () => {
    assert.equal(emailMatches("  Sam@Example.com ", "sam@example.com"), true);
    assert.equal(emailMatches("sam@example.com", "Sam@Example.com"), true);
  });

  it("refuses another email, a malformed one or an account with none", () => {
    assert.equal(emailMatches("ada@example.com", "sam@example.com"), false);
    assert.equal(emailMatches("sam", "sam"), false);
    assert.equal(emailMatches("", ""), false);
    assert.equal(emailMatches("sam@example.com", null), false);
  });
});
