import { extensionAllowed, parseExtensionIds } from "@/lib/connect/params";

/**
 * Which extension the dashboard may frame, decided on the server so the
 * proxy's content security policy and the page agree: `frame-src` names
 * exactly that extension's origin and nothing else. It is the id in the
 * `coere_ext` cookie, when the server allows that id (COERE_EXTENSION_IDS,
 * or any well formed id outside production while the list is unset, as
 * /connect allows). Pure, so the proxy, the page and the tests share it.
 */

export interface IdRules {
  /** COERE_EXTENSION_IDS as set. */
  ids: string | undefined;
  production: boolean;
}

/** The cookie's extension id when the server allows it, else null. */
export function frameExtensionId(cookie: string | undefined, rules: IdRules): string | null {
  return cookie && extensionAllowed(cookie, rules.ids, rules.production) ? cookie : null;
}

/**
 * The ids the page asks with coere.hello, best first: the allowed cookie id,
 * then each allowed id, each once. Only these may ever be framed.
 */
export function helloCandidates(cookie: string | undefined, rules: IdRules): string[] {
  const out: string[] = [];
  const first = frameExtensionId(cookie, rules);
  if (first) out.push(first);
  for (const id of parseExtensionIds(rules.ids)) if (extensionAllowed(id, rules.ids, rules.production) && !out.includes(id)) out.push(id);
  return out;
}

/** The dashboard's frame source for the policy: the one extension origin, or null to keep the default. */
export const frameSource = (id: string | null): string | null => (id ? `chrome-extension://${id}/` : null);
