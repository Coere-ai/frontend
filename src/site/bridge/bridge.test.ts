import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { helloMessage, readHello } from "./messages";

describe("bridge messages", () => {
  it("has the hello of section 5", () => {
    assert.deepEqual(helloMessage(), { type: "coere.hello" });
  });

  it("reads a hello answer and refuses anything else", () => {
    assert.deepEqual(readHello({ ok: true, version: "1.1.3", build: 4, signedIn: true, userId: "u1" }), {
      version: "1.1.3",
      build: 4,
      signedIn: true,
      userId: "u1",
    });
    assert.deepEqual(readHello({ ok: true }), { version: "", build: 0, signedIn: false, userId: null });
    assert.equal(readHello({ ok: false, reason: "unknown" }), null);
    assert.equal(readHello(undefined), null);
    assert.equal(readHello("ok"), null);
  });
});
