import { EXTENSION_COOKIE } from "@/lib/supabase/cookie-options";

import type { BridgeResult } from "./bridge";

/**
 * The site's Sign out tells Coere in this browser too (docs/accounts.md 5).
 * Signing out of coere.ai only ended the browser session: the extension's
 * device token stayed live, so the next person to sign in on that browser
 * saw the first person's Coere in /dashboard, and builds kept spending on
 * the first account (the review of 2026-11-11). So before the session ends
 * the page asks the extension it connected, by the `coere_ext` cookie, to
 * disconnect. The ask carries no data, and a browser with no Coere only
 * waits out a short timeout.
 */

/** The one message, the same type the framed Console posts the host page. */
export const EXTENSION_SIGN_OUT = { type: "coere.sign_out" } as const;

/** How long the page waits for Coere before it signs the site out anyway. */
export const EXTENSION_SIGN_OUT_WAIT_MS = 3000;

const EXTENSION_ID = /^[a-p]{32}$/;

/** The extension id this browser connected, from a `document.cookie` string, or null. */
export function connectedExtensionId(cookie: string): string | null {
  for (const part of cookie.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name !== EXTENSION_COOKIE) continue;
    const id = rest.join("=");
    return EXTENSION_ID.test(id) ? id : null;
  }
  return null;
}

type Send = (id: string, message: unknown, timeoutMs: number) => Promise<BridgeResult>;

/** Asks the connected Coere to disconnect; resolves once it answers, or when it cannot. Never throws. */
export async function signOutExtension(cookie: string, send: Send): Promise<void> {
  const id = connectedExtensionId(cookie);
  if (!id) return;
  await send(id, EXTENSION_SIGN_OUT, EXTENSION_SIGN_OUT_WAIT_MS).catch(() => undefined);
}
