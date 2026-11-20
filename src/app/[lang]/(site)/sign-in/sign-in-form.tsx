"use client";

import { useActionState } from "react";

import { signInState, type SignInState } from "@/lib/auth/sign-in-state";
import { IconInput } from "@/site/account/auth-fields";
import { authCardClass, FormStatus } from "@/site/account/auth-shell";
import { buttonClass } from "@/site/ui/button";
import { FormField } from "@/site/ui/form-field";
import { LockIcon, UserIcon } from "@/site/ui/icons/interface-icons";

import { signIn } from "./actions";

/** The error that belongs to this field, if any. */
const errorFor = (state: SignInState, field: SignInState["field"]) => (state.field === field ? (state.error ?? undefined) : undefined);

/** The sign in card: a username and a password. The server action answers each try. */
export function SignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, signInState(next));
  const usernameError = errorFor(state, "username");
  const passwordError = errorFor(state, "password");
  // A field's own error shows under the field; the status line takes the rest.
  const formError = state.field ? null : state.error;
  return (
    <form action={action} noValidate className={`space-y-6 ${authCardClass}`}>
      <input type="hidden" name="next" value={state.next} />
      <FormField id="username" label="Username" error={usernameError}>
        <IconInput icon={UserIcon} invalid={Boolean(usernameError)} id="username" name="username" autoComplete="username" defaultValue={state.username} autoCapitalize="none" spellCheck={false} maxLength={64} required aria-invalid={Boolean(usernameError)} aria-describedby={usernameError ? "username-error" : undefined} />
      </FormField>
      <FormField id="password" label="Password" error={passwordError}>
        <IconInput icon={LockIcon} invalid={Boolean(passwordError)} id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={Boolean(passwordError)} aria-describedby={passwordError ? "password-error" : undefined} />
      </FormField>
      <button type="submit" disabled={pending} className={buttonClass("primary", "w-full disabled:opacity-60")}>
        {pending ? "Signing in" : "Sign in"}
      </button>
      <FormStatus error={formError} />
    </form>
  );
}
