import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { allowedIds, candidateIds, cookieExtensionId } from "./extension-ids";
import { answeredOk, backupMessage, helloMessage, openMessage, OPEN_TARGETS, readHello, settingsMessage } from "./messages";

const A = "a".repeat(32);
const B = "bcdefghijklmnopabcdefghijklmnopa";

describe("bridge messages", () => {
  it("has the shapes of section 5", () => {
    assert.deepEqual(helloMessage(), { type: "coere.hello" });
    assert.deepEqual(openMessage("library"), { type: "coere.open", target: "library" });
    assert.deepEqual(backupMessage(), { type: "coere.backup" });
    assert.deepEqual(settingsMessage(), { type: "coere.settings" });
    assert.deepEqual([...OPEN_TARGETS], ["library", "memory", "home", "cori", "settings-folder", "settings-import", "settings-logs", "settings-transfer"]);
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

  it("counts only ok: true as done", () => {
    assert.equal(answeredOk({ ok: true }), true);
    assert.equal(answeredOk({ ok: "true" }), false);
    assert.equal(answeredOk(null), false);
  });
});

describe("extension ids", () => {
  it("reads the coere_ext cookie only when it holds an id", () => {
    assert.equal(cookieExtensionId(`a=1; coere_ext=${A}; b=2`), A);
    assert.equal(cookieExtensionId("coere_ext=not-an-id"), null);
    assert.equal(cookieExtensionId("other=1"), null);
  });

  it("tries the cookie's id first, then the allowed ones, each once", () => {
    assert.deepEqual(candidateIds(`coere_ext=${B}`, [A, B, "bad"]), [B, A]);
    assert.deepEqual(candidateIds("", [A]), [A]);
    assert.deepEqual(candidateIds("", []), []);
  });

  it("splits the server's list", () => {
    assert.deepEqual(allowedIds(` ${A} ,nope,${B}`), [A, B]);
    assert.deepEqual(allowedIds(undefined), []);
  });
});
