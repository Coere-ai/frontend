import Link from "next/link";
import { roles, teams } from "@/site/content/roles";
import { ChevronRightIcon, ClockIcon, MapPinIcon } from "@/site/ui/icons/interface-icons";

/** Open roles grouped by team. Each team has the anchor the Careers menu links to. */
export function RoleList() {
  return (
    <div className="space-y-16">
      {teams.map((team) => {
        const open = roles.filter((role) => role.team === team);
        return (
          <div key={team} id={team.toLowerCase()} className="scroll-mt-28">
            <div className="flex items-baseline justify-between border-b border-neutral-950 pb-4">
              <h3 className="text-2xl font-medium tracking-[-0.03em] text-neutral-950">{team}</h3>
              <p className="text-[14px] text-neutral-500">
                {open.length} open {open.length === 1 ? "role" : "roles"}
              </p>
            </div>
            <ul className="divide-y divide-neutral-200">
              {open.map((role) => (
                <li key={role.slug}>
                  <Link href={`/careers/${role.slug}`} className="group grid items-center gap-3 py-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.1fr)_auto] md:gap-8">
                    <div>
                      <p className="text-lg font-medium text-neutral-950 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{role.title}</p>
                      <p className="mt-1 text-[14px] text-neutral-500">{role.summary}</p>
                    </div>
                    <p className="flex items-center gap-2 text-[14px] text-neutral-600">
                      <MapPinIcon size={16} />
                      {role.location}
                    </p>
                    <p className="flex items-center gap-2 text-[14px] text-neutral-600">
                      <ClockIcon size={16} />
                      {role.type}, {role.pay}
                    </p>
                    <ChevronRightIcon size={20} className="hidden text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-950 md:block" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
