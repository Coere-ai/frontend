"use client";

import Link from "next/link";
import { useMemo } from "react";

import type { CostPayload } from "@/lib/admin/types";
import { bytes, dollars, whole } from "@/lib/dashboard/format";
import { MODEL_NAMES } from "@/lib/dashboard/usage";
import { HorizontalBarChart } from "@/stats/charts/horizontal-bar-chart";
import { EmptyCard, Framed, Kpi, Section, Table } from "@/stats/panel/ui";

import { AdminPanel } from "../admin-panel";
import { DayChart } from "../day-chart";
import { useAdminData } from "../use-admin-data";

/** What Coere pays: AI spend by day, model and account, and what storage costs a month. */
export function CostPanel() {
  const { data, error, reload } = useAdminData<CostPayload>("/api/admin/cost");
  const lines = useMemo(() => (data ? [{ id: "spend", label: "AI spend", points: data.daily, format: dollars }] : []), [data]);
  const models = useMemo(
    () => (data?.byModel ?? []).map((m) => ({ id: m.model, label: MODEL_NAMES[m.model] ?? m.model, color: "var(--color-chart)", values: [m.costMicros], format: dollars })),
    [data],
  );

  return (
    <AdminPanel title="Cost" ready={!!data} error={error} reload={reload}>
      {data ? (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="AI this month" value={dollars(data.monthMicros)} />
            <Kpi label="AI, last 24h" value={dollars(data.last24hMicros)} />
            <Kpi label="Storage held" value={bytes(data.storageBytes)} />
            <Kpi label="Storage a month" value={dollars(data.storageMonthMicros)} />
          </section>
          <DayChart title="AI spend by day" lines={lines} />
          {data.breakdownCapped ? <p className="text-[12px] text-[color:var(--color-muted)]">More calls than the page reads: the figures below count the newest.</p> : null}
          <div className="grid gap-8 lg:grid-cols-2">
            <Section title={`By model, last ${data.breakdownDays} days`}>
              {models.length ? (
                <Framed>
                  <HorizontalBarChart series={models} labelWidth="auto" height={Math.max(120, models.length * 36)} />
                </Framed>
              ) : (
                <EmptyCard>No model calls yet.</EmptyCard>
              )}
            </Section>
            <Section title={`By account, last ${data.breakdownDays} days`}>
              <Table
                head={["Account", "Requests", "Spend"]}
                empty="No account has spent anything yet."
                rows={data.byAccount.map((a) => [
                  a.id ? (
                    <Link key="a" href={`/admin/users/${a.id}`} className="underline-offset-2 hover:underline">
                      {a.name}
                    </Link>
                  ) : (
                    a.name
                  ),
                  whole(a.requests),
                  dollars(a.costMicros),
                ])}
              />
            </Section>
          </div>
          <p className="text-[12px] text-[color:var(--color-muted)]">Storage is priced at $0.021 per GB a month, on what the buckets hold now.</p>
        </>
      ) : null}
    </AdminPanel>
  );
}
