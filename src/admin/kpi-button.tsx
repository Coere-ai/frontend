"use client";

/**
 * A headline number that also picks what the chart below it draws. Pressed
 * reads as the panel's "on" state, ink. A tile with no daily line passes no
 * `onPick` and is drawn as a plain tile.
 */
export function KpiButton({ label, value, on, onPick }: { label: string; value: string; on?: boolean; onPick?: () => void }) {
  const body = (
    <>
      <span className="block text-[11px] font-semibold tracking-[0.08em] uppercase">{label}</span>
      <span className="mt-1.5 block text-[22px] leading-none font-semibold">{value}</span>
    </>
  );
  const style = {
    borderColor: on ? "var(--color-accent)" : "var(--color-border)",
    background: on ? "var(--color-accent)" : "var(--color-surface)",
    color: on ? "var(--color-on-ink)" : "var(--color-ink)",
  };
  if (!onPick) return <div className="rounded-xl border p-4" style={style}>{body}</div>;
  return (
    <button type="button" aria-pressed={on} onClick={onPick} className="rounded-xl border p-4 text-left transition-colors" style={style}>
      {body}
    </button>
  );
}
