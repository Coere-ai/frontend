"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";

import { deleteAccountAction, deleteMemoryCopy, type FormState } from "@/app/(site)/dashboard/account/actions";
import { FormStatus } from "@/site/account/auth-shell";
import { DownloadButton } from "@/site/memory/memory-actions";
import { buttonClass } from "@/site/ui/button";
import { FormField, inputClass } from "@/site/ui/form-field";

/** Download everything and delete the memory copy: the account's data, in and out. */
export function MemoryCopy({ hasCopy }: { hasCopy: boolean }) {
  const router = useRouter();
  const [line, setLine] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const remove = () => {
    if (!window.confirm("Delete the memory copy stored on coere.ai? Your memory in Coere stays. With the backup on, Coere uploads a new copy at its next backup.")) return;
    start(async () => {
      setLine(null);
      const done = await deleteMemoryCopy();
      setLine(done.ok ? "The stored copy is deleted." : "That did not work. Try again in a minute.");
      router.refresh();
    });
  };
  if (!hasCopy) return <p className="text-[15px] text-neutral-500">coere.ai holds no copy of your memory right now.</p>;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <DownloadButton onProblem={setLine} />
        <button type="button" disabled={pending} onClick={remove} className={buttonClass("ghost", "disabled:opacity-60")}>
          Delete the memory copy
        </button>
      </div>
      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-[13px] text-neutral-500">
        {line ?? ""}
      </p>
    </div>
  );
}

const START: FormState = { error: null, notice: null };

/** Deleting the account: the person types their email to show they mean it. */
export function DeleteAccount({ email }: { email: string }) {
  const [state, action, pending] = useActionState(deleteAccountAction, START);
  return (
    <form action={action} noValidate className="space-y-4">
      <p className="text-[14px] leading-relaxed text-neutral-500">
        This deletes your account, your memory copy and your synced settings, and signs out every connected browser. Your usage history stays with your name taken off. It cannot be undone.
      </p>
      <FormField id="delete-email" label={`Type ${email} to confirm`}>
        <input
          id="delete-email"
          name="email"
          type="email"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={Boolean(state.error)}
          className={`${inputClass(Boolean(state.error))} h-12`}
        />
      </FormField>
      <button type="submit" disabled={pending} className={buttonClass("primary", "disabled:opacity-60")}>
        {pending ? "Deleting" : "Delete my account"}
      </button>
      <FormStatus error={state.error} />
    </form>
  );
}
