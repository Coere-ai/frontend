import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { typedEmail, usernameMatches } from "./delete-request";

describe("typedEmail", () => {
  it("takes a string email from the API's body and nothing else", () => {
    assert.equal(typedEmail({ email: "sam@example.com" }), "sam@example.com");
    for (const body of [null, {}, { email: 1 }, { email: "a".repeat(321) }, "sam@example.com"]) assert.equal(typedEmail(body), null);
  });
});

describe("usernameMatches", () => {
  it("matches the account's own username as stored, ignoring case and spaces", () => {
    assert.equal(usernameMatches("  Sam_1 ", "sam_1"), true);
    assert.equal(usernameMatches("sam_1", "sam_1"), true);
  });

  it("refuses another username, a malformed one or an account with none", () => {
    assert.equal(usernameMatches("ada_1", "sam_1"), false);
    assert.equal(usernameMatches("sa", "sa"), false);
    assert.equal(usernameMatches("", ""), false);
    assert.equal(usernameMatches("sam_1", null), false);
    assert.equal(usernameMatches("sam_1@users.coere.ai", "sam_1"), false);
  });
});
