"use client";

import { useActionState } from "react";

import { joinLab, type LabFormState } from "@/app/[lang]/(site)/lab/actions";
import { buttonClass } from "@/site/ui/button";
import { FormField, inputClass } from "@/site/ui/form-field";

/**
 * Joining the study: the code read out in the room, how much they code with
 * an AI already, and the consent box. The consent words name everything the
 * study keeps, so nothing in the export surprises a student later.
 */
export function JoinForm() {
  const [state, run, pending] = useActionState<LabFormState, FormData>(joinLab, { error: null, done: false });
  return (
    <form action={run} className="space-y-6">
      <FormField id="code" label="Join code" hint="From the person running the session" error={state.error ?? undefined}>
        <input id="code" name="code" required autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={32} className={`${inputClass(Boolean(state.error))} h-12`} />
      </FormField>
      <fieldset>
        <legend className="text-[14px] font-medium text-white">How often do you already code with an AI?</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {[
            ["none", "Rarely or never"],
            ["weekly", "Every week"],
            ["daily", "Every day"],
          ].map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[14px] text-white/85 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-500/15">
              <input type="radio" name="experience" value={value} required className="accent-brand-500" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-5 text-[14px] leading-relaxed text-white/70">
        <p className="font-medium text-white">What the study keeps</p>
        <p className="mt-2">
          Your answers to each task, when you start and hand in each one, the numbers you report (messages sent and how often you explained the case again), and your survey answers. It also reads Coere&apos;s own usage counts for your account, such as how often it saved a chat or brought memory into one. Those are counts, never chat text.
        </p>
        <p className="mt-2">
          Coere never sends your chats to coere.ai. If your memory backup is on, your memory is stored as it is for every account, and the study does not read it. We use what the study keeps to improve Coere and in summaries with no names. You can stop at any time and ask us to delete your rows.
        </p>
        <label className="mt-4 flex items-start gap-3 text-white">
          <input type="checkbox" name="consent" required className="mt-1 accent-brand-500" />
          <span>I agree to take part on these terms.</span>
        </label>
        <label className="mt-3 flex items-start gap-3 text-white/85">
          <input type="checkbox" name="launch" className="mt-1 accent-brand-500" />
          <span>Count me in as an early Coere Connect user after the study. Optional.</span>
        </label>
      </div>
      <button type="submit" disabled={pending} className={buttonClass("primary", "disabled:opacity-60")}>
        {pending ? "Joining" : "Join the study"}
      </button>
    </form>
  );
}
