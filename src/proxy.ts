import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, PREVIEW_PREFIX } from "@/lib/access/constants";
import { validPassExpiry } from "@/lib/access/pass";

/**
 * Serves the private new site at the real addresses for anyone holding a
 * valid pass, and the current site for everyone else.
 *
 * With a pass, a page request such as /blog is rewritten to /preview/blog, so
 * the browser keeps showing coere.ai/blog. Without one, nothing under
 * /preview answers at all: pages, films and images all return the 404 page.
 */
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const pass = request.cookies.get(ACCESS_COOKIE)?.value;
  // Only pay for the signature check when a cookie is there to check.
  const granted = pass ? (await validPassExpiry(pass)) !== null : false;

  if (isPreviewPath(pathname) || isPreviewImage(pathname, searchParams)) {
    if (!granted) return notFound(request);
    // A page asked for by its inner address goes to its clean one instead.
    if (isPreviewPath(pathname) && isPage(pathname)) {
      const clean = request.nextUrl.clone();
      clean.pathname = pathname.slice(PREVIEW_PREFIX.length) || "/";
      return NextResponse.redirect(clean);
    }
    return keepPrivate(NextResponse.next());
  }

  if (!granted || !isPage(pathname) || isOwnRoute(pathname)) {
    return NextResponse.next();
  }

  const target = request.nextUrl.clone();
  target.pathname = pathname === "/" ? PREVIEW_PREFIX : `${PREVIEW_PREFIX}${pathname}`;
  return keepPrivate(NextResponse.rewrite(target));
}

/** True for /preview and anything under it, including its .rsc payloads. */
function isPreviewPath(pathname: string): boolean {
  return pathname === PREVIEW_PREFIX || pathname.startsWith(`${PREVIEW_PREFIX}/`) || pathname.startsWith(`${PREVIEW_PREFIX}.`);
}

/** The image optimizer must not hand out the new site's images either. */
function isPreviewImage(pathname: string, params: URLSearchParams): boolean {
  return pathname === "/_next/image" && (params.get("url") ?? "").startsWith(PREVIEW_PREFIX);
}

/** Pages have no file extension in their last segment; files like /robots.txt do. */
function isPage(pathname: string): boolean {
  const last = pathname.split("/").pop() ?? "";
  return !last.includes(".") && !pathname.startsWith("/_next/");
}

/** Routes that must keep working with a pass: the sign in itself and any API. */
function isOwnRoute(pathname: string): boolean {
  return pathname === "/access" || pathname.startsWith("/access/") || pathname.startsWith("/api/");
}

/** Shows the site's normal 404 page, so the private paths look like nothing at all. */
function notFound(request: NextRequest): NextResponse {
  return NextResponse.rewrite(new URL("/404", request.url), { status: 404 });
}

/** The new site must never be indexed or cached by a shared cache. */
function keepPrivate(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Vary", "Cookie");
  return response;
}

export const config = {
  // Every request but the build's own static chunks and dev hot reload.
  matcher: ["/((?!_next/static|_next/webpack-hmr).*)"],
};
