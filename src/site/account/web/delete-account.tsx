"use client";

import { useActionState } from "react";

import { deleteAccountAction, type FormState } from "@/app/(site)/account/actions";
import { FormStatus } from "@/site/account/auth-shell";
import { buttonClass } from "@/site/ui/button";

import { Part } from "./rows";

const initial: FormState = { error: null, notice: null };

/**
 * Delete account: only here, never from a device token. It needs a sign in
 * from the last ten minutes, then the person's own email typed out.
 */
export function DeleteAccount({ email, fresh, signInAgain }: { email: string; fresh: boolean; signInAgain: React.ReactNode }) {
  const [state, action, pending] = useActionState(deleteAccountAction, initial);
  return (
    <Part
      title="Delete account"
      line="This removes your account, your memory copy on coere.ai and your place in any organization. It cannot be undone. Coere keeps your chats in each browser."
    >
      {fresh ? (
        <form action={action} className="flex flex-wrap gap-3">
          <input
            name="email"
            type="email"
            required
            autoComplete="off"
            placeholder={email}
            aria-label="Type your email"
            className="h-11 min-w-0 flex-1 rounded-full border border-neutral-200 bg-white px-4 text-[15px] text-neutral-950 placeholder:text-neutral-400 focus-visible:border-neutral-950 focus-visible:outline-none"
          />
          <button type="submit" disabled={pending} className={buttonClass("secondary", "disabled:opacity-60")}>
            Delete account
          </button>
        </form>
      ) : (
        <div>
          <p className="mb-4 text-[15px] text-neutral-500">To delete your account, sign in again first. You then have ten minutes.</p>
          {signInAgain}
        </div>
      )}
      <div className="mt-3">
        <FormStatus error={state.error} notice={state.notice} />
      </div>
    </Part>
  );
}
