"use client";

import { useId } from "react";

import type { Choice } from "@/lib/settings/catalog";

/**
 * The two controls the Settings page is made of: an on and off switch and
 * a row of choices, each with its label and a short line under it, in the
 * site's flat look (the brand blue when on or chosen).
 */

export function SwitchRow({ label, about, checked, disabled, onChange }: { label: string; about?: string; checked: boolean; disabled?: boolean; onChange: (on: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-6 border-t border-neutral-100 py-4 first:border-t-0 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <label htmlFor={id} className="text-[15px] text-neutral-950">
          {label}
        </label>
        {about ? <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">{about}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 disabled:opacity-60 ${
          checked ? "bg-brand-500" : "bg-neutral-200"
        }`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

export function ChoiceRow({
  label,
  about,
  choices,
  value,
  disabled,
  onChange,
}: {
  label: string;
  about?: string;
  choices: Choice[];
  value: string | number | boolean;
  disabled?: boolean;
  onChange: (value: string | number) => void;
}) {
  const id = useId();
  const picked = choices.find((c) => c.value === value);
  return (
    <div className="border-t border-neutral-100 py-4 first:border-t-0 first:pt-0 last:pb-0">
      <p id={id} className="text-[15px] text-neutral-950">
        {label}
      </p>
      <div role="radiogroup" aria-labelledby={id} className="mt-3 flex flex-wrap gap-2">
        {choices.map((c) => {
          const on = c.value === value;
          return (
            <button
              key={String(c.value)}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={disabled}
              onClick={() => onChange(c.value)}
              className={`h-9 rounded-full border px-4 text-[14px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 disabled:opacity-60 ${
                on ? "border-brand-500 bg-brand-50 text-brand-600" : "border-neutral-200 text-neutral-950 hover:border-neutral-950"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      {picked?.about || about ? <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">{picked?.about ?? about}</p> : null}
    </div>
  );
}
