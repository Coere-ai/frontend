"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "./client";
import { localizePath } from "./locales";

/**
 * next/link in the page's language: a site path gets the language's prefix
 * (/pricing becomes /es/pricing on a Spanish page), so every link keeps the
 * reader in the language they picked. Outside links, mail links and the
 * English only pages pass through.
 */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const locale = useLocale();
  return <NextLink href={typeof href === "string" ? localizePath(href, locale) : href} {...props} />;
}
