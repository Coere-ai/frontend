import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import { credentialsMatch } from "./credentials";
import { issueSessionToken, verifySessionToken } from "./session-token";

// USER is set by every shell, so each test states both values itself.
beforeEach(() => {
  process.env.USER = "owner";
  process.env.PASSWORD = "correct horse";
});

test("credentials match only when both halves are right", () => {
  assert.equal(credentialsMatch("owner", "correct horse"), true);
  assert.equal(credentialsMatch("owner", "wrong"), false);
  assert.equal(credentialsMatch("someone", "correct horse"), false);
  assert.equal(credentialsMatch("", ""), false);
});

test("nobody signs in when either value is missing", () => {
  delete process.env.PASSWORD;
  assert.equal(credentialsMatch("owner", ""), false);
  assert.equal(credentialsMatch("owner", "\u0000unset"), false);
  process.env.PASSWORD = "correct horse";
  delete process.env.USER;
  assert.equal(credentialsMatch("", "correct horse"), false);
  assert.throws(() => issueSessionToken());
});

test("a fresh token verifies, an edited one does not", () => {
  const token = issueSessionToken();
  assert.equal(verifySessionToken(token), true);
  const [payload, sig] = token.split(".");
  const forged = Buffer.from(JSON.stringify({ iat: 0, exp: 4102444800, jti: "x" })).toString("base64url");
  assert.equal(verifySessionToken(`${forged}.${sig}`), false);
  assert.equal(verifySessionToken(`${payload}.`), false);
  assert.equal(verifySessionToken("nonsense"), false);
  assert.equal(verifySessionToken(undefined), false);
});

test("changing the password signs every session out", () => {
  const token = issueSessionToken();
  process.env.PASSWORD = "a new password";
  assert.equal(verifySessionToken(token), false);
  delete process.env.PASSWORD;
  assert.equal(verifySessionToken(token), false);
});
