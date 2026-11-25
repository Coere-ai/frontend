"use client";

import { useActionState } from "react";

import { saveLabSurvey, type LabFormState } from "@/app/[lang]/(site)/lab/actions";
import { SURVEY_SCALES } from "@/lib/lab/form";
import type { LabCondition } from "@/lib/lab/types";
import { buttonClass } from "@/site/ui/button";
import { inputClass } from "@/site/ui/form-field";

/** The short survey once every task of a case is handed in. Every question may be skipped. */
export function SurveyForm({ caseId, condition, done }: { caseId: string; condition: LabCondition; done: boolean }) {
  const [state, run, pending] = useActionState<LabFormState, FormData>(saveLabSurvey, { error: null, done });
  if (state.done) return <p className="text-[15px] text-emerald-300">Thanks. Your survey for this case is saved.</p>;
  return (
    <form action={run} className="space-y-5">
      <input type="hidden" name="caseId" value={caseId} />
      {SURVEY_SCALES.filter((s) => !s.coereOnly || condition === "coere").map((s) => (
        <Scale key={s.key} name={s.key} label={s.label} max={5} />
      ))}
      {condition === "coere" ? (
        <>
          <Scale name="recommend" label="How likely are you to tell a friend to use Coere?" min={0} max={10} />
          <label className="flex items-start gap-3 text-[15px] text-white/85">
            <input type="checkbox" name="wrong" className="mt-1 accent-brand-500" />
            <span>Coere brought something wrong or unwanted into a chat.</span>
          </label>
        </>
      ) : null}
      <label className="block text-[14px] font-medium text-white">
        What was the most annoying part of this case?
        <textarea name="friction" rows={3} maxLength={2000} className={`${inputClass(false)} py-3`} />
      </label>
      {state.error ? <p className="text-[13px] text-red-400">{state.error}</p> : null}
      <button type="submit" disabled={pending} className={buttonClass("primary", "disabled:opacity-60")}>
        {pending ? "Saving" : "Save the survey"}
      </button>
    </form>
  );
}

function Scale({ name, label, min = 1, max }: { name: string; label: string; min?: number; max: number }) {
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <fieldset>
      <legend className="text-[14px] font-medium text-white">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((n) => (
          <label key={n} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 text-[14px] text-white/80 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-500/20 has-[:checked]:text-white">
            <input type="radio" name={name} value={n} className="sr-only" />
            {n}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
