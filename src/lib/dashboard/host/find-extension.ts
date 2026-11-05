import { EXTENSION_COOKIE } from "@/lib/supabase/cookie-options";

/**
 * How the host page finds Coere in this browser, without a browser so it
 * is tested on its own. It asks each candidate id with coere.hello in
 * turn and takes the first that answers as Coere. Then it either frames
 * that id, when the server already allowed it in the page's policy, or
 * remembers it in the `coere_ext` cookie and loads the page once more, so
 * the server writes a policy that names it.
 */

export type HelloAsk = (id: string) => Promise<boolean>;

/** The first candidate that answers hello, or null. */
export async function firstAnswering(candidates: readonly string[], ask: HelloAsk): Promise<string | null> {
  for (const id of candidates) if (await ask(id)) return id;
  return null;
}

export type HostStep = { kind: "frame"; id: string } | { kind: "reload"; id: string } | { kind: "missing" };

/**
 * What the page does with the id that answered. `reloadedFor` is the id a
 * reload this visit was already for: a second reload for the same id would
 * only loop, so the page says Coere is missing instead.
 */
export function hostStep(found: string | null, frameId: string | null, reloadedFor: string | null): HostStep {
  if (!found) return { kind: "missing" };
  if (found === frameId) return { kind: "frame", id: found };
  return reloadedFor === found ? { kind: "missing" } : { kind: "reload", id: found };
}

/** The `coere_ext` cookie as a script writes it: the same flags /connect gives it, 400 days. */
export function extensionCookie(id: string, secure: boolean): string {
  return `${EXTENSION_COOKIE}=${id}; Path=/; Max-Age=${400 * 24 * 60 * 60}; SameSite=Lax${secure ? "; Secure" : ""}`;
}
