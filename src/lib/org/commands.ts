import { isUuid } from "@/lib/uuid";
import { isRecord } from "@/lib/v1/body";

import { parseRole, type Role } from "./roles";

/**
 * The organization actions the extension sends to
 * `POST /api/v1/org/{action}` (docs/accounts.md 8.11), read from the path
 * and the JSON body. Only the shape is checked here; the rules (who may do
 * what) run in the actions themselves, the same ones the dashboard used.
 * Pure, so the tests pin every shape.
 */

export const ORG_ACTIONS = ["invite", "revoke-invite", "accept", "decline", "role", "access", "remove", "leave", "share", "settings"] as const;

export type OrgAction = (typeof ORG_ACTIONS)[number];

export type OrgCommand =
  | { action: "invite"; login: string; role: Role }
  | { action: "revoke-invite" | "accept" | "decline"; inviteId: string }
  | { action: "role"; userId: string; role: Role }
  | { action: "access"; userId: string; access: unknown }
  | { action: "remove"; userId: string }
  | { action: "leave" }
  | { action: "share"; on: boolean }
  | { action: "settings"; name: unknown; sections: unknown; defaultAccess: unknown };

export const isOrgAction = (v: unknown): v is OrgAction => typeof v === "string" && (ORG_ACTIONS as readonly string[]).includes(v);

/** The command for an action and its body, or null when the body does not match. */
export function readOrgCommand(action: OrgAction, body: unknown): OrgCommand | null {
  if (!isRecord(body)) return null;
  switch (action) {
    case "invite": {
      const role = body.role === undefined ? "member" : parseRole(body.role);
      return typeof body.login === "string" && body.login.length <= 254 && role ? { action, login: body.login, role } : null;
    }
    case "revoke-invite":
    case "accept":
    case "decline":
      return isUuid(body.inviteId) ? { action, inviteId: body.inviteId } : null;
    case "role": {
      const role = parseRole(body.role);
      return isUuid(body.userId) && role ? { action, userId: body.userId, role } : null;
    }
    case "access":
      // null puts the member back on the organization's default; any other value is checked by cleanAccess.
      return isUuid(body.userId) && "access" in body ? { action, userId: body.userId, access: body.access } : null;
    case "remove":
      return isUuid(body.userId) ? { action, userId: body.userId } : null;
    case "leave":
      return { action };
    case "share":
      return typeof body.on === "boolean" ? { action, on: body.on } : null;
    case "settings":
      return { action, name: body.name, sections: body.sections, defaultAccess: body.defaultAccess };
  }
}
