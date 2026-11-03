import { isSignedIn } from "@/lib/auth/session";
import { SignInForm } from "@/stats/sign-in-form";
import { StatisticsView } from "@/stats/statistics-view";

// Rendered per request: it reads a cookie, and it must never be cached.
export const dynamic = "force-dynamic";

/**
 * Signed out, the page IS the sign-in form and nothing else: no heading, no
 * product name, no hint of what it guards. Signed in, it is the dashboard. The
 * session is checked here even though the proxy has looked at it already.
 */
export default async function StatisticsPage() {
  if (!(await isSignedIn())) return <SignInForm />;
  return <StatisticsView />;
}
