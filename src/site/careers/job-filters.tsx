import type { Role, Team } from "@/site/content/roles";
import { SearchIcon } from "@/site/ui/icons/interface-icons";
import { ANY_LOCATION, toggle, type RoleFilters } from "./filter-roles";

/** A plain checkbox with a black tick, for one filter value. */
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[14px] text-neutral-700">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-neutral-950" />
      {label}
    </label>
  );
}

/** The search box and the filters above the role list. */
export function JobFilters({
  filters,
  onChange,
  types,
  teams,
  locations,
}: {
  filters: RoleFilters;
  onChange: (next: RoleFilters) => void;
  types: Role["type"][];
  teams: Team[];
  locations: string[];
}) {
  return (
    <div className="space-y-6">
      <label className="flex h-12 items-center gap-3 rounded-full border border-neutral-200 px-5 focus-within:border-neutral-950">
        <SearchIcon size={18} className="text-neutral-500" />
        <span className="sr-only">Search roles</span>
        <input
          type="search"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Search roles"
          className="h-full w-full bg-transparent text-[15px] text-neutral-950 outline-none placeholder:text-neutral-400"
        />
      </label>

      <div className="grid grid-cols-2 gap-6">
        <fieldset>
          <legend className="text-[13px] font-medium text-neutral-500">Type</legend>
          <div className="mt-3 space-y-2">
            {types.map((type) => (
              <Check key={type} label={type} checked={filters.types.includes(type)} onChange={() => onChange({ ...filters, types: toggle(filters.types, type) })} />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-[13px] font-medium text-neutral-500">Team</legend>
          <div className="mt-3 space-y-2">
            {teams.map((team) => (
              <Check key={team} label={team} checked={filters.teams.includes(team)} onChange={() => onChange({ ...filters, teams: toggle(filters.teams, team) })} />
            ))}
          </div>
        </fieldset>
      </div>

      <label className="block">
        <span className="text-[13px] font-medium text-neutral-500">Location</span>
        <select
          value={filters.location}
          onChange={(event) => onChange({ ...filters, location: event.target.value })}
          className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-[15px] text-neutral-950 outline-none focus:border-neutral-950"
        >
          {[ANY_LOCATION, ...locations].map((location) => (
            <option key={location}>{location}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
