"use client";

import { useEffect, useState, useTransition } from "react";

import { extensionRuntime, sendToExtension } from "@/lib/connect/bridge";
import { deviceName } from "@/lib/connect/device-name";
import { loadedAddress, loadedElsewhere } from "@/lib/connect/loaded-path";
import type { ConnectParams } from "@/lib/connect/params";
import { authCardClass, FormStatus } from "@/site/account/auth-shell";
import { buttonClass } from "@/site/ui/button";
import { CheckIcon, UserIcon } from "@/site/ui/icons/interface-icons";

import { connectExtension } from "./actions";

/** What each way of failing tells the person, in the order they are likely to meet them. */
const PROBLEMS = {
  missing: "Open this page in Chrome with Coere installed, then press Connect Coere.",
  no_answer: "Coere did not answer. Open this page in Chrome with Coere installed, then press Connect Coere.",
  timeout: "Coere did not answer in time. Check it is turned on in this browser, then try again.",
  state: "This link is out of date. Click Sign in in Coere to get a new one.",
  exchange: "Coere could not finish connecting. Press Connect Coere to try again.",
  signed_out: "You were signed out. Reload this page to sign in again.",
  refused: "This link can't connect Coere. Click Sign in in Coere to get a new one.",
  unavailable: "Connecting is not available right now. Try again in a minute.",
} as const;

type Problem = keyof typeof PROBLEMS;

/** The extension's answer to `coere.connect`, or the problem it names. */
function readAnswer(answer: unknown): Problem | null {
  const value = answer as { ok?: unknown; reason?: unknown } | null;
  if (value?.ok === true) return null;
  return value?.reason === "state" ? "state" : "exchange";
}

/**
 * The confirm step. Nothing is made until the person presses the button, so
 * a link someone else sent cannot connect their extension to this account.
 */
export function ConnectCard({ username, params }: { username: string | null; params: ConnectParams }) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  // Arrived here by a client side navigation (from sign in), Coere would see its message come from
  // the page the document loaded at and turn it away, so the page loads itself once as a whole.
  useEffect(() => {
    if (loadedElsewhere(loadedAddress(), window.location.pathname)) window.location.reload();
  }, []);

  function connect() {
    setProblem(null);
    // Checked first, so a browser that cannot reach Coere never makes a code.
    if (!extensionRuntime()) {
      setProblem("missing");
      return;
    }
    startTransition(async () => {
      const made = await connectExtension({ ...params, deviceName: deviceName(navigator.userAgent) });
      if (!made.ok) return setProblem(made.reason);
      const sent = await sendToExtension(params.ext, { type: "coere.connect", code: made.code, state: params.state });
      const failed = sent.ok ? readAnswer(sent.answer) : sent.reason;
      if (failed) setProblem(failed);
      else setDone(true);
    });
  }

  if (done) {
    return (
      <div role="status" className={`${authCardClass} text-center`}>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
          <CheckIcon size={22} />
        </span>
        <p className="mt-5 text-2xl font-medium tracking-[-0.02em] text-neutral-950">Connected</p>
        <p className="mt-2 text-[15px] text-neutral-500">Coere is connected. You can close this tab.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${authCardClass}`}>
      <div>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
            <UserIcon size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] text-neutral-500">Signed in as</p>
            <p className="text-[17px] font-medium tracking-[-0.01em] break-all text-neutral-950">{username ?? "Your account"}</p>
          </div>
        </div>
        <p className="mt-4 text-[14px] leading-relaxed text-neutral-500">
          Coere in this browser will use this account. Only connect if you opened this page from Coere.
        </p>
      </div>
      <button type="button" onClick={connect} disabled={pending} className={buttonClass("primary", "w-full disabled:opacity-60")}>
        {pending ? "Connecting" : "Connect Coere"}
      </button>
      <FormStatus error={problem ? PROBLEMS[problem] : null} />
    </div>
  );
}
