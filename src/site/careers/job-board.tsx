"use client";

import Link from "next/link";
import { useState } from "react";
import { roles, teams, type Role, type Team } from "@/site/content/roles";
import { ANY_LOCATION, filterRoles, type RoleFilters } from "./filter-roles";
import { JobDetail } from "./job-detail";
import { JobFilters } from "./job-filters";
import { Underlined } from "@/site/ui/underlined";

const types = [...new Set(roles.map((role) => role.type))];
const locations = [...new Set(roles.map((role) => role.location))];

/**
 * The careers page's first screen: search and filters with the matching
 * roles on the left, the picked role on the right. On small screens the
 * right side is skipped and each role opens its own page.
 *
 * `team` comes from the Careers menu, which links straight to one team.
 */
export function JobBoard({ team }: { team?: Team }) {
  const [filters, setFilters] = useState<RoleFilters>({ query: "", types: [], teams: team ? [team] : [], location: ANY_LOCATION });
  const [picked, setPicked] = useState<string | null>(null);
  const matches = filterRoles(roles, filters);
  // Keep the picked role while it still matches, else show the first match.
  const shown: Role | undefined = matches.find((role) => role.slug === picked) ?? matches[0];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-14">
      <div>
        <JobFilters filters={filters} onChange={setFilters} types={types} teams={teams} locations={locations} />
        <p className="mt-8 text-[13px] text-neutral-500">
          {matches.length} open {matches.length === 1 ? "role" : "roles"}
        </p>
        <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
          {matches.map((role) => {
            const active = role.slug === shown?.slug;
            return (
              <li key={role.slug}>
                <button type="button" onClick={() => setPicked(role.slug)} aria-pressed={active} className="group hidden w-full py-4 text-left lg:block">
                  <RoleRow role={role} active={active} />
                </button>
                <Link href={`/careers/${role.slug}`} className="group block py-4 lg:hidden">
                  <RoleRow role={role} active={false} />
                </Link>
              </li>
            );
          })}
        </ul>
        {matches.length === 0 ? <p className="mt-6 text-[15px] text-neutral-500">No roles match. Try fewer filters.</p> : null}
      </div>
      <div className="hidden lg:sticky lg:top-28 lg:block lg:self-start">{shown ? <JobDetail role={shown} /> : null}</div>
    </div>
  );
}

/** One role in the list. The picked one is underlined in black. */
function RoleRow({ role, active }: { role: Role; active: boolean }) {
  return (
    <>
      <span className="block text-[16px] font-medium text-neutral-950">
        <Underlined on={active}>{role.title}</Underlined>
      </span>
      <span className="mt-1 block text-[13px] text-neutral-500">
        {/* "Internships, Internship" would say the same thing twice. */}
        {role.team === "Internships" ? role.type : `${role.team}, ${role.type}`}, {role.location}
      </span>
    </>
  );
}
