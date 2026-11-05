import Image from "next/image";
import { agents } from "@/site/content/agents";

/** The agents side by side on the white page, each with its field and name, for the top of the Agents page. */
export function AgentLineup() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {agents.map((agent) => (
        <div key={agent.slug} className="text-center">
          <Image src={agent.art} alt="" width={256} height={256} unoptimized className="mx-auto w-[78%]" />
          <p className="mt-2 text-[14px] font-medium text-neutral-950">{agent.field}</p>
          <p className="text-[12px]" style={{ color: agent.color }}>
            {agent.name}
          </p>
        </div>
      ))}
    </div>
  );
}
