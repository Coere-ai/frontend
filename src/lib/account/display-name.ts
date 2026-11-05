/**
 * The display name a person sets on /account: the name their organization
 * sees in place of their username or email. Pure, so the action and the
 * tests share the rule.
 */

/** The database refuses a longer one (profiles_display_sane counts characters, not bytes). */
export const DISPLAY_NAME_MAX = 80;

/**
 * Characters that draw nothing or turn the text around: control
 * characters, zero width spaces, direction marks and overrides, and the
 * byte order mark. A name made of them would look blank or reorder the
 * text around it in a member list. The zero width joiner stays, since
 * emoji use it.
 */
const HIDDEN = /[\p{Cc}​‎‏‪-‮⁦-⁩﻿]/gu;

export type DisplayName = { ok: true; name: string | null } | { ok: false; problem: string };

/** The name in its stored form, with null for an empty box (which clears it), or why it will not do. */
export function parseDisplayName(raw: unknown): DisplayName {
  if (raw === null || raw === undefined) return { ok: true, name: null };
  if (typeof raw !== "string") return { ok: false, problem: "Type your name as plain text." };
  const name = raw.replace(HIDDEN, "").replace(/\s+/g, " ").trim();
  if (!name) return { ok: true, name: null };
  if ([...name].length > DISPLAY_NAME_MAX) return { ok: false, problem: `Use ${DISPLAY_NAME_MAX} characters or fewer.` };
  return { ok: true, name };
}
