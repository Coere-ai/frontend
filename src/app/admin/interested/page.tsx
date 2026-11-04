import { AdminShell } from "@/admin/admin-shell";
import { InterestedPanel } from "@/admin/interested/interested-panel";
import { requireAdmin } from "@/lib/admin/guard";
import { readInterestList } from "@/lib/admin/interest-lists";

export const dynamic = "force-dynamic";

export default async function InterestedPage({ searchParams }: PageProps<"/admin/interested">) {
  await requireAdmin();
  const raw = (await searchParams).list;
  return (
    <AdminShell>
      <InterestedPanel initial={readInterestList(typeof raw === "string" ? raw : null) ?? "developers"} />
    </AdminShell>
  );
}
