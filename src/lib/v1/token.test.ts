import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { describe, it } from "node:test";

import { newDeviceToken, parseBearer, pkceMatches, tokenHash, tokenHint } from "./token";

describe("device tokens", () => {
  it("are the prefix and 43 base64url characters", () => {
    const token = newDeviceToken();
    assert.match(token, /^coere_dev_[A-Za-z0-9_-]{43}$/);
    assert.notEqual(newDeviceToken(), token);
  });

  it("hash to lowercase hex SHA-256 and hint with the last 4 characters", () => {
    const token = newDeviceToken();
    assert.equal(tokenHash(token), createHash("sha256").update(token).digest("hex"));
    assert.equal(tokenHint(token), token.slice(-4));
    assert.equal(tokenHint(token).length, 4);
  });
});

describe("parseBearer", () => {
  const token = newDeviceToken();

  it("reads a well formed header", () => {
    assert.equal(parseBearer(`Bearer ${token}`), token);
    assert.equal(parseBearer(`bearer ${token}`), token);
  });

  it("refuses anything else", () => {
    assert.equal(parseBearer(null), null);
    assert.equal(parseBearer(""), null);
    assert.equal(parseBearer(token), null);
    assert.equal(parseBearer(`Basic ${token}`), null);
    assert.equal(parseBearer(`Bearer ${token}x`), null);
    assert.equal(parseBearer(`Bearer coere_code_${token.slice(10)}`), null);
    assert.equal(parseBearer(`Bearer ${token} extra`), null);
  });
});

describe("pkceMatches", () => {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

  it("accepts the verifier the challenge was made from", () => {
    assert.equal(pkceMatches(verifier, challenge), true);
  });

  it("refuses another verifier, a bad shape or another challenge", () => {
    assert.equal(pkceMatches(randomBytes(32).toString("base64url"), challenge), false);
    assert.equal(pkceMatches(`${verifier}=`, challenge), false);
    assert.equal(pkceMatches("short", challenge), false);
    assert.equal(pkceMatches(verifier, challenge.slice(1)), false);
    assert.equal(pkceMatches(verifier, ""), false);
  });
});
