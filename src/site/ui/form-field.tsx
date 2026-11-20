import type { ReactNode } from "react";

/**
 * The look every input shares, with a red edge when the field has an error.
 * On a dark page it is dark glass with a fine light edge, a Coere blue edge
 * and ring while focused, and its placeholder still readable.
 */
export function inputClass(invalid: boolean): string {
  return `mt-2 w-full rounded-xl border bg-white px-4 text-[15px] text-neutral-950 outline-none transition-[border-color,box-shadow] placeholder:text-neutral-400 focus:border-neutral-950 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/50 dark:focus:border-brand-400 dark:focus:ring-4 dark:focus:ring-brand-500/25 ${
    invalid ? "border-red-500 dark:border-red-400" : "border-neutral-200 dark:border-white/15"
  }`;
}

/** A label, its control, an optional hint and the field's error. */
export function FormField({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label id={`${id}-label`} htmlFor={id} className="block text-[14px] font-medium text-neutral-950 dark:text-white">
        {label}
        {hint ? <span className="ml-1.5 font-normal text-neutral-500 dark:text-white/60">{hint}</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
