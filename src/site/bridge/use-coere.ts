"use client";

import { useCallback, useEffect, useState } from "react";

import { extensionRuntime, sendToExtension } from "@/lib/connect/bridge";

import { candidateIds } from "./extension-ids";
import { answeredOk, helloMessage, readHello, type BridgeMessage, type Hello } from "./messages";

/**
 * Coere in this browser, as a dashboard page sees it: still looking, not
 * here, or here with its hello. `send` sends one message to the id that
 * answered and says whether Coere did it.
 */

export type CoereState = { status: "checking" } | { status: "missing" } | { status: "ready"; id: string; hello: Hello };

/** Each id gets this long to answer hello; an id with no extension answers at once with an error. */
const HELLO_WAIT_MS = 3000;
const SEND_WAIT_MS = 10_000;

async function findCoere(allowed: readonly string[]): Promise<CoereState> {
  if (!extensionRuntime()) return { status: "missing" };
  for (const id of candidateIds(document.cookie, allowed)) {
    const sent = await sendToExtension(id, helloMessage(), HELLO_WAIT_MS);
    const hello = sent.ok ? readHello(sent.answer) : null;
    if (hello) return { status: "ready", id, hello };
  }
  return { status: "missing" };
}

export function useCoere(allowed: readonly string[]) {
  const [state, setState] = useState<CoereState>({ status: "checking" });
  const key = allowed.join(",");

  useEffect(() => {
    let live = true;
    findCoere(key ? key.split(",") : []).then((found) => {
      if (live) setState(found);
    });
    return () => {
      live = false;
    };
  }, [key]);

  const send = useCallback(
    async (message: BridgeMessage): Promise<boolean> => {
      if (state.status !== "ready") return false;
      const sent = await sendToExtension(state.id, message, SEND_WAIT_MS);
      return sent.ok && answeredOk(sent.answer);
    },
    [state],
  );

  return { state, send };
}
