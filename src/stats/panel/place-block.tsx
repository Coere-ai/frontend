"use client";

import { useState } from "react";

import { HorizontalBarChart } from "../charts/horizontal-bar-chart";

import { EmptyCard, Framed, Table } from "./ui";

/** How many rows a block shows before "show all". Long enough to see a shape,
 *  short enough that the three blocks still fit on one screen. */
export const PREVIEW_ROWS = 8;

export type PlaceRow = {
  id: string;
  /** What the bar is called, flag included. */
  barLabel: string;
  views: number;
  /** The table's cells for this row, first column first. */
  cells: React.ReactNode[];
};

/**
 * One resolution of "where people are": a bar beside its own table.
 *
 * Side by side because the two halves are the same rows at the same height, so
 * neither leaves a column of dead space next to the other. Both halves draw
 * the same slice for that reason. `expandable` adds the "show all" switch.
 */
export function PlaceBlock({
  title,
  head,
  rows,
  empty,
  expandable = false,
}: {
  title: string;
  head: string[];
  rows: PlaceRow[];
  empty: string;
  expandable?: boolean;
}) {
  const [all, setAll] = useState(false);
  const shown = all ? rows : rows.slice(0, PREVIEW_ROWS);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-[12.5px] font-semibold text-[color:var(--color-ink)]">{title}</h4>
        {expandable && rows.length > PREVIEW_ROWS && (
          <button
            type="button"
            onClick={() => setAll((v) => !v)}
            className="text-[11.5px] underline underline-offset-2 text-[color:var(--color-ink)]"
          >
            {all ? "Show top only" : `Show all ${rows.length}`}
          </button>
        )}
      </div>
      {shown.length === 0 ? (
        <EmptyCard>{empty}</EmptyCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Framed>
            <HorizontalBarChart
              height={Math.max(150, shown.length * 32 + 40)}
              labelWidth="11rem"
              series={shown.map((r) => ({
                id: r.id,
                label: r.barLabel,
                color: "var(--color-chart)",
                values: [r.views],
              }))}
            />
          </Framed>
          <Table head={head} empty={empty} rows={shown.map((r) => r.cells)} />
        </div>
      )}
    </div>
  );
}
