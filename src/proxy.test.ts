import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import { NextRequest } from "next/server";

import { adminGate } from "./lib/auth/admin-gate";
import { SESSION_COOKIE, issueSessionToken } from "./lib/auth/session-token";
import { proxy } from "./proxy";

// The admin guard as the proxy applies it. USER is set by every shell, so
// each test states both values itself. No Supabase settings are set, so an
// account page's session refresh does nothing here.
beforeEach(() => {
  process.env.USER = "owner";
  process.env.PASSWORD = "correct horse";
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_PUBLISHABLE_KEY;
});

const BASE = "https://www.coere.ai";

function request(path: string, cookies: Record<string, string> = {}): NextRequest {
  const cookie = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  return new NextRequest(`${BASE}${path}`, { headers: cookie ? { cookie } : {} });
}

const admin = () => ({ [SESSION_COOKIE]: issueSessionToken() });
/** What an account session's cookie looks like; it must open nothing here. */
const account = { "sb-project-auth-token": "base64-eyJhY2Nlc3NfdG9rZW4iOiJ4In0", coere_signed_in: "1" };

test("the gate's answers for every kind of admin path", () => {
  assert.equal(adminGate("/admin", false), "page");
  assert.equal(adminGate("/admin/users", false), "home");
  assert.equal(adminGate("/admin/users", true), "page");
  assert.equal(adminGate("/api/admin/users", false), "not_found");
  assert.equal(adminGate("/api/admin", false), "not_found");
  assert.equal(adminGate("/api/admin/users", true), "api");
});

test("signed out, /admin is the sign in form with the nonce policy", async () => {
  const res = await proxy(request("/admin"));
  assert.equal(res.headers.get("x-middleware-next"), "1");
  assert.match(res.headers.get("content-security-policy") ?? "", /script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
  assert.match(res.headers.get("x-robots-tag") ?? "", /noindex/);
});

test("signed out, an admin page goes home and a data route answers 404", async () => {
  const page = await proxy(request("/admin/organizations/x"));
  assert.equal(page.status, 307);
  assert.equal(page.headers.get("location"), `${BASE}/`);
  const api = await proxy(request("/api/admin/users"));
  assert.equal(api.status, 404);
  assert.equal(api.headers.get("cache-control"), "no-store");
});

test("an account session never opens the admin panel", async () => {
  const page = await proxy(request("/admin/users", account));
  assert.equal(page.status, 307);
  const api = await proxy(request("/api/admin/statistics", account));
  assert.equal(api.status, 404);
});

test("a forged or edited admin cookie is refused", async () => {
  const token = issueSessionToken();
  const edited = `${token.slice(0, -2)}${token.endsWith("A") ? "B" : "A"}A`;
  assert.equal((await proxy(request("/api/admin/users", { [SESSION_COOKIE]: edited }))).status, 404);
  assert.equal((await proxy(request("/api/admin/users", { [SESSION_COOKIE]: "x.y" }))).status, 404);
});

test("a changed password signs the admin out", async () => {
  const cookies = admin();
  process.env.PASSWORD = "a new password";
  assert.equal((await proxy(request("/api/admin/users", cookies))).status, 404);
});

test("signed in, pages pass with a fresh nonce and data routes pass noindex", async () => {
  const cookies = admin();
  const one = await proxy(request("/admin/users", cookies));
  const two = await proxy(request("/admin/users", cookies));
  assert.equal(one.headers.get("x-middleware-next"), "1");
  assert.notEqual(one.headers.get("content-security-policy"), two.headers.get("content-security-policy"));
  const api = await proxy(request("/api/admin/users", cookies));
  assert.equal(api.headers.get("x-middleware-next"), "1");
  assert.match(api.headers.get("x-robots-tag") ?? "", /noindex/);
});

test("the admin cookie is not an account session: account pages pass without it mattering", async () => {
  const res = await proxy(request("/dashboard", admin()));
  // The proxy only refreshes the account session and adds the policy; the
  // dashboard page itself decides, from the Supabase session alone.
  assert.equal(res.headers.get("x-middleware-next"), "1");
  assert.equal(res.headers.get("location"), null);
});
