import { LogoMark } from "@/components/logo";

/**
 * The ink of public/coere-wordmark.svg sits inside a wide padded canvas
 * (1284 by 512, the letters from about 141,136 to 1144,372). This box crops
 * to the letters with a little air, so the logo can be sized by its real
 * height. It stays a vector, so it is sharp at any pixel ratio.
 */
const CROP = { x: 133, y: 124, width: 1020, height: 260 };

/** The Coere mark in blue beside the text logo, 26px tall. */
export function BrandLockup({ height = 26 }: { height?: number }) {
  const width = Math.round((height * CROP.width) / CROP.height);
  return (
    <span className="flex items-center gap-2">
      <LogoMark className="h-6 w-6 shrink-0 text-brand-500" />
      <svg width={width} height={height} viewBox={`${CROP.x} ${CROP.y} ${CROP.width} ${CROP.height}`} aria-hidden="true" focusable="false" className="block shrink-0">
        <image href="/coere-wordmark.svg" width="1284" height="512" />
      </svg>
    </span>
  );
}
