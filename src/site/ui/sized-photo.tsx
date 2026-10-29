"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";
import { sizedSrc } from "./sized-src";

/**
 * Picks the saved size of a private photo for the width next/image asks
 * for. The built in optimizer can't be used for these: it fetches the file
 * without the visitor's pass, and the access gate turns it away. So each
 * photo is saved at a few widths ahead of time and served as a plain file.
 */
const sizedPhotoLoader: ImageLoader = ({ src, width }) => sizedSrc(src, width);

/**
 * next/image for a photo saved at several widths. `src` is the photo's path
 * without the width, such as /preview/images/industries/finance.webp. The
 * loader is a function, so it lives in this client file: a server
 * component can't hand one to Image.
 */
export function SizedPhoto({ alt, ...props }: Omit<ImageProps, "loader">) {
  return <Image alt={alt} {...props} loader={sizedPhotoLoader} />;
}
