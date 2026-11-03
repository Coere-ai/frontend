"use client";

import { useMemo, useState } from "react";

import type { FlowKey } from "@/lib/admin/totals";
import type { StatisticsPayload } from "@/lib/admin/types";
import { bytes, compact, dollars } from "@/lib/dashboard/format";
import { Section, Table } from "@/stats/panel/ui";

import { AdminPanel } from "../admin-panel";
import { DayChart } from "../day-chart";
import { KpiButton } from "../kpi-button";
import { useAdminData } from "../use-admin-data";

/** The tiles with a daily line, each naming its daily_totals column. */
const FLOWS: Array<{ key: FlowKey; label: string; total: (t: StatisticsPayload["totals"]) => number; money?: boolean }> = [
  { key: "newUsers", label: "Accounts", total: (t) => t.accounts },
  { key: "newOrgs", label: "Organizations", total: (t) => t.organizations },
  { key: "costMicros", label: "AI cost", total: (t) => t.costMicros, money: true },
  { key: "tokensUsed", label: "Tokens used", total: (t) => t.tokensUsed },
  { key: "tokensSaved", label: "Tokens saved", total: (t) => t.tokensSaved },
  { key: "contextImports", label: "Context imports", total: (t) => t.contextImports },
  { key: "transfers", label: "Transfers", total: (t) => t.transfers },
];

/**
 * Statistics: the product's running totals (docs/accounts.md 15). Each flow
 * is a tile and, picked, the line below it. Memories, chats and storage
 * are levels as they stand now, so they have a tile and no line.
 */
export function StatisticsPanel() {
  const { data, error, reload } = useAdminData<StatisticsPayload>("/api/admin/statistics");
  const [pick, setPick] = useState<FlowKey>("tokensSaved");
  const flow = FLOWS.find((f) => f.key === pick) ?? FLOWS[0]!;

  const lines = useMemo(
    () =>
      data
        ? [{ id: flow.key, label: flow.label, points: data.daily.map((d) => ({ date: d.date, count: d[flow.key] })), format: flow.money ? dollars : undefined }]
        : [],
    [data, flow],
  );

  return (
    <AdminPanel title="Statistics" ready={!!data} error={error} reload={reload}>
      {data ? (
        <>
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
            {FLOWS.map((f) => (
              <KpiButton
                key={f.key}
                label={f.label}
                value={f.money ? dollars(f.total(data.totals)) : compact(f.total(data.totals))}
                on={f.key === pick}
                onPick={() => setPick(f.key)}
              />
            ))}
            <KpiButton label="Memories" value={compact(data.totals.memories)} />
            <KpiButton label="Chats" value={compact(data.totals.chats)} />
            <KpiButton label="Storage" value={bytes(data.totals.storageBytes)} />
          </section>
          <DayChart title={`${flow.label} by day`} lines={lines} />
          <p className="text-[12px] text-[color:var(--color-muted)]">
            Accounts and organizations by day count the new ones. Memories, chats and storage are what the product holds now.
          </p>
          <div className="grid gap-8 lg:grid-cols-2">
            <Section title="Top accounts by tokens saved">
              <Table head={["Account", "Tokens saved"]} rows={data.topAccounts.map((r) => [r.name, compact(r.tokensSaved)])} empty="No account has saved tokens yet." />
            </Section>
            <Section title="Top organizations by tokens saved">
              <Table head={["Organization", "Tokens saved"]} rows={data.topOrgs.map((r) => [r.name, compact(r.tokensSaved)])} empty="No organization has saved tokens yet." />
            </Section>
          </div>
        </>
      ) : null}
    </AdminPanel>
  );
}
