// Review before launch: the owner (and a lawyer if possible) must read this
// policy's text, in src/site/content/privacy.ts, before Coere goes into the
// Chrome Web Store. Every line comes from docs/accounts.md and the code, and
// facts nobody has settled yet (a legal name, an address) are left out.

import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";
import { emailHref } from "@/site/content/navigation";
import { PRIVACY_EFFECTIVE, PRIVACY_EFFECTIVE_LABEL, privacySections, privacySummary } from "@/site/content/privacy";
import { privacySeo } from "@/site/content/seo";
import { Container } from "@/site/ui/container";
import { SectionHeading } from "@/site/ui/section-heading";

export const metadata: Metadata = pageMetadata({ ...privacySeo, path: "/privacy" });

const email = emailHref.replace(/^mailto:/, "");

const LINK = "text-neutral-950 underline decoration-neutral-300 underline-offset-[3px] hover:decoration-neutral-950";

/** A line of the policy, with each {email} turned into a link that writes to the team. */
function Line({ text }: { text: string }): ReactNode {
  return text.split("{email}").map((part, i) => (
    <Fragment key={i}>
      {i > 0 ? (
        <a href={emailHref} className={LINK}>
          {email}
        </a>
      ) : null}
      {part}
    </Fragment>
  ));
}

function Paragraphs({ lines }: { lines: string[] }) {
  return lines.map((p) => (
    <p key={p} className="mt-4 text-[17px] leading-relaxed text-neutral-600">
      <Line text={p} />
    </p>
  ));
}

/** The privacy policy: the short version, a list of parts, then each part in full. */
export default function PrivacyPage() {
  return (
    <>
      <section className="pt-20 pb-16 md:pt-28">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Privacy policy"
            title="What Coere reads, keeps and sends"
            description="Coere is built so your chats stay with you. This page says exactly what the extension and coere.ai do with your data."
          />
          <p className="mt-6 text-[15px] text-neutral-500">
            Effective <time dateTime={PRIVACY_EFFECTIVE}>{PRIVACY_EFFECTIVE_LABEL}</time>
          </p>
        </Container>
      </section>
      <section className="pb-28 md:pb-32">
        <Container className="grid gap-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-20">
          <nav aria-label="On this page" className="hidden lg:sticky lg:top-28 lg:block lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto">
            <p className="text-[13px] font-medium text-neutral-500">On this page</p>
            <ol className="mt-4 space-y-2.5">
              {privacySections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-[15px] text-neutral-950 hover:text-neutral-500">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <article className="max-w-3xl">
            <div className="rounded-[28px] bg-neutral-50 p-8 md:p-10">
              <h2 className="text-[22px] font-medium tracking-[-0.02em] text-neutral-950">The short version</h2>
              <ul className="mt-5 space-y-3">
                {privacySummary.map((line) => (
                  <li key={line} className="flex gap-3 text-[17px] leading-relaxed text-neutral-600">
                    <span aria-hidden="true" className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-950" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            {privacySections.map((s) => (
              <section key={s.id} id={s.id} className="mt-16 scroll-mt-28">
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-neutral-950 text-balance md:text-[28px]">{s.title}</h2>
                <Paragraphs lines={s.paragraphs} />
                {s.list ? (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-[17px] leading-relaxed text-neutral-600 marker:text-neutral-400">
                    {s.list.map((item) => (
                      <li key={item}>
                        <Line text={item} />
                      </li>
                    ))}
                  </ul>
                ) : null}
                {s.after ? <Paragraphs lines={s.after} /> : null}
              </section>
            ))}
          </article>
        </Container>
      </section>
    </>
  );
}
