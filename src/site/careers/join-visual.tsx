import Image from "next/image";
import { executives, founders, type TeamMember } from "@/lib/site";
import { backgrounds } from "@/site/content/backgrounds";
import { SizedPhoto } from "@/site/ui/sized-photo";

const team: TeamMember[] = [...founders, ...executives];

/** How each card sits in the fan: turned in 3D, raised and tilted a little. */
const poses = [
  "translate-x-[-78%] translate-y-[10%] rotate-[-9deg] [transform:rotateY(18deg)]",
  "z-10 translate-y-[-4%]",
  "translate-x-[78%] translate-y-[10%] rotate-[9deg] [transform:rotateY(-18deg)]",
];

/** One person as a glossy card: portrait, name and role. */
function PersonCard({ member, pose }: { member: TeamMember; pose: string }) {
  return (
    <div className={`absolute w-[23%] ${pose}`}>
      <div className="overflow-hidden rounded-2xl bg-white/95 p-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.65),0_2px_0_rgba(255,255,255,0.6)_inset] ring-1 ring-white/40">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-neutral-200">
          {member.photo ? <Image src={member.photo} alt="" fill sizes="200px" loading="eager" className={`object-cover ${member.photoClassName ?? ""}`} /> : null}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/25" />
        </div>
        <p className="mt-2 px-1 text-[13px] font-medium text-neutral-950">{member.name}</p>
        <p className="px-1 pb-1 text-[12px] text-neutral-500">{member.role}</p>
      </div>
    </div>
  );
}

/**
 * The careers invitation: the team's cards fanned out in 3D over blue
 * artwork, with the line asking people to join. Still, with no motion.
 */
export function JoinVisual({ className }: { className?: string }) {
  return (
    <div className={`relative isolate overflow-hidden rounded-2xl bg-neutral-950 ${className ?? ""}`}>
      <SizedPhoto src={backgrounds.waves.src} alt="" fill sizes="700px" className="-z-10 object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-neutral-950/50 to-neutral-950/0" />
      <p className="p-6 text-[22px] leading-tight font-medium tracking-[-0.02em] text-white text-balance">
        Come join us in building the future of AI infrastructure.
      </p>
      <div className="relative mx-auto mt-2 flex h-[290px] items-start justify-center [perspective:900px]" aria-label="The Coere team">
        {team.slice(0, 3).map((member, index) => (
          <PersonCard key={member.name} member={member} pose={poses[index]} />
        ))}
      </div>
    </div>
  );
}
