"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { UsersPayload } from "@/lib/admin/types";
import { ago, bytes, compact, day, dollars, whole } from "@/lib/dashboard/format";
import { Kpi, Section, Table } from "@/stats/panel/ui";

import { AdminPanel } from "../admin-panel";
import { fieldClass, fieldStyle } from "../controls";
import { DayChart } from "../day-chart";
import { useAdminData } from "../use-admin-data";

const HEAD = ["Account", "Plan", "Status", "Created", "Last seen", "Devices", "Month cost", "Requests", "Lifetime cost", "First build", "Tokens saved", "Memory"];

/**
 * Every account, with sign ups by day. Typing filters by username
 * or organization; a row opens the account. First build says whether the
 * account's free first memory build is used, after which its daily limit
 * applies; the account's page can give it back.
 */
export function UsersPanel() {
  const router = useRouter();
  const { data, error, reload } = useAdminData<UsersPayload>("/api/admin/users");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = data?.rows ?? [];
    if (!q) return all;
    return all.filter((r) => [r.username, r.org?.name].some((v) => v?.toLowerCase().includes(q)));
  }, [data, query]);

  const lines = useMemo(() => (data ? [{ id: "signups", label: "Sign ups", points: data.signups }] : []), [data]);
  const kpis = useMemo(() => {
    const all = data?.rows ?? [];
    return {
      suspended: all.filter((r) => r.status === "suspended").length,
      devices: all.reduce((s, r) => s + r.devices, 0),
      month: all.reduce((s, r) => s + r.monthCostMicros, 0),
    };
  }, [data]);

  return (
    <AdminPanel title="Users" ready={!!data} error={error} reload={reload}>
      {data ? (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Accounts" value={`${whole(data.rows.length)}${data.capped ? "+" : ""}`} />
            <Kpi label="Suspended" value={whole(kpis.suspended)} />
            <Kpi label="Live devices" value={whole(kpis.devices)} />
            <Kpi label="Cost this month" value={dollars(kpis.month)} />
          </section>
          <DayChart title="Sign ups by day" lines={lines} />
          <Section
            title="Accounts"
            control={
              <input
                type="search"
                aria-label="Filter accounts"
                placeholder="Email, username or organization"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`${fieldClass} max-w-[260px]`}
                style={fieldStyle}
              />
            }
          >
            {data.capped ? <p className="mb-2 text-[12px] text-[color:var(--color-muted)]">Showing the newest {whole(data.rows.length)} accounts.</p> : null}
            <div className="overflow-x-auto whitespace-nowrap">
              <Table
                head={HEAD}
                empty={query ? "No account matches." : "No accounts yet."}
                onRowClick={(i) => {
                  const r = rows[i];
                  if (r) router.push(`/admin/users/${r.id}`);
                }}
                rows={rows.map((r) => [
                  // The organization sits under the username, so the table stays narrow enough to read whole.
                  <span key="account">
                    <Link href={`/admin/users/${r.id}`} onClick={(e) => e.stopPropagation()} className="underline-offset-2 hover:underline">
                      {r.username ?? "No username"}
                    </Link>
                    {r.org ? <span className="block text-[color:var(--color-muted)]">{`${r.org.name} (${r.org.role})`}</span> : null}
                  </span>,
                  r.plan,
                  r.status,
                  day(r.createdAt),
                  r.lastSeenAt ? ago(r.lastSeenAt) : "Never",
                  whole(r.devices),
                  dollars(r.monthCostMicros),
                  whole(r.monthRequests),
                  dollars(r.lifetimeCostMicros),
                  r.firstBuildAt ? `Used ${day(r.firstBuildAt)}` : "Free",
                  compact(r.tokensSaved),
                  r.memoryBytes ? bytes(r.memoryBytes) : "",
                ])}
              />
            </div>
          </Section>
        </>
      ) : null}
    </AdminPanel>
  );
}
