import { AdminShell } from "@/admin/admin-shell";
import { DatabasePanel } from "@/admin/database/database-panel";
import { requireAdmin } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

export default async function DatabasePage() {
  await requireAdmin();
  return (
    <AdminShell>
      <DatabasePanel />
    </AdminShell>
  );
}
