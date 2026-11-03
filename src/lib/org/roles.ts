import type { OrgAccess } from "./access";

/**
 * Who may do what in an organization (docs/accounts.md 14.1). Two roles:
 * a member adds to the graph and reads it; an admin also runs the
 * organization. There is no owner, and an organization always keeps one
 * admin: the last one cannot leave, be made a member or delete their
 * account (only the operator can). Pure, so every action asks the same
 * questions and the tests pin the answers.
 */

export type Role = "admin" | "member";

export type Refusal = "not_admin" | "last_admin" | "self" | "same";

export type Verdict = { ok: true } | { ok: false; reason: Refusal };

const yes: Verdict = { ok: true };
const no = (reason: Refusal): Verdict => ({ ok: false, reason });

export const parseRole = (v: unknown): Role | null => (v === "admin" || v === "member" ? v : null);

/** Invites, removals, access, settings: admins only. */
export const mayManage = (role: Role): Verdict => (role === "admin" ? yes : no("not_admin"));

/**
 * An admin changes a role. Making the last admin a member is refused,
 * whether they change their own role or (there being only one) nobody
 * else's could be meant.
 */
export function mayChangeRole(o: { actor: Role; target: Role; to: Role; admins: number }): Verdict {
  if (o.actor !== "admin") return no("not_admin");
  if (o.target === o.to) return no("same");
  if (o.target === "admin" && o.to === "member" && o.admins <= 1) return no("last_admin");
  return yes;
}

/** An admin removes someone else; leaving is how a person removes themselves. */
export function mayRemove(o: { actor: Role; actorId: string; targetId: string; target: Role; admins: number }): Verdict {
  if (o.actor !== "admin") return no("not_admin");
  if (o.actorId === o.targetId) return no("self");
  if (o.target === "admin" && o.admins <= 1) return no("last_admin");
  return yes;
}

/** Leaving, or deleting the account while a member: refused for the last admin. */
export const mayLeave = (o: { role: Role; admins: number }): Verdict => (o.role === "admin" && o.admins <= 1 ? no("last_admin") : yes);

/** An organization's name: 1 to 80 characters once trimmed, spaces folded. */
export function cleanOrgName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.replace(/\s+/g, " ").trim();
  return name.length >= 1 && name.length <= 80 ? name : null;
}

/** A section key as the index names them. */
const SECTION_KEY = /^[a-z0-9_-]{1,40}$/;

/** Shared sections from a form: known keys only, each once, in the order given. At most 40. */
export function cleanSections(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const out: string[] = [];
  for (const k of raw) {
    if (typeof k !== "string" || !SECTION_KEY.test(k)) return null;
    if (!out.includes(k)) out.push(k);
  }
  return out.length <= 40 ? out : null;
}

/** An access object from a form, its read list narrowed to the shared sections. Null when it is not one. */
export function cleanAccess(raw: unknown, shared: readonly string[]): OrgAccess | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { read, contribute } = raw as Record<string, unknown>;
  if (typeof contribute !== "boolean") return null;
  if (read === "all") return { read, contribute };
  const keys = cleanSections(read);
  return keys ? { read: keys.filter((k) => shared.includes(k)), contribute } : null;
}
