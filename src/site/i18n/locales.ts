/**
 * The languages the site is written in. English is the default and keeps
 * the addresses it always had, with no prefix; every other language lives
 * under its code (/es/pricing, /ja/about). Pure, so the routing rules in
 * next.config.ts, the menus and the tests all read the same list.
 */
export const locales = ["en", "es", "fr", "nl", "ja"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** The languages with a prefix, in the menu's order. */
export const prefixedLocales = locales.filter((l) => l !== defaultLocale);

/** Each language's name in itself, as the language menu lists it. */
export const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  nl: "Nederlands",
  ja: "日本語",
};

/** The Open Graph locale for each language (og:locale wants a region). */
export const ogLocales: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
  fr: "fr_FR",
  nl: "nl_NL",
  ja: "ja_JP",
};

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * The account pages, which exist in English only for now. A link to one
 * from a page in another language goes to the English address, and the
 * language menu on one of them offers each language's home page.
 */
const ENGLISH_ONLY = /^\/(sign-in|sign-up|sign-out|connect|account|welcome|dashboard|admin|api)(\/|$|\?|#)/;

export function isEnglishOnly(path: string): boolean {
  return ENGLISH_ONLY.test(path);
}

/**
 * The address of a site path in a language: "/pricing" in Spanish is
 * "/es/pricing", and the home page is "/es". English, outside links,
 * anchors on the same page and the English only pages come back as they
 * are.
 */
export function localizePath(path: string, locale: Locale): string {
  if (locale === defaultLocale || !path.startsWith("/") || path.startsWith("//") || isEnglishOnly(path)) return path;
  if (path === "/") return `/${locale}`;
  if (path.startsWith("/#") || path.startsWith("/?")) return `/${locale}${path.slice(1)}`;
  return `/${locale}${path}`;
}

/**
 * The language a path is in, and the path without its prefix. An /en prefix
 * comes off too, since a rewritten English page may report its inner path.
 */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const first = pathname.split("/")[1] ?? "";
  if (hasLocale(first)) {
    const rest = pathname.slice(first.length + 1);
    return { locale: first, path: rest === "" ? "/" : rest };
  }
  return { locale: defaultLocale, path: pathname || "/" };
}
