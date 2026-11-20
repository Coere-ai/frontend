import type { ReactNode } from "react";
import { I18nProvider } from "./client";
import { messagesFor } from "./messages";
import type { Messages } from "./messages/types";

/**
 * The body of a page whose words are still English in every language: the
 * blog posts, the guides, the policy and the rest the report lists. The
 * navbar and footer around it stay in the reader's language and its links
 * keep their prefix, while the body says it is English (lang="en"), so
 * screen readers and translators read it right. `parts` are the messages
 * its Client Components read, given in English so nothing in it mixes.
 */
export function EnglishOnly({ parts = [], children }: { parts?: (keyof Messages)[]; children: ReactNode }) {
  const en = messagesFor("en");
  const messages = Object.fromEntries(parts.map((part) => [part, en[part]])) as Partial<Messages>;
  return (
    <I18nProvider messages={messages}>
      <div lang="en" className="contents">
        {children}
      </div>
    </I18nProvider>
  );
}
