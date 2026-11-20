import type { TeamMember } from "@/lib/site";
import type { Locale } from "@/site/i18n/locales";

/** "Business and Computer Science", "A, B and C", in English as before, else as the page's language joins a list. */
function listOf(items: readonly string[], locale: Locale): string {
  if (locale !== "en") return new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(items);
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}` : (items[0] ?? "");
}

/** One founder's record under their lanyard, as a dark glass card: name, role, school and majors, then their own highlights. */
export function TeamCard({ member, locale = "en" }: { member: TeamMember; locale?: Locale }) {
  return (
    <article className="flex h-full flex-col rounded-[28px] bg-white/[0.04] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_30px_80px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/10 backdrop-blur-md md:p-9">
      <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">{member.name}</h3>
      <p className="mt-1 text-[15px] font-medium text-brand-300">{member.role}</p>
      <p className="mt-4 text-[15px] text-white/60">
        {member.school}, {listOf(member.majors, locale)}
      </p>
      <ul className="mt-6 space-y-3 border-t border-white/10 pt-6">
        {member.highlights.map((line) => (
          <li key={line} className="flex gap-3 text-[15px] leading-relaxed text-white/75">
            <span aria-hidden="true" className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
