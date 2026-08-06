import { AgentLogo } from "@/components/agent-logo";
import { LogoMark } from "@/components/logo";
import { agents } from "@/lib/site";

const RADIUS = 37; // percent of the container
const DURATION = 46; // seconds per revolution
const LOGO = 54; // px

/**
 * The AI logos orbit the Coere mark on a single ring, one direction. Rotation
 * runs as a plain CSS animation so the browser keeps it on the compositor, and
 * each logo counter-rotates at the same rate to stay upright.
 */
export function Orbit() {
  return (
    // clip so the rotated ring's bounding box can't widen the page
    <div className="mx-auto aspect-square w-full max-w-[25rem] overflow-clip">
      <div className="relative h-full w-full">
        <div
          className="absolute inset-0"
          style={{
            animation: `coere-spin ${DURATION}s linear infinite`,
            willChange: "transform",
          }}
        >
          {agents.map((agent, index) => {
            const angle = (index / agents.length) * 2 * Math.PI;
            const left = 50 + RADIUS * Math.sin(angle);
            const top = 50 - RADIUS * Math.cos(angle);

            return (
              <div
                key={agent.name}
                className="absolute"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: LOGO,
                  height: LOGO,
                  marginLeft: -LOGO / 2,
                  marginTop: -LOGO / 2,
                }}
              >
                {/* cancels the ring rotation so the mark never tilts */}
                <div
                  className="grid h-full w-full place-items-center"
                  style={{
                    animation: `coere-spin ${DURATION}s linear infinite`,
                    animationDirection: "reverse",
                    willChange: "transform",
                  }}
                >
                  <AgentLogo src={agent.logo} name={agent.name} size={LOGO} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute inset-0 grid place-items-center">
          <LogoMark className="h-24 w-24 text-brand-500" />
        </div>
      </div>
    </div>
  );
}
