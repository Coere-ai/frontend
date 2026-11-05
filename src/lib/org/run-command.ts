import "server-only";

import { changeRole, inviteMember, removeMember, revokeInvite, saveOrgSettings, setMemberAccess } from "./admin-ops";
import type { OrgCommand } from "./commands";
import { acceptInvite, declineInvite, leaveOrganization, setShareMemory } from "./member-ops";
import { readMembership } from "./membership";
import { refused, unavailable, type OrgOutcome } from "./outcome";

/**
 * Runs one organization command for the person `userId`. Accept and
 * decline act on the person's own invite; every other command first reads
 * their own membership, so it can only ever touch their organization.
 */
export async function runOrgCommand(userId: string, headers: Headers, c: OrgCommand): Promise<OrgOutcome> {
  if (c.action === "accept") return acceptInvite(userId, c.inviteId, headers);
  if (c.action === "decline") return declineInvite(userId, c.inviteId);

  const membership = await readMembership(userId).catch(() => undefined);
  if (membership === undefined) return unavailable();
  if (membership === null) return refused("not_member");
  const ctx = { userId, membership, headers };
  switch (c.action) {
    case "invite":
      return inviteMember(ctx, c.login, c.role);
    case "revoke-invite":
      return revokeInvite(ctx, c.inviteId);
    case "role":
      return changeRole(ctx, c.userId, c.role);
    case "access":
      return setMemberAccess(ctx, c.userId, c.access);
    case "remove":
      return removeMember(ctx, c.userId);
    case "settings":
      return saveOrgSettings(ctx, c);
    case "share":
      return setShareMemory(userId, membership, c.on);
    case "leave":
      return leaveOrganization(userId, membership, headers);
  }
}
