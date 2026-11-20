"use client";

import { createContext, useContext, type ReactNode } from "react";
import { defaultLocale, type Locale } from "./locales";
import type { Messages } from "./messages/types";

type Value = { locale: Locale; messages: Partial<Messages> };

const I18nContext = createContext<Value>({ locale: defaultLocale, messages: {} });

/**
 * Hands the page's language and some of its messages to the Client
 * Components below. The site layout gives the navbar's and footer's; a page
 * adds the parts its own Client Components read with a nested provider, so
 * no page ships the words of every other page.
 */
export function I18nProvider({ locale, messages, children }: { locale?: Locale; messages: Partial<Messages>; children: ReactNode }) {
  const outer = useContext(I18nContext);
  const value = { locale: locale ?? outer.locale, messages: { ...outer.messages, ...messages } };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}

/** One part of the messages. A part no provider above gave is a bug, so it throws while drawing. */
export function useMessages<K extends keyof Messages>(part: K): Messages[K] {
  const found = useContext(I18nContext).messages[part];
  if (!found) throw new Error(`No messages for "${String(part)}" here; add it to the page's I18nProvider.`);
  return found as Messages[K];
}
