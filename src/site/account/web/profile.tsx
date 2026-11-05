"use client";

import { useActionState } from "react";

import { saveDisplayName, saveUsername, type FieldState } from "@/app/(site)/account/sign-in-actions";
import { DISPLAY_NAME_MAX } from "@/lib/account/display-name";
import { buttonClass } from "@/site/ui/button";
import { FormField, inputClass } from "@/site/ui/form-field";

import { Part } from "./rows";

/**
 * Profile: the name an organization sees, and the username a person can
 * sign in with instead of their email. Each field saves on its own, so a
 * taken username never holds back a new name.
 */
export function Profile({ displayName, username }: { displayName: string | null; username: string | null }) {
  return (
    <Part title="Profile" line="Your name is what your organization sees. A username lets you sign in with a password without typing your email.">
      <div className="space-y-6">
        <OneField
          id="displayName"
          label="Name"
          hint="Optional"
          current={displayName}
          action={saveDisplayName}
          button="Save name"
          input={{ autoComplete: "name", maxLength: DISPLAY_NAME_MAX * 2 }}
        />
        <OneField
          id="username"
          label="Username"
          hint="3 to 24 letters, numbers or underscores"
          current={username}
          action={saveUsername}
          button={username ? "Change username" : "Set username"}
          input={{ autoComplete: "username", autoCapitalize: "none", spellCheck: false, maxLength: 24 }}
        />
      </div>
    </Part>
  );
}

type Action = (prev: FieldState, form: FormData) => Promise<FieldState>;

/** A label, one box and its Save button on the same line, with the answer under them. */
function OneField({
  id,
  label,
  hint,
  current,
  action,
  button,
  input,
}: {
  id: string;
  label: string;
  hint: string;
  current: string | null;
  action: Action;
  button: string;
  input: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  const [state, run, pending] = useActionState(action, { error: null, notice: null });
  const invalid = Boolean(state.error);
  return (
    <form action={run} noValidate>
      <FormField id={id} label={label} hint={hint} error={state.error ?? undefined}>
        <div className="flex flex-wrap items-end gap-3">
          <input
            id={id}
            name={id}
            defaultValue={state.value ?? current ?? ""}
            aria-invalid={invalid}
            aria-describedby={invalid ? `${id}-error` : undefined}
            className={`${inputClass(invalid)} h-11 min-w-48 flex-1`}
            {...input}
          />
          <button type="submit" disabled={pending} className={buttonClass("secondary", "disabled:opacity-60")}>
            {pending ? "Saving" : button}
          </button>
        </div>
      </FormField>
      <p role="status" aria-live="polite" className="mt-1.5 text-[13px] text-neutral-500 empty:mt-0">
        {state.notice ?? ""}
      </p>
    </form>
  );
}
