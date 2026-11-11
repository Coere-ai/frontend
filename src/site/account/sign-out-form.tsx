"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { signOut } from "@/lib/auth/sign-out";
import { sendToExtension } from "@/lib/connect/bridge";
import { signOutExtension } from "@/lib/connect/extension-sign-out";

/**
 * A Sign out form that signs Coere in this browser out too
 * (extension-sign-out.ts). It posts to the sign out action, so it still
 * works before scripts load; once they have, the first submit asks the
 * connected extension to disconnect, then submits again for real. With
 * `auto` it submits itself once on load, for /sign-out.
 */
export function SignOutForm({ next, auto = false, children }: { next?: string; auto?: boolean; children: ReactNode }) {
  const form = useRef<HTMLFormElement>(null);
  const asked = useRef(false);

  useEffect(() => {
    if (auto) form.current?.requestSubmit();
  }, [auto]);

  return (
    <form
      ref={form}
      action={signOut}
      onSubmit={(e) => {
        if (asked.current) return;
        e.preventDefault();
        asked.current = true;
        void signOutExtension(document.cookie, sendToExtension).finally(() => form.current?.requestSubmit());
      }}
    >
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {children}
    </form>
  );
}
