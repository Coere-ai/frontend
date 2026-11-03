"use client";

import { useState, useTransition } from "react";

import { backupMessage, openMessage } from "@/site/bridge/messages";
import { useCoere } from "@/site/bridge/use-coere";
import { buttonClass } from "@/site/ui/button";
import { ArrowUpRightIcon } from "@/site/ui/icons/interface-icons";

import { CHROME_STORE_URL } from "./connect-first";
import { Panel } from "./panel";

/**
 * Coere in this browser, through the bridge: whether it is installed,
 * which account it uses, and the two things the dashboard can ask of it,
 * Open library and Back up now.
 */
export function CoereCard({ allowedIds, userId, backupOn }: { allowedIds: string[]; userId: string; backupOn: boolean }) {
  const { state, send } = useCoere(allowedIds);
  const [note, setNote] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const ask = (what: "library" | "backup") =>
    start(async () => {
      setNote(null);
      const ok = await send(what === "library" ? openMessage("library") : backupMessage());
      if (what === "backup") setNote(ok ? "Coere is backing up your memory. The new copy shows here in a minute." : "Coere did not answer. Try again.");
      else if (!ok) setNote("Coere did not answer. Try again.");
    });

  if (state.status === "checking") {
    return (
      <Panel title="Coere in this browser">
        <p className="text-[15px] text-neutral-500">Looking for Coere in this browser.</p>
      </Panel>
    );
  }

  if (state.status === "missing") {
    return (
      <Panel title="Coere in this browser" description="Coere is not installed in this browser, or it is turned off. Open this page in Chrome with Coere to use these buttons.">
        <a href={CHROME_STORE_URL} className={buttonClass("secondary")}>
          Get Coere for Chrome
          <ArrowUpRightIcon size={16} />
        </a>
      </Panel>
    );
  }

  const { hello } = state;
  const other = hello.signedIn && hello.userId !== null && hello.userId !== userId;
  const status = !hello.signedIn ? "Installed, not connected to an account yet." : other ? "Installed and connected to another account." : "Installed and connected to this account.";
  return (
    <Panel title="Coere in this browser" description={`${status}${hello.version ? ` Version ${hello.version}.` : ""}`}>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={() => ask("library")} className={buttonClass("primary", "disabled:opacity-60")}>
          Open library
        </button>
        {backupOn && !other && hello.signedIn ? (
          <button type="button" disabled={pending} onClick={() => ask("backup")} className={buttonClass("secondary", "disabled:opacity-60")}>
            Back up now
          </button>
        ) : null}
      </div>
      <p role="status" aria-live="polite" className="mt-4 min-h-5 text-[13px] text-neutral-500">
        {note ?? ""}
      </p>
    </Panel>
  );
}
