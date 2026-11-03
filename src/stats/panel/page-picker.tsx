"use client";

import type { PageOption } from "@/lib/analytics/types";

/** The value the select uses for the whole site. Not a path, so it cannot
 *  collide with one. */
const ALL = "*";

/**
 * Choose which page the dashboard is about.
 *
 * A native select, styled like the switches beside it: it is keyboard and
 * screen-reader friendly for free, and a page list can grow long without
 * needing a custom popover. Each option shows its view count in the window,
 * so the busy pages are easy to spot.
 */
export function PagePicker({
  value,
  options,
  onChange,
}: {
  value: string | null;
  options: PageOption[];
  onChange: (path: string | null) => void;
}) {
  // A page picked from the URL may not be in the list yet (no traffic and not
  // in the registry). Keep it selectable instead of silently showing "All".
  const listed = value === null || options.some((o) => o.path === value);
  const all: PageOption[] = listed ? options : [{ path: value, label: value, views: 0 }, ...options];

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Page</span>
      <select
        value={value ?? ALL}
        onChange={(e) => onChange(e.target.value === ALL ? null : e.target.value)}
        className="appearance-none rounded-md border bg-transparent py-1 pr-7 pl-2.5 text-[11.5px] text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-canvas-soft)]"
        style={{ borderColor: "var(--color-border)" }}
      >
        <option value={ALL}>All pages</option>
        {all.map((o) => (
          <option key={o.path} value={o.path}>
            {o.label} ({o.views.toLocaleString()})
          </option>
        ))}
      </select>
      {/* The select's own arrow is hidden by appearance-none so the control
          matches its neighbours; this is the replacement. */}
      <svg
        aria-hidden
        viewBox="0 0 10 6"
        className="pointer-events-none absolute right-2.5 h-1.5 w-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <path d="M1 1l4 4 4-4" />
      </svg>
    </label>
  );
}
