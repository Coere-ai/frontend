"use client";

import { useEffect, useRef, useState } from "react";

import { signOut } from "@/lib/auth/sign-out";
import { sendToExtension } from "@/lib/connect/bridge";
import { consoleSrc, onboardingSrc } from "@/lib/dashboard/host/console-tab";
import { isSignOutAsk } from "@/lib/dashboard/host/sign-out-message";
import { extensionCookie, firstAnswering, hostStep } from "@/lib/dashboard/host/find-extension";
import { helloMessage, readHello } from "@/site/bridge/messages";

import { InstallNote } from "./install-note";

/**
 * The dashboard host: finds Coere in this browser with coere.hello, then
 * shows only its Console in a frame that fills the window. The Console
 * runs as the extension itself, so every feature it has works here as it
 * does in its own tab. An id the policy does not name yet is remembered in
 * the cookie and the page loads once more; with no Coere answering, the
 * page says how to get it. /welcome frames the extension's onboarding page
 * the same way. Sign out in the Console's rail asks this page, once the
 * extension has disconnected, to sign the site out too (sign-out-message.ts).
 */

/** Which of the extension's pages the host frames: the Console at a section, or the onboarding with its query. */
export type FrameTarget = { page: "console"; tab: string; tour?: boolean; finish?: boolean } | { page: "onboarding"; query: Record<string, string> };

const srcFor = (id: string, target: FrameTarget): string =>
  target.page === "console" ? consoleSrc(id, target.tab, target.tour === true, target.finish === true) : onboardingSrc(id, target.query);

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

export function ConsoleHost({ target, frameId, candidates }: { target: FrameTarget; frameId: string | null; candidates: string[] }) {
  const [view, setView] = useState<View>({ kind: "checking" });
  const frame = useRef<HTMLIFrameElement>(null);
  const key = candidates.join(",");
  const shownId = view.kind === "frame" ? view.id : null;

  // The framed extension's Sign out: only from this frame, at its own origin, with the one fixed type.
  useEffect(() => {
    if (!shownId) return;
    let signingOut = false;
    const onMessage = (e: MessageEvent) => {
      if (signingOut || !isSignOutAsk(e, { origin: `chrome-extension://${shownId}`, window: frame.current?.contentWindow ?? null })) return;
      signingOut = true;
      const form = new FormData();
      form.set("next", "/sign-in");
      void signOut(form);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [shownId]);

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

  // The finish screen plays once: the frame has it, so a reload of this page does not play it again.
  const finishing = target.page === "console" && target.finish === true;
  useEffect(() => {
    if (!shownId || !finishing) return;
    const url = new URL(location.href);
    url.searchParams.delete("finish");
    history.replaceState(history.state, "", url.toString());
  }, [shownId, finishing]);

  if (view.kind === "missing") return <InstallNote />;
  if (view.kind === "checking") return <main className="min-h-screen bg-white" aria-busy="true" />;
  return (
    <iframe
      ref={frame}
      src={srcFor(view.id, target)}
      title="Coere"
      allow="clipboard-write"
      className="fixed inset-0 h-full w-full border-0 bg-white"
    />
  );
}
