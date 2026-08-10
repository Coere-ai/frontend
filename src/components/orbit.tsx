import { AgentLogo } from "@/components/agent-logo";
import { LogoMark } from "@/components/logo";
import { agents } from "@/lib/site";

const RADIUS = 37; // percent of the container
const DEFAULT_DURATION = 46; // seconds per revolution
const LOGO = 54; // px

/**
 * The AI logos travel around the Coere mark. Each logo rides a CSS motion path
 * with `offset-rotate: 0deg`, so it stays face up the whole way round and no
 * two animations can drift out of sync.
 */
export function Orbit({ duration = DEFAULT_DURATION }: { duration?: number }) {
  return (
    // clip so the ring's bounding box can't widen the page
    <div className="mx-auto aspect-square w-full max-w-[25rem] overflow-clip">
      <div className="relative h-full w-full">
        {agents.map((agent, index) => (
          <div
            key={agent.name}
            className="absolute top-0 left-0 grid place-items-center"
            style={{
              width: LOGO,
              height: LOGO,
              offsetPath: `circle(${RADIUS}% at 50% 50%)`,
              offsetRotate: "0deg",
              animation: `coere-orbit ${duration}s linear infinite`,
              // spreads the logos evenly around the ring
              animationDelay: `-${(index / agents.length) * duration}s`,
              willChange: "offset-distance",
            }}
          >
            <AgentLogo src={agent.logo} name={agent.name} size={LOGO} />
          </div>
        ))}

        <div className="absolute inset-0 grid place-items-center">
          <LogoMark className="h-24 w-24 text-brand-500" />
        </div>
      </div>
    </div>
  );
}
