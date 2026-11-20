import { AdminShell } from "@/admin/admin-shell";
import { OrgsPanel } from "@/admin/organizations/orgs-panel";
import { requireAdmin } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  await requireAdmin();
  return (
    <AdminShell>
      <OrgsPanel />
    </AdminShell>
  );
}
