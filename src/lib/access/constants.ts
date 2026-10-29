/** The cookie that carries a signed, time limited pass to the new site. */
export const ACCESS_COOKIE = "coere_access";

/** How long one sign in lasts. The pass and its cookie both end after an hour. */
export const ACCESS_TTL_SECONDS = 60 * 60;

/**
 * Where the new site's routes and files live inside the app. Visitors with a
 * pass see them at the clean address (coere.ai/blog), never under this prefix,
 * and visitors without one get a 404 here.
 */
export const PREVIEW_PREFIX = "/preview";
