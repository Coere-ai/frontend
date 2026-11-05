"use client";

import { useActionState } from "react";

import { PASSWORD_MIN } from "@/lib/auth/identity";
import { signUpState, type SignUpField } from "@/lib/auth/sign-up-state";
import { IconInput } from "@/site/account/auth-fields";
import { FormStatus, textButtonClass } from "@/site/account/auth-shell";
import { buttonClass } from "@/site/ui/button";
import { FormField } from "@/site/ui/form-field";
import { LockIcon, MailIcon, UserIcon } from "@/site/ui/icons/interface-icons";
import { Underlined } from "@/site/ui/underlined";

import { signUp } from "./actions";

/** The sign up card, and in its place, once the email has gone, the "check your email" panel. */
export function SignUpForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signUp, signUpState(next));

  if (state.sent) {
    return (
      <form action={action} role="status" className="text-center">
        <input type="hidden" name="next" value={state.next} />
        <p className="text-2xl font-medium tracking-[-0.02em] text-neutral-950">Check your email</p>
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">
          We sent a link to <span className="break-all text-neutral-950">{state.sent}</span>. Open it to finish making your account.
        </p>
        <button type="submit" name="intent" value="restart" className={`${textButtonClass} mt-6`}>
          <Underlined>Use another email</Underlined>
        </button>
      </form>
    );
  }

  const field = (id: SignUpField) => ({
    id,
    name: id,
    "aria-invalid": Boolean(state.errors[id]),
    "aria-describedby": state.errors[id] ? `${id}-error` : undefined,
    invalid: Boolean(state.errors[id]),
  });

  return (
    <form action={action} noValidate className="space-y-6">
      <input type="hidden" name="next" value={state.next} />
      <FormField id="email" label="Email" error={state.errors.email}>
        <IconInput icon={MailIcon} {...field("email")} type="email" autoComplete="email" required defaultValue={state.values.email} />
      </FormField>
      <FormField id="username" label="Username" hint="optional" error={state.errors.username}>
        <IconInput icon={UserIcon} {...field("username")} autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={24} defaultValue={state.values.username} />
      </FormField>
      <FormField id="password" label="Password" hint={`at least ${PASSWORD_MIN} characters`} error={state.errors.password}>
        <IconInput icon={LockIcon} {...field("password")} type="password" autoComplete="new-password" required minLength={PASSWORD_MIN} />
      </FormField>
      <button type="submit" disabled={pending} className={buttonClass("primary", "w-full disabled:opacity-60")}>
        {pending ? "Making your account" : "Create account"}
      </button>
      <FormStatus error={state.error} />
    </form>
  );
}
