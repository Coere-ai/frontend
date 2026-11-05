import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { consoleSrc, consoleTabFor, dashboardPath } from "./console-tab";

describe("consoleTabFor", () => {
  it("opens Home at /dashboard", () => {
    assert.equal(consoleTabFor(undefined), "home");
    assert.equal(consoleTabFor([]), "home");
  });

  it("maps the plan's addresses", () => {
    assert.equal(consoleTabFor(["memory"]), "memory");
    assert.equal(consoleTabFor(["usage"]), "statistics");
    assert.equal(consoleTabFor(["settings"]), "settings");
    assert.equal(consoleTabFor(["account"]), "settings");
    assert.equal(consoleTabFor(["organization"]), "organization");
  });

  it("keeps the extension's console.open routes, whose last part is the Console's id", () => {
    for (const id of ["library", "search", "import", "logs", "transfer", "platforms", "folder", "statistics"]) assert.equal(consoleTabFor([id]), id);
    assert.equal(consoleTabFor(["chats"]), "library");
  });

  it("has no page for anything else", () => {
    for (const s of [["apps"], ["benchmarks"], ["evals"], ["memory", "x"], ["Memory"], ["__proto__"], ["constructor"], [""]]) assert.equal(consoleTabFor(s), null);
  });
});

describe("consoleSrc", () => {
  it("is the extension's own console.html, embedded", () => {
    assert.equal(consoleSrc("a".repeat(32), "statistics"), `chrome-extension://${"a".repeat(32)}/console.html?tab=statistics&embed=1`);
  });
});

describe("dashboardPath", () => {
  it("rebuilds the address to come back to after signing in", () => {
    assert.equal(dashboardPath(undefined), "/dashboard");
    assert.equal(dashboardPath(["usage"]), "/dashboard/usage");
  });
});
