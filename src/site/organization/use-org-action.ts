"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { OrgResult } from "@/lib/org/action-context";

/**
 * Runs one organization action, then reloads the page's data so every
 * panel shows the new state, and keeps the line to show: the action's
 * notice, or why it was refused.
 */
export function useOrgAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [line, setLine] = useState<{ text: string; error: boolean } | null>(null);
  const run = (action: () => Promise<OrgResult>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    start(async () => {
      setLine(null);
      const done = await action();
      if (!done.ok) setLine({ text: done.error, error: true });
      else if (done.notice) setLine({ text: done.notice, error: false });
      router.refresh();
    });
  };
  return { pending, line, run };
}

/** The line under a panel, read out as it changes. */
export function lineClass(error: boolean | undefined): string {
  return `mt-4 min-h-5 text-[13px] ${error ? "text-red-600" : "text-neutral-500"}`;
}
