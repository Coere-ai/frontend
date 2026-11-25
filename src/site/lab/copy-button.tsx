"use client";

import { useState } from "react";

import { buttonClass } from "@/site/ui/button";

/** Copies the starter chat. Says so for two seconds, or says to select it by hand when the browser refuses. */
export function CopyButton({ text, label = "Copy the starter chat" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2000);
  }
  return (
    <button type="button" onClick={copy} className={buttonClass("primary")}>
      {state === "copied" ? "Copied" : state === "failed" ? "Select the text and copy it" : label}
    </button>
  );
}
