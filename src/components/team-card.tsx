import Image from "next/image";
import type { TeamMember } from "@/lib/site";

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

function Portrait({ member }: { member: TeamMember }) {
  return (
    <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-brand-50">
      {member.photo ? (
        <Image
          src={member.photo}
          alt={member.name}
          fill
          // Larger than the box so a zoomed crop stays sharp.
          sizes="200px"
          className={`object-cover ${member.photoClassName ?? ""}`}
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid h-full w-full place-items-center text-xl font-semibold tracking-[-0.02em] text-brand-600"
        >
          {initialsOf(member.name)}
        </span>
      )}
    </span>
  );
}

function Label({ children }: { children: string }) {
  return (
    <p className="text-[11.5px] font-semibold tracking-[0.1em] text-ink-900/45 uppercase">
      {children}
    </p>
  );
}

/** One person: portrait and role, then education, then short bullets. */
export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-ink-900/8 bg-white p-6 sm:p-8">
      <header className="flex items-center gap-5">
        <Portrait member={member} />
        <div className="min-w-0">
          <h4 className="text-lg font-semibold tracking-[-0.02em] text-ink-900">
            {member.name}
          </h4>
          <p className="mt-0.5 text-[13.5px] font-medium text-brand-600">
            {member.role}
          </p>
        </div>
      </header>

      <div className="mt-6">
        <Label>Education</Label>
        <ul className="mt-2 space-y-1">
          {member.education.map((line) => (
            <li key={line} className="text-[14px] text-ink-900/75">
              {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 border-t border-ink-900/6 pt-5">
        <Label>Experience and accomplishments</Label>
        <ul className="mt-2.5 space-y-2">
          {member.highlights.map((line) => (
            <li
              key={line}
              className="flex gap-3 text-[14px] leading-relaxed text-ink-900/75"
            >
              <span
                aria-hidden="true"
                className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
