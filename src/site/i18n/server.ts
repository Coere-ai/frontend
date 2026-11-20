import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { defaultLocale, hasLocale, type Locale } from "./locales";
import { messagesFor } from "./messages";
import type { Messages } from "./messages/types";

/**
 * The language of the page being drawn, read from the [lang] segment above
 * the root layout (next/root-params), so a Server Component anywhere in the
 * tree can ask without the page passing it down.
 */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!hasLocale(value)) notFound();
  return value;
}

/**
 * The messages of the page's language, or of `locale` when a part of the
 * page is still English in every language (see EnglishOnly).
 */
export async function getMessages(locale?: Locale): Promise<Messages> {
  return messagesFor(locale ?? (await getLocale()));
}

/** For the pages that exist in English only for now (the account pages): any other language is a 404. */
export async function requireEnglish(): Promise<void> {
  if ((await getLocale()) !== defaultLocale) notFound();
}
