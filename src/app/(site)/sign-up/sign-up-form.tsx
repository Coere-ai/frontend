"use client";

import { useActionState } from "react";

import { PASSWORD_MAX, PASSWORD_MIN } from "@/lib/auth/identity";
import { signUpState, type SignUpField } from "@/lib/auth/sign-up-state";
import { IconInput } from "@/site/account/auth-fields";
import { authCardClass, FormStatus } from "@/site/account/auth-shell";
import { buttonClass } from "@/site/ui/button";
import { FormField } from "@/site/ui/form-field";
import { LockIcon, UserIcon } from "@/site/ui/icons/interface-icons";

import { signUp } from "./actions";

/** The sign up card: a username and a password typed twice. A made account goes straight on, signed in. */
export function SignUpForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signUp, signUpState(next));

  const field = (id: SignUpField) => ({
    id,
    name: id,
    "aria-invalid": Boolean(state.errors[id]),
    "aria-describedby": state.errors[id] ? `${id}-error` : undefined,
    invalid: Boolean(state.errors[id]),
  });

  return (
    <form action={action} noValidate className={`space-y-6 ${authCardClass}`}>
      <input type="hidden" name="next" value={state.next} />
      <FormField id="username" label="Username" hint="3 to 24 letters, numbers or underscores" error={state.errors.username}>
        <IconInput icon={UserIcon} {...field("username")} autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={24} required defaultValue={state.username} />
      </FormField>
      <FormField id="password" label="Password" hint={`at least ${PASSWORD_MIN} characters`} error={state.errors.password}>
        <IconInput icon={LockIcon} {...field("password")} type="password" autoComplete="new-password" required minLength={PASSWORD_MIN} maxLength={PASSWORD_MAX} />
      </FormField>
      <FormField id="confirm" label="Password again" error={state.errors.confirm}>
        <IconInput icon={LockIcon} {...field("confirm")} type="password" autoComplete="new-password" required minLength={PASSWORD_MIN} maxLength={PASSWORD_MAX} />
      </FormField>
      <button type="submit" disabled={pending} className={buttonClass("primary", "w-full disabled:opacity-60")}>
        {pending ? "Making your account" : "Create account"}
      </button>
      <FormStatus error={state.error} />
    </form>
  );
}
