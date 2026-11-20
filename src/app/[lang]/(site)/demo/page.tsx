import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { demoSeo } from "@/site/content/seo";
import { DemoSection } from "@/site/home/demo-section";
import { getLocale, getMessages } from "@/site/i18n/server";
import { UNDER_NAV } from "@/site/nav/nav-space";
import { Container } from "@/site/ui/container";
import { DarkPage } from "@/site/ui/page-theme";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, { about }] = await Promise.all([getLocale(), getMessages()]);
  return pageMetadata({ ...demoSeo, ...about.demo.seo, path: "/demo", locale, translated: true });
}

/** The full product film on a page of its own, moved off the home page; the hero's Watch demo still opens it in place. The film itself plays Coere's English app. */
export default async function DemoPage() {
  const t = (await getMessages()).about.demo;
  return (
    <DarkPage className={UNDER_NAV}>
      <section data-nav-tone="dark" className="pt-[136px] pb-10 md:pt-[168px]">
        <Container className="text-center">
          <h1 className="text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.045em] text-white text-balance sm:text-6xl">{t.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/65 text-pretty">{t.line}</p>
        </Container>
      </section>
      <DemoSection />
    </DarkPage>
  );
}
