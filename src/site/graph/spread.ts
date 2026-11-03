import type { Layout } from "./layout";
import type { Bounds } from "./types";
import { fitView, type Frame } from "./view";

/**
 * How far out a picture is seen, which sets how much room its lines need.
 * The camera fits the whole picture to the card, so a picture twice as big
 * is seen from twice as far, and a point's drawn floor is the same number
 * of pixels either way. Room made for one layout is too little once it has
 * grown the layout, so the layout is made again for the new fit, a few
 * times, until the room made is enough for the zoom it is seen at. The
 * room is made for the fit on the smallest card, the view at rest and
 * after a click. Past it the page stops the zoom where any line would hide
 * (line-room.ts), since no layout can keep every line of a big library
 * showing in a few hundred pixels.
 */

/** The smallest card the Memory page draws its graph in, with its controls' bands. A bigger card sees the picture closer. */
export const SMALLEST_CARD: Frame = { width: 720, height: 520, top: 104, bottom: 56 };
/** The room is made for a little further out than asked, which covers the growth of the last pass. */
const MARGIN = 0.9;
const PASSES = 8;
/**
 * The most the room may push the picture out, as the share of its first
 * fit it may be seen at. A library with many full sections can need more
 * room than a small card has, and each pass would then grow it again; past
 * this the page keeps its lines by stopping the zoom instead.
 */
const MOST_GROWTH = 0.4;

/** The zoom a picture of this size is seen at, fitted to the smallest card. */
export const farthestOut = (b: Bounds): number => fitView(b, SMALLEST_CARD).k;

/** Lays out with `at(zoom)` until the room made is enough for how far out the result is seen. */
export function spread(at: (zoom: number) => Layout): Layout {
  let laid = at(Infinity);
  const least = farthestOut(laid.bounds) * MOST_GROWTH;
  for (let i = 0; i < PASSES; i++) {
    const far = farthestOut(laid.bounds);
    if (far >= laid.zoom || laid.zoom <= least) break;
    laid = at(Math.max(least, far * MARGIN));
  }
  return laid;
}
