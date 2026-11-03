/**
 * The organization functions' refusals (docs/accounts.md 10), turned into
 * words for the operator. The database raises them by name, and a taken
 * slug is a unique violation on organizations_slug_key. Pure.
 */

export type OrgDbRefusal = "already_in_org" | "invite_not_found" | "invite_expired" | "slug_taken" | "unknown";

export function orgDbRefusal(error: { code?: string; message?: string; details?: string } | null): OrgDbRefusal | null {
  if (!error) return null;
  const text = `${error.message ?? ""} ${error.details ?? ""}`;
  for (const name of ["already_in_org", "invite_not_found", "invite_expired"] as const) if (text.includes(name)) return name;
  if (error.code === "23505" && text.includes("organizations_slug_key")) return "slug_taken";
  return "unknown";
}

export const ORG_REFUSAL_WORDS: Record<Exclude<OrgDbRefusal, "unknown">, string> = {
  already_in_org: "That account is already in an organization. A person can be in one at a time.",
  invite_not_found: "That invite is gone.",
  invite_expired: "That invite has expired.",
  slug_taken: "Another organization took that name's address at the same moment. Try again.",
};
