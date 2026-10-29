import Image from "next/image";
import { agents } from "@/site/content/agents";

/** The agents side by side on frosted glass, for the top of the Agents page. */
export function AgentLineup() {
  return (
    <div className="grid grid-cols-2 gap-4 rounded-3xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur-md sm:grid-cols-4">
      {agents.map((agent) => (
        <div key={agent.slug} className="rounded-2xl bg-white p-4 text-center shadow-[0_20px_50px_-25px_rgba(0,0,0,0.6)]">
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
