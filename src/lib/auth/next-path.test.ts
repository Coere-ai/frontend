import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { safeNext } from "./next-path";

describe("safeNext", () => {
  it("keeps a path on this site", () => {
    assert.equal(safeNext("/connect?ext=a&state=b"), "/connect?ext=a&state=b");
    assert.equal(safeNext("/dashboard/memory"), "/dashboard/memory");
  });

  it("refuses other origins and odd shapes", () => {
    for (const bad of ["https://evil.example", "//evil.example", "/\\evil.example", "evil", "", null, undefined]) {
      assert.equal(safeNext(bad), "/dashboard");
    }
  });

  it("refuses control characters a browser drops from an address", () => {
    for (const bad of ["/\t/evil.com", "/\n/evil.com", "/\r/evil.com", "/\t\t//evil.com", "/\u0000x"]) {
      assert.equal(safeNext(bad), "/dashboard");
    }
  });

  it("percent encodes characters a header cannot carry", () => {
    assert.equal(safeNext("/dashboard/caf\u00e9\u4e2d"), "/dashboard/caf%C3%A9%E4%B8%AD");
  });

  it("uses the given fallback", () => {
    assert.equal(safeNext("//x", "/sign-in"), "/sign-in");
  });
});
