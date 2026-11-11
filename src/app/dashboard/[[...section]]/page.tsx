import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/user";
import { consoleTabFor, dashboardPath } from "@/lib/dashboard/host/console-tab";
import { frameExtensionId, helloCandidates } from "@/lib/dashboard/host/frame-id";
import { EXTENSION_COOKIE } from "@/lib/supabase/cookie-options";
import { ConsoleHost } from "@/site/console-host/console-host";

/**
 * coere.ai/dashboard: the extension's own Console, framed full screen
 * (docs/accounts.md 7). The page lives outside the site's layout, so no
 * navbar or footer shows around it. It renders per request: it checks the
 * session, and the proxy gives it a nonce policy whose frame-src names
 * exactly the extension `frameId` below and nothing else.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage({ params, searchParams }: PageProps<"/dashboard/[[...section]]">) {
  const { section } = await params;
  // The finished onboarding opens the dashboard with Cori's tour running (the extension's own ?tour=1).
  const tour = (await searchParams).tour === "1";
  const tab = consoleTabFor(section);
  if (!tab) notFound();
  await requireUser(dashboardPath(section));

  const cookie = (await cookies()).get(EXTENSION_COOKIE)?.value;
  const rules = { ids: process.env.COERE_EXTENSION_IDS, production: process.env.NODE_ENV === "production" };
  return <ConsoleHost target={{ page: "console", tab, tour }} frameId={frameExtensionId(cookie, rules)} candidates={helloCandidates(cookie, rules)} />;
}
