import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CONNECT_CODE_PREFIX, newConnectCode, sha256Hex } from "./code";
import { cleanDeviceName, deviceName } from "./device-name";
import { checkConnectParams, connectPath, extensionAllowed, parseExtensionIds } from "./params";

const EXT = "abcdefghijklmnopabcdefghijklmnop";
const OTHER = "ponmlkjihgfedcbaponmlkjihgfedcba";
const STATE = "A".repeat(21) + "_";
const CHALLENGE = "b".repeat(42) + "-";
const DEV = { extensionIds: undefined, production: false };

describe("parseExtensionIds", () => {
  it("splits on commas and drops blanks", () => {
    assert.deepEqual(parseExtensionIds(` ${EXT} ,, ${OTHER},`), [EXT, OTHER]);
    assert.deepEqual(parseExtensionIds(undefined), []);
    assert.deepEqual(parseExtensionIds(""), []);
  });
});

describe("extensionAllowed", () => {
  it("lets any id through outside production when the list is unset", () => {
    assert.equal(extensionAllowed(EXT, undefined, false), true);
    assert.equal(extensionAllowed(EXT, " ", false), true);
  });

  it("lets none through in production when the list is unset", () => {
    assert.equal(extensionAllowed(EXT, undefined, true), false);
    assert.equal(extensionAllowed(EXT, "", true), false);
  });

  it("holds to the list when it is set", () => {
    assert.equal(extensionAllowed(EXT, `${OTHER},${EXT}`, true), true);
    assert.equal(extensionAllowed(EXT, OTHER, true), false);
    assert.equal(extensionAllowed(EXT, OTHER, false), false);
  });

  it("refuses a malformed id even when listed", () => {
    assert.equal(extensionAllowed("abc", "abc", false), false);
    assert.equal(extensionAllowed(EXT.replace("a", "z"), undefined, false), false);
    assert.equal(extensionAllowed(EXT.toUpperCase(), undefined, false), false);
  });
});

describe("checkConnectParams", () => {
  it("accepts a well formed address", () => {
    const result = checkConnectParams({ ext: EXT, state: STATE, challenge: CHALLENGE, v: "1.1.3" }, DEV);
    assert.deepEqual(result, { ok: true, params: { ext: EXT, state: STATE, challenge: CHALLENGE, v: "1.1.3" } });
  });

  it("names what is wrong", () => {
    assert.deepEqual(checkConnectParams({ state: STATE, challenge: CHALLENGE }, DEV), { ok: false, reason: "extension" });
    assert.deepEqual(checkConnectParams({ ext: EXT, state: "short", challenge: CHALLENGE }, DEV), { ok: false, reason: "state" });
    assert.deepEqual(checkConnectParams({ ext: EXT, state: STATE + "x", challenge: CHALLENGE }, DEV), { ok: false, reason: "state" });
    assert.deepEqual(checkConnectParams({ ext: EXT, state: STATE, challenge: CHALLENGE + "=" }, DEV), { ok: false, reason: "challenge" });
    assert.deepEqual(checkConnectParams({ ext: EXT, state: STATE, challenge: "c".repeat(42) + "+" }, DEV), { ok: false, reason: "challenge" });
  });

  it("treats a repeated key as malformed", () => {
    assert.deepEqual(checkConnectParams({ ext: [EXT, EXT], state: STATE, challenge: CHALLENGE }, DEV), { ok: false, reason: "extension" });
  });

  it("drops an odd version but still connects", () => {
    const result = checkConnectParams({ ext: EXT, state: STATE, challenge: CHALLENGE, v: "<b>" }, DEV);
    assert.equal(result.ok && result.params.v, null);
  });

  it("rebuilds the address", () => {
    assert.equal(
      connectPath({ ext: EXT, state: STATE, challenge: CHALLENGE, v: "1.1.3" }),
      `/connect?ext=${EXT}&state=${STATE}&challenge=${CHALLENGE}&v=1.1.3`,
    );
  });
});

describe("connect codes", () => {
  it("are the prefix and 43 base64url characters", () => {
    const code = newConnectCode();
    assert.ok(code.startsWith(CONNECT_CODE_PREFIX));
    assert.match(code.slice(CONNECT_CODE_PREFIX.length), /^[A-Za-z0-9_-]{43}$/);
    assert.notEqual(newConnectCode(), code);
  });

  it("hash to lowercase hex SHA-256", () => {
    assert.equal(sha256Hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});

describe("deviceName", () => {
  it("names the browser and the system", () => {
    const mac = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
    const win = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0";
    const cros = "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
    const linux = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
    assert.equal(deviceName(mac), "Chrome on macOS");
    assert.equal(deviceName(win), "Edge on Windows");
    assert.equal(deviceName(cros), "Chrome on ChromeOS");
    assert.equal(deviceName(linux), "Chrome on Linux");
    assert.equal(deviceName(""), "Chrome");
  });

  it("is trimmed on the server", () => {
    assert.equal(cleanDeviceName("  Chrome on macOS\n"), "Chrome on macOS");
    assert.equal(cleanDeviceName("x".repeat(80)).length, 60);
    assert.equal(cleanDeviceName(""), "Chrome");
    assert.equal(cleanDeviceName(7), "Chrome");
  });
});
