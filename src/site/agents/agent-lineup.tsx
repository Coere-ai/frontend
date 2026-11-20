import Image from "next/image";
import { agents } from "@/site/content/agents";

/** The agents side by side on frosted glass over a light backdrop, for the top of the Agents page. */
export function AgentLineup() {
  return (
    <div className="grid grid-cols-2 gap-4 rounded-[28px] bg-white/55 p-5 shadow-[0_40px_100px_-40px_rgba(20,17,15,0.35)] ring-1 ring-neutral-950/5 backdrop-blur-xl sm:grid-cols-4">
      {agents.map((agent) => (
        <div key={agent.slug} className="rounded-2xl bg-white p-4 text-center shadow-[0_18px_40px_-24px_rgba(20,17,15,0.35)] ring-1 ring-neutral-950/5">
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
