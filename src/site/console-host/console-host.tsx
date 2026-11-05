"use client";

import { useEffect, useState } from "react";

import { sendToExtension } from "@/lib/connect/bridge";
import { consoleSrc } from "@/lib/dashboard/host/console-tab";
import { extensionCookie, firstAnswering, hostStep } from "@/lib/dashboard/host/find-extension";
import { helloMessage, readHello } from "@/site/bridge/messages";

import { InstallNote } from "./install-note";

/**
 * The dashboard host: finds Coere in this browser with coere.hello, then
 * shows only its Console in a frame that fills the window. The Console
 * runs as the extension itself, so every feature it has works here as it
 * does in its own tab. An id the policy does not name yet is remembered in
 * the cookie and the page loads once more; with no Coere answering, the
 * page says how to get it.
 */

type View = { kind: "checking" } | { kind: "frame"; id: string } | { kind: "missing" };

/** Each id gets this long to answer; an id with no extension answers at once with an error. */
const HELLO_WAIT_MS = 3000;
/** Holds the id the last reload was for, so a reload can never repeat for the same id. */
const RELOADED_KEY = "coere.dashboard.reloaded";

function readReloaded(): string | null {
  try {
    return sessionStorage.getItem(RELOADED_KEY);
  } catch {
    return null;
  }
}

function writeReloaded(id: string | null): void {
  try {
    if (id) sessionStorage.setItem(RELOADED_KEY, id);
    else sessionStorage.removeItem(RELOADED_KEY);
  } catch {
    // Without session storage the page still works; it may only reload once more.
  }
}

async function answersHello(id: string): Promise<boolean> {
  const sent = await sendToExtension(id, helloMessage(), HELLO_WAIT_MS);
  return sent.ok && readHello(sent.answer) !== null;
}

export function ConsoleHost({ tab, frameId, candidates }: { tab: string; frameId: string | null; candidates: string[] }) {
  const [view, setView] = useState<View>({ kind: "checking" });
  const key = candidates.join(",");

  useEffect(() => {
    let live = true;
    firstAnswering(key ? key.split(",") : [], answersHello).then((found) => {
      if (!live) return;
      const step = hostStep(found, frameId, readReloaded());
      if (step.kind === "reload") {
        writeReloaded(step.id);
        document.cookie = extensionCookie(step.id, location.protocol === "https:");
        location.reload();
        return;
      }
      writeReloaded(null);
      setView(step);
    });
    return () => {
      live = false;
    };
  }, [key, frameId]);

  if (view.kind === "missing") return <InstallNote />;
  if (view.kind === "checking") return <main className="min-h-screen bg-white" aria-busy="true" />;
  return (
    <iframe
      src={consoleSrc(view.id, tab)}
      title="Coere"
      allow="clipboard-write"
      className="fixed inset-0 h-full w-full border-0 bg-white"
    />
  );
}
