import { AdminShell } from "@/admin/admin-shell";
import { WaitlistPanel } from "@/admin/waitlist/waitlist-panel";
import { requireAdmin } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

export default async function WaitlistPage() {
  await requireAdmin();
  return (
    <AdminShell>
      <WaitlistPanel />
    </AdminShell>
  );
}
