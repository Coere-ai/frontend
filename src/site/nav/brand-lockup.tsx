/**
 * The ink of public/coere-wordmark.svg sits inside a wide padded canvas
 * (1284 by 512, the letters from about 141,136 to 1144,372). This box crops
 * to the letters with a little air, so the logo can be sized by its real
 * height. It stays a vector, so it is sharp at any pixel ratio.
 */
const CROP = { x: 133, y: 124, width: 1020, height: 260 };

/** The text logo alone, 26px tall: the owner wants no mark beside it. */
export function BrandLockup({ height = 26 }: { height?: number }) {
  const width = Math.round((height * CROP.width) / CROP.height);
  return (
    <span className="flex items-center">
      {/* The white copy shows when the navbar sits over a dark hero, and in the footer of a dark page. */}
      <svg width={width} height={height} viewBox={`${CROP.x} ${CROP.y} ${CROP.width} ${CROP.height}`} aria-hidden="true" focusable="false" className="block shrink-0 group-data-[tone=dark]/nav:hidden dark:hidden">
        <image href="/coere-wordmark.svg" width="1284" height="512" />
      </svg>
      <svg width={width} height={height} viewBox={`${CROP.x} ${CROP.y} ${CROP.width} ${CROP.height}`} aria-hidden="true" focusable="false" className="hidden shrink-0 group-data-[tone=dark]/nav:block dark:block">
        <image href="/coere-wordmark-white.svg" width="1284" height="512" />
      </svg>
    </span>
  );
}
