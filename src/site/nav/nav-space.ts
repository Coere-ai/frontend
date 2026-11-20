/**
 * The navbar's size. The bar floats 12px below the top of the window and is
 * 60px tall, so it takes 72px of the page, as the old white navbar did.
 * A page whose first section should run under the glass (the home hero)
 * pulls itself up by that much with UNDER_NAV and pads its content back
 * down, so the glass has something to bend from the first frame.
 */
export const NAV_BAR_HEIGHT = 60;

/** Pull a page's first section up under the floating navbar. Pair it with top padding of at least 72px. */
export const UNDER_NAV = "-mt-[72px]";
