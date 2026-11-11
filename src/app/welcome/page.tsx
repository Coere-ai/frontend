import type { Metadata } from "next";
import { cookies } from "next/headers";

import { requireUser } from "@/lib/auth/user";
import { frameExtensionId, helloCandidates } from "@/lib/dashboard/host/frame-id";
import { EXTENSION_COOKIE } from "@/lib/supabase/cookie-options";
import { ConsoleHost } from "@/site/console-host/console-host";

/**
 * coere.ai/welcome: the extension's own onboarding page, framed full screen
 * as /dashboard frames the Console (docs/accounts.md 7), so a v4 build's
 * first run and its memory build show live on the site. It lives outside
 * the site's layout, checks the session, and gets the dashboard's nonce
 * policy whose frame-src names exactly the extension below. The step and
 * any state the local page took from its query pass on to the frame as
 * plain words (onboardingSrc).
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
};

export default async function WelcomePage({ searchParams }: PageProps<"/welcome">) {
  const params = await searchParams;
  const query: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    const value = Array.isArray(v) ? v[0] : v;
    if (typeof value === "string") query[k] = value;
  }
  const back = new URLSearchParams(query).toString();
  await requireUser(back ? `/welcome?${back}` : "/welcome");

  const cookie = (await cookies()).get(EXTENSION_COOKIE)?.value;
  const rules = { ids: process.env.COERE_EXTENSION_IDS, production: process.env.NODE_ENV === "production" };
  return <ConsoleHost target={{ page: "onboarding", query }} frameId={frameExtensionId(cookie, rules)} candidates={helloCandidates(cookie, rules)} />;
}
