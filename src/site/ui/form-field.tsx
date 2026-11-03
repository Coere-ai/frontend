import type { ReactNode } from "react";

/** The look every input shares, with a red edge when the field has an error. */
export function inputClass(invalid: boolean): string {
  return `mt-2 w-full rounded-xl border bg-white px-4 text-[15px] text-neutral-950 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-950 ${
    invalid ? "border-red-500" : "border-neutral-200"
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
      <label htmlFor={id} className="block text-[14px] font-medium text-neutral-950">
        {label}
        {hint ? <span className="ml-1.5 font-normal text-neutral-500">{hint}</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
