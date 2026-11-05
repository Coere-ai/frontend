import type { OrgAccess } from "@/lib/org/access";
import type { Membership } from "@/lib/org/membership";
import type { MyInvite } from "@/lib/org/my-invites";
import type { OrgInvite, OrgMember, OrgPageData } from "@/lib/org/page-data";

/**
 * The answer of `GET /api/v1/org/page` (docs/accounts.md 8.11): what the
 * Console's Organization section shows, in the shape the site's own page
 * read (src/lib/org/page-data.ts). The graph is not here: it comes from
 * `GET /api/v1/org/index`. With no organization, `org` is null and
 * `myInvites` holds the invites waiting for the person. Pure, so the tests
 * pin the shape.
 */

export interface OrgPageBody {
  org: { id: string; name: string; plan: string; sharedSections: string[]; defaultAccess: OrgAccess; sections: Array<{ key: string; name: string }> } | null;
  me: { userId: string; role: "admin" | "member"; shareMemory: boolean; access: OrgAccess; readable: string[] } | null;
  members: OrgMember[];
  invites: OrgInvite[];
  totals: OrgPageData["totals"] | null;
  myInvites: MyInvite[];
}

export function noOrgBody(myInvites: MyInvite[]): OrgPageBody {
  return { org: null, me: null, members: [], invites: [], totals: null, myInvites };
}

export function orgPageBody(userId: string, m: Membership, data: OrgPageData): OrgPageBody {
  const mine = data.members.find((x) => x.userId === userId);
  return {
    org: { id: data.id, name: data.name, plan: data.plan, sharedSections: data.sharedSections, defaultAccess: data.defaultAccess, sections: data.sections },
    me: { userId, role: m.role, shareMemory: mine?.shareMemory ?? m.shareMemory, access: m.access, readable: m.readable },
    members: data.members,
    // Only an admin's page reads them, but an answer never carries them to a member either way.
    invites: m.role === "admin" ? data.invites : [],
    totals: data.totals,
    myInvites: [],
  };
}
