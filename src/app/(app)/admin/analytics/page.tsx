import { AdminShell } from "@/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/guard";
import { AnalyticsPanel } from "@/stats/panel/analytics-panel";

export const dynamic = "force-dynamic";

/** The public site's own analytics, as /statistics showed them. */
export default async function AnalyticsPage() {
  await requireAdmin();
  return (
    <AdminShell>
      <AnalyticsPanel />
    </AdminShell>
  );
}
