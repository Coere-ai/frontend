"use client";

import { useMemo } from "react";

import type { WaitlistPayload } from "@/lib/admin/types";
import { day, whole } from "@/lib/dashboard/format";
import { Kpi, Section, Table } from "@/stats/panel/ui";

import { AdminPanel } from "../admin-panel";
import { DayChart } from "../day-chart";
import { useAdminData } from "../use-admin-data";

/** The table draws the newest this many; the CSV holds every one. */
const SHOWN = 500;

/** The developer waitlist: who joined and when, by day, and the whole list as a CSV. */
export function WaitlistPanel() {
  const { data, error, reload } = useAdminData<WaitlistPayload>("/api/admin/waitlist");
  const lines = useMemo(() => (data ? [{ id: "joined", label: "Joined", points: data.byDay }] : []), [data]);
  const week = useMemo(() => (data ? data.byDay.slice(-7).reduce((s, d) => s + d.count, 0) : 0), [data]);

  const csv = (
    <a
      href="/api/admin/waitlist/csv"
      download
      className="rounded-md border px-2.5 py-1 text-[11.5px] transition-colors hover:bg-[color:var(--color-canvas-soft)]"
      style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
    >
      Download CSV
    </a>
  );

  return (
    <AdminPanel title="Developer waitlist" ready={!!data} error={error} reload={reload} control={csv}>
      {data ? (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="On the list" value={whole(data.total)} />
            <Kpi label="Last 7 days" value={whole(week)} />
          </section>
          <DayChart title="Joined by day" lines={lines} />
          <Section title="Who joined">
            {data.rows.length > SHOWN ? <p className="mb-2 text-[12px] text-[color:var(--color-muted)]">The newest {whole(SHOWN)}. The CSV has all {whole(data.total)}.</p> : null}
            <Table
              head={["Email", "From", "Joined"]}
              empty="Nobody has joined yet."
              rows={data.rows.slice(0, SHOWN).map((r) => [r.email, r.source ?? "", day(r.createdAt)])}
            />
          </Section>
        </>
      ) : null}
    </AdminPanel>
  );
}
