import Image from "next/image";
import { agents } from "@/site/content/agents";
import { CheckList } from "@/site/blocks/check-list";

/**
 * Every agent as a soft card, its art on a tile in its own color: Cori in that color, the
 * agent's name and field, what it is for, and a few things to ask it.
 */
export function AgentCards() {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {agents.map((agent) => (
        <li key={agent.slug} className="flex flex-col rounded-[28px] bg-white p-7 ring-1 ring-neutral-950/[0.06] shadow-[0_28px_70px_-34px_rgba(23,27,77,0.28)]">
          <div className="grid aspect-square place-items-center rounded-2xl" style={{ backgroundColor: `${agent.color}1f` }}>
            <Image src={agent.art} alt={`${agent.name}, in ${agent.field.toLowerCase()} colors`} width={256} height={256} unoptimized className="w-[62%]" />
          </div>
          <p className="mt-6 text-[13px] font-medium" style={{ color: agent.color }}>
            {agent.field}
          </p>
          <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">{agent.name}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">{agent.line}</p>
          <CheckList items={agent.tasks} className="mt-5" />
        </li>
      ))}
    </ul>
  );
}
