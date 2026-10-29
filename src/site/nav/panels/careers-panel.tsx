import { JoinVisual } from "@/site/careers/join-visual";
import { teams, type Team } from "@/site/content/roles";
import { FeatureIcon, type FeatureIconName } from "@/site/ui/icons/feature-icons";
import { PanelLabel, PanelLink, PanelMore } from "./panel-parts";

/** What each team does, in a few words, and its icon. */
const about: Record<Team, { icon: FeatureIconName; line: string }> = {
  Engineering: { icon: "code", line: "The extension, the server and the memory." },
  Business: { icon: "briefcase", line: "First companies and partners." },
  Marketing: { icon: "megaphone", line: "Launches, content and community." },
  Internships: { icon: "cap", line: "A summer or a semester with the team." },
};

/** Careers menu: the kinds of roles open, each opening the job board on that team, and the invitation. */
export function CareersPanel() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-12">
      <div className="flex flex-col justify-between py-1">
        <div>
          <PanelLabel>Open roles</PanelLabel>
          <ul className="mt-3 space-y-1">
            {teams.map((team) => (
              <li key={team}>
                <PanelLink href={`/careers?team=${encodeURIComponent(team)}`} title={team} summary={about[team].line} icon={<FeatureIcon name={about[team].icon} size={22} />} />
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <PanelMore href="/careers">See every role</PanelMore>
        </div>
      </div>
      <JoinVisual />
    </div>
  );
}
