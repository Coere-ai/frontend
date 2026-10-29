"use client";

import { useState, type FormEvent } from "react";
import type { Role } from "@/site/content/roles";
import { buttonClass } from "@/site/ui/button";
import { CheckIcon, UploadIcon } from "@/site/ui/icons/interface-icons";
import { FormField, inputClass } from "./form-field";
import { validateApplication, type Application, type ApplicationErrors } from "./validate";

const EMPTY: Application = { name: "", email: "", link: "", resume: "", why: "" };

/**
 * The application form. It is a mock: it checks every field and shows a
 * thank you, but sends nothing anywhere, and the thank you says so.
 */
export function ApplicationForm({ role }: { role: Role }) {
  const [form, setForm] = useState<Application>(EMPTY);
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  const set = (field: keyof Application, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateApplication(form);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      // Take the person straight to the first thing to fix.
      document.getElementById(first)?.focus();
      return;
    }
    setState("sending");
    // A short pause so the button's state is visible, as a real send would be.
    window.setTimeout(() => setState("sent"), 700);
  }

  if (state === "sent") {
    return (
      <div role="status" className="rounded-3xl bg-neutral-50 p-10 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-neutral-950 text-white">
          <CheckIcon size={22} />
        </span>
        <p className="mt-5 text-2xl font-medium tracking-[-0.02em] text-neutral-950">Thanks, {form.name.trim().split(" ")[0]}.</p>
        <p className="mt-2 text-[15px] text-neutral-500">Your application for {role.title} is complete.</p>
        <p className="mt-6 text-[13px] text-neutral-400">This is a preview, so applications aren&apos;t sent anywhere yet.</p>
      </div>
    );
  }

  const describedBy = (field: keyof Application) => (errors[field] ? `${field}-error` : undefined);

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-6 rounded-3xl border border-neutral-200 p-7 md:p-9">
      <div>
        <p className="text-[13px] text-neutral-500">Apply for</p>
        <p className="mt-1 text-xl font-medium tracking-[-0.02em] text-neutral-950">{role.title}</p>
      </div>
      <FormField id="name" label="Full name" error={errors.name}>
        <input id="name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy("name")} className={`${inputClass(Boolean(errors.name))} h-12`} />
      </FormField>
      <FormField id="email" label="Email" error={errors.email}>
        <input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={describedBy("email")} className={`${inputClass(Boolean(errors.email))} h-12`} />
      </FormField>
      <FormField id="link" label="LinkedIn or portfolio" hint="optional" error={errors.link}>
        <input id="link" type="url" placeholder="https://" value={form.link} onChange={(e) => set("link", e.target.value)} aria-invalid={Boolean(errors.link)} aria-describedby={describedBy("link")} className={`${inputClass(Boolean(errors.link))} h-12`} />
      </FormField>
      <FormField id="resume" label="Resume" error={errors.resume}>
        <label htmlFor="resume" className={`${inputClass(Boolean(errors.resume))} flex h-12 cursor-pointer items-center gap-3 text-neutral-500`}>
          <UploadIcon size={18} />
          <span className="truncate">{form.resume || "Choose a PDF"}</span>
        </label>
        <input id="resume" type="file" accept="application/pdf" className="sr-only" onChange={(e) => set("resume", e.target.files?.[0]?.name ?? "")} aria-describedby={describedBy("resume")} />
      </FormField>
      <FormField id="why" label="Why Coere?" error={errors.why}>
        <textarea id="why" rows={5} value={form.why} onChange={(e) => set("why", e.target.value)} aria-invalid={Boolean(errors.why)} aria-describedby={describedBy("why")} className={`${inputClass(Boolean(errors.why))} resize-y py-3`} />
      </FormField>
      <button type="submit" disabled={state === "sending"} className={buttonClass("primary", "w-full disabled:opacity-60")}>
        {state === "sending" ? "Sending" : "Submit application"}
      </button>
    </form>
  );
}
