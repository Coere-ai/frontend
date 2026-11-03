"use client";

import { useState, useTransition } from "react";

import { memoryDownload } from "@/app/(site)/dashboard/memory/actions";
import { openMessage } from "@/site/bridge/messages";
import { useCoere } from "@/site/bridge/use-coere";
import { buttonClass } from "@/site/ui/button";

/**
 * Download the stored `.coere` file, and Edit in Coere, which opens the
 * local Memory page through the bridge (editing stays in the extension,
 * where the memory lives).
 */

const DOWNLOAD_PROBLEM = {
  signed_out: "You were signed out. Reload the page to sign in again.",
  none: "There is no stored copy to download yet.",
  unavailable: "Downloads are not available right now. Try again in a minute.",
} as const;

/** A button that fetches a fresh short lived link and follows it. */
export function DownloadButton({ variant = "secondary", onProblem }: { variant?: "primary" | "secondary"; onProblem: (line: string | null) => void }) {
  const [pending, start] = useTransition();
  const download = () =>
    start(async () => {
      onProblem(null);
      const made = await memoryDownload();
      if (made.ok) window.location.assign(made.url);
      else onProblem(DOWNLOAD_PROBLEM[made.reason]);
    });
  return (
    <button type="button" onClick={download} disabled={pending} className={buttonClass(variant, "disabled:opacity-60")}>
      {pending ? "Preparing" : "Download .coere file"}
    </button>
  );
}

export function MemoryActions({ allowedIds }: { allowedIds: string[] }) {
  const { state, send } = useCoere(allowedIds);
  const [line, setLine] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const edit = () =>
    start(async () => {
      setLine(null);
      if (!(await send(openMessage("memory")))) setLine("Coere did not answer. Open this page in Chrome with Coere installed.");
    });
  return (
    <div className="flex flex-col items-start gap-2 md:items-end">
      <div className="flex flex-wrap gap-2">
        <DownloadButton onProblem={setLine} />
        <button
          type="button"
          onClick={edit}
          disabled={pending || state.status !== "ready"}
          title={state.status === "missing" ? "Needs Coere in this browser" : undefined}
          className={buttonClass("primary", "disabled:opacity-60")}
        >
          Edit in Coere
        </button>
      </div>
      <p role="status" aria-live="polite" className="min-h-5 text-[13px] text-neutral-500">
        {line ?? (state.status === "missing" ? "Edit in Coere needs Coere in this browser." : "")}
      </p>
    </div>
  );
}
