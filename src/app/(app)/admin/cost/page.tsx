import { AdminShell } from "@/admin/admin-shell";
import { CostPanel } from "@/admin/cost/cost-panel";
import { requireAdmin } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

export default async function CostPage() {
  await requireAdmin();
  return (
    <AdminShell>
      <CostPanel />
    </AdminShell>
  );
}
