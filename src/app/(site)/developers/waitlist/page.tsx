import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";
import { CodeTabs } from "@/site/blocks/code-tabs";
import { SoftBackdrop } from "@/site/blocks/soft-backdrop";
import { Stage } from "@/site/blocks/stage";
import { backgrounds } from "@/site/content/backgrounds";
import { contextSamples } from "@/site/content/code/context-api";
import { waitlistSeo } from "@/site/content/seo";
import { WaitlistForm } from "@/site/developers/waitlist-form";
import { ArrowLink } from "@/site/ui/arrow-link";
import { Container } from "@/site/ui/container";

export const metadata: Metadata = pageMetadata({ ...waitlistSeo, path: "/developers/waitlist" });

/**
 * The developer waitlist (docs/accounts.md section 16): one screen, the
 * words and the email field on the left, and on the right the few lines a
 * developer writes first, over Coere's artwork as on the Forge page.
 */
export default function DeveloperWaitlistPage() {
  return (
    <section className="relative isolate overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <SoftBackdrop />
      </div>
      <Container className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1.5 text-[13px] font-medium text-brand-700 ring-1 ring-brand-500/15 backdrop-blur-md">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Coere Forge for developers
          </p>
          <h1 className="mt-6 text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.045em] text-neutral-950 text-balance sm:text-6xl">
            Give your app&apos;s users memory from day one
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-neutral-600 text-pretty">
            Your app reads the memory a person already built across their AIs, with their permission, from the first message.
          </p>
          <div className="mt-10 max-w-md">
            <WaitlistForm />
          </div>
          <ArrowLink href="/products/forge" className="mt-8 text-neutral-950">
            See what Coere Forge does
          </ArrowLink>
        </div>
        <Stage background={backgrounds.ribbons} className="shadow-[0_40px_100px_-40px_rgba(23,27,77,0.45)]">
          <div aria-hidden="true" className="absolute inset-0 bg-neutral-950/35" />
          <div className="relative p-6 md:p-12">
            <CodeTabs samples={contextSamples} />
          </div>
        </Stage>
      </Container>
    </section>
  );
}
