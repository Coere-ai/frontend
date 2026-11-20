import Image from "next/image";
import { agentsIn } from "@/site/content/agents";
import type { Messages } from "@/site/i18n/messages/types";
import { format } from "@/site/i18n/types";
import { CheckList } from "@/site/blocks/check-list";

/**
 * Every agent as a soft card, its art on a tile in its own color: Cori in that color, the
 * agent's name and field, what it is for, and a few things to ask it.
 */
export function AgentCards({ words }: { words: Messages["productPages"]["agents"] }) {
  const agents = agentsIn(words);
  return (
    <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {agents.map((agent) => (
        <li key={agent.slug} className="flex flex-col rounded-[28px] bg-white p-7 ring-1 ring-neutral-950/[0.06] shadow-[0_28px_70px_-34px_rgba(23,27,77,0.28)] dark:bg-white/[0.045] dark:shadow-none dark:ring-white/10">
          <div className="grid aspect-square place-items-center rounded-2xl" style={{ backgroundColor: `${agent.color}1f` }}>
            <Image src={agent.art} alt={format(words.artAlt, { name: agent.name, field: agent.field.toLowerCase() })} width={256} height={256} unoptimized className="w-[62%]" />
          </div>
          <p className="mt-6 text-[13px] font-medium dark:brightness-[1.4]" style={{ color: agent.color }}>
            {agent.field}
          </p>
          <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">{agent.name}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-600 dark:text-white/65">{agent.line}</p>
          <CheckList items={agent.tasks} className="mt-5" />
        </li>
      ))}
    </ul>
  );
}
