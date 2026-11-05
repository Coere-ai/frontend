"use client";

import { useActionState } from "react";

import { savePassword, type PasswordState } from "@/app/(site)/account/sign-in-actions";
import { PASSWORD_MAX, PASSWORD_MIN } from "@/lib/auth/identity";
import { FormStatus } from "@/site/account/auth-shell";
import { buttonClass } from "@/site/ui/button";
import { FormField, inputClass } from "@/site/ui/form-field";

import { Part } from "./rows";

const START: PasswordState = { error: null, notice: null, needsCode: false };

/**
 * Password: set one to sign in without an emailed code, or change it.
 * When Supabase wants a recent sign in first, the form says so and offers
 * an emailed code, which then goes in with the new password.
 */
export function Password() {
  const [state, action, pending] = useActionState(savePassword, START);
  const field = (invalid: boolean) => `${inputClass(invalid)} h-11`;
  return (
    <Part title="Password" line="Optional. Without one, you sign in with a code sent to your email. With one, you can sign in by email or username and password.">
      <form action={action} noValidate className="max-w-[420px] space-y-4">
        <FormField id="password" label="New password" hint={`At least ${PASSWORD_MIN} characters`}>
          <input id="password" name="password" type="password" autoComplete="new-password" maxLength={PASSWORD_MAX} className={field(false)} />
        </FormField>
        <FormField id="confirm" label="New password again">
          <input id="confirm" name="confirm" type="password" autoComplete="new-password" maxLength={PASSWORD_MAX} className={field(false)} />
        </FormField>
        {state.needsCode ? (
          <FormField id="code" label="Code from the email" hint="6 digits">
            <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={12} className={field(false)} />
          </FormField>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <button type="submit" name="intent" value="save" disabled={pending} className={buttonClass("secondary", "disabled:opacity-60")}>
            {pending ? "Saving" : "Save password"}
          </button>
          {state.needsCode ? (
            <button type="submit" name="intent" value="code" disabled={pending} className={buttonClass("ghost", "disabled:opacity-60")}>
              Email me a code
            </button>
          ) : null}
        </div>
        <FormStatus error={state.error} notice={state.notice} />
      </form>
    </Part>
  );
}
