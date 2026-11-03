"use client";

import type { DatabasePayload } from "@/lib/admin/types";
import { bytes, whole } from "@/lib/dashboard/format";
import { Kpi, Section, Table } from "@/stats/panel/ui";

import { AdminPanel } from "../admin-panel";
import { useAdminData } from "../use-admin-data";

/**
 * The database and Storage at a glance. A table with Row Level Security
 * off is named at the top: every table must have it on, and the secret key
 * is the only thing meant to reach past it.
 */
export function DatabasePanel() {
  const { data, error, reload } = useAdminData<DatabasePayload>("/api/admin/database");
  const off = data?.tables.filter((t) => !t.rls) ?? [];

  return (
    <AdminPanel title="Database" ready={!!data} error={error} reload={reload}>
      {data ? (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Database size" value={bytes(data.tables.reduce((s, t) => s + t.bytes, 0))} />
            <Kpi label="Tables" value={whole(data.tables.length)} />
            <Kpi label="Rows, estimated" value={whole(data.tables.reduce((s, t) => s + t.rows, 0))} />
            <Kpi label="Storage" value={bytes(data.buckets.reduce((s, b) => s + b.bytes, 0))} />
          </section>
          <RlsWarning names={off.map((t) => `${t.schema}.${t.name}`)} />
          <Section title="Tables">
            <div className="overflow-x-auto whitespace-nowrap">
              <Table
                head={["Table", "Rows, estimated", "Size", "Row Level Security", "Policies"]}
                empty="No tables were reported."
                rows={data.tables.map((t) => [`${t.schema}.${t.name}`, whole(t.rows), bytes(t.bytes), t.rls ? "On" : <strong key="off">Off</strong>, whole(t.policies)])}
              />
            </div>
          </Section>
          <div className="grid gap-8 lg:grid-cols-2">
            <Section title="Storage buckets">
              <Table head={["Bucket", "Files", "Size"]} empty="No buckets." rows={data.buckets.map((b) => [b.bucket, whole(b.objects), bytes(b.bytes)])} />
            </Section>
            <Section title="Largest folders in memory">
              <Table head={["Folder", "Files", "Size"]} empty="The memory bucket is empty." rows={data.folders.map((f) => [f.label, whole(f.objects), bytes(f.bytes)])} />
            </Section>
          </div>
          <p className="text-[12px] text-[color:var(--color-muted)]">Row counts are Postgres&apos;s own estimates, refreshed when it analyzes a table.</p>
        </>
      ) : null}
    </AdminPanel>
  );
}

/** The tables with Row Level Security off, or nothing when there are none. */
export function RlsWarning({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  return (
    <div role="alert" className="rounded-xl border-2 p-4 text-[12.5px]" style={{ borderColor: "var(--color-ink)", color: "var(--color-ink)" }}>
      <strong>Row Level Security is off</strong> on {names.join(", ")}. No policy guards {names.length === 1 ? "it" : "them"} while it is off. Turn it on in the SQL editor.
    </div>
  );
}
