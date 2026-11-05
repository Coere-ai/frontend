import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { frameExtensionId, frameSource, helloCandidates } from "./frame-id";

const A = "a".repeat(32);
const B = "b".repeat(32);
const C = "c".repeat(32);

describe("frameExtensionId", () => {
  it("takes the cookie's id when the list allows it", () => {
    assert.equal(frameExtensionId(A, { ids: `${A},${B}`, production: true }), A);
    assert.equal(frameExtensionId(C, { ids: `${A},${B}`, production: true }), null);
  });

  it("allows any well formed id outside production while the list is unset, and none in production", () => {
    assert.equal(frameExtensionId(C, { ids: undefined, production: false }), C);
    assert.equal(frameExtensionId(C, { ids: undefined, production: true }), null);
  });

  it("refuses a missing or malformed cookie", () => {
    for (const cookie of [undefined, "", "abc", `${A}x`, "z".repeat(32), `${A}; frame-src *`]) assert.equal(frameExtensionId(cookie, { ids: undefined, production: false }), null);
  });
});

describe("helloCandidates", () => {
  it("puts the allowed cookie id first, then each allowed id once", () => {
    assert.deepEqual(helloCandidates(B, { ids: `${A}, ${B}`, production: true }), [B, A]);
    assert.deepEqual(helloCandidates(undefined, { ids: `${A},${B}`, production: true }), [A, B]);
  });

  it("never offers an id the server would not frame", () => {
    assert.deepEqual(helloCandidates(C, { ids: A, production: true }), [A]);
    assert.deepEqual(helloCandidates(undefined, { ids: "nope, ,", production: true }), []);
    assert.deepEqual(helloCandidates(undefined, { ids: undefined, production: false }), []);
    assert.deepEqual(helloCandidates(C, { ids: undefined, production: false }), [C]);
  });
});

describe("frameSource", () => {
  it("names exactly the one extension origin", () => {
    assert.equal(frameSource(A), `chrome-extension://${A}/`);
    assert.equal(frameSource(null), null);
  });
});
