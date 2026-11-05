"use client";

import { createContext, useActionState, useContext, type ReactNode } from "react";

import { signInState, type SignInState, type SignInStep } from "@/lib/auth/sign-in-state";
import { FormStatus } from "@/site/account/auth-shell";

import { signInStep } from "./actions";
import { CodeStep, EmailStep, PasswordStep } from "./sign-in-fields";

/**
 * The sign in card and the line under the page title. The server action
 * decides which step shows, so the form holds no state of its own beyond
 * what the action returned. The line sits above the card in the page's
 * frame, so the state lives in a provider both of them read.
 */

type Flow = { state: SignInState; action: (form: FormData) => void; pending: boolean };

const FlowContext = createContext<Flow | null>(null);

function useFlow(): Flow {
  const flow = useContext(FlowContext);
  if (!flow) throw new Error("SignInFlow is missing");
  return flow;
}

export function SignInFlow({ next, error, children }: { next: string; error: string | null; children: ReactNode }) {
  const [state, action, pending] = useActionState(signInStep, signInState(next, error));
  return <FlowContext value={{ state, action, pending }}>{children}</FlowContext>;
}

/** What each step asks of the person, in one line. */
const LEDES: Record<SignInStep, string> = {
  email: "We'll email you a code. No password needed.",
  code: "One more step and you are in.",
  password: "Use your email or username and the password you set.",
};

export function SignInLede() {
  return <>{LEDES[useFlow().state.step]}</>;
}

export function SignInForm() {
  const { state, action, pending } = useFlow();
  // A field's own error shows under the field; the status line takes the rest.
  const formError = state.field ? null : state.error;
  return (
    <form action={action} noValidate className="space-y-6">
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
