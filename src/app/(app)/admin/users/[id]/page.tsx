import { notFound } from "next/navigation";

import { AdminShell } from "@/admin/admin-shell";
import { UserPanel } from "@/admin/users/user-panel";
import { requireAdmin } from "@/lib/admin/guard";
import { isUuid } from "@/lib/admin/http";

export const dynamic = "force-dynamic";

export default async function UserPage({ params }: PageProps<"/admin/users/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  return (
    <AdminShell>
      <UserPanel id={id} />
    </AdminShell>
  );
}
