import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { CONSOLE_COMPACT_SIZE, CONSOLE_SIZE, ConsoleDashboard } from "./console-dashboard";
import { ScaleBox } from "./scale-box";

/** The look every tile shares: white, a fine light edge, deep shade and a blue glow under it. */
const TILE = "overflow-hidden rounded-[20px] bg-white ring-1 ring-white/20 shadow-[0_0_0_1px_rgba(8,14,36,0.35),0_50px_120px_-30px_rgba(0,0,0,0.85),0_30px_90px_-40px_rgba(82,103,247,0.75)]";

/**
 * One tile of the stack. It rises into place from a little below, out of a
 * soft blur, a beat after the one above it, then floats gently. Plain CSS,
 * so it plays from the first paint, and the site's reduced motion rule
 * shows it in place at once.
 */
function Tile({ delay, drift, className = "", style, children }: { delay: number; drift: number; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div data-hero-tile className={`shrink-0 animate-[coere-tile-in_1.1s_cubic-bezier(0.22,1,0.36,1)_both] ${className}`} style={{ animationDelay: `${delay}ms`, ...style }}>
      <div className="h-full animate-[coere-drift_10s_ease-in-out_infinite]" style={{ animationDelay: `${drift}s` }}>
        <div className={`h-full ${TILE}`}>{children}</div>
      </div>
    </div>
  );
}

/**
 * The home hero's right side, laid out as Gamma's was: three tall tiles in
 * a column that runs from the hero's top edge to its bottom. The top tile
 * is a real picture of Coere saving a person's chats, cut off by the top of
 * the hero so only its lower part shows; the middle one, the largest and
 * whole, is the dashboard; the bottom one is a real picture of the memory
 * graph, cut off by the hero's foot. The pictures show the made up account
 * Maya Collins and her made up chats. Behind them a soft blue glow gives
 * the stack depth. Below lg only the dashboard shows, under the words.
 */
export function HeroStack() {
  return (
    <>
      <div className="relative hidden lg:block">
        <div aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 h-[70%] w-[95%] -translate-x-1/2 -translate-y-[42%] rounded-full bg-[radial-gradient(closest-side,rgba(82,103,247,0.45),rgba(82,103,247,0.12)_60%,transparent)] blur-2xl" />
        {/* Taller than the hero on purpose: the column is centred below the navbar, the hero clips the ends, and the top fades out under the glass so the bar never sits on a white tile. */}
        <div className="absolute inset-0 flex flex-col justify-center gap-5 pt-[72px] [mask-image:linear-gradient(to_bottom,transparent_52px,black_112px)]">
          <Tile delay={150} drift={0} className="aspect-[1300/813] w-[92%] self-end">
            <Image src="/preview/hero/extraction.webp" alt="Coere saving Maya's chats: 74 of 570 chats saved, about 5 minutes left, and ChatGPT at 18 of 240" width={1300} height={813} unoptimized className="h-full w-full object-cover object-bottom" />
          </Tile>
          <Tile delay={380} drift={2.5}>
            <ScaleBox width={CONSOLE_SIZE.width} height={CONSOLE_SIZE.height}>
              <ConsoleDashboard />
            </ScaleBox>
          </Tile>
          <Tile delay={610} drift={5} className="aspect-[1300/696] w-[92%] self-end">
            <Image src="/preview/hero/memory-graph.webp" alt="The Memory page's graph: Personal info, People, Tone and voice, Writing style and Work branching from the person" width={1300} height={696} unoptimized className="h-full w-full object-cover object-top" />
          </Tile>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[520px] lg:hidden">
        <Tile delay={250} drift={0}>
          <ScaleBox width={CONSOLE_COMPACT_SIZE.width} height={CONSOLE_COMPACT_SIZE.height}>
            <ConsoleDashboard compact />
          </ScaleBox>
        </Tile>
      </div>
    </>
  );
}
