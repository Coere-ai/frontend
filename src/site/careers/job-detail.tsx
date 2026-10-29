import type { Role } from "@/site/content/roles";
import { ButtonLink } from "@/site/ui/button";
import { CheckIcon, ClockIcon, MapPinIcon } from "@/site/ui/icons/interface-icons";

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-[15px] font-medium text-neutral-950">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-neutral-600">
            <CheckIcon size={17} className="mt-1 shrink-0 text-neutral-950" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The right side of the job board: everything about the picked role, and a way to apply. */
export function JobDetail({ role }: { role: Role }) {
  return (
    <article aria-live="polite" className="rounded-3xl border border-neutral-200 p-8 md:p-10">
      <p className="text-[13px] font-medium text-neutral-500">{role.team}</p>
      <h2 className="mt-2 text-3xl font-medium tracking-[-0.035em] text-neutral-950 text-balance">{role.title}</h2>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-neutral-600">
        <span className="flex items-center gap-2"><MapPinIcon size={16} />{role.location}</span>
        <span className="flex items-center gap-2"><ClockIcon size={16} />{role.type}</span>
      </div>
      <p className="mt-6 text-[16px] leading-relaxed text-neutral-600">{role.summary}</p>
      <p className="mt-4 text-[15px] text-neutral-950">{role.pay}</p>
      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <List title="What you'll do" items={role.responsibilities} />
        <List title="What we look for" items={role.lookingFor} />
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href={`/careers/${role.slug}#apply`}>Apply</ButtonLink>
        <ButtonLink href={`/careers/${role.slug}`} variant="secondary">Open the full listing</ButtonLink>
      </div>
    </article>
  );
}
