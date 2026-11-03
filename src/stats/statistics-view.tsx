import { signOut } from "@/app/admin/actions";

import { AnalyticsPanel } from "./panel/analytics-panel";

/**
 * The dashboard: one page, one panel, no sidebar.
 *
 * The source dashboard hung this off an admin shell with a nav rail beside it.
 * There is one page here, so there is nothing to navigate between and the rail
 * is gone; what is left is the panel itself and a way out.
 */
export function StatisticsView() {
  return (
    <div className="mx-auto max-w-[1180px] px-6 py-8">
      <header
        className="mb-6 flex items-baseline justify-between gap-4 border-b pb-4"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div>
          <p className="text-[11px] font-medium tracking-[0.09em] uppercase text-[color:var(--color-muted)]">
            Coere
          </p>
          <h1 className="mt-1 text-[19px] font-semibold text-[color:var(--color-ink)]">
            Site analytics
          </h1>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border px-2.5 py-1 text-[11.5px] transition-colors hover:bg-[color:var(--color-canvas-soft)]"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-ink)",
            }}
          >
            Sign out
          </button>
        </form>
      </header>

      <AnalyticsPanel />
    </div>
  );
}
