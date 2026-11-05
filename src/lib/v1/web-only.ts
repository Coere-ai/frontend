import type { BackupChange } from "@/lib/account/memory-backup-request";
import type { OrgCommand } from "@/lib/org/commands";

/**
 * What a device token may not do (docs/accounts.md 8.11, 8.12). A device
 * token never expires and lives in a browser, so a copy of one must not
 * be able to delete the account, start sending memory to coere.ai, or let
 * a new person into the organization. Those steps need the person signed
 * in on coere.ai itself, at /account. Each refusal carries the line the
 * Console shows as it is. Pure, so the tests pin every case.
 */

export const DELETE_ON_WEB = "To delete your account, sign in at coere.ai/account and delete it there.";
export const BACKUP_ON_WEB = "To turn this on, sign in at coere.ai/account. You can turn it off here.";
export const INVITE_ON_WEB = "To invite someone or make an admin, sign in at coere.ai/account.";

/** Whether the change turns a switch on. Turning one off is always allowed, since that removes data. */
export function turnsBackupOn(change: BackupChange): boolean {
  return change.sync === true || change.includeSensitive === true;
}

/**
 * Whether an organization command needs the person on the web. An invite
 * lets someone in who stays after the token is revoked, and making an admin
 * hands over every other power, so both wait for a signed in session.
 */
export function orgNeedsWeb(command: OrgCommand): boolean {
  return command.action === "invite" || (command.action === "role" && command.role === "admin");
}
