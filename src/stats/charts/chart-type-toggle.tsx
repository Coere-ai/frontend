"use client";

import type { ReactNode } from "react";

// The shapes the traffic chart can switch between, and the small segmented
// control that picks one: white pill, dark active segment.

export type ChartType = "line" | "area" | "bar";

const TYPES: { value: ChartType; label: string; icon: ReactNode }[] = [
  {
    value: "line",
    label: "Line",
    icon: (
      <path d="M2 11 6 6l3 3 5-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    value: "area",
    label: "Area",
    icon: (
      <>
        <path d="M2 11 6 7l3 2 5-5V14H2Z" fill="currentColor" fillOpacity="0.28" />
        <path d="M2 11 6 7l3 2 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    value: "bar",
    label: "Bar",
    icon: (
      <>
        <rect x="2.4" y="8" width="2.7" height="6" rx="0.6" fill="currentColor" />
        <rect x="6.7" y="4" width="2.7" height="10" rx="0.6" fill="currentColor" />
        <rect x="11" y="9.5" width="2.7" height="4.5" rx="0.6" fill="currentColor" />
      </>
    ),
  },
];

export function ChartTypeToggle({
  value,
  onChange,
}: {
  value: ChartType;
  onChange: (t: ChartType) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-[color:var(--color-border)] bg-white/90 p-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm">
      {TYPES.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            aria-label={`${t.label} chart`}
            aria-pressed={active}
            title={`${t.label} chart`}
            className={`inline-flex h-[22px] w-[26px] items-center justify-center rounded-[6px] transition-colors ${
              active ? "bg-zinc-900 text-white" : "text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              {t.icon}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
