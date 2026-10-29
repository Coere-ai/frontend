import type { Role } from "@/site/content/roles";
import { CheckIcon } from "@/site/ui/icons/interface-icons";

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-xl font-medium tracking-[-0.02em] text-neutral-950">{title}</h2>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[16px] leading-relaxed text-neutral-600">
            <CheckIcon size={18} className="mt-1 shrink-0 text-brand-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** What the role is: its summary, the work, what we look for, and the facts beside them. */
export function RoleDetails({ role }: { role: Role }) {
  const facts = [
    { label: "Team", value: role.team },
    { label: "Type", value: role.type },
    { label: "Location", value: role.location },
    { label: "Pay", value: role.pay },
  ];
  return (
    <div className="space-y-12">
      <dl className="grid gap-6 rounded-3xl bg-neutral-50 p-7 sm:grid-cols-2">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-[13px] text-neutral-500">{fact.label}</dt>
            <dd className="mt-1 text-[16px] text-neutral-950">{fact.value}</dd>
          </div>
        ))}
      </dl>
      <List title="What you'll do" items={role.responsibilities} />
      <List title="What we look for" items={role.lookingFor} />
    </div>
  );
}
