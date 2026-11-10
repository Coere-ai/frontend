import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isWrongLogin } from "./password-refusal";

describe("isWrongLogin", () => {
  it("takes a wrong password and an unconfirmed account as the person's doing", () => {
    assert.equal(isWrongLogin("invalid_credentials"), true);
    assert.equal(isWrongLogin("email_not_confirmed"), true);
  });

  it("leaves Supabase's own refusals for the log", () => {
    for (const code of ["over_request_rate_limit", "over_email_send_rate_limit", "unexpected_failure", undefined]) assert.equal(isWrongLogin(code), false);
  });
});
