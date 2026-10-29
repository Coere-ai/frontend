import Image from "next/image";
import type { TeamMember } from "@/lib/site";

/** "Business and Computer Science", "A, B and C". */
function listOf(items: readonly string[]): string {
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}` : (items[0] ?? "");
}

/** One person: portrait, name, role, school and majors, then their own record. */
export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-neutral-200 p-7">
      <div className="flex items-center gap-5">
        <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-neutral-100">
          {member.photo ? (
            <Image src={member.photo} alt={member.name} fill sizes="160px" className={`object-cover ${member.photoClassName ?? ""}`} />
          ) : null}
        </span>
        <div>
          <h3 className="text-xl font-medium tracking-[-0.02em] text-neutral-950">{member.name}</h3>
          <p className="mt-0.5 text-[15px] text-brand-500">{member.role}</p>
        </div>
      </div>
      <p className="mt-6 text-[15px] text-neutral-950">
        {member.school}, {listOf(member.majors)}
      </p>
      <ul className="mt-4 space-y-2.5 border-t border-neutral-100 pt-4">
        {member.highlights.map((line) => (
          <li key={line} className="flex gap-3 text-[14.5px] leading-relaxed text-neutral-600">
            <span aria-hidden="true" className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
