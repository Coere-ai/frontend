import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";
import { CodeTabs } from "@/site/blocks/code-tabs";
import { SoftBackdrop } from "@/site/blocks/soft-backdrop";
import { Stage } from "@/site/blocks/stage";
import { backgrounds } from "@/site/content/backgrounds";
import { contextSamples } from "@/site/content/code/context-api";
import { waitlistSeo } from "@/site/content/seo";
import { WaitlistForm } from "@/site/developers/waitlist-form";
import { UNDER_NAV } from "@/site/nav/nav-space";
import { ArrowLink } from "@/site/ui/arrow-link";
import { Container } from "@/site/ui/container";
import { DarkPage } from "@/site/ui/page-theme";
import { EnglishOnly } from "@/site/i18n/english-only";

export const metadata: Metadata = pageMetadata({ ...waitlistSeo, path: "/developers/waitlist" });

/**
 * The developer waitlist (docs/accounts.md section 16): one screen, the
 * words and the email field on the left, and on the right the few lines a
 * developer writes first, over Coere's artwork as on the Forge page.
 */
export default function DeveloperWaitlistPage() {
  return (
    <EnglishOnly>
      <DarkPage>
        <section className={`relative isolate overflow-hidden pt-[136px] pb-24 md:pt-[168px] md:pb-32 ${UNDER_NAV}`}>
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <SoftBackdrop />
          </div>
          <Container className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
            <div>
              <h1 className="text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.045em] text-neutral-950 text-balance dark:text-white sm:text-6xl">
                Give your app&apos;s users memory from day one
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-neutral-600 text-pretty dark:text-white/65">
                Your app reads the memory a person already built across their AIs, with their permission, from the first message.
              </p>
              <div className="mt-10 max-w-md">
                <WaitlistForm />
              </div>
              <ArrowLink href="/products/forge" className="mt-8 text-neutral-950">
                See what Coere Forge does
              </ArrowLink>
            </div>
            <Stage background={backgrounds.ribbons} className="shadow-[0_40px_100px_-40px_rgba(23,27,77,0.45)] dark:shadow-none">
              <div aria-hidden="true" className="absolute inset-0 bg-neutral-950/35" />
              <div className="relative p-6 md:p-12">
                <CodeTabs samples={contextSamples} />
              </div>
            </Stage>
          </Container>
        </section>
      </DarkPage>
    </EnglishOnly>
  );
}
