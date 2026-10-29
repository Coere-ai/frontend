import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, ACCESS_TTL_SECONDS } from "@/lib/access/constants";
import { accessCredentials, credentialsMatch, passSecret } from "@/lib/access/credentials";
import { issuePass } from "@/lib/access/token";

/** A failed attempt waits this long, which makes guessing slow without bothering a person. */
const FAILURE_DELAY_MS = 800;

/**
 * Handles the sign in form. A plain form POST and a 303 redirect keep this
 * working without JavaScript, and the redirect is a full page load, so the
 * browser fetches the new site fresh instead of reusing the old one.
 */
export async function POST(request: NextRequest) {
  const credentials = accessCredentials();
  const form = await request.formData();
  const user = String(form.get("user") ?? "");
  const password = String(form.get("password") ?? "");

  if (!credentials || !(await credentialsMatch(credentials, user, password))) {
    await new Promise((resolve) => setTimeout(resolve, FAILURE_DELAY_MS));
    const reason = credentials ? "wrong" : "unset";
    return NextResponse.redirect(new URL(`/access?error=${reason}`, request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(ACCESS_COOKIE, await issuePass(passSecret(credentials)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TTL_SECONDS,
  });
  return response;
}
