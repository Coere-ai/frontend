"use client";

import { useActionState } from "react";

import { savePassword, type FieldState } from "@/app/(site)/account/sign-in-actions";
import { PASSWORD_MAX, PASSWORD_MIN } from "@/lib/auth/identity";
import { FormStatus } from "@/site/account/auth-shell";
import { buttonClass } from "@/site/ui/button";
import { FormField, inputClass } from "@/site/ui/form-field";

import { Part } from "./rows";

const START: FieldState = { error: null, notice: null };

/** Password: change the one this account signs in with, after the current one. Nothing is emailed. */
export function Password() {
  const [state, action, pending] = useActionState(savePassword, START);
  const field = `${inputClass(false)} h-11`;
  return (
    <Part title="Password" line="You sign in with your username and this password. Type your current one, then a new one twice.">
      <form action={action} noValidate className="max-w-[420px] space-y-4">
        <FormField id="current-password" label="Current password">
          <input id="current-password" name="currentPassword" type="password" autoComplete="current-password" maxLength={PASSWORD_MAX} className={field} />
        </FormField>
        <FormField id="password" label="New password" hint={`At least ${PASSWORD_MIN} characters`}>
          <input id="password" name="password" type="password" autoComplete="new-password" maxLength={PASSWORD_MAX} className={field} />
        </FormField>
        <FormField id="confirm" label="New password again">
          <input id="confirm" name="confirm" type="password" autoComplete="new-password" maxLength={PASSWORD_MAX} className={field} />
        </FormField>
        <button type="submit" disabled={pending} className={buttonClass("secondary", "disabled:opacity-60")}>
          {pending ? "Saving" : "Change password"}
        </button>
        <FormStatus error={state.error} notice={state.notice} />
      </form>
    </Part>
  );
}
