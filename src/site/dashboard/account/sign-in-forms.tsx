"use client";

import { useActionState } from "react";

import { setPassword, setUsername, type FormState } from "@/app/(site)/dashboard/account/actions";
import { FormStatus } from "@/site/account/auth-shell";
import { buttonClass } from "@/site/ui/button";
import { FormField, inputClass } from "@/site/ui/form-field";

/**
 * Setting or changing the username and the password, for a person who came
 * in by an emailed code and wants another way in, or one who wants a new one.
 */

const START: FormState = { error: null, notice: null };

export function UsernameForm({ current }: { current: string | null }) {
  const [state, action, pending] = useActionState(setUsername, START);
  return (
    <form action={action} noValidate className="space-y-4">
      <FormField id="username" label="Username" hint="3 to 24 letters, numbers or underscores">
        <input
          id="username"
          name="username"
          defaultValue={current ?? ""}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={24}
          aria-invalid={Boolean(state.error)}
          className={`${inputClass(Boolean(state.error))} h-12`}
        />
      </FormField>
      <button type="submit" disabled={pending} className={buttonClass("secondary", "disabled:opacity-60")}>
        {pending ? "Saving" : current ? "Change username" : "Set username"}
      </button>
      <FormStatus error={state.error} notice={state.notice} />
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(setPassword, START);
  return (
    <form action={action} noValidate className="space-y-4">
      <FormField id="password" label="New password" hint="At least 10 characters">
        <input id="password" name="password" type="password" autoComplete="new-password" aria-invalid={Boolean(state.error)} className={`${inputClass(Boolean(state.error))} h-12`} />
      </FormField>
      <FormField id="confirm" label="New password again">
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" aria-invalid={Boolean(state.error)} className={`${inputClass(Boolean(state.error))} h-12`} />
      </FormField>
      <button type="submit" disabled={pending} className={buttonClass("secondary", "disabled:opacity-60")}>
        {pending ? "Saving" : "Save password"}
      </button>
      <FormStatus error={state.error} notice={state.notice} />
    </form>
  );
}
