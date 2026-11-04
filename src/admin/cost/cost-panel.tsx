"use client";

import { useMemo, useState } from "react";

import { COST_RANGES, type CostRange } from "@/lib/admin/cost";
import type { CostPayload } from "@/lib/admin/types";
import { bytes, dollars } from "@/lib/dashboard/format";
import { Kpi, Segmented } from "@/stats/panel/ui";

import { AdminPanel } from "../admin-panel";
import { DayChart } from "../day-chart";
import { useAdminData } from "../use-admin-data";

import { AccountTable, ModelTable } from "./cost-tables";

/**
 * What Coere pays: AI spend by day, a range of it split by model and by
 * account, and what storage costs a month. The range switch reloads the
 * split from the database's own sums.
 */
export function CostPanel() {
  const [range, setRange] = useState<CostRange>("30d");
  const { data, error, reload } = useAdminData<CostPayload>(`/api/admin/cost?range=${range}`);
  const lines = useMemo(() => (data ? [{ id: "spend", label: "AI spend", points: data.daily, format: dollars }] : []), [data]);
  const label = (COST_RANGES.find((r) => r.value === (data?.range ?? range))?.label ?? "").toLowerCase();

  return (
    <AdminPanel
      title="Cost"
      ready={!!data}
      error={error}
      reload={reload}
      control={<Segmented value={range} onChange={(v) => setRange(v as CostRange)} options={COST_RANGES.map((r) => ({ ...r }))} />}
    >
      {data ? (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="AI today" value={dollars(data.todayMicros)} />
            <Kpi label="AI this month" value={dollars(data.monthMicros)} />
            <Kpi label="Storage held" value={bytes(data.storageBytes)} />
            <Kpi label="Storage a month" value={dollars(data.storageMonthMicros)} />
          </section>
          <DayChart title="AI spend by day" lines={lines} />
          <ModelTable title={`By model, ${label}`} models={data.byModel} total={data.total} />
          <AccountTable title={`Top accounts, ${label}`} accounts={data.accounts} />
          <p className="text-[12px] text-[color:var(--color-muted)]">Days are UTC. Storage is priced at $0.021 per GB a month, on what the buckets hold now.</p>
        </>
      ) : null}
    </AdminPanel>
  );
}
