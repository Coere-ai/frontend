/**
 * What a member may do in their organization (docs/accounts.md 14.1). An
 * access object is `{ read: "all" | [section keys], contribute }`; a
 * member's own (null means the organization's default) overrides the
 * default. Admins always read everything. Pure, so the API, the dashboard
 * and the tests agree.
 */

export interface OrgAccess {
  read: "all" | string[];
  contribute: boolean;
}

export const DEFAULT_ACCESS: OrgAccess = { read: "all", contribute: true };

/** A stored access object, or null when it is not one. */
export function parseAccess(v: unknown): OrgAccess | null {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return null;
  const { read, contribute } = v as Record<string, unknown>;
  if (typeof contribute !== "boolean") return null;
  if (read === "all") return { read, contribute };
  if (Array.isArray(read) && read.every((k) => typeof k === "string")) return { read: read as string[], contribute };
  return null;
}

export function effectiveAccess(memberAccess: unknown, defaultAccess: unknown): OrgAccess {
  return parseAccess(memberAccess) ?? parseAccess(defaultAccess) ?? DEFAULT_ACCESS;
}

/** The shared sections this member may read. */
export function readableSections(role: string, access: OrgAccess, shared: readonly string[]): string[] {
  if (role === "admin" || access.read === "all") return [...shared];
  const allowed = new Set(access.read);
  return shared.filter((k) => allowed.has(k));
}

/** Whether this member's memory goes into the graph: their own switch and their access both allow it. */
export function contributes(shareMemory: boolean, access: OrgAccess): boolean {
  return shareMemory && access.contribute;
}
