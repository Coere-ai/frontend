import type { Role, Team } from "@/site/content/roles";

/** What the job board is narrowed by. An empty list means "any". */
export type RoleFilters = {
  query: string;
  types: Role["type"][];
  teams: Team[];
  location: string;
};

export const ANY_LOCATION = "Any location";

/**
 * The roles that match every filter. The search looks at the title, team
 * and summary, word by word, so "ai engineer" finds "Founding Engineer, AI
 * and Memory" as well.
 */
export function filterRoles(roles: Role[], filters: RoleFilters): Role[] {
  const words = filters.query.toLowerCase().split(/\s+/).filter(Boolean);
  return roles.filter((role) => {
    const text = `${role.title} ${role.team} ${role.summary}`.toLowerCase();
    if (!words.every((word) => text.includes(word))) return false;
    if (filters.types.length > 0 && !filters.types.includes(role.type)) return false;
    if (filters.teams.length > 0 && !filters.teams.includes(role.team)) return false;
    return filters.location === ANY_LOCATION || role.location === filters.location;
  });
}

/** Adds the value when it is missing and takes it out when it is there. */
export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}
