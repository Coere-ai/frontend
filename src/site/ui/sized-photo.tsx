"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";

/** The widths each private photo is saved at, as <name>-<width>.webp. */
const WIDTHS = [960, 1920, 3840];

/**
 * Picks the saved size of a private photo for the width next/image asks
 * for. The built in optimizer can't be used for these: it fetches the file
 * without the visitor's pass, and the access gate turns it away. So each
 * photo is saved at a few widths ahead of time and served as a plain file.
 */
const sizedPhotoLoader: ImageLoader = ({ src, width }) => {
  const size = WIDTHS.find((w) => w >= width) ?? WIDTHS[WIDTHS.length - 1];
  return src.replace(/\.webp$/, `-${size}.webp`);
};

/**
 * next/image for a photo saved at several widths. `src` is the photo's path
 * without the width, such as /preview/images/industries/finance.webp. The
 * loader is a function, so it lives in this client file: a server
 * component can't hand one to Image.
 */
export function SizedPhoto({ alt, ...props }: Omit<ImageProps, "loader">) {
  return <Image alt={alt} {...props} loader={sizedPhotoLoader} />;
}
