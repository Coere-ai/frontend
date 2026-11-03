import { notFound } from "next/navigation";

/**
 * Catches every address the new site doesn't have, so its 404 renders inside
 * the new site's layout instead of falling through to the bare default.
 */
export default function Missing() {
  notFound();
}
