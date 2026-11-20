import { PixelMatrixLogos } from "@/site/art/pixel-matrix-logos";

/**
 * The Coere Solutions hero's backdrop: the LED wall of AI logos, floating
 * above and below the app and out of the beam that falls on it, with only
 * a few far marks on the side of the words. A soft shade
 * sits behind the words so white type reads on the wall: from the left on
 * a wide screen, and over the top half where a phone stacks the copy.
 */
export function SolutionsBackdrop() {
  return (
    <div className="absolute inset-0 bg-[#04050b]">
      <PixelMatrixLogos layout="frame" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,5,11,0.3),rgba(4,5,11,0.7)_18%,rgba(4,5,11,0.62)_55%,rgba(4,5,11,0.15)_80%)] lg:bg-[radial-gradient(ellipse_62%_75%_at_20%_55%,rgba(4,5,11,0.84),rgba(4,5,11,0.5)_55%,transparent_82%)]" />
    </div>
  );
}
