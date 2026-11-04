import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { serverAccountError } from "./server-errors";

const body = (type: string, message: string, details?: object) => JSON.stringify({ type: "error", error: { type, message, ...(details ? { details } : {}) } });

describe("serverAccountError", () => {
  it("knows Coere's own key and account errors", () => {
    assert.equal(serverAccountError(401, body("authentication_error", "invalid x-api-key")), "401");
    assert.equal(serverAccountError(402, ""), "402");
    assert.equal(serverAccountError(403, body("permission_error", "no")), "403");
    assert.equal(serverAccountError(400, body("invalid_request_error", "Your credit balance is too low to access the Anthropic API.")), "400 account");
    assert.equal(serverAccountError(400, body("invalid_request_error", "You have reached your specified API usage limits.")), "400 account");
    assert.equal(
      serverAccountError(429, body("rate_limit_error", "spend limit", { error_code: "enforced_spend_limit_reached" })),
      "429 enforced_spend_limit_reached",
    );
  });

  it("passes the request's own errors through", () => {
    assert.equal(serverAccountError(400, body("invalid_request_error", "prompt is too long")), null);
    assert.equal(serverAccountError(429, body("rate_limit_error", "slow down")), null);
    assert.equal(serverAccountError(400, "not json"), null);
    assert.equal(serverAccountError(404, body("not_found_error", "model: x")), null);
    assert.equal(serverAccountError(529, body("overloaded_error", "Overloaded")), null);
  });
});
