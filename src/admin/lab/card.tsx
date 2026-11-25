/** A titled panel in the admin look: a thin border on the panel's surface. */
export function Card({ title, line, children }: { title: string; line?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <h2 className="text-[13px] font-semibold text-[color:var(--color-ink)]">{title}</h2>
      {line ? <p className="mt-0.5 text-[12px] text-[color:var(--color-muted)]">{line}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** One number and its label, with how many rows it rests on. */
export function Stat({ label, value, n }: { label: string; value: string; n?: number }) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.06em] uppercase text-[color:var(--color-muted)]">{label}</p>
      <p className="mt-0.5 text-[18px] font-semibold tabular-nums text-[color:var(--color-ink)]">{value}</p>
      {n !== undefined ? <p className="text-[11px] text-[color:var(--color-muted)]">n = {n}</p> : null}
    </div>
  );
}

export const fmt = (v: number | null, unit = ""): string => (v === null ? "none yet" : `${v}${unit}`);
export const signed = (v: number | null, unit = ""): string => (v === null ? "none yet" : `${v > 0 ? "+" : ""}${v}${unit}`);
