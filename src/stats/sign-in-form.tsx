"use client";

import { useActionState } from "react";

import { signIn, type SignInState } from "@/app/statistics/actions";

const initial: SignInState = { error: null };

/**
 * The way in.
 *
 * Deliberately plain: no logo, no product name, nothing that tells a stranger
 * what is behind it. The form posts to a server action, so the password never
 * appears in a URL and never reaches a log.
 */
export function SignInForm() {
  const [state, formAction, pending] = useActionState(signIn, initial);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form
        action={formAction}
        className="w-full max-w-[320px]"
        aria-labelledby="signin-heading"
      >
        <h1
          id="signin-heading"
          className="text-[13px] font-semibold tracking-[0.09em] uppercase text-[color:var(--color-muted)]"
        >
          Sign in
        </h1>

        <label
          className="mt-7 block text-[12px] font-medium text-[color:var(--color-ink)]"
          htmlFor="username"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          autoFocus
          className="mt-1.5 w-full rounded-md border px-3 py-2 text-[13px] outline-none focus:border-[color:var(--color-ink)]"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-ink)",
          }}
        />

        <label
          className="mt-4 block text-[12px] font-medium text-[color:var(--color-ink)]"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1.5 w-full rounded-md border px-3 py-2 text-[13px] outline-none focus:border-[color:var(--color-ink)]"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-ink)",
          }}
        />

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-md px-3 py-2 text-[12px] font-medium tracking-[0.06em] uppercase transition-opacity disabled:opacity-60"
          style={{
            background: "var(--color-ink)",
            color: "var(--color-on-ink)",
          }}
        >
          {pending ? "Checking…" : "Sign in"}
        </button>

        <p
          role="status"
          aria-live="polite"
          className="mt-4 min-h-[1.25rem] text-[12px] text-[color:var(--color-ink)]"
        >
          {state.error}
        </p>
      </form>
    </main>
  );
}
