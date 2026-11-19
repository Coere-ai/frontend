import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// /account reads the session only once Supabase is configured, so a build
// without those settings found nothing per request in it and served one
// static redirect to /sign-in for good: a signed in person then went round
// /account and /sign-in until the browser gave up, and a static page carries
// no nonce for the proxy's policy. The page states that it renders per
// request, as every account page must (src/proxy.ts).
test("/account renders per request, whatever the build's settings", () => {
  const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
  assert.match(source, /^export const dynamic = "force-dynamic";$/m);
});
