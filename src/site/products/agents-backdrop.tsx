import { LiquidLines } from "@/site/art/liquid-lines";
// The palette comes from its own module: a value exported through the client component would reach this server file only as a reference.
import { COERE_PALETTE as COERE_LIQUID_PALETTE } from "@/site/art/liquid-lines/palette";

/** Liquid Lines on the dark heroes' own near black, so the hero meets the page with no seam. */
const LINES = { ...COERE_LIQUID_PALETTE, background: "#0b0a12" };

/**
 * The Coere Agents hero's backdrop: Liquid Lines in Coere's palette,
 * white streaks edged with Coere blue and now and then cyan, flowing
 * along the diagonal behind the live demo. A shade sits behind the
 * words only, so white type reads: from the left on a wide screen, and
 * over the top where a phone stacks the copy above the demo.
 */
export function AgentsBackdrop() {
  return (
    <div className="absolute inset-0 bg-[#0b0a12]">
      <LiquidLines palette={LINES} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,18,0.55),rgba(11,10,18,0.78)_22%,rgba(11,10,18,0.6)_48%,rgba(11,10,18,0.12)_72%,transparent)] lg:bg-[radial-gradient(ellipse_58%_85%_at_16%_52%,rgba(11,10,18,0.88),rgba(11,10,18,0.6)_50%,transparent_82%)]" />
    </div>
  );
}
