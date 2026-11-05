import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadedElsewhere, pathOf } from "./loaded-path";

describe("loadedElsewhere", () => {
  it("is true when the document loaded at sign in and now shows connect", () => {
    assert.equal(loadedElsewhere("https://www.coere.ai/sign-in?next=%2Fconnect", "/connect"), true);
  });
  it("is false when the document loaded at connect itself", () => {
    assert.equal(loadedElsewhere("https://www.coere.ai/connect?ext=a&state=b", "/connect"), false);
  });
  it("is false when the browser gives no address", () => {
    assert.equal(loadedElsewhere(undefined, "/connect"), false);
    assert.equal(loadedElsewhere("", "/connect"), false);
  });
  it("reads only the path", () => {
    assert.equal(pathOf("https://www.coere.ai/connect?x=1#y"), "/connect");
    assert.equal(pathOf("not an address"), null);
  });
});
