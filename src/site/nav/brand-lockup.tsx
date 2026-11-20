import { WORDMARK_CROP } from "@/components/logo";

/**
 * The ink of public/coere-wordmark.svg sits inside a wide padded canvas
 * (1284 by 512, the letters from about 141,136 to 1144,372). This box crops
 * to the letters with a little air, so the logo can be sized by its real
 * height. It stays a vector, so it is sharp at any pixel ratio.
 */
const CROP = WORDMARK_CROP;

/**
 * The text logo alone, 26px tall: the owner wants no mark beside it. It
 * follows the page's theme, or with `white` stays white, for a panel that
 * is dark whatever page it sits on.
 */
export function BrandLockup({ height = 26, white = false }: { height?: number; white?: boolean }) {
  const width = Math.round((height * CROP.width) / CROP.height);
  const box = { width, height, viewBox: `${CROP.x} ${CROP.y} ${CROP.width} ${CROP.height}`, "aria-hidden": true, focusable: false } as const;
  if (white) {
    return (
      <span className="flex items-center">
        <svg {...box} className="block shrink-0">
          <image href="/coere-wordmark-white.svg" width="1284" height="512" />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex items-center">
      {/* The white copy shows when the navbar sits over a dark hero, and in the footer of a dark page. */}
      <svg {...box} className="block shrink-0 group-data-[tone=dark]/nav:hidden dark:hidden">
        <image href="/coere-wordmark.svg" width="1284" height="512" />
      </svg>
      <svg {...box} className="hidden shrink-0 group-data-[tone=dark]/nav:block dark:block">
        <image href="/coere-wordmark-white.svg" width="1284" height="512" />
      </svg>
    </span>
  );
}
