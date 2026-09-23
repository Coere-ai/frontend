import Image from "next/image";
import type { TeamMember } from "@/lib/site";

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

/** Joins majors the way a sentence would: "A", "A and B", "A, B and C". */
const listOf = (items: readonly string[]) =>
  items.length > 1
    ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
    : (items[0] ?? "");

function Portrait({ member }: { member: TeamMember }) {
  return (
    <span className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full ring-1 ring-ink-900/8 sm:h-28 sm:w-28">
      {member.photo ? (
        <Image
          src={member.photo}
          alt={member.name}
          fill
          // Larger than the box so a zoomed crop stays sharp.
          sizes="256px"
          className={`object-cover ${member.photoClassName ?? ""}`}
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid h-full w-full place-items-center bg-linear-to-br from-brand-100 to-brand-50 text-2xl font-semibold tracking-[-0.02em] text-brand-700"
        >
          {initialsOf(member.name)}
        </span>
      )}
    </span>
  );
}

function CapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mt-[3px] h-4 w-4 shrink-0 text-ink-900"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 10l10-5 10 5-10 5z" />
      <path d="M6 12.2v4.3c3 2.6 9 2.6 12 0v-4.3M22 10v6" />
    </svg>
  );
}

/** One person: portrait beside their name and role, then school and majors, then short bullets. */
export function TeamProfile({ member }: { member: TeamMember }) {
  return (
    <article className="flex flex-col gap-5 p-6 sm:flex-row sm:gap-8 sm:p-8">
      <Portrait member={member} />

      <div className="min-w-0 flex-1">
        <h4 className="text-xl font-semibold tracking-[-0.02em] text-ink-900">
          {member.name}
        </h4>
        <p className="mt-0.5 text-[14px] font-medium text-brand-600">
          {member.role}
        </p>

        <p className="mt-3 flex gap-2 text-[14px] leading-relaxed text-ink-900/60">
          <CapIcon />
          <span>
            {member.school}, {listOf(member.majors)}
          </span>
        </p>

        <ul className="mt-5 space-y-2">
          {member.highlights.map((line) => (
            <li
              key={line}
              className="flex gap-3 text-[14.5px] leading-relaxed text-ink-900/75"
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
