import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { consoleSrc, consoleTabFor, dashboardPath, onboardingSrc } from "./console-tab";

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
    assert.equal(consoleSrc("a".repeat(32), "home", true), `chrome-extension://${"a".repeat(32)}/console.html?tab=home&tour=1&embed=1`);
  });
});

describe("dashboardPath", () => {
  it("rebuilds the address to come back to after signing in", () => {
    assert.equal(dashboardPath(undefined), "/dashboard");
    assert.equal(dashboardPath(["usage"]), "/dashboard/usage");
  });
});

describe("onboardingSrc", () => {
  const id = "a".repeat(32);
  it("is the extension's own onboarding.html, embedded, with the step the local page took", () => {
    assert.equal(onboardingSrc(id), `chrome-extension://${id}/onboarding.html?embed=1`);
    assert.equal(onboardingSrc(id, { step: "build", tour: ["1", "2"] }), `chrome-extension://${id}/onboarding.html?step=build&tour=1&embed=1`);
  });

  it("passes no script, address or odd key to the frame", () => {
    const src = onboardingSrc(id, { step: "<script>", next: "https://evil.example/", Embed: "0", embed: "0", ok: "fine" });
    assert.equal(src, `chrome-extension://${id}/onboarding.html?ok=fine&embed=1`);
  });
});
