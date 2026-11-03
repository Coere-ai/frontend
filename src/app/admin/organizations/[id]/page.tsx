import { notFound } from "next/navigation";

import { AdminShell } from "@/admin/admin-shell";
import { OrgPanel } from "@/admin/organizations/org-panel";
import { requireAdmin } from "@/lib/admin/guard";
import { isUuid } from "@/lib/admin/http";

export const dynamic = "force-dynamic";

export default async function OrganizationPage({ params }: PageProps<"/admin/organizations/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  return (
    <AdminShell>
      <OrgPanel id={id} />
    </AdminShell>
  );
}
