import type { TeamMember } from "@/lib/site";

/** "Business and Computer Science", "A, B and C". */
function listOf(items: readonly string[]): string {
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}` : (items[0] ?? "");
}

/** One founder's record under their lanyard: name, role, school and majors, then their own highlights. */
export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="flex h-full flex-col rounded-[28px] bg-white p-7 shadow-[0_1px_2px_rgba(20,17,15,0.04),0_24px_48px_-32px_rgba(40,50,133,0.28)] ring-1 ring-neutral-200/70 md:p-9">
      <h3 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950">{member.name}</h3>
      <p className="mt-1 text-[15px] font-medium text-brand-600">{member.role}</p>
      <p className="mt-4 text-[15px] text-neutral-600">
        {member.school}, {listOf(member.majors)}
      </p>
      <ul className="mt-6 space-y-3 border-t border-neutral-100 pt-6">
        {member.highlights.map((line) => (
          <li key={line} className="flex gap-3 text-[15px] leading-relaxed text-neutral-700">
            <span aria-hidden="true" className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
