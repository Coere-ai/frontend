import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { extensionCookie, firstAnswering, hostStep } from "./find-extension";

const A = "a".repeat(32);
const B = "b".repeat(32);

describe("firstAnswering", () => {
  it("asks in order and stops at the first that answers", async () => {
    const asked: string[] = [];
    const found = await firstAnswering([A, B], async (id) => {
      asked.push(id);
      return true;
    });
    assert.equal(found, A);
    assert.deepEqual(asked, [A]);
  });

  it("goes on past an id with no Coere, and answers null when none does", async () => {
    assert.equal(await firstAnswering([A, B], async (id) => id === B), B);
    assert.equal(await firstAnswering([A, B], async () => false), null);
    assert.equal(await firstAnswering([], async () => true), null);
  });
});

describe("hostStep", () => {
  it("frames the id the server allowed in the policy", () => {
    assert.deepEqual(hostStep(A, A, null), { kind: "frame", id: A });
  });

  it("reloads once for a different id, so the policy can name it", () => {
    assert.deepEqual(hostStep(B, A, null), { kind: "reload", id: B });
    assert.deepEqual(hostStep(B, null, null), { kind: "reload", id: B });
  });

  it("does not reload twice for the same id", () => {
    assert.deepEqual(hostStep(B, null, B), { kind: "missing" });
  });

  it("says Coere is missing when nothing answered", () => {
    assert.deepEqual(hostStep(null, A, null), { kind: "missing" });
  });
});

describe("extensionCookie", () => {
  it("writes coere_ext for 400 days, secure on https", () => {
    assert.equal(extensionCookie(A, true), `coere_ext=${A}; Path=/; Max-Age=34560000; SameSite=Lax; Secure`);
    assert.equal(extensionCookie(A, false), `coere_ext=${A}; Path=/; Max-Age=34560000; SameSite=Lax`);
  });
});
