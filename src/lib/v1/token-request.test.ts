import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { codeUsable, parseTokenRequest } from "./token-request";

const good = {
  code: `coere_code_${"a".repeat(43)}`,
  verifier: "b".repeat(43),
  extensionId: "abcdefghijklmnopabcdefghijklmnop",
  extensionVersion: "1.1.3",
  name: "Chrome on macOS",
};

describe("parseTokenRequest", () => {
  it("reads a well formed body", () => {
    assert.deepEqual(parseTokenRequest(good), good);
    assert.deepEqual(parseTokenRequest({ ...good, extensionVersion: "<x>", name: 5 }), {
      ...good,
      extensionVersion: null,
      name: null,
    });
  });

  it("refuses a malformed code, verifier or extension id", () => {
    assert.equal(parseTokenRequest(null), null);
    assert.equal(parseTokenRequest({ ...good, code: "coere_dev_" + "a".repeat(43) }), null);
    assert.equal(parseTokenRequest({ ...good, verifier: "short" }), null);
    assert.equal(parseTokenRequest({ ...good, extensionId: "z".repeat(32) }), null);
  });
});

describe("codeUsable", () => {
  const now = Date.parse("2026-11-03T10:00:00Z");
  const row = { used_at: null, expires_at: "2026-11-03T10:04:00Z", extension_id: good.extensionId };

  it("accepts an unused code within its 5 minutes for the same extension", () => {
    assert.equal(codeUsable(row, good.extensionId, now), true);
  });

  it("refuses a used, expired or other extension's code", () => {
    assert.equal(codeUsable({ ...row, used_at: "2026-11-03T09:59:00Z" }, good.extensionId, now), false);
    assert.equal(codeUsable({ ...row, expires_at: "2026-11-03T10:00:00Z" }, good.extensionId, now), false);
    assert.equal(codeUsable(row, "ponmlkjihgfedcbaponmlkjihgfedcba", now), false);
  });
});
