import { AdminShell } from "@/admin/admin-shell";
import { SecurityPanel } from "@/admin/security/security-panel";
import { requireAdmin } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  await requireAdmin();
  return (
    <AdminShell>
      <SecurityPanel />
    </AdminShell>
  );
}
