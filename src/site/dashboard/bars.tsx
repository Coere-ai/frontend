/**
 * The Usage page's charts, drawn as plain bars in the site's look: a column
 * per day, and a bar per row for the split by model and by kind. No chart
 * library and no axes to read; each bar carries its own number on hover
 * and in its label for screen readers.
 */

export function DayColumns({ days, format, label }: { days: Array<{ key: string; value: number }>; format: (v: number) => string; label: string }) {
  const top = Math.max(0, ...days.map((d) => d.value));
  const first = days[0]?.key ?? "";
  const last = days[days.length - 1]?.key ?? "";
  const short = (key: string) => new Date(`${key}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return (
    <figure aria-label={label}>
      <div className="flex h-40 items-end gap-[3px]">
        {days.map((d) => {
          const h = top > 0 ? Math.max(d.value > 0 ? 3 : 0, Math.round((d.value / top) * 100)) : 0;
          return (
            <div key={d.key} className="group relative flex h-full flex-1 items-end" title={`${short(d.key)}: ${format(d.value)}`}>
              <span className="sr-only">{`${short(d.key)}: ${format(d.value)}`}</span>
              <div className="w-full rounded-t-[3px] bg-brand-500 transition-colors group-hover:bg-brand-600" style={{ height: `${h}%` }} />
              <div className="absolute inset-x-0 bottom-0 h-px bg-neutral-200" />
            </div>
          );
        })}
      </div>
      <figcaption className="mt-2 flex justify-between text-[12px] text-neutral-500">
        <span>{first ? short(first) : ""}</span>
        <span>{last ? short(last) : ""}</span>
      </figcaption>
    </figure>
  );
}

export function ShareBars({ rows, empty }: { rows: Array<{ key: string; label: string; value: number; note: string }>; empty: string }) {
  const top = Math.max(0, ...rows.map((r) => r.value));
  if (rows.length === 0) return <p className="text-[15px] text-neutral-500">{empty}</p>;
  return (
    <ul className="space-y-4">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="flex items-baseline justify-between gap-4 text-[14px]">
            <span className="truncate text-neutral-950">{r.label}</span>
            <span className="shrink-0 text-neutral-500">{r.note}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${top > 0 ? Math.max(1, (r.value / top) * 100) : 0}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
