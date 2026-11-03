"use client";

import { useActionState } from "react";

import { joinWaitlistAction } from "@/app/(site)/developers/waitlist/actions";
import { waitlistStart } from "@/lib/waitlist/form";
import { buttonClass } from "@/site/ui/button";
import { FormField, inputClass } from "@/site/ui/form-field";
import { CheckIcon } from "@/site/ui/icons/interface-icons";

/**
 * The developer waitlist's one field. The server action decides what shows,
 * so the form works before its scripts load, and once the address is stored
 * the card turns into a thank you in the application form's style.
 */
export function WaitlistForm() {
  const [state, action, pending] = useActionState(joinWaitlistAction, waitlistStart);

  if (state.joined) {
    return (
      <div role="status" className="rounded-3xl bg-neutral-50 p-10 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-neutral-950 text-white">
          <CheckIcon size={22} />
        </span>
        <p className="mt-5 text-2xl font-medium tracking-[-0.02em] text-neutral-950">You&apos;re on the list.</p>
        <p className="mx-auto mt-2 max-w-sm text-[15px] text-neutral-500">
          We&apos;ll email {state.email} when Coere Forge opens. Your 1,000 free credits will be waiting.
        </p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-5 rounded-3xl border border-neutral-200 p-7 md:p-9">
      <FormField id="email" label="Work email" error={state.error ?? undefined}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="you@company.com"
          defaultValue={state.email}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "email-error" : undefined}
          className={`${inputClass(Boolean(state.error))} h-12`}
        />
      </FormField>
      <button type="submit" disabled={pending} className={buttonClass("primary", "w-full disabled:opacity-60")}>
        {pending ? "Joining" : "Join the waitlist"}
      </button>
      <p className="flex items-center justify-center gap-2 text-[14px] text-neutral-600">
        <CheckIcon size={16} className="shrink-0 text-brand-500" />
        Join now and get 1,000 free credits at launch.
      </p>
    </form>
  );
}
