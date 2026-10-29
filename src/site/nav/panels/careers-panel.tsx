import { roles, teams } from "@/site/content/roles";
import { PanelLabel, PanelLink, PanelMore } from "./panel-parts";

/** Careers menu: a short pitch, and each team with how many roles are open. */
export function CareersPanel() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-12">
      <div className="flex flex-col justify-between py-1">
        <div>
          <p className="text-[28px] font-medium tracking-[-0.03em] text-neutral-950">Careers</p>
          <p className="mt-2 text-[15px] text-neutral-500">Build the memory layer with us. Founding roles are open.</p>
        </div>
        <PanelMore href="/careers">See open roles</PanelMore>
      </div>
      <div className="border-l border-neutral-200 pl-12">
        <PanelLabel>Teams</PanelLabel>
        <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1">
          {teams.map((team) => {
            const open = roles.filter((role) => role.team === team).length;
            return (
              <li key={team}>
                <PanelLink
                  href={`/careers?team=${encodeURIComponent(team)}`}
                  title={team}
                  summary={`${open} open ${open === 1 ? "role" : "roles"}`}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
