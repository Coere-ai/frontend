"use client";

import { useMemo, useState } from "react";

import { INTEREST_LIST_NAMES, INTEREST_LISTS, type InterestList } from "@/lib/admin/interest-lists";
import type { InterestedPayload } from "@/lib/admin/types";
import { ago, day, whole } from "@/lib/dashboard/format";
import { Kpi, Section, Table } from "@/stats/panel/ui";

import { AdminPanel } from "../admin-panel";
import { DayChart } from "../day-chart";
import { useAdminData } from "../use-admin-data";

/** The table draws the newest this many; the CSV holds every one. */
const SHOWN = 500;

const linkClass = "rounded-md border px-2.5 py-1 text-[11.5px] transition-colors hover:bg-[color:var(--color-canvas-soft)]";
const linkStyle = { borderColor: "var(--color-border)", color: "var(--color-ink)" } as const;

/** The panel's segmented switch, with each list's count beside its name. */
function ListSwitch({ value, counts, onChange }: { value: InterestList; counts: Record<InterestList, number> | null; onChange: (l: InterestList) => void }) {
  return (
    <div role="tablist" aria-label="Lists" className="flex overflow-hidden rounded-md border" style={{ borderColor: "var(--color-border)" }}>
      {INTEREST_LISTS.map((l) => {
        const on = l === value;
        return (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(l)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] whitespace-nowrap transition-colors"
            style={{ background: on ? "var(--color-accent)" : "transparent", color: on ? "var(--color-on-ink)" : "var(--color-ink)" }}
          >
            {INTEREST_LIST_NAMES[l]}
            {counts ? (
              <span className="rounded px-1 text-[10.5px] tabular-nums" style={{ background: on ? "rgba(255,255,255,0.16)" : "var(--color-canvas-soft)", color: on ? "var(--color-on-ink)" : "var(--color-muted)" }}>
                {whole(counts[l])}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Who is interested: developers on the waitlist, and people waiting for
 * Coere Connect or Coere for Teams. Each list has its count, its count by
 * day, the newest entries and its CSV; Export all is every list in one file
 * with a product column.
 */
export function InterestedPanel({ initial }: { initial: InterestList }) {
  const [list, setList] = useState<InterestList>(initial);
  const { data, error, reload } = useAdminData<InterestedPayload>(`/api/admin/interested?list=${list}`);
  // The last answer stays on screen while the next loads; it is drawn only for its own list.
  const shown = data && data.list === list ? data : null;
  const lines = useMemo(() => (shown ? [{ id: "joined", label: "Joined", points: shown.byDay }] : []), [shown]);
  const sum = (days: number) => (shown ? shown.byDay.slice(-days).reduce((s, d) => s + d.count, 0) : 0);

  const pick = (l: InterestList) => {
    setList(l);
    window.history.replaceState(null, "", `?list=${l}`);
  };

  const control = (
    <>
      <ListSwitch value={list} counts={data?.counts ?? null} onChange={pick} />
      <a href={`/api/admin/interested/csv?list=${list}`} download className={linkClass} style={linkStyle}>
        Download CSV
      </a>
      <a href="/api/admin/interested/csv?list=all" download className={linkClass} style={linkStyle}>
        Export all
      </a>
    </>
  );

  return (
    <AdminPanel title="Interested" ready={!!shown} error={error} reload={reload} control={control}>
      {shown ? (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label={list === "developers" ? "On the waitlist" : "Interested"} value={whole(shown.total)} />
            <Kpi label="Last 7 days" value={whole(sum(7))} />
            <Kpi label="Last 30 days" value={whole(sum(30))} />
            <Kpi label="Newest" value={shown.rows[0] ? ago(shown.rows[0].createdAt) : "None yet"} />
          </section>
          <DayChart title="Joined by day" lines={lines} />
          <Section title="Newest">
            {shown.rows.length > SHOWN ? <p className="mb-2 text-[12px] text-[color:var(--color-muted)]">The newest {whole(SHOWN)}. The CSV has all {whole(shown.total)}.</p> : null}
            <Table
              head={["Email", "From", "Joined"]}
              empty={list === "developers" ? "Nobody has joined yet." : "Nobody has said they are interested yet."}
              rows={shown.rows.slice(0, SHOWN).map((r) => [r.email, r.source ?? "", day(r.createdAt)])}
            />
          </Section>
        </>
      ) : null}
    </AdminPanel>
  );
}
