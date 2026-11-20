/** One blade of the Coere mark on a 512 square; the mark is it and its copy turned half way round. */
export const LOGO_BLADE = "M 42 460 L 88 190 L 220 58 L 332 170 L 168 334 Z";

/** The mark as a standalone SVG, for canvases and shaders that take an image. */
export function logoMarkSvg(color = "#5267f7"): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="${color}"><path d="${LOGO_BLADE}"/><path d="${LOGO_BLADE}" transform="rotate(180 256 256)"/></svg>`;
}

/** The Coere mark: one blade, mirrored through the center. Inherits currentColor. */
export function LogoMark({ className }: { className?: string }) {
  const blade = LOGO_BLADE;

  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={blade} />
      <path d={blade} transform="rotate(180 256 256)" />
    </svg>
  );
}

/**
 * The text logo, "Coere" and its blue dot, as outlines on the 1284 by 512
 * canvas of public/coere-wordmark.svg, for drawings that cannot load the
 * font that file carries: share pictures and canvases.
 */
export const WORDMARK_LETTERS = "M248.3 372.2Q217.2 372.2 192.9 358.2Q168.6 344.2 154.8 318.1Q141 291.9 141 254.7Q141 218.9 154.2 192.4Q167.4 165.8 191.8 151.2Q216.2 136.6 249.3 136.6Q294.7 136.6 319.9 158.9Q345.1 181.1 352.4 222.7L295 224.9Q291.5 204.6 279.7 193.1Q268 181.7 249.3 181.7Q232.8 181.7 221.2 190.9Q209.6 200.1 203.7 216.6Q197.8 233.1 197.8 254.7Q197.8 277 204 293.1Q210.2 309.3 221.6 318.2Q233.1 327.1 248.9 327.1Q269.6 327.1 280.8 314.9Q292.1 302.7 295.3 281.1L353.1 283.3Q348.3 311.6 335 331.4Q321.6 351.2 300.1 361.7Q278.5 372.2 248.3 372.2ZM461.9 370.9Q435 370.9 414.8 359.8Q394.6 348.7 383.4 328.7Q372.1 308.7 372.1 281.7Q372.1 254.7 383.4 234.7Q394.6 214.7 414.8 203.6Q435 192.5 461.9 192.5Q488.9 192.5 508.9 203.6Q528.9 214.7 540.2 234.7Q551.5 254.7 551.5 281.7Q551.5 308.7 540.2 328.7Q528.9 348.7 508.9 359.8Q488.9 370.9 461.9 370.9ZM461.9 330.6Q477.8 330.6 486.5 317.9Q495.3 305.2 495.3 281.7Q495.3 258.5 486.5 245.7Q477.8 232.8 461.9 232.8Q445.8 232.8 437 245.7Q428.3 258.5 428.3 281.7Q428.3 305.2 437 317.9Q445.8 330.6 461.9 330.6ZM658.8 370.9Q632.1 370.9 612.1 359.8Q592.1 348.7 581 328.7Q569.9 308.7 569.9 281.7Q569.9 254.7 581 234.9Q592.1 215.1 611.9 203.8Q631.8 192.5 658.4 192.5Q685.1 192.5 704.6 203.8Q724.1 215.1 734.6 236Q745.1 257 745.1 285.8V296H626.4Q627.3 313.8 636.4 322.5Q645.4 331.2 659.7 331.2Q670.5 331.2 677.8 326.9Q685.1 322.7 688.3 312.8L742.9 316Q735.9 342.7 713.4 356.8Q690.8 370.9 658.8 370.9ZM626.4 264.9H689.9Q689.2 248.1 680.7 239.7Q672.1 231.2 658.4 231.2Q645.4 231.2 636.7 240.1Q628 249 626.4 264.9ZM772.1 367.1V196.3H824.5L826.4 248.1L822.2 247.4Q826.7 220.1 837.2 208.2Q847.6 196.3 866.4 196.3H881.3V240.4H866Q852.4 240.4 843.8 243.6Q835.3 246.8 831 253.9Q826.7 261.1 826.7 273.5V367.1ZM979.4 370.9Q952.7 370.9 932.7 359.8Q912.7 348.7 901.6 328.7Q890.5 308.7 890.5 281.7Q890.5 254.7 901.6 234.9Q912.7 215.1 932.5 203.8Q952.4 192.5 979 192.5Q1005.7 192.5 1025.2 203.8Q1044.8 215.1 1055.2 236Q1065.7 257 1065.7 285.8V296H947Q947.9 313.8 957 322.5Q966 331.2 980.3 331.2Q991.1 331.2 998.4 326.9Q1005.7 322.7 1008.9 312.8L1063.5 316Q1056.5 342.7 1034 356.8Q1011.4 370.9 979.4 370.9ZM947 264.9H1010.5Q1009.8 248.1 1001.3 239.7Q992.7 231.2 979 231.2Q966 231.2 957.3 240.1Q948.6 249 947 264.9Z";
export const WORDMARK_DOT = "M1087.3 367.1V314.1H1144.4V367.1Z";

/** The box around the text logo's letters on that canvas, with a little air. */
export const WORDMARK_CROP = { x: 133, y: 124, width: 1020, height: 260 };

/** The text logo as a standalone SVG cropped to its letters, in `letters` with the dot in Coere blue. */
export function wordmarkSvg(letters = "#14110f"): string {
  const c = WORDMARK_CROP;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${c.x} ${c.y} ${c.width} ${c.height}" width="${c.width}" height="${c.height}"><path d="${WORDMARK_LETTERS}" fill="${letters}"/><path d="${WORDMARK_DOT}" fill="#5267f7"/></svg>`;
}
