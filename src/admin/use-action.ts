"use client";

import { useCallback, useState, useTransition } from "react";

import type { AdminResult } from "@/lib/admin/action";

/**
 * Runs one admin server action, keeps what it answered for the page to
 * show, and reloads the page's data after it, so the numbers on screen
 * follow the change. A thrown action (the network dropped) reads as a
 * failure, not a crash. `clear` forgets the answer, for a form whose
 * fields changed since.
 */
export function useAction(reload: () => void) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<AdminResult | null>(null);
  const run = useCallback(
    (act: () => Promise<AdminResult>) =>
      start(async () => {
        const r = await act().catch((): AdminResult => ({ ok: false, error: "That did not reach the server. Try again." }));
        setResult(r);
        reload();
      }),
    [reload],
  );
  const clear = useCallback(() => setResult(null), []);
  const message = result ? (result.ok ? result.notice : result.error) : null;
  return { run, pending, message, clear };
}
