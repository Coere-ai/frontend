"use client";

import type { SignInState } from "@/lib/auth/sign-in-state";
import { textButtonClass } from "@/site/account/auth-shell";
import { buttonClass } from "@/site/ui/button";
import { FormField, inputClass } from "@/site/ui/form-field";
import { Underlined } from "@/site/ui/underlined";

/**
 * The three faces of the sign in form. Each button carries its own `intent`,
 * and the main one comes first, so Enter in a field presses it.
 */

type StepProps = { state: SignInState; pending: boolean };

/** The error that belongs to this field, if any. */
const errorFor = (state: SignInState, field: SignInState["field"]) => (state.field === field ? (state.error ?? undefined) : undefined);

function TextButton({ intent, children }: { intent: string; children: string }) {
  return (
    <button type="submit" name="intent" value={intent} formNoValidate className={textButtonClass}>
      <Underlined>{children}</Underlined>
    </button>
  );
}

export function EmailStep({ state, pending }: StepProps) {
  const error = errorFor(state, "email");
  return (
    <>
      <FormField id="email" label="Email" error={error}>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.email} aria-invalid={Boolean(error)} aria-describedby={error ? "email-error" : undefined} className={`${inputClass(Boolean(error))} h-12`} />
      </FormField>
      <button type="submit" name="intent" value="send" disabled={pending} className={buttonClass("primary", "w-full disabled:opacity-60")}>
        {pending ? "Sending" : "Email me a code"}
      </button>
      <div className="flex justify-center">
        <TextButton intent="use-password">Use a password instead</TextButton>
      </div>
    </>
  );
}

export function CodeStep({ state, pending }: StepProps) {
  const error = errorFor(state, "code");
  return (
    <>
      <div>
        <p className="text-[13px] text-neutral-500">Code sent to</p>
        <p className="mt-1 text-xl font-medium tracking-[-0.02em] break-all text-neutral-950">{state.email}</p>
        <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">Type the 6 digit code from the email, or open the link in it.</p>
      </div>
      <input type="hidden" name="email" value={state.email} />
      <FormField id="code" label="Code" error={error}>
        <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} autoFocus aria-invalid={Boolean(error)} aria-describedby={error ? "code-error" : undefined} className={`${inputClass(Boolean(error))} h-12 tracking-[0.3em] tabular-nums`} />
      </FormField>
      <button type="submit" name="intent" value="verify" disabled={pending} className={buttonClass("primary", "w-full disabled:opacity-60")}>
        {pending ? "Checking" : "Verify"}
      </button>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        <TextButton intent="resend">Resend the code</TextButton>
        <TextButton intent="restart">Use another email</TextButton>
      </div>
    </>
  );
}

export function PasswordStep({ state, pending }: StepProps) {
  const loginError = errorFor(state, "login");
  const passwordError = errorFor(state, "password");
  return (
    <>
      <FormField id="login" label="Email or username" error={loginError}>
        <input id="login" name="login" autoComplete="username" autoCapitalize="none" spellCheck={false} required aria-invalid={Boolean(loginError)} aria-describedby={loginError ? "login-error" : undefined} className={`${inputClass(Boolean(loginError))} h-12`} />
      </FormField>
      <FormField id="password" label="Password" error={passwordError}>
        <input id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={Boolean(passwordError)} aria-describedby={passwordError ? "password-error" : undefined} className={`${inputClass(Boolean(passwordError))} h-12`} />
      </FormField>
      <button type="submit" name="intent" value="password" disabled={pending} className={buttonClass("primary", "w-full disabled:opacity-60")}>
        {pending ? "Signing in" : "Sign in"}
      </button>
      <div className="flex justify-center">
        <TextButton intent="use-code">Email me a code instead</TextButton>
      </div>
    </>
  );
}
