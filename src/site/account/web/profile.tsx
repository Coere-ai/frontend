"use client";

import { useActionState } from "react";

import { saveDisplayName, saveUsername, type FieldState } from "@/app/(site)/account/sign-in-actions";
import { DISPLAY_NAME_MAX } from "@/lib/account/display-name";
import { PASSWORD_MAX } from "@/lib/auth/identity";
import { buttonClass } from "@/site/ui/button";
import { FormField, inputClass } from "@/site/ui/form-field";

import { Part } from "./rows";

/**
 * Profile: the name an organization sees, and the username the person
 * signs in with. Each field saves on its own, so a taken username never
 * holds back a new name. A new username also asks for the current
 * password, since it changes how the account signs in.
 */
export function Profile({ displayName, username }: { displayName: string | null; username: string | null }) {
  return (
    <Part title="Profile" line="Your name is what your organization sees. Your username is what you sign in with, so a new one works from your next sign in.">
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
          button="Change username"
          input={{ autoComplete: "username", autoCapitalize: "none", spellCheck: false, maxLength: 24 }}
          withPassword
        />
      </div>
    </Part>
  );
}

type Action = (prev: FieldState, form: FormData) => Promise<FieldState>;

/**
 * A label, one box and its Save button on the same line, with the answer
 * under them. `withPassword` adds the current password under the box, and
 * the button moves beside it.
 */
function OneField({
  id,
  label,
  hint,
  current,
  action,
  button,
  input,
  withPassword = false,
}: {
  id: string;
  label: string;
  hint: string;
  current: string | null;
  action: Action;
  button: string;
  input: React.InputHTMLAttributes<HTMLInputElement>;
  withPassword?: boolean;
}) {
  const [state, run, pending] = useActionState(action, { error: null, notice: null });
  const invalid = Boolean(state.error);
  const submit = (
    <button type="submit" disabled={pending} className={buttonClass("secondary", "disabled:opacity-60")}>
      {pending ? "Saving" : button}
    </button>
  );
  const box = (
    <input
      id={id}
      name={id}
      defaultValue={state.value ?? current ?? ""}
      aria-invalid={invalid}
      aria-describedby={invalid ? `${id}-error` : undefined}
      className={`${inputClass(invalid)} h-11 min-w-48 flex-1`}
      {...input}
    />
  );
  const passwordId = `${id}-current-password`;
  return (
    <form action={run} noValidate className={withPassword ? "space-y-4" : undefined}>
      <FormField id={id} label={label} hint={hint} error={state.error ?? undefined}>
        {withPassword ? (
          box
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            {box}
            {submit}
          </div>
        )}
      </FormField>
      {withPassword ? (
        <FormField id={passwordId} label="Current password">
          <div className="flex flex-wrap items-end gap-3">
            <input id={passwordId} name="currentPassword" type="password" autoComplete="current-password" maxLength={PASSWORD_MAX} className={`${inputClass(false)} h-11 min-w-48 flex-1`} />
            {submit}
          </div>
        </FormField>
      ) : null}
      <p role="status" aria-live="polite" className="mt-1.5 text-[13px] text-neutral-500 empty:mt-0">
        {state.notice ?? ""}
      </p>
    </form>
  );
}
