"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState, useState } from "react";

import { registerInterestAction } from "@/lib/interest/actions";
import { interestStart } from "@/lib/interest/form";
import { launchCopy, type LaunchProduct } from "@/site/content/launch";
import { useMessages } from "@/site/i18n/client";
import { format } from "@/site/i18n/types";
import { ArrowLink } from "@/site/ui/arrow-link";
import { ArrowButton, buttonClass } from "@/site/ui/button";
import { FormField, inputClass } from "@/site/ui/form-field";
import { CheckIcon } from "@/site/ui/icons/interface-icons";

const swap = {
  initial: { opacity: 0, y: 10, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -6, filter: "blur(4px)" },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

/**
 * Under the countdown: I'm interested, which opens an email field in its
 * place, then a thank you once the address is stored. The server action
 * decides what shows. Watch the demo stays under it as the other way on.
 */
export function InterestForm({ product }: { product: LaunchProduct }) {
  const [state, submit, pending] = useActionState(registerInterestAction, interestStart);
  const [open, setOpen] = useState(false);
  const copy = launchCopy[product];
  const t = useMessages("launch");
  const watchDemo = useMessages("chrome").common.watchDemo;
  const step = state.saved ? "saved" : open ? "form" : "button";
  const id = `interest-${product}`;

  return (
    <div className="mt-12 md:mt-14">
      <div className="mx-auto flex max-w-md justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {step === "button" ? (
            <motion.div key="button" {...swap}>
              <ArrowButton size="lg" onClick={() => setOpen(true)} aria-controls={id} aria-expanded={false}>
                {t.interested}
              </ArrowButton>
            </motion.div>
          ) : step === "form" ? (
            <motion.form key="form" {...swap} id={id} action={submit} noValidate className="w-full text-left">
              <input type="hidden" name="product" value={product} />
              <FormField id={`${id}-email`} label={format(t.emailMe, { name: copy.name })} error={state.error ?? undefined}>
                <div className="flex flex-col sm:flex-row sm:gap-2.5">
                  <input
                    id={`${id}-email`}
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    autoFocus
                    placeholder="you@example.com"
                    defaultValue={state.email}
                    aria-invalid={state.error ? true : undefined}
                    aria-describedby={state.error ? `${id}-email-error` : undefined}
                    className={`${inputClass(Boolean(state.error))} h-12 sm:flex-1`}
                  />
                  <button type="submit" disabled={pending} className={buttonClass("primary", "mt-2.5 h-12 px-6 disabled:opacity-60 sm:mt-2")}>
                    {pending ? t.saving : t.countMeIn}
                  </button>
                </div>
              </FormField>
              <p className="mt-3 text-[13px] text-neutral-500 dark:text-white/60">{t.oneEmail}</p>
            </motion.form>
          ) : (
            <motion.div key="saved" {...swap} role="status" className="flex items-center gap-3 text-left">
              <span className="grid h-10 w-10 shrink-0 place-items-center text-neutral-950 dark:text-brand-300">
                <CheckIcon size={30} strokeWidth={2} />
              </span>
              <p className="text-[16px] leading-snug text-neutral-950 dark:text-white">
                <span className="font-medium">{t.thanks}</span>{" "}
                <span className="text-neutral-600 dark:text-white/65">
                  {format(t.willEmail, { email: state.email, name: copy.name })}
                </span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ArrowLink href="/demo" className="mt-8 text-neutral-950">
        {watchDemo}
      </ArrowLink>
    </div>
  );
}
