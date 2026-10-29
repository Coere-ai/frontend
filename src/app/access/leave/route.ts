import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE } from "@/lib/access/constants";

/** Ends the pass early and goes back to the public site. */
export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.delete(ACCESS_COOKIE);
  return response;
}
