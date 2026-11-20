import Link from "@/site/i18n/link";
import type { ReactNode } from "react";
import { parseInline } from "./inline";

const LINK =
  "font-medium text-brand-600 underline decoration-brand-300 decoration-[1.5px] underline-offset-[5px] transition-colors hover:text-brand-700 hover:decoration-brand-600 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:text-brand-300 dark:decoration-brand-400/60 dark:hover:text-brand-200 dark:hover:decoration-brand-200";

/** A link inside post text: a page of this site through Next's Link, anything else as a plain anchor. */
function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return href.startsWith("/") ? (
    <Link href={href} className={LINK}>
      {children}
    </Link>
  ) : (
    <a href={href} className={LINK}>
      {children}
    </a>
  );
}

/** A line of post text with its links, bold and code drawn as elements. */
export function InlineText({ text }: { text: string }) {
  return parseInline(text).map((piece, i) => {
    if (piece.kind === "link") return <TextLink key={i} href={piece.href}>{piece.text}</TextLink>;
    if (piece.kind === "code") return <code key={i} className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.86em] text-neutral-900 ring-1 ring-neutral-950/5 dark:bg-white/10 dark:text-white dark:ring-white/10">{piece.text}</code>;
    if (piece.kind === "bold") {
      const strong = <strong className="font-semibold text-neutral-950 dark:text-white">{piece.text}</strong>;
      return piece.href ? <TextLink key={i} href={piece.href}>{strong}</TextLink> : <span key={i}>{strong}</span>;
    }
    return <span key={i}>{piece.text}</span>;
  });
}
