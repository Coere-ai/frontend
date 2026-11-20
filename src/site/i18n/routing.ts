import { defaultLocale, locales } from "./locales";

/**
 * How the addresses map onto app/[lang], read by next.config.ts.
 *
 * Every page of the site lives under app/[lang], as the Next.js guide to
 * internationalization lays it out, so each language is its own static
 * page with its own <html lang>. English keeps its addresses with no
 * prefix: a rewrite serves /pricing from /en/pricing, so nobody is ever
 * redirected to read English. Nothing looks at the browser's language
 * either; a person picks one in the language menu.
 *
 * The rewrite runs after the files and the fixed routes (afterFiles), so
 * public files, _next, the share images and the API, admin and dashboard
 * routes are served as they are. The prefixes left out below are the paths
 * that already name a language and the dynamic routes outside the site.
 */
const SKIP = [...locales, "api", "admin", "dashboard", "welcome", "_next", "preview"].join("|");

/**
 * The first segment of a path that should be read as English: any segment
 * but those above. The lookahead peeks past the segment, so "es" is left
 * alone and "esports" is not.
 */
export const ENGLISH_SEGMENT = `(?!(?:${SKIP})(?:/|$))[^/]+`;

export const localeRewrites = [
  { source: "/", destination: `/${defaultLocale}` },
  { source: `/:first(${ENGLISH_SEGMENT})`, destination: `/${defaultLocale}/:first` },
  { source: `/:first(${ENGLISH_SEGMENT})/:rest*`, destination: `/${defaultLocale}/:first/:rest*` },
];

/**
 * /en/pricing is the same page as /pricing, so it goes there for good. This
 * keeps one address per page, as the apex redirect does. It never touches
 * an address someone would read English at.
 */
export const localeRedirects = [
  { source: `/${defaultLocale}`, destination: "/", permanent: true },
  { source: `/${defaultLocale}/:path*`, destination: "/:path*", permanent: true },
];
