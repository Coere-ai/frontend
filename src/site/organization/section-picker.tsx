"use client";

/**
 * A row of section pills to pick several from, in the site's look: picked
 * ones in the brand blue. Used for the shared sections and for which
 * sections a member reads.
 */
export function SectionPicker({
  choices,
  picked,
  disabled,
  onChange,
  label,
}: {
  choices: Array<{ key: string; name: string }>;
  picked: readonly string[];
  disabled?: boolean;
  onChange: (next: string[]) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {choices.map((c) => {
        const on = picked.includes(c.key);
        return (
          <button
            key={c.key}
            type="button"
            aria-pressed={on}
            disabled={disabled}
            onClick={() => onChange(on ? picked.filter((k) => k !== c.key) : choices.map((x) => x.key).filter((k) => k === c.key || picked.includes(k)))}
            className={`h-9 rounded-full border px-4 text-[14px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 disabled:opacity-60 ${
              on ? "border-brand-500 bg-brand-50 text-brand-600" : "border-neutral-200 text-neutral-950 hover:border-neutral-950"
            }`}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
