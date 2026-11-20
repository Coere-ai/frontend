import { agents } from "@/lib/site";
import type { Locale } from "@/site/i18n/locales";
import type { Messages } from "@/site/i18n/messages/types";
import { faqs as en } from "@/site/i18n/messages/en/faqs";
import { format } from "@/site/i18n/types";
import { emailHref } from "./navigation";

/**
 * Questions people and AI search ask about Coere, each answered in a few
 * plain sentences that stand on their own. Every answer is something the
 * site or the developer docs (src/site/content/docs) already shows; nothing
 * here is new. Each list is drawn on its page by FaqSection and written
 * into that page's FAQPage data by faqGraph, word for word.
 */
export type Faq = { q: string; a: string; link?: { href: string; label: string } };

/** Every AI Coere saves chats from, as one line: "ChatGPT, Claude, ... and Kimi". */
export const AI_LIST = `${agents
  .slice(0, -1)
  .map((a) => a.name)
  .join(", ")} and ${agents.at(-1)?.name}`;

/** Every AI Coere saves chats from, as a list in a language: "ChatGPT, Claude ... y Kimi". */
export function aiListIn(locale: Locale): string {
  return new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(agents.map((a) => a.name));
}

/** Where each home question's link goes, in the order of the questions (messages faqs.home). */
const homeLinks: (string | undefined)[] = ["/portable-ai-memory", undefined, "/chatgpt-to-claude-memory", undefined, "/ai-agent-memory", undefined, emailHref];

/** The home page's questions in a language, with the same links as in English. */
export function homeFaqsIn(words: Messages["faqs"]["home"], locale: Locale): Faq[] {
  const ais = locale === "en" ? AI_LIST : aiListIn(locale);
  return words.map((faq, i) => {
    const href = homeLinks[i];
    const label = "link" in faq ? faq.link : undefined;
    return { q: faq.q, a: format(faq.a, { ais }), ...(href && label ? { link: { href, label } } : {}) };
  });
}

/** The home page's questions in English, for the guides and anything else in English. */
export const homeFaqs: Faq[] = homeFaqsIn(en.home, "en");

/** "Can I use Coere today?", which closes every list of questions. */
export const pending: Faq = homeFaqs[homeFaqs.length - 1];
