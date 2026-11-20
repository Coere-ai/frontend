import { AdminShell } from "@/admin/admin-shell";
import { UsersPanel } from "@/admin/users/users-panel";
import { requireAdmin } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireAdmin();
  return (
    <AdminShell>
      <UsersPanel />
    </AdminShell>
  );
}
