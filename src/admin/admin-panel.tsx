"use client";

import { RefreshButton } from "@/stats/charts/refresh-button";

import { ADMIN_POLL_MS } from "./use-admin-data";

/**
 * The top of every admin section: its heading, anything the page puts
 * beside it, and the refresh button, then the body once the data is in.
 * Until then it says it is loading, or shows the route's own error.
 */
export function AdminPanel({
  title,
  ready,
  error,
  reload,
  control,
  children,
}: {
  title: string;
  ready: boolean;
  error: string | null;
  reload: () => void;
  control?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8 p-1">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-[color:var(--color-ink)]">{title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {control}
          <RefreshButton onRefresh={reload} intervalSec={ADMIN_POLL_MS / 1000} />
        </div>
      </header>
      {error ? (
        <p role="alert" className="text-[13px] font-medium text-[color:var(--color-ink)]">
          {error}
        </p>
      ) : null}
      {ready ? children : error ? null : <p className="text-[13px] text-[color:var(--color-muted)]">Loading…</p>}
    </div>
  );
}
