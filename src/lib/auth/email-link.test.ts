import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { continuePath, linkFailedPath, readEmailLink } from "./email-link";

describe("readEmailLink", () => {
  it("keeps a well formed link", () => {
    assert.deepEqual(readEmailLink("a1b2c3d4e5f6", "email", "/connect?ext=a"), { tokenHash: "a1b2c3d4e5f6", type: "email", next: "/connect?ext=a" });
    assert.equal(readEmailLink("a1b2c3d4e5f6", "invite", null)?.next, "/dashboard");
  });

  it("refuses a missing or odd token hash and an unknown type", () => {
    for (const [hash, type] of [
      [null, "email"],
      ["short", "email"],
      ["a1b2c3d4 e5f6", "email"],
      ["a1b2c3d4e5f6", "recovery"],
      ["a1b2c3d4e5f6", null],
    ]) {
      assert.equal(readEmailLink(hash, type, "/dashboard"), null);
    }
  });

  it("sends an unsafe next to the dashboard", () => {
    assert.equal(readEmailLink("a1b2c3d4e5f6", "email", "/\t/evil.com")?.next, "/dashboard");
  });
});

describe("continuePath", () => {
  it("round trips through the confirm page's query", () => {
    const path = continuePath({ tokenHash: "a1b2c3d4e5f6", type: "signup", next: "/connect?ext=a&state=b" });
    const query = new URL(path, "https://www.coere.ai").searchParams;
    assert.equal(new URL(path, "https://www.coere.ai").pathname, "/auth/continue");
    assert.deepEqual(readEmailLink(query.get("token_hash"), query.get("type"), query.get("next")), {
      tokenHash: "a1b2c3d4e5f6",
      type: "signup",
      next: "/connect?ext=a&state=b",
    });
  });
});

describe("linkFailedPath", () => {
  it("keeps next for after sign in", () => {
    assert.equal(linkFailedPath("/connect?ext=a"), "/sign-in?error=link&next=%2Fconnect%3Fext%3Da");
  });
});
