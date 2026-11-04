"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState, useState } from "react";

import { registerInterestAction } from "@/lib/interest/actions";
import { interestStart } from "@/lib/interest/form";
import { launchCopy, type LaunchProduct } from "@/site/content/launch";
import { ArrowLink } from "@/site/ui/arrow-link";
import { buttonClass, CircleArrowButton } from "@/site/ui/button";
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
  const step = state.saved ? "saved" : open ? "form" : "button";
  const id = `interest-${product}`;

  return (
    <div className="mt-12 md:mt-14">
      <div className="mx-auto flex max-w-md justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {step === "button" ? (
            <motion.div key="button" {...swap}>
              <CircleArrowButton size="lg" onClick={() => setOpen(true)} aria-controls={id} aria-expanded={false}>
                I&apos;m interested
              </CircleArrowButton>
            </motion.div>
          ) : step === "form" ? (
            <motion.form key="form" {...swap} id={id} action={submit} noValidate className="w-full text-left">
              <input type="hidden" name="product" value={product} />
              <FormField id={`${id}-email`} label={`Email me when ${copy.name} opens`} error={state.error ?? undefined}>
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
                    {pending ? "Saving" : "Count me in"}
                  </button>
                </div>
              </FormField>
              <p className="mt-3 text-[13px] text-neutral-500">One email when it opens. Nothing else.</p>
            </motion.form>
          ) : (
            <motion.div key="saved" {...swap} role="status" className="flex items-center gap-3 text-left">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-neutral-950 text-white">
                <CheckIcon size={18} />
              </span>
              <p className="text-[16px] leading-snug text-neutral-950">
                <span className="font-medium">Thanks, you&apos;re in.</span>{" "}
                <span className="text-neutral-600">
                  We&apos;ll email {state.email} when {copy.name} opens.
                </span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ArrowLink href="/#demo" className="mt-8 text-neutral-950">
        Watch the demo
      </ArrowLink>
    </div>
  );
}
