import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { connectedExtensionId, EXTENSION_SIGN_OUT, signOutExtension } from "./extension-sign-out";

const ID = "a".repeat(32);

describe("connectedExtensionId", () => {
  it("reads the coere_ext cookie among others", () => {
    assert.equal(connectedExtensionId(`coere_signed_in=1; coere_ext=${ID}; other=x`), ID);
  });

  it("refuses a malformed id or no cookie", () => {
    assert.equal(connectedExtensionId("coere_ext=not-an-id"), null);
    assert.equal(connectedExtensionId(`xcoere_ext=${ID}`), null);
    assert.equal(connectedExtensionId(""), null);
  });
});

describe("signOutExtension", () => {
  it("asks the connected extension with the one fixed message", async () => {
    const sent: Array<[string, unknown]> = [];
    await signOutExtension(`coere_ext=${ID}`, async (id, message) => {
      sent.push([id, message]);
      return { ok: true, answer: { ok: true } };
    });
    assert.deepEqual(sent, [[ID, EXTENSION_SIGN_OUT]]);
    assert.deepEqual(EXTENSION_SIGN_OUT, { type: "coere.sign_out" });
  });

  it("asks nobody without a connected extension, and never throws", async () => {
    let asked = 0;
    await signOutExtension("", async () => {
      asked++;
      return { ok: false, reason: "missing" };
    });
    assert.equal(asked, 0);
    await signOutExtension(`coere_ext=${ID}`, async () => Promise.reject(new Error("gone")));
  });
});
