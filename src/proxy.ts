import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session-token";
import { refreshSession } from "@/lib/supabase/refresh";

/**
 * The gate in front of the private dashboard, and nothing else.
 *
 * The matcher below covers /statistics and /api/statistics alone, so every
 * public page is served exactly as it was built: static, untouched, never seen
 * by this file. This is a second gate, never the only one. The page and the
 * data route check the session again on the server.
 *
 * Signed out:
 *   /statistics             passes, because signed out that page IS the form
 *   /statistics/anything    goes to the home page, not to a login screen or a
 *                           401, either of which would confirm something is there
 *   /api/statistics/...     answers 404, not 401, for the same reason
 *
 * Everything here is also marked noindex, and the dashboard's document gets a
 * per-request nonce Content-Security-Policy.
 *
 * The account pages (sign in, sign up, the emailed link, /connect, the
 * person's dashboard) pass through here too, for two things only: the
 * Supabase session is refreshed before they render, and they get the same
 * nonce policy and noindex. Who may see what is decided by each page, action
 * and route itself.
 */

const NOINDEX = "noindex, nofollow, noarchive";

/**
 * The dashboard's policy. Next reads the nonce out of the request's own
 * `content-security-policy` header while it renders and stamps it on every
 * script it emits, so this is set on the request as well as the response.
 * `'strict-dynamic'` then lets those scripts load the hashed chunks, while an
 * injected script, with no nonce and no trusted loader, never runs. Frames are
 * same origin only: the dashboard previews the live pages in small frames.
 */
function buildCsp(nonce: string, isDev: boolean): string {
  const directives: Array<[string, string[]]> = [
    ["default-src", ["'self'"]],
    // `https:` is the fallback for browsers that do not know strict-dynamic;
    // React's dev tooling needs eval, in development only.
    ["script-src", ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", "https:", ...(isDev ? ["'unsafe-eval'"] : [])]],
    // For the inline style attributes React writes; a nonce cannot cover those.
    ["style-src", ["'self'", "'unsafe-inline'"]],
    ["img-src", ["'self'", "data:", "blob:"]],
    ["font-src", ["'self'"]],
    ["connect-src", ["'self'", ...(isDev ? ["ws:", "wss:"] : [])]],
    ["object-src", ["'none'"]],
    ["base-uri", ["'none'"]],
    ["form-action", ["'self'"]],
    ["frame-ancestors", ["'none'"]],
    ["frame-src", ["'self'"]],
  ];
  const policy = directives.map(([name, values]) => `${name} ${values.join(" ")}`).join("; ");
  return isDev ? policy : `${policy}; upgrade-insecure-requests`;
}

function notFound(): NextResponse {
  return new NextResponse("Not found", {
    status: 404,
    headers: { "cache-control": "no-store", "x-robots-tag": NOINDEX },
  });
}

/** The private account paths. Keep in step with the matcher below. */
const ACCOUNT_PATH = /^\/(sign-in|sign-up|connect)$|^\/(auth|dashboard|join)(\/|$)/;

/** A fresh 16 byte nonce, well past the 128 bits the CSP spec asks for. */
function newNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

/**
 * An account page: refresh the session first, so the request headers built
 * after it carry the new cookies to the page, then add the policy. Every
 * account page renders per request (it reads the session), which a nonce
 * needs anyway.
 */
async function accountPage(request: NextRequest): Promise<NextResponse> {
  const refreshed = await refreshSession(request);
  const nonce = newNonce();
  const csp = buildCsp(nonce, process.env.NODE_ENV === "development");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("content-security-policy", csp);
  response.headers.set("x-robots-tag", NOINDEX);
  return refreshed.apply(response);
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  if (ACCOUNT_PATH.test(pathname)) return accountPage(request);

  const signedIn = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/api/statistics")) {
    if (!signedIn) return notFound();
    const response = NextResponse.next();
    response.headers.set("x-robots-tag", NOINDEX);
    return response;
  }

  if (pathname !== "/statistics" && !signedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 16 bytes of CSPRNG entropy, well past the 128 bits the CSP spec asks for.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const nonce = btoa(String.fromCharCode(...bytes));
  const csp = buildCsp(nonce, process.env.NODE_ENV === "development");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("content-security-policy", csp);
  response.headers.set("x-robots-tag", NOINDEX);
  return response;
}

export const config = {
  // Only the private pages and their data, so public pages stay static.
  // `:path*` matches zero or more segments, so "/statistics/:path*" covers
  // /statistics itself as well.
  matcher: [
    "/statistics/:path*",
    "/api/statistics/:path*",
    "/sign-in",
    "/sign-up",
    "/auth/:path*",
    "/connect",
    "/dashboard/:path*",
    "/join/:path*",
  ],
};
