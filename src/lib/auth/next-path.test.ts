import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { nextFromLink, safeNext } from "./next-path";

const SITE = ["https://www.coere.ai"];

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

  it("uses the given fallback", () => {
    assert.equal(safeNext("//x", "/sign-in"), "/sign-in");
  });
});

describe("nextFromLink", () => {
  it("reads an unencoded RedirectTo whose query spilled into the link", () => {
    const search = "?token_hash=abc&type=email&next=https://www.coere.ai/connect?ext=aaaa&state=s1&challenge=c1&v=1";
    assert.equal(nextFromLink(search, SITE), "/connect?ext=aaaa&state=s1&challenge=c1&v=1");
  });

  it("reads an encoded RedirectTo", () => {
    const to = encodeURIComponent("https://www.coere.ai/connect?ext=aaaa&state=s1");
    assert.equal(nextFromLink(`?token_hash=abc&type=email&next=${to}`, SITE), "/connect?ext=aaaa&state=s1");
    assert.equal(nextFromLink(`?type=email&next=${encodeURIComponent("/dashboard/usage")}`, SITE), "/dashboard/usage");
  });

  it("sends the bare Site URL to the dashboard", () => {
    assert.equal(nextFromLink("?token_hash=abc&type=email&next=https://www.coere.ai", SITE), "/dashboard");
    assert.equal(nextFromLink("?token_hash=abc&type=email&next=https://www.coere.ai/", SITE), "/dashboard");
  });

  it("refuses another origin", () => {
    assert.equal(nextFromLink("?token_hash=abc&next=https://evil.example/connect", SITE), "/dashboard");
    assert.equal(nextFromLink("?token_hash=abc&next=//evil.example", SITE), "/dashboard");
    assert.equal(nextFromLink(`?next=${encodeURIComponent("//evil.example")}`, SITE), "/dashboard");
  });

  it("falls back with no next or a broken one", () => {
    assert.equal(nextFromLink("?token_hash=abc&type=email", SITE), "/dashboard");
    assert.equal(nextFromLink("?token_hash=abc&next=", SITE), "/dashboard");
    assert.equal(nextFromLink("?next=%E0%A4%A", SITE), "/dashboard");
    assert.equal(nextFromLink("?xnext=/dashboard/usage", SITE), "/dashboard");
  });

  it("takes a plain path too", () => {
    assert.equal(nextFromLink("next=/dashboard/account", SITE), "/dashboard/account");
  });
});
