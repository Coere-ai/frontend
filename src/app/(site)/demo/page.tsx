import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { demoSeo } from "@/site/content/seo";
import { DemoSection } from "@/site/home/demo-section";
import { UNDER_NAV } from "@/site/nav/nav-space";
import { Container } from "@/site/ui/container";
import { DarkPage } from "@/site/ui/page-theme";

export const metadata: Metadata = pageMetadata({ ...demoSeo, path: "/demo" });

/** The full product film on a page of its own, moved off the home page; the hero's Watch demo still opens it in place. */
export default function DemoPage() {
  return (
    <DarkPage className={UNDER_NAV}>
      <section data-nav-tone="dark" className="pt-[136px] pb-10 md:pt-[168px]">
        <Container className="text-center">
          <h1 className="text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.045em] text-white text-balance sm:text-6xl">See Coere in action</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/65 text-pretty">
            The whole product, played live on Coere&apos;s own code: setup, import, the memory it builds and what you can do with it.
          </p>
        </Container>
      </section>
      <DemoSection />
    </DarkPage>
  );
}
