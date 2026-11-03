import type { PageOption } from "@/lib/analytics/types";

/**
 * The line under the header that says which page every number is about.
 *
 * Without it, a scoped dashboard looks exactly like the site-wide one, and a
 * number read off the wrong one is a wrong number. It also carries the two
 * things you want next: the page itself, and the way back.
 */
export function ScopeBar({
  page,
  options,
  onClear,
}: {
  page: string;
  options: PageOption[];
  onClear: () => void;
}) {
  const label = options.find((o) => o.path === page)?.label ?? page;
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3"
      style={{ borderColor: "var(--color-border)", background: "var(--color-canvas-soft)" }}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[color:var(--color-muted)]">
          One page
        </p>
        <p className="mt-0.5 truncate text-[13.5px] font-semibold text-[color:var(--color-ink)]">
          {label}
          <span className="ml-2 font-normal text-[12px] text-[color:var(--color-muted)]">{page}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={page}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border px-2.5 py-1 text-[11.5px] text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-surface)]"
          style={{ borderColor: "var(--color-border)" }}
        >
          Open page
        </a>
        <button
          type="button"
          onClick={onClear}
          className="rounded-md border px-2.5 py-1 text-[11.5px] transition-colors"
          style={{ background: "var(--color-accent)", borderColor: "var(--color-accent)", color: "#fff" }}
        >
          All pages
        </button>
      </div>
    </div>
  );
}
