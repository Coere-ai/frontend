import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isSignOutAsk, SIGN_OUT_TYPE } from "./sign-out-message";

const frame = { origin: `chrome-extension://${"a".repeat(32)}`, window: { name: "frame" } };
const ask = { origin: frame.origin, data: { type: SIGN_OUT_TYPE }, source: frame.window };

describe("isSignOutAsk", () => {
  it("takes the fixed ask from the frame the host made", () => {
    assert.equal(isSignOutAsk(ask, frame), true);
  });

  it("refuses another origin, another window, another type or extra data", () => {
    assert.equal(isSignOutAsk({ ...ask, origin: `chrome-extension://${"b".repeat(32)}` }, frame), false);
    assert.equal(isSignOutAsk({ ...ask, origin: "https://evil.example" }, frame), false);
    assert.equal(isSignOutAsk({ ...ask, source: {} }, frame), false);
    assert.equal(isSignOutAsk({ ...ask, source: null }, { ...frame, window: null }), false);
    assert.equal(isSignOutAsk({ ...ask, data: { type: "coere.hello" } }, frame), false);
    assert.equal(isSignOutAsk({ ...ask, data: { type: SIGN_OUT_TYPE, next: "/x" } }, frame), false);
    assert.equal(isSignOutAsk({ ...ask, data: SIGN_OUT_TYPE }, frame), false);
  });
});
