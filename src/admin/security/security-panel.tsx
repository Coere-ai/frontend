"use client";

import { useMemo, useState } from "react";

import type { SecurityPayload } from "@/lib/admin/types";
import { ago, whole } from "@/lib/dashboard/format";
import { MultiLineChart } from "@/stats/charts/multi-line-chart";
import { Kpi, Section, Segmented, Table } from "@/stats/panel/ui";

import { AdminPanel } from "../admin-panel";
import { RlsWarning } from "../database/database-panel";
import { useAdminData } from "../use-admin-data";

/** The headline counts, each naming its security_events kind. */
const TILES: Array<[kind: string, label: string]> = [
  ["sign_in", "Sign ins"],
  ["sign_in_failed", "Failed sign ins"],
  ["rate_limited", "Rate limit hits"],
  ["token_rejected", "Refused tokens"],
  ["device_revoked", "Revoked devices"],
  ["connect_refused", "Connect refusals"],
  ["usage_limited", "Spend limit hits"],
  ["account_deleted", "Deleted accounts"],
  ["admin_sign_in_failed", "Failed admin sign ins"],
  ["admin_viewed_memory", "Admin memory views"],
];

const WINDOWS = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
];

/** What the security log says over a window, and what the operator should act on. */
export function SecurityPanel() {
  const [days, setDays] = useState("30");
  const { data, error, reload } = useAdminData<SecurityPayload>(`/api/admin/security?days=${days}`);

  const chart = useMemo(() => {
    const daily = data?.daily ?? [];
    const label = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
    return {
      labels: daily.map((d) => label(d.date)),
      series: [
        { id: "signIns", label: "Sign ins", color: "var(--color-chart)", values: daily.map((d) => d.signIns) },
        { id: "failures", label: "Failed sign ins", color: "var(--color-chart-deep)", values: daily.map((d) => d.failures) },
        { id: "admin", label: "Failed admin sign ins", color: "var(--color-chart-soft)", values: daily.map((d) => d.adminFailures) },
      ],
    };
  }, [data]);

  return (
    <AdminPanel title="Security" ready={!!data} error={error} reload={reload} control={<Segmented value={days} onChange={setDays} options={WINDOWS} />}>
      {data ? (
        <>
          <RlsWarning names={data.rlsOff.map((t) => `${t.schema}.${t.name}`)} />
          <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {TILES.map(([kind, label]) => (
              <Kpi key={kind} label={label} value={whole(data.counts[kind] ?? 0)} />
            ))}
          </section>
          <Section title={`Sign ins and failures, last ${data.days} days`}>
            <MultiLineChart labels={chart.labels} series={chart.series} type="bar" switchable={false} height={240} />
          </Section>
          <Section title="Your recent memory views">
            <Table head={["Whose memory", "When"]} empty="You have not opened anyone's memory." rows={data.memoryViews.map((v) => [v.label, ago(v.at)])} />
          </Section>
          <p className="text-[12px] text-[color:var(--color-muted)]">
            Every table has Row Level Security {data.rlsOff.length ? "except the ones named above" : "on"}. Addresses are kept only as keyed hashes.
          </p>
        </>
      ) : null}
    </AdminPanel>
  );
}
