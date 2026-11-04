import { AdminShell } from "@/admin/admin-shell";
import { LimitsPanel } from "@/admin/limits/limits-panel";
import { requireAdmin } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

export default async function LimitsPage() {
  await requireAdmin();
  return (
    <AdminShell>
      <LimitsPanel />
    </AdminShell>
  );
}
