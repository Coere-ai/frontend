/** The widths each private photo is saved at, as <name>-<width>.webp. */
export const PHOTO_WIDTHS = [960, 1920, 3840];

/**
 * The file for a private photo at the smallest saved width that covers
 * `width`. `src` is the photo's path without a width, such as
 * /preview/images/backgrounds/waves.webp.
 */
export function sizedSrc(src: string, width: number): string {
  const size = PHOTO_WIDTHS.find((w) => w >= width) ?? PHOTO_WIDTHS[PHOTO_WIDTHS.length - 1];
  return src.replace(/\.webp$/, `-${size}.webp`);
}
