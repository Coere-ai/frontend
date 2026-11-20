import Image from "next/image";
import { agents } from "@/site/content/agents";

/** The agents side by side on dark frosted glass, for the top of the Agents page, which opens on near black. */
export function AgentLineup() {
  return (
    <div className="grid grid-cols-2 gap-4 rounded-[28px] bg-white/[0.06] p-5 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/10 backdrop-blur-xl sm:grid-cols-4">
      {agents.map((agent) => (
        <div key={agent.slug} className="rounded-2xl bg-white/[0.07] p-4 text-center ring-1 ring-white/10">
          <Image src={agent.art} alt="" width={256} height={256} unoptimized className="mx-auto w-[78%] drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]" />
          <p className="mt-2 text-[14px] font-medium text-white">{agent.field}</p>
          <p className="text-[12px] brightness-125" style={{ color: agent.color }}>
            {agent.name}
          </p>
        </div>
      ))}
    </div>
  );
}
