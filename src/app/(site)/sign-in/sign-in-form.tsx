"use client";

import { useActionState } from "react";

import { signInState } from "@/lib/auth/sign-in-state";
import { authCardClass, FormStatus } from "@/site/account/auth-shell";

import { signInStep } from "./actions";
import { CodeStep, EmailStep, PasswordStep } from "./sign-in-fields";

/**
 * The sign in card. The server action decides which step shows, so the form
 * holds no state of its own beyond what the action returned.
 */
export function SignInForm({ next, error }: { next: string; error: string | null }) {
  const [state, action, pending] = useActionState(signInStep, signInState(next, error));
  // A field's own error shows under the field; the status line takes the rest.
  const formError = state.field ? null : state.error;
  return (
    <form action={action} noValidate className={`space-y-6 ${authCardClass}`}>
      <input type="hidden" name="next" value={state.next} />
      {state.step === "code" ? (
        <CodeStep key="code" state={state} pending={pending} />
      ) : state.step === "password" ? (
        <PasswordStep key="password" state={state} pending={pending} />
      ) : (
        <EmailStep key="email" state={state} pending={pending} />
      )}
      <FormStatus error={formError} notice={state.notice} />
    </form>
  );
}
