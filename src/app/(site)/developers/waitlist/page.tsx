import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";
import { CodeTabs } from "@/site/blocks/code-tabs";
import { Stage } from "@/site/blocks/stage";
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
    <section className="pt-16 pb-24 md:pt-24 md:pb-32">
      <Container className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
        <div>
          <p className="text-sm font-medium text-neutral-500">Coere Forge for developers</p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-[3.25rem] md:leading-[1.05]">
            Give your app&apos;s users memory from day one
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-neutral-500 text-pretty">
            Your app reads the memory a person already built across their AIs, with their permission, from the first message.
          </p>
          <div className="mt-10 max-w-md">
            <WaitlistForm />
          </div>
          <ArrowLink href="/products/forge" className="mt-8 text-neutral-950">
            See what Coere Forge does
          </ArrowLink>
        </div>
        <Stage>
          <div className="relative">
            <CodeTabs samples={contextSamples} />
          </div>
        </Stage>
      </Container>
    </section>
  );
}
