import { AdminShell } from "@/admin/admin-shell";
import { Comparison } from "@/admin/lab/comparison";
import { Grading } from "@/admin/lab/grading";
import { PeopleTable } from "@/admin/lab/people-table";
import { StudyControls } from "@/admin/lab/study-controls";
import { Surveys } from "@/admin/lab/surveys";
import { requireAdmin } from "@/lib/admin/guard";
import { loadLabAdmin } from "@/lib/admin/lab";
import { flags, withConditions } from "@/lib/lab/summary";
import { supabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * /admin/lab: run the Coere Lab sessions and read what they found
 * (docs/lab.md 6). Server rendered from one read; every write is a server
 * action that checks the admin session again and reloads this page.
 */
export default async function LabAdminPage({ searchParams }: PageProps<"/admin/lab">) {
  await requireAdmin();
  if (!supabaseConfigured()) {
    return (
      <AdminShell>
        <p className="text-[13px]">Storage is not configured.</p>
      </AdminShell>
    );
  }
  const data = await loadLabAdmin();
  const rows = withConditions(data.people, data.work);
  const nameOf = new Map(data.people.map((p) => [p.userId, p.username]));
  const show = (await searchParams).show;
  return (
    <AdminShell>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[15px] font-semibold text-[color:var(--color-ink)]">Coere Lab</h2>
          <a href="/api/admin/lab/csv" download className="rounded-md border px-2.5 py-1.5 text-[12px]" style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}>
            Download CSV
          </a>
        </div>
        <StudyControls study={data.study} />
        <Comparison rows={rows} flags={flags(data.people, data.work, data.events, data.now)} nameOf={(id) => nameOf.get(id) ?? "?"} />
        <PeopleTable data={data} />
        <Surveys data={data} />
        <Grading data={data} onlyUngraded={show !== "all"} />
      </div>
    </AdminShell>
  );
}
