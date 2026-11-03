import { AdminShell } from "@/admin/admin-shell";
import { StatisticsPanel } from "@/admin/statistics/statistics-panel";
import { isSignedIn } from "@/lib/auth/session";
import { SignInForm } from "@/stats/sign-in-form";

// Rendered per request: it reads a cookie, and it must never be cached.
export const dynamic = "force-dynamic";

/**
 * Signed out, the page IS the sign-in form and nothing else: no heading, no
 * product name, no hint of what it guards. Signed in, it is Statistics. The
 * session is checked here even though the proxy has looked at it already.
 */
export default async function AdminPage() {
  if (!(await isSignedIn())) return <SignInForm />;
  return (
    <AdminShell>
      <StatisticsPanel />
    </AdminShell>
  );
}
