import { AdminShell } from "@/admin/admin-shell";
import { LaunchPanel } from "@/admin/launch/launch-panel";
import { requireAdmin } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

export default async function LaunchPage() {
  await requireAdmin();
  return (
    <AdminShell>
      <LaunchPanel />
    </AdminShell>
  );
}
