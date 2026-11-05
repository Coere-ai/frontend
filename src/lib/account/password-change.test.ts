import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { codeSendRefusal, newPasswordProblem, passwordRefusal, UNAVAILABLE } from "./password-change";

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
  it("asks for an emailed code when Supabase needs a recent sign in", () => {
    for (const code of ["reauthentication_needed", "reauth_nonce_missing"]) {
      const refusal = passwordRefusal(code);
      assert.equal(refusal.needsCode, true);
      assert.match(refusal.message, /sign in from the last day/);
    }
  });

  it("keeps the code box for a wrong or expired code", () => {
    assert.equal(passwordRefusal("reauthentication_not_valid").needsCode, true);
    assert.equal(passwordRefusal("otp_expired").needsCode, true);
  });

  it("names the password problems Supabase finds", () => {
    assert.deepEqual(passwordRefusal("same_password"), { message: "That is already your password.", needsCode: false });
    assert.equal(passwordRefusal("weak_password").message, "Choose a password that is harder to guess.");
  });

  it("falls back to try again for anything else", () => {
    assert.deepEqual(passwordRefusal(undefined), { message: UNAVAILABLE, needsCode: false });
    assert.deepEqual(passwordRefusal("unexpected_failure"), { message: UNAVAILABLE, needsCode: false });
  });
});

describe("codeSendRefusal", () => {
  it("asks for a wait when a code just went out", () => {
    assert.match(codeSendRefusal("over_email_send_rate_limit"), /Wait a minute/);
    assert.equal(codeSendRefusal(undefined), UNAVAILABLE);
  });
});
