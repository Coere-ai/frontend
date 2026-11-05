/**
 * What an organization action answers (docs/accounts.md 8.11): done, with
 * an optional line to show, or refused for a named reason with the line
 * that says why in the person's words. The reasons are fixed so the API
 * can hand them to the extension, which shows `message` as it is. Pure, so
 * the routes and the tests read the same table.
 */

export type OrgRefusal =
  | "not_member"
  | "not_admin"
  | "last_admin"
  | "self"
  | "bad_login"
  | "no_account"
  | "in_org"
  | "pending"
  | "too_many"
  | "invite_not_found"
  | "invite_expired"
  | "already_in_org"
  | "bad_name"
  | "no_sections";

export type OrgOutcome =
  | { ok: true; notice: string | null }
  | { ok: false; reason: OrgRefusal | "bad_request" | "unavailable"; message: string };

export const UNAVAILABLE_LINE = "That did not work. Try again in a minute.";

/** The line for each refusal, the same words the dashboard's actions used. */
export const REFUSAL_LINES: Record<OrgRefusal, string> = {
  not_member: "You are not in an organization.",
  not_admin: "Only an admin can do that.",
  last_admin: "An organization needs an admin. Make someone else an admin first.",
  self: "To remove yourself, leave the organization.",
  bad_login: "Type the email or username of your coworker's Coere account.",
  no_account: "No Coere account uses that. Your coworker needs to make one first, at coere.ai/sign-up.",
  in_org: "They are already in an organization.",
  pending: "They already have an invite waiting.",
  too_many: "That is a lot of invites at once. Try again in an hour.",
  invite_not_found: "That invite is no longer open.",
  invite_expired: "That invite has expired. Ask an admin to invite you again.",
  already_in_org: "You are already in an organization. Leave it first.",
  bad_name: "Give the organization a name of up to 80 characters.",
  no_sections: "Share at least one section.",
};

export const done = (notice: string | null = null): OrgOutcome => ({ ok: true, notice });

/** A refusal, with its own line unless the action words it for its case. */
export function refused(reason: OrgRefusal, message?: string): OrgOutcome {
  return { ok: false, reason, message: message ?? REFUSAL_LINES[reason] };
}

export const unavailable = (): OrgOutcome => ({ ok: false, reason: "unavailable", message: UNAVAILABLE_LINE });
export const badRequest = (): OrgOutcome => ({ ok: false, reason: "bad_request", message: UNAVAILABLE_LINE });
