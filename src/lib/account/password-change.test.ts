import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { currentPasswordRefusal, newPasswordProblem, passwordRefusal, SIGN_IN_AGAIN, UNAVAILABLE } from "./password-change";

describe("newPasswordProblem", () => {
  it("asks for 10 characters", () => {
    assert.equal(newPasswordProblem("123456789", "123456789"), "Use at least 10 characters.");
  });

  it("asks for the same password twice", () => {
    assert.equal(newPasswordProblem("1234567890", "1234567891"), "The two passwords are not the same.");
  });

  it("passes a long enough pair that matches", () => {
    assert.equal(newPasswordProblem("1234567890", "1234567890"), null);
  });
});

describe("passwordRefusal", () => {
  it("says to sign in again when Supabase wants a recent sign in", () => {
    for (const code of ["reauthentication_needed", "reauth_nonce_missing", "reauthentication_not_valid"]) {
      assert.equal(passwordRefusal(code), SIGN_IN_AGAIN);
    }
  });

  it("never offers an emailed code", () => {
    for (const code of ["reauthentication_needed", "otp_expired", undefined]) assert.doesNotMatch(passwordRefusal(code), /email|code/i);
  });

  it("names the password problems Supabase finds", () => {
    assert.equal(passwordRefusal("same_password"), "That is already your password.");
    assert.equal(passwordRefusal("weak_password"), "Choose a password that is harder to guess.");
  });

  it("falls back to try again for anything else", () => {
    assert.equal(passwordRefusal(undefined), UNAVAILABLE);
    assert.equal(passwordRefusal("unexpected_failure"), UNAVAILABLE);
  });
});

describe("currentPasswordRefusal", () => {
  it("lets a right current password through", () => {
    assert.equal(currentPasswordRefusal("ok"), null);
  });

  it("says the current password is wrong, too many tries, or try later", () => {
    assert.equal(currentPasswordRefusal("wrong"), "Your current password is wrong.");
    assert.match(currentPasswordRefusal("limited") ?? "", /^Too many tries/);
    assert.equal(currentPasswordRefusal("unavailable"), UNAVAILABLE);
  });
});
