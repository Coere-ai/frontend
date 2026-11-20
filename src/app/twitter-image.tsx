import { SHARE_ALT } from "@/lib/seo";
import { siteShareImage } from "@/site/share/site-image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = SHARE_ALT;

/** The site's share picture, drawn at build time. A blog post draws its own. */
export default function Image() {
  return siteShareImage();
}
