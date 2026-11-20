import "server-only";
import type { Locale } from "../locales";
import { allMessages } from "./all";
import type { Messages } from "./types";

/**
 * A language's messages. Server only: a Client Component gets the parts it
 * needs from an I18nProvider, so no page ships every language.
 */
export function messagesFor(locale: Locale): Messages {
  return allMessages[locale];
}
